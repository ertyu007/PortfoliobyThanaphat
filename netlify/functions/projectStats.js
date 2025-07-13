// netlify/functions/projectStats.js
// นี่คือ Netlify Function สำหรับจัดการสถิติ Like, Share, View ของโปรเจกต์
// โดยเชื่อมต่อกับฐานข้อมูล PostgreSQL (Neon DB)

const { Client } = require("pg"); // เรียกใช้ PostgreSQL client library
const url = require('url'); // เพิ่มโมดูล url เพื่อใช้ในการแยกส่วนประกอบของ URL

// ประกาศ client ไว้นอก handler เพื่อให้สามารถนำกลับมาใช้ใหม่ได้ (Connection Pooling)
let client;
let dbConfig;

// --- การตั้งค่า Rate Limiting (ในหน่วยความจำ, ต่ออินสแตนซ์ของฟังก์ชัน) ---
// ในสถานการณ์จริงสำหรับการจำกัด Rate Limiting แบบกระจาย (distributed rate limiting)
// ควรพิจารณาใช้ persistent store เช่น Redis หรือฐานข้อมูล
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // กำหนดช่วงเวลา 1 นาที (60,000 มิลลิวินาที)
const RATE_LIMIT_MAX_REQUESTS = 10; // กำหนดจำนวนคำขอสูงสุดที่อนุญาตต่อ IP ภายในช่วงเวลาที่กำหนด
const requestCounts = new Map(); // Map สำหรับเก็บข้อมูล { ip: { count: number, lastReset: timestamp } }

// --- ฟังก์ชันช่วยสำหรับการตรวจสอบความถูกต้องของข้อมูล (Input Validation) ---

/**
 * ตรวจสอบความถูกต้องของ ID โปรเจกต์
 * @param {string} id - ID ของโปรเจกต์ที่รับเข้ามา
 * @returns {boolean} - true ถ้า ID ถูกต้องตามรูปแบบ, false ถ้าไม่ถูกต้อง
 */
function isValidId(id) {
  // ตรวจสอบว่า ID เป็นสตริงที่ไม่ว่างเปล่า และประกอบด้วยตัวอักษร (a-z, A-Z), ตัวเลข (0-9),
  // ขีดกลาง (-) หรือขีดล่าง (_) เท่านั้น
  // รูปแบบนี้ช่วยป้องกัน SQL Injection และการส่งค่าที่ไม่พึงประสงค์
  return typeof id === 'string' && id.length > 0 && /^[a-zA-Z0-9_-]+$/.test(id);
}

/**
 * ตรวจสอบความถูกต้องของประเภท (type) ที่รับเข้ามา
 * @param {string} type - ประเภทที่รับเข้ามา (เช่น 'like', 'share', 'view')
 * @param {string[]} allowedTypes - อาร์เรย์ของประเภทที่อนุญาต
 * @returns {boolean} - true ถ้า type เป็นหนึ่งในประเภทที่อนุญาต, false ถ้าไม่ถูกต้อง
 */
function isValidType(type, allowedTypes) {
  // ตรวจสอบว่า type เป็นสตริงและอยู่ในรายการ allowedTypes ที่กำหนดไว้
  return typeof type === 'string' && allowedTypes.includes(type);
}

// --- Handler function สำหรับ Netlify Function ---
exports.handler = async (event) => {
  // ดึงค่า parameters จาก Query String
  const id = event.queryStringParameters?.id; // project_id
  const type = event.queryStringParameters?.type; // 'like', 'share', 'view'
  const getTotal = event.queryStringParameters?.total; // 'true' สำหรับดึงยอดรวม
  const clearAll = event.queryStringParameters?.clear_all; // 'true' สำหรับล้างข้อมูลทั้งหมด
  const method = event.httpMethod; // HTTP method ของ request (GET, POST, DELETE)
  // ดึง IP Address ของ Client จาก Header (Netlify จะส่งมาใน Header นี้)
  const clientIp = event.headers['x-nf-client-connection-ip'] || event.headers['client-ip'] || 'unknown';

  // --- การจำกัดจำนวนครั้งในการส่งคำขอ (Rate Limiting) สำหรับ POST requests ---
  // ใช้สำหรับป้องกันการสแปมหรือ Brute-force ในการเพิ่มสถิติ
  if (method === "POST") {
    const now = Date.now();
    const ipData = requestCounts.get(clientIp) || { count: 0, lastReset: now };

    if (now - ipData.lastReset > RATE_LIMIT_WINDOW_MS) {
      // หากเกินช่วงเวลาที่กำหนด ให้รีเซ็ตจำนวนคำขอและเวลา
      ipData.count = 1;
      ipData.lastReset = now;
    } else {
      // หากยังอยู่ในช่วงเวลา ให้เพิ่มจำนวนคำขอ
      ipData.count++;
    }
    requestCounts.set(clientIp, ipData); // อัปเดตข้อมูลใน Map

    if (ipData.count > RATE_LIMIT_MAX_REQUESTS) {
      console.warn(`Rate limit exceeded for IP: ${clientIp}`);
      return {
        statusCode: 429, // รหัสสถานะ HTTP สำหรับ "Too Many Requests"
        body: JSON.stringify({ error: "Too many requests. Please try again later." }),
        headers: {
          // แนะนำให้ client ลองส่งคำขอใหม่หลังจากผ่านไปกี่วินาที
          'Retry-After': Math.ceil((ipData.lastReset + RATE_LIMIT_WINDOW_MS - now) / 1000).toString(),
        }
      };
    }
  }

  try {
    // ตรวจสอบและตั้งค่า dbConfig หากยังไม่ถูกตั้งค่า
    if (!dbConfig) {
      const databaseUrl = process.env.NETLIFY_DATABASE_URL; // ดึง NETLIFY_DATABASE_URL จาก Environment Variables
      if (!databaseUrl) {
        console.error("NETLIFY_DATABASE_URL is not set in environment variables.");
        // ส่งข้อความ error ที่ชัดเจนกลับไป
        return {
          statusCode: 500,
          body: JSON.stringify({ error: "Server configuration error: Database URL (NETLIFY_DATABASE_URL) not set. Please ensure it's configured locally in .env or in Netlify dashboard." }),
        };
      }

      // แยกส่วนประกอบของ URL เพื่อสร้าง dbConfig
      const params = url.parse(databaseUrl);
      const auth = params.auth.split(':'); // แยก user และ password

      dbConfig = {
        user: auth[0],
        password: auth[1],
        host: params.hostname,
        port: params.port,
        database: params.pathname.split('/')[1],
        ssl: { rejectUnauthorized: false } // ตั้งค่าสำหรับ SSL/TLS ถ้าฐานข้อมูลต้องการ
      };
      console.log("Database configuration parsed from NETLIFY_DATABASE_URL.");
    }

    // สร้างการเชื่อมต่อเพียงครั้งแรก หรือใช้การเชื่อมต่อที่มีอยู่แล้ว
    if (!client) {
      console.log("Creating new DB client and connecting...");
      client = new Client(dbConfig);
      await client.connect();
      console.log("DB client connected successfully.");
    } else {
      // ตรวจสอบว่าการเชื่อมต่อยังคงใช้งานได้หรือไม่
      try {
        await client.query('SELECT 1'); // ลองส่ง query ง่ายๆ เพื่อตรวจสอบสถานะการเชื่อมต่อ
        console.log("Reusing existing DB client connection.");
      } catch (e) {
        console.warn("Existing DB connection lost or unhealthy, attempting to reconnect...", e.message);
        if (client) {
            await client.end(); // ปิดการเชื่อมต่อที่มีปัญหา
            client = null;      // ตั้งค่าเป็น null เพื่อให้สร้างใหม่ในครั้งต่อไป
        }
        client = new Client(dbConfig);
        await client.connect();
        console.log("DB client reconnected successfully.");
      }
    }

    // --- ระบบยืนยันตัวตนและการอนุญาต (Authentication and Authorization) สำหรับ DELETE request ---
    // การดำเนินการ DELETE (clearAll) ต้องมีโทเค็นผู้ดูแลระบบที่ถูกต้อง
    if (clearAll === "true" && method === "DELETE") {
      const adminToken = process.env.ADMIN_TOKEN; // ดึง ADMIN_TOKEN จาก Environment Variables
      const authHeader = event.headers.authorization; // ดึง Authorization Header

      // ตรวจสอบว่ามีการตั้งค่า ADMIN_TOKEN ใน Environment Variables หรือไม่
      if (!adminToken) {
        console.error("ADMIN_TOKEN is not set in environment variables for DELETE operation.");
        return {
          statusCode: 500,
          body: JSON.stringify({ error: "Server configuration error: ADMIN_TOKEN not set." }),
        };
      }

      // ตรวจสอบว่ามี Authorization Header และเริ่มต้นด้วย 'Bearer ' หรือไม่
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.warn("Unauthorized DELETE attempt: Missing or invalid Authorization header.");
        return {
          statusCode: 401, // Unauthorized
          body: JSON.stringify({ error: "Unauthorized: Bearer token required." }),
        };
      }

      // แยกโทเค็นออกจาก Header
      const token = authHeader.split(' ')[1];
      // ตรวจสอบว่าโทเค็นที่ส่งมาตรงกับ ADMIN_TOKEN ที่กำหนดไว้หรือไม่
      if (token !== adminToken) {
        console.warn("Unauthorized DELETE attempt: Invalid token.");
        return {
          statusCode: 403, // Forbidden
          body: JSON.stringify({ error: "Forbidden: Invalid token." }),
        };
      }

      console.log("Received authorized DELETE request to clear all stats.");
      // ดำเนินการล้างข้อมูลสถิติทั้งหมด
      await client.query("UPDATE project_likes SET likes = 0, shares = 0, views = 0;");
      console.log("All project statistics cleared in DB.");
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "All project statistics cleared successfully." }),
      };
    }

    // --- กรณี: ดึงยอดรวมทั้งหมดตามประเภท (GET request with total=true) ---
    if (getTotal === "true" && method === "GET") {
      const validTypesForTotal = ['likes', 'shares', 'views'];
      // ตรวจสอบความถูกต้องของ 'type'
      if (!isValidType(type, validTypesForTotal)) {
        console.warn(`Invalid type for total count: ${type}`);
        return {
          statusCode: 400,
          body: JSON.stringify({ error: "Invalid type for total count. Must be 'likes', 'shares', or 'views'." }),
        };
      }
      // 'type' ถูกตรวจสอบแล้วว่าเป็นชื่อคอลัมน์ที่ถูกต้อง
      const columnName = type;
      console.log(`Received GET request for total ${columnName}.`);
      const res = await client.query(`SELECT SUM(${columnName}) AS total_count FROM project_likes`);
      const totalCount = res.rows[0]?.total_count || 0;
      console.log(`Total ${columnName} fetched: ${totalCount}`);
      return {
        statusCode: 200,
        body: JSON.stringify({ totalCount }),
      };
    }

    // --- กรณี: ดึงข้อมูลสถิติของโปรเจกต์เดียว (GET request) ---
    if (method === "GET") {
      // ตรวจสอบความถูกต้องของ 'id'
      if (!id || !isValidId(id)) {
        console.warn("Missing or invalid ID for GET request.");
        return {
          statusCode: 400,
          body: JSON.stringify({ error: "Missing or invalid id" }),
        };
      }
      console.log(`Received GET request for project ID: ${id}`);
      // Optimization Note: Ensure 'id' column in 'project_likes' table has an index
      // for faster lookups (e.g., CREATE INDEX idx_project_likes_id ON project_likes (id);)
      const res = await client.query(
        "SELECT likes, shares, views FROM project_likes WHERE id = $1",
        [id]
      );
      const stats = res.rows[0] || { likes: 0, shares: 0, views: 0 };
      console.log(`Fetched stats for project ${id}:`, stats);
      return {
        statusCode: 200,
        body: JSON.stringify({ ...stats, userHasLiked: false }), // userHasLiked is managed client-side
      };
    }

    // --- กรณี: เพิ่มยอดสถิติ (Like, Share, View) (POST request) ---
    if (method === "POST") {
      // ตรวจสอบความถูกต้องของ 'id'
      if (!id || !isValidId(id)) {
        console.warn("Missing or invalid ID for POST request.");
        return {
          statusCode: 400,
          body: JSON.stringify({ error: "Missing or invalid id for increment" }),
        };
      }
      const validIncrementTypes = ['like', 'share', 'view'];
      // ตรวจสอบความถูกต้องของ 'type'
      if (!isValidType(type, validIncrementTypes)) {
        console.warn(`Invalid type for increment: ${type}`);
        return {
          statusCode: 400,
          body: JSON.stringify({ error: "Invalid type for increment. Must be 'like', 'share', or 'view'." }),
        };
      }
      // สร้างชื่อคอลัมน์ที่จะอัปเดต (เช่น 'like' -> 'likes')
      const updateColumn = `${type}s`;

      console.log(`Received POST request to increment ${type} for project ID: ${id}`);

      // UPSERT operation: Insert ถ้ายังไม่มี, มิฉะนั้นให้อัปเดต
      await client.query(
        `
        INSERT INTO project_likes (id, ${updateColumn})
        VALUES ($1, 1)
        ON CONFLICT (id)
        DO UPDATE SET ${updateColumn} = project_likes.${updateColumn} + 1;
        `,
        [id]
      );
      console.log(`Successfully incremented ${type} for project ${id}.`);

      // ดึงข้อมูลสถิติที่อัปเดตแล้วกลับไปให้ client
      const res = await client.query(
        "SELECT likes, shares, views FROM project_likes WHERE id = $1",
        [id]
      );
      const updatedStats = res.rows[0] || { likes: 0, shares: 0, views: 0 };
      console.log(`Updated stats for project ${id}:`, updatedStats);
      return {
        statusCode: 200,
        body: JSON.stringify({ ...updatedStats, userHasLiked: false }), // userHasLiked ถูกจัดการฝั่ง client
      };
    }

    // --- กรณี: HTTP Method ที่ไม่รองรับ ---
    console.warn(`Method not allowed: ${method}`);
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  } catch (err) {
    // ดักจับข้อผิดพลาดที่เกิดขึ้นในระหว่างการทำงาน (เช่น ฐานข้อมูล error)
    console.error("Database error in handler:", err);
    // ในกรณีที่เกิดข้อผิดพลาดร้ายแรงกับการเชื่อมต่อ ควรพิจารณาปิดและตั้งค่า client เป็น null
    // เพื่อให้สร้างการเชื่อมต่อใหม่ในครั้งต่อไป
    if (client) {
        await client.end();
        client = null;
    }
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server error", details: err.message }),
    };
  }
};

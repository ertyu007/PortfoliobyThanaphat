// netlify/functions/projectStats.js
// นี่คือ Netlify Function สำหรับจัดการสถิติ Like, Share, View ของโปรเจกต์
// โดยเชื่อมต่อกับฐานข้อมูล PostgreSQL (Neon DB)

const { Client } = require("pg"); // เรียกใช้ PostgreSQL client library
const url = require('url'); // เพิ่มโมดูล url เพื่อใช้ในการแยกส่วนประกอบของ URL

// ประกาศ client ไว้นอก handler เพื่อให้สามารถนำกลับมาใช้ใหม่ได้ (Connection Pooling)
let client;
let dbConfig; // ประกาศ dbConfig ไว้ด้านนอกเพื่อเก็บค่าที่แยกออกมา

// Handler function สำหรับ Netlify Function
exports.handler = async (event) => {
  // ดึงค่า parameters จาก Query String
  const id = event.queryStringParameters?.id; // project_id
  const type = event.queryStringParameters?.type; // 'like', 'share', 'view'
  const getTotal = event.queryStringParameters?.total; // 'true' สำหรับดึงยอดรวม
  const clearAll = event.queryStringParameters?.clear_all; // 'true' สำหรับล้างข้อมูลทั้งหมด
  const method = event.httpMethod; // HTTP method ของ request (GET, POST, DELETE)

  try {
    // ตรวจสอบและตั้งค่า dbConfig หากยังไม่ถูกตั้งค่า
    if (!dbConfig) {
      const databaseUrl = process.env.NETLIFY_DATABASE_URL; // ดึง NETLIFY_DATABASE_URL
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
        await client.query('SELECT 1');
        console.log("Reusing existing DB client connection.");
      } catch (e) {
        console.warn("Existing DB connection lost, attempting to reconnect...", e);
        if (client) {
            await client.end(); // ปิดการเชื่อมต่อที่มีปัญหา
            client = null;      // ตั้งค่าเป็น null เพื่อให้สร้างใหม่ในครั้งต่อไป
        }
        client = new Client(dbConfig);
        await client.connect();
        console.log("DB client reconnected successfully.");
      }
    }

    // --- กรณี: ล้างข้อมูลสถิติทั้งหมด (DELETE request) ---
    if (clearAll === "true" && method === "DELETE") {
      console.log("Received DELETE request to clear all stats.");
      await client.query("UPDATE project_likes SET likes = 0, shares = 0, views = 0;");
      console.log("All project statistics cleared in DB.");
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "All project statistics cleared successfully." }),
      };
    }

    // --- กรณี: ดึงยอดรวมทั้งหมดตามประเภท (GET request with total=true) ---
    if (getTotal === "true" && method === "GET") {
      console.log(`Received GET request for total ${type}.`);
      let columnName = '';
      if (type === 'likes') {
        columnName = 'likes';
      } else if (type === 'shares') {
        columnName = 'shares';
      } else if (type === 'views') {
        columnName = 'views';
      } else {
        console.warn(`Invalid type for total count: ${type}`);
        return {
          statusCode: 400,
          body: JSON.stringify({ error: "Invalid type for total count. Must be 'likes', 'shares', or 'views'." }),
        };
      }
      const res = await client.query(`SELECT SUM(${columnName}) AS total_count FROM project_likes`);
      const totalCount = res.rows[0]?.total_count || 0;
      console.log(`Total ${type} fetched: ${totalCount}`);
      return {
        statusCode: 200,
        body: JSON.stringify({ totalCount }),
      };
    }

    // --- กรณี: ดึงข้อมูลสถิติของโปรเจกต์เดียว (GET request) ---
    if (method === "GET") {
      if (!id) {
        console.warn("Missing ID for GET request.");
        return {
          statusCode: 400,
          body: JSON.stringify({ error: "Missing id" }),
        };
      }
      console.log(`Received GET request for project ID: ${id}`);
      const res = await client.query(
        "SELECT likes, shares, views FROM project_likes WHERE id = $1",
        [id]
      );
      const stats = res.rows[0] || { likes: 0, shares: 0, views: 0 };
      console.log(`Fetched stats for project ${id}:`, stats);
      return {
        statusCode: 200,
        body: JSON.stringify({ ...stats, userHasLiked: false }),
      };
    }

    // --- กรณี: เพิ่มยอดสถิติ (Like, Share, View) (POST request) ---
    if (method === "POST") {
      if (!id || !type) {
        console.warn("Missing ID or type for POST request.");
        return {
          statusCode: 400,
          body: JSON.stringify({ error: "Missing id or type for increment" }),
        };
      }
      console.log(`Received POST request to increment ${type} for project ID: ${id}`);

      let updateColumn = '';
      if (type === 'like') {
        updateColumn = 'likes';
      } else if (type === 'share') {
        updateColumn = 'shares';
      } else if (type === 'view') {
        updateColumn = 'views';
      } else {
        console.warn(`Invalid type for increment: ${type}`);
        return {
          statusCode: 400,
          body: JSON.stringify({ error: "Invalid type for increment. Must be 'like', 'share', or 'view'." }),
        };
      }

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

      const res = await client.query(
        "SELECT likes, shares, views FROM project_likes WHERE id = $1",
        [id]
      );
      const updatedStats = res.rows[0] || { likes: 0, shares: 0, views: 0 };
      console.log(`Updated stats for project ${id}:`, updatedStats);
      return {
        statusCode: 200,
        body: JSON.stringify({ ...updatedStats, userHasLiked: false }),
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

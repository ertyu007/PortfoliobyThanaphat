// เหตุการณ์ DOMContentLoaded: ตรวจสอบให้แน่ใจว่า HTML ถูกโหลดและแยกวิเคราะห์เรียบร้อยแล้วก่อนที่จะรันสคริปต์
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOMContentLoaded event fired.");

  // Active link highlighting based on scroll position:
  // ไฮไลต์ลิงก์เมนูนำทางที่ตรงกับส่วนของหน้าเว็บที่กำลังมองเห็น
  const sections = document.querySelectorAll("section");
  const navItems = document.querySelectorAll(".header-nav li a");

  // เพิ่ม Event Listener สำหรับการเลื่อนหน้าจอ
  window.addEventListener("scroll", function () {
    let current = "";

    // วนลูปผ่านแต่ละส่วนของหน้า
    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      // const sectionHeight = section.clientHeight; // ไม่ได้ใช้งาน
      // ตรวจสอบว่าส่วนนั้นอยู่ในขอบเขตการมองเห็นหรือไม่ (ปรับค่า offset เล็กน้อย)
      if (pageYOffset >= sectionTop - 100) {
        current = section.getAttribute("id");
      }
    });

    // วนลูปผ่านแต่ละลิงก์ในเมนูนำทาง
    navItems.forEach((item) => {
      item.classList.remove("active");
      if (item.getAttribute("href") === `#${current}`) {
        item.classList.add("active");
      }
    });
  });


  // Smooth scrolling for anchor links:
  // ทำให้การเลื่อนหน้าจอไปยังส่วนที่ลิงก์เชื่อมโยงเป็นไปอย่างราบรื่น
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();

      const targetId = this.getAttribute("href");
      if (targetId === "#") return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        // Offset for fixed header
        const headerOffset = document.querySelector('.header-section').offsetHeight;
        const elementPosition = targetElement.offsetTop;
        const offsetPosition = elementPosition - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }

      // Close mobile menu if open after clicking a link
      const menuToggle = document.querySelector('.menu-toggle');
      const headerList = document.querySelector('.header-list');
      if (headerList.classList.contains('active')) {
        menuToggle.classList.remove('open');
        headerList.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  });

  // Typewriter effect for motto
  const motto = document.querySelector(".about-motto p");
  if (motto) {
    const text = motto.textContent;
    motto.textContent = "";

    let i = 0;
    const typeWriter = setInterval(() => {
      if (i < text.length) {
        motto.textContent += text.charAt(i);
        i++;
      } else {
        clearInterval(typeWriter);
      }
    }, 50);
  }

  // ====== DATA ======
  // ข้อมูลโปรเจกต์ทั้งหมด (สามารถเพิ่มหรือแก้ไขได้ตามต้องการ)
  const projects = [{
    "id": "project-1", // เปลี่ยน id เป็น string เพื่อให้เข้ากับ Netlify Function
    "title": "ออกแบบ แผนผังอินเตอร์เน็ต",
    "category": "it",
    "year": 2024,
    "type": "image",
    "thumbnail": "assets/images/1741780829154.jpg",
    "src": "assets/images/1741780829154.jpg",
    "desc": "ออกแบบ แผนผังโครงสร้างท่อร้อยสายเน็ตบนอาคารจากห้อง server ถึงชั้น 3 ของอาคาร",
    "shortDesc": "ออกแบบแผนผังโครงสร้างท่อร้อยสายเน็ต" // เพิ่ม shortDesc สำหรับ overlay
  },
  {
    "id": "project-2",
    "title": "อัพเดตโปรแกรมต่างๆ",
    "category": "it",
    "year": 2024,
    "type": "image",
    "thumbnail": "assets/images/1739578807758.jpg",
    "src": "assets/images/1739578807758.jpg",
    "desc": "อัพเดตโปรแกรมต่างๆ ในคอมพิวเตอร์",
    "shortDesc": "อัพเดตโปรแกรมในคอมพิวเตอร์"
  },
  {
    "id": "project-3",
    "title": "เข้าหัวสายแลน",
    "category": "it",
    "year": 2024,
    "type": "image",
    "thumbnail": "assets/images/IMG20250329132925.jpg",
    "src": "assets/images/IMG20250329132925.jpg",
    "desc": "เข้าหัวสายแลนและเอาเข้าตู้ และเตรียมเทสสปีด",
    "shortDesc": "เข้าหัวสายแลนและเตรียมเทสสปีด"
  },
  {
    "id": "project-4",
    "title": "เทสสปีดเน็ต",
    "category": "it",
    "year": 2024,
    "type": "image",
    "thumbnail": "assets/images/IMG20250506092117.jpg",
    "src": "assets/images/IMG20250506092117.jpg",
    "desc": "เทสสปีดเน็ต ให้ได้มาตรฐาน คือ 900Mb",
    "shortDesc": "ทดสอบความเร็วอินเทอร์เน็ต"
  },
  {
    "id": "project-5",
    "title": "ตัดสายไฟ เข้าบล็อกไฟเพื่อติดตั้งภายในห้องคอม",
    "category": "it",
    "year": 2024,
    "type": "image",
    "thumbnail": "assets/images/IMG20250507104510.jpg",
    "src": "assets/images/IMG20250507104510.jpg",
    "desc": "ตัดสายไฟ เข้าบล็อกไฟเพื่ิติดตัดภายในห้องคอม",
    "shortDesc": "ติดตั้งสายไฟในห้องคอมพิวเตอร์"
  },
  {
    "id": "project-6",
    "title": "ทำโปสเตอร์ ประกาศ",
    "category": "แต่งภาพ",
    "year": 2024,
    "type": "image",
    "thumbnail": "assets/images/39a4db3b-f6e8-467f-88ce-c40193c8972aphoto.png",
    "src": "assets/images/39a4db3b-f6e8-467f-88ce-c40193c8972aphoto.png",
    "desc": "ทำโปสเตอร์ ประกาศ การเลือกตั้งประธานนักเรียน",
    "shortDesc": "ออกแบบโปสเตอร์เลือกตั้งประธานนักเรียน"
  },
  {
    "id": "project-7",
    "title": "เป็นตากล้อง ถ่ายรูปกิจกรรมต่างๆ",
    "category": "แต่งภาพ",
    "year": 2024,
    "type": "image",
    "thumbnail": "assets/images/1751162337512.jpg",
    "src": "assets/images/1751162337512.jpg",
    "desc": "เป็นตากล้อง ถ่ายรูปกิจกรรมต่างๆ",
    "shortDesc": "ถ่ายภาพกิจกรรมต่างๆ"
  },
  {
    "id": "project-8",
    "title": "ซ้อมคอมพิวเตอร์ให้กลับมาใช้งานได้",
    "category": "it",
    "year": 2024,
    "type": "image",
    "thumbnail": "assets/images/IMG_20250313_053720.jpg",
    "src": "assets/images/IMG_20250313_053720.jpg",
    "desc": "เปลี่ยน ssd และจัดระเบียบสายไฟ",
    "shortDesc": "ซ่อมคอมพิวเตอร์และจัดระเบียบสายไฟ"
  },
  {
    "id": "project-9",
    "title": "ช่วยคอมคุมเพลงและเพิ่มเกมผ่านโปรเจคเตอร์ในกิจกรรม",
    "category": "it",
    "year": 2024,
    "type": "image",
    "thumbnail": "assets/images/IMG20250529092723.jpg",
    "src": "assets/images/IMG20250529092723.jpg",
    "desc": "ช่วยคอมคุมเพลงและเพิ่มเกมผ่านโปรเจคเตอร์ในกิจกรรม เพื่อเพิ่มความสนุกสนานในกิจกรรม",
    "shortDesc": "ควบคุมเพลงและเกมในกิจกรรม"
  },
  {
    "id": "project-10",
    "title": "ซ้อมแข่งหุ่นยนต์ระดับกลาง",
    "category": "เเข่งหุ่นยนต์",
    "year": 2024,
    "type": "video",
    "thumbnail": "assets/images/093739.png",
    "src": "assets/video/received_651238003846627.mp4",
    "desc": "ซ้อมแข่งหุ่นยนต์ระดับกลาง แต่ก็ได้เหรียญทองนะค้าบบบ",
    "shortDesc": "ฝึกซ้อมแข่งขันหุ่นยนต์"
  },
  {
    "id": "project-11",
    "title": "ตัดต่ออินโทร โลโก",
    "category": "ตัดต่อ",
    "year": 2024,
    "type": "video",
    "thumbnail": "assets/images/094024.png",
    "src": "assets/video/received_1793334780.mp4",
    "desc": "ตัดต่ออินโทร โลโก และตัดต่อ VTR ให้โรงเรียน",
    "shortDesc": "ตัดต่อ Intro และ VTR"
  },
  {
    "id": "project-12",
    "category": "it",
    "year": 2024,
    "type": "video",
    "thumbnail": "assets/images/095615.png",
    "src": "assets/video/VID_20250512065631.mp4",
    "desc": "ลองเล่น esp32 โดยให้เล่น อนิเมชั่นง่ายๆ",
    "shortDesc": "ทดลองเล่น ESP32"
  },
  {
    "id": "project-13",
    "title": "เขียนบอทเกมใน Discord",
    "category": "code",
    "year": 2024,
    "type": "image",
    "thumbnail": "assets/images/IMG_20241212_215204.jpg",
    "src": "assets/images/IMG_20241212_215204.jpg",
    "desc": "ลองสร้างเกมง่ายๆบน discord เพื่อการศึกษา",
    "shortDesc": "พัฒนา Discord Bot Game"
  },
  {
    "id": "project-14",
    "title": "ลองสร้างโค้ด python ด้วย ai",
    "category": "code",
    "year": 2025,
    "type": "video",
    "thumbnail": "assets/images/113700.png",
    "src": "assets/video/125002.mp4",
    "desc": "ช่วงนั่นผมได้ดึงไฟล์จาดกล้องมา แล้วผมไม่ได้ติดตั้ง แอพแปลงไฟล์เลย ลองทำโค้ดนี้ขึ้นมา โค้ดนี้สามารถดูใน github",
    "shortDesc": "สร้างโค้ด Python ด้วย AI"
  },
  {
    "id": "project-15",
    "title": "ผมเคยเป็นผู้ช่วยตัดต่อและกำกับหนังสั้น",
    "category": "ตัดต่อ",
    "year": 2025,
    "type": "image",
    "thumbnail": "assets/images/204654.png",
    "src": "assets/images/204654.png",
    "desc": "สามารถ ดูคริปได้เลยครับ",
    "shortDesc": "ผู้ช่วยตัดต่อและกำกับหนังสั้น"
  },
  {
    "id": "project-16",
    "title": "ผมได้เป็นหนึ่งในสมาชิกสภานักเรียน",
    "category": "code",
    "year": 2024,
    "type": "image",
    "thumbnail": "assets/images/IMG_20250223_115236.jpg",
    "src": "assets/images/IMG_20250223_115236.jpg",
    "desc": "ผมได้ทำหน้าที่เป็นหัวหน้าฝ่ายโสตทัศนะ",
    "shortDesc": "สมาชิกสภานักเรียนฝ่ายโสตทัศนะ"
  },
  ];

  // ===== DOM Elements =====
  const filtersEl = document.getElementById("filters");
  const galleryEl = document.getElementById("gallery");
  const lightboxEl = document.getElementById("lightbox");
  const lightboxContent = document.getElementById("lightbox-content");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const lightboxClose = document.getElementById("lightbox-close");
  const totalLikesEl = document.getElementById("total-likes"); // อ้างอิงถึง element สำหรับแสดงยอดไลก์รวม
  const totalSharesEl = document.getElementById("total-shares"); // อ้างอิงถึง element สำหรับแสดงยอดแชร์รวม
  const totalViewsEl = document.getElementById("total-views");   // อ้างอิงถึง element สำหรับแสดงยอดวิวรวม
  const clearLikesBtn = document.getElementById("clear-likes-btn"); // ปุ่มสำหรับล้างไลก์ทั้งหมด
  const darkModeToggle = document.getElementById("dark-mode-toggle"); // ปุ่ม Dark Mode

  // Certificates Carousel Elements (Removed as replaced by GSAP stack animation)
  // const carouselTrack = document.querySelector('.carousel-track');
  // const carouselPrevBtn = document.querySelector('.carousel-button.prev');
  // const carouselNextBtn = document.querySelector('.carousel-button.next');
  // const carouselDotsContainer = document.querySelector('.carousel-dots');
  // const certCards = document.querySelectorAll('.certificates-section .cert-card'); // This will now refer to the GSAP animated cards
  // let currentSlideIndex = 0;

  // ===== Local stats registry =====
  // คีย์สำหรับเก็บสถานะการกด Like, Share, View ใน Local Storage
  const LOCAL_KEY = "project-stats";
  // โหลดสถานะการกด Like, Share, View จาก Local Storage
  function loadLocalStats() { return JSON.parse(localStorage.getItem(LOCAL_KEY) || "{}"); }
  // บันทึกสถานะการกด Like, Share, View ลง Local Storage
  function saveLocalStats(d) { localStorage.setItem(LOCAL_KEY, JSON.stringify(d)); }

  // ฟังก์ชันสำหรับล้างสถานะสถิติทั้งหมดใน Local Storage
  function clearAllLocalStats() {
    localStorage.removeItem(LOCAL_KEY);
    console.log("Local stats cleared.");

    // Explicitly remove 'liked' class from all buttons and reset count
    document.querySelectorAll('.like-btn.liked').forEach(btn => {
      btn.classList.remove('liked');
      const likeCountSpan = btn.querySelector('.like-count');
      if (likeCountSpan) {
        likeCountSpan.textContent = '0'; // Reset displayed count to 0
      }
    });

    // Reset share and view counts in UI
    document.querySelectorAll('.share-count').forEach(span => span.textContent = '0');
    document.querySelectorAll('.view-count').forEach(span => span.textContent = '0');

    // Re-initialize the gallery to fetch fresh counts and re-render
    init();
  }

  // ===== Heart burst animation =====
  // ฟังก์ชันสำหรับเรียกใช้แอนิเมชันหัวใจกระจาย
  function triggerHeartBurst(btn) {
    const burst = document.createElement("div");
    burst.className = "heart-burst";
    for (let i = 0; i < 6; i++) {
      const h = document.createElement("div");
      h.className = "burst-heart";
      burst.appendChild(h);
    }
    btn.appendChild(burst);
    setTimeout(() => burst.remove(), 800); // ลบแอนิเมชันออกหลังจาก 0.8 วินาที
  }

  // ===== Stat handler functions =====
  // ฟังก์ชันสำหรับดึงจำนวน Like, Share, View จาก Netlify Function สำหรับโปรเจกต์เดียว
  async function fetchProjectStats(id) {
    try {
      const response = await fetch(`/.netlify/functions/projectStats?id=${id}`);
      if (!response.ok) {
        // พยายามอ่านข้อความ error จาก response body
        const errorData = await response.json().catch(() => ({})); // พยายาม parse JSON, ถ้าไม่ได้ให้เป็น object ว่าง
        const errorMessage = errorData.error || `HTTP error! status: ${response.status}`;
        throw new Error(`Error fetching project stats for project ${id}: ${errorMessage}`);
      }
      const data = await response.json();
      return {
        likes: data.likes || 0,
        shares: data.shares || 0,
        views: data.views || 0,
        userHasLiked: data.userHasLiked || false // รับค่า userHasLiked กลับมา
      };
    } catch (error) {
      console.error('Error fetching project stats:', error);
      return { likes: 0, shares: 0, views: 0, userHasLiked: false };
    }
  }

  // ฟังก์ชันสำหรับดึงยอดไลก์, แชร์, วิว ทั้งหมดสำหรับทุกโปรเจกต์พร้อมกัน
  async function fetchAllProjectStats(projectIds) {
    const statPromises = projectIds.map(id => fetchProjectStats(id));
    const results = await Promise.all(statPromises);
    const allStatsMap = {};
    projectIds.forEach((id, index) => {
      allStatsMap[id] = results[index];
    });
    return allStatsMap;
  }

  // ฟังก์ชันสำหรับดึงยอดรวมทั้งหมดตามประเภท
  async function fetchTotalStat(type) {
    try {
      const response = await fetch(`/.netlify/functions/projectStats?total=true&type=${type}`);
      if (!response.ok) {
        // พยายามอ่านข้อความ error จาก response body
        const errorData = await response.json().catch(() => ({})); // พยายาม parse JSON, ถ้าไม่ได้ให้เป็น object ว่าง
        const errorMessage = errorData.error || `HTTP error! status: ${response.status}`;
        throw new Error(`Error fetching total ${type}: ${errorMessage}`);
      }
      const data = await response.json();
      return data.totalCount || 0;
    } catch (error) {
      console.error(`Error fetching total ${type}:`, error);
      return 0;
    }
  }

  // ฟังก์ชันหลักสำหรับจัดการการกด Like (Optimistic UI)
  async function handleLike(id, btn) {
    const local = loadLocalStats();
    if (local[id] && local[id].liked) { // ตรวจสอบสถานะการไลก์จาก Local Storage
      console.log(`Project ${id} already liked locally.`);
      return; // ไม่ต้องทำอะไรถ้ากดไลก์ไปแล้ว
    }

    // Optimistic UI Update: อัปเดต UI ทันที
    let currentLikeCount = parseInt(btn.querySelector(".like-count").textContent);
    currentLikeCount++;
    btn.querySelector(".like-count").textContent = currentLikeCount;
    btn.classList.add("liked");
    triggerHeartBurst(btn);

    local[id] = local[id] || {};
    local[id].liked = true;
    saveLocalStats(local);

    // ส่งข้อมูลไปยังเซิร์ฟเวอร์แบบ Asynchronous
    try {
      const updatedStats = await pushStat(id, 'like'); // เรียก API เพื่อบันทึกไลก์
      if (updatedStats) {
        updateTotalStatsDisplay(); // อัปเดตยอดไลก์รวม
      } else {
        console.error("Failed to update like count on server. Reverting UI.");
        // Rollback UI ถ้าเซิร์ฟเวอร์ไม่ยืนยันการไลก์
        btn.classList.remove("liked");
        const actualStats = await fetchProjectStats(id);
        btn.querySelector(".like-count").textContent = actualStats.likes;
        delete local[id].liked; // ลบสถานะ liked ใน Local Storage
        saveLocalStats(local);
        await showInfoModal('เกิดข้อผิดพลาดในการบันทึกไลก์ กรุณาลองใหม่อีกครั้ง');
      }
    } catch (error) {
      console.error("Error in handleLike (server call):", error);
      // Rollback UI ถ้าเกิดข้อผิดพลาดในการเชื่อมต่อ
      btn.classList.remove("liked");
      const actualStats = await fetchProjectStats(id);
      btn.querySelector(".like-count").textContent = actualStats.likes;
      delete local[id].liked; // ลบสถานะ liked ใน Local Storage
      saveLocalStats(local);
      await showInfoModal('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาตรวจสอบอินเทอร์เน็ตและลองใหม่อีกครั้ง');
    }
  }

  // ฟังก์ชันสำหรับจัดการการแชร์ (Optimistic UI)
  async function handleShare(id, btn) {
    const local = loadLocalStats();
    if (local[id] && local[id].shared) { // ตรวจสอบว่าเคยแชร์แล้วหรือไม่
      console.log(`Project ${id} already shared locally.`);
      return;
    }

    // Optimistic UI Update
    let currentShareCount = parseInt(btn.querySelector(".share-count").textContent);
    currentShareCount++;
    btn.querySelector(".share-count").textContent = currentShareCount;
    btn.classList.add("shared"); // อาจเพิ่มคลาส 'shared' เพื่อเปลี่ยนสไตล์ปุ่มแชร์

    local[id] = local[id] || {};
    local[id].shared = true;
    saveLocalStats(local);

    // ส่งข้อมูลไปยังเซิร์ฟเวอร์แบบ Asynchronous
    try {
      const updatedStats = await pushStat(id, 'share');
      if (updatedStats) {
        updateTotalStatsDisplay();
        // สามารถเพิ่ม Web Share API ได้ที่นี่
        if (navigator.share) {
          try {
            await navigator.share({
              title: projects.find(p => p.id === id)?.title || 'My Portfolio Project',
              text: projects.find(p => p.id === id)?.desc || 'Check out this amazing project!',
              url: window.location.href, // หรือ URL เฉพาะของโปรเจกต์
            });
            console.log('Content shared successfully');
          } catch (shareError) {
            console.error('Error sharing:', shareError);
            // ถ้าผู้ใช้ยกเลิกการแชร์ หรือเกิดข้อผิดพลาดในการแชร์ ไม่ต้อง rollback
          }
        } else {
          // Fallback for browsers that do not support Web Share API
          console.log('Web Share API not supported. Please copy the link manually.');
          // อาจจะแสดง modal ให้คัดลอกลิงก์แทน
          await showInfoModal('เบราว์เซอร์ของคุณไม่รองรับการแชร์โดยตรง กรุณาคัดลอกลิงก์ด้วยตนเอง');
        }
      } else {
        console.error("Failed to update share count on server. Reverting UI.");
        btn.classList.remove("shared");
        delete local[id].shared;
        saveLocalStats(local);
        const actualStats = await fetchProjectStats(id);
        btn.querySelector(".share-count").textContent = actualStats.shares;
        await showInfoModal('เกิดข้อผิดพลาดในการบันทึกการแชร์ กรุณาลองใหม่อีกครั้ง');
      }
    } catch (error) {
      console.error("Error in handleShare (server call):", error);
      btn.classList.remove("shared");
      delete local[id].shared;
      saveLocalStats(local);
      const actualStats = await fetchProjectStats(id);
      btn.querySelector(".share-count").textContent = actualStats.shares;
      await showInfoModal('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาตรวจสอบอินเทอร์เน็ตและลองใหม่อีกครั้ง');
    }
  }

  // ฟังก์ชันสำหรับจัดการการนับ View (Optimistic UI)
  async function handleView(id) {
    const local = loadLocalStats();
    if (local[id] && local[id].viewed) { // ตรวจสอบว่าเคยดูแล้วหรือไม่
      console.log(`Project ${id} already viewed locally.`);
      return;
    }

    local[id] = local[id] || {};
    local[id].viewed = true;
    saveLocalStats(local);

    // ส่งข้อมูลไปยังเซิร์ฟเวอร์แบบ Asynchronous
    try {
      const updatedStats = await pushStat(id, 'view');
      if (updatedStats) {
        updateTotalStatsDisplay();
        // ไม่จำเป็นต้องอัปเดต view count ใน gallery item หรือ lightbox ที่นี่
        // เพราะ openLightbox จะจัดการการแสดงผลแบบ optimistic แล้ว
      } else {
        console.error("Failed to update view count on server.");
        delete local[id].viewed;
        saveLocalStats(local);
      }
    } catch (error) {
      console.error("Error in handleView (server call):", error);
      delete local[id].viewed;
      saveLocalStats(local);
    }
  }


  // ฟังก์ชันสำหรับส่งการอัปเดตสถิติไปยัง Netlify Function
  async function pushStat(id, type) {
    try {
      const response = await fetch(`/.netlify/functions/projectStats?id=${id}&type=${type}`, {
        method: "POST"
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})); // พยายาม parse JSON, ถ้าไม่ได้ให้เป็น object ว่าง
        const errorMessage = errorData.error || `Server error: ${response.status} - Unknown error`;
        throw new Error(errorMessage);
      }
      const data = await response.json();
      return data; // คาดหวัง { likes, shares, views, userHasLiked (ถ้า type เป็น like) }
    } catch (error) {
      console.error(`Error pushing ${type}:`, error);
      return null;
    }
  }

  // ฟังก์ชันสำหรับอัปเดตการแสดงผลยอดรวมทั้งหมด
  async function updateTotalStatsDisplay() {
    if (totalLikesEl) {
      const total = await fetchTotalStat('likes');
      totalLikesEl.textContent = total;
    }
    if (totalSharesEl) {
      const total = await fetchTotalStat('shares');
      totalSharesEl.textContent = total;
    }
    if (totalViewsEl) {
      const total = await fetchTotalStat('views');
      totalViewsEl.textContent = total;
    }
  }

  // ฟังก์ชันสำหรับแสดง/ซ่อน loading animation ในส่วน Projects
  function showProjectsLoading(show) {
    if (show) {
      // ซ่อน gallery และแสดง loading spinner
      galleryEl.innerHTML = `
        <div class="projects-loading-spinner">
          <div class="loader"></div>
          <p>กำลังโหลดโปรเจกต์...</p>
        </div>
      `;
      galleryEl.style.display = 'flex'; // ใช้ flex เพื่อจัดตำแหน่ง spinner
      galleryEl.style.justifyContent = 'center';
      galleryEl.style.alignItems = 'center';
      galleryEl.style.minHeight = '200px'; // กำหนดความสูงขั้นต่ำ
    } else {
      // ซ่อน loading spinner และแสดง gallery
      galleryEl.innerHTML = ''; // ล้าง spinner ออก
      galleryEl.style.display = 'grid'; // กลับไปใช้ grid layout
      galleryEl.style.justifyContent = '';
      galleryEl.style.alignItems = '';
      galleryEl.style.minHeight = '';
    }
  }

  // ===== Gallery render (ปรับปรุงใหม่) =====
  // ฟังก์ชันสำหรับแสดงผลงานใน Gallery
  async function renderGallery(data, allStatsMap, mostViewedProjectId) {
    console.log(`Rendering gallery with ${data.length} projects.`);
    showProjectsLoading(false); // ซ่อน loading spinner ก่อน render จริง
    galleryEl.innerHTML = ""; // ล้าง gallery ก่อน render ใหม่
    const local = loadLocalStats(); // โหลด local stats เพื่อตรวจสอบสถานะ liked/shared

    if (data.length === 0) {
      galleryEl.innerHTML = '<p class="no-projects-message">ไม่พบโปรเจกต์ในหมวดหมู่นี้</p>';
      galleryEl.style.display = 'block'; // Ensure it's not flex if no projects
      return;
    }

    for (const project of data) {
      const item = document.createElement("div");
      item.classList.add("project-item"); // เปลี่ยนจาก gallery-item เป็น project-item
      item.setAttribute('data-aos', 'fade-up');
      item.setAttribute('data-aos-duration', '800');
      item.setAttribute('data-id', project.id); // เพิ่ม data-id สำหรับการอ้างอิง

      // ดึงจำนวน Like, Share, View จาก allStatsMap ที่โหลดไว้ล่วงหน้า
      const projectStats = allStatsMap[project.id] || { likes: 0, shares: 0, views: 0 };

      // เพิ่มคลาส 'most-viewed' ถ้าเป็นโปรเจกต์ที่มีคนดูมากที่สุด
      if (project.id === mostViewedProjectId && mostViewedProjectId !== null) {
        item.classList.add('most-viewed');
      }

      // สร้างโครงสร้าง HTML ใหม่
      item.innerHTML = `
        <img src="${project.thumbnail}" alt="${project.title}">
        <div class="project-overlay">
            <h4>${project.title}</h4>
            <p>${project.shortDesc || project.desc}</p>
            <button class="view-button">
              ${project.type === 'video' ? 'ดูวิดีโอ' : 'ดูรูปภาพ'}
            </button>
        </div>
        <div class="project-content">
            <h3>${project.title}</h3>
            <p>${project.desc}</p>
            <div class="project-meta">
                <span class="category">${project.category}</span>
                <div class="stats">
                    <span class="stat-item likes ${local[project.id] && local[project.id].liked ? 'liked' : ''}">
                      <i class="fas fa-heart"></i>
                      <span class="like-count">${projectStats.likes}</span>
                    </span>
                    <span class="stat-item shares">
                      <i class="fas fa-share-alt"></i>
                      <span class="share-count">${projectStats.shares}</span>
                    </span>
                    <span class="stat-item views">
                      <i class="fas fa-eye"></i>
                      <span class="view-count">${projectStats.views}</span>
                    </span>
                </div>
            </div>
        </div>
      `;

      // Event listener สำหรับเปิด Lightbox เมื่อคลิกที่ project-item
      item.addEventListener("click", () => openLightbox(project, projectStats));

      // Event listener สำหรับปุ่ม "ดูวิดีโอ" / "ดูรูปภาพ" ภายใน overlay
      const viewButton = item.querySelector(".view-button");
      if (viewButton) {
        viewButton.addEventListener("click", (e) => {
          e.stopPropagation(); // หยุด event propagation เพื่อไม่ให้เปิด lightbox ซ้ำซ้อน หรือเกิดการนำทาง
          openLightbox(project, projectStats);
        });
      }

      // Event listeners สำหรับปุ่ม Like/Share ภายใน overlay (ถ้ามี) หรือใน content
      const likeBtn = item.querySelector(".stat-item.likes");
      if (likeBtn) {
        likeBtn.addEventListener("click", (e) => {
          e.stopPropagation(); // หยุด event propagation เพื่อไม่ให้เปิด lightbox
          handleLike(project.id, likeBtn);
        });
      }

      const shareBtn = item.querySelector(".stat-item.shares");
      if (shareBtn) {
        // ตรวจสอบสถานะ shared จาก local storage และเพิ่มคลาส
        if (local[project.id] && local[project.id].shared) {
          shareBtn.classList.add("shared");
        }
        shareBtn.addEventListener("click", (e) => {
          e.stopPropagation(); // หยุด event propagation เพื่อไม่ให้เปิด lightbox
          handleShare(project.id, shareBtn);
        });
      }

      galleryEl.appendChild(item);
    }
  }

  // ===== Lightbox functions =====
  // ฟังก์ชันสำหรับเปิด Lightbox
  async function openLightbox(project, initialProjectStats) { // รับ initialProjectStats เข้ามา
    lightboxContent.innerHTML = "";
    const media = document.createElement(project.type === "video" ? "video" : "img");
    media.src = project.src;
    media.alt = project.title;
    if (project.type === "image") {
      media.setAttribute("loading", "lazy");
    }
    if (project.type === "video") {
      media.controls = true;
      media.autoplay = true;
      media.setAttribute("preload", "none");
    }

    media.style.maxWidth = "90vw";
    media.style.maxHeight = "80vh";

    const local = loadLocalStats();

    // ใช้ initialProjectStats สำหรับการแสดงผลเริ่มต้นของ Likes, Shares, Views
    const currentLikes = initialProjectStats.likes;
    const currentShares = initialProjectStats.shares;
    let currentViews = initialProjectStats.views; // ใช้ let เพราะจะเพิ่มค่าแบบ optimistic

    // เพิ่มยอดวิวแบบ Optimistic หากยังไม่เคยดูโปรเจกต์นี้ใน session ปัจจุบัน
    if (!(local[project.id] && local[project.id].viewed)) {
      currentViews++; // เพิ่มค่าทันทีเพื่อแสดงผล
    }

    const likeBtn = document.createElement("button");
    // ใช้ local[project.id].liked ในการกำหนดคลาส 'liked'
    likeBtn.className = `like-btn ${local[project.id] && local[project.id].liked ? "liked" : ""}`;
    likeBtn.innerHTML = `
      <i class="fas fa-heart"></i>
      <span class="like-count">${currentLikes}</span>
    `;
    likeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      handleLike(project.id, likeBtn);
    });

    const shareBtn = document.createElement("button");
    shareBtn.className = `share-btn ${local[project.id] && local[project.id].shared ? "shared" : ""}`;
    shareBtn.innerHTML = `
      <i class="fas fa-share-alt"></i>
      <span class="share-count">${currentShares}</span>
    `;
    shareBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      handleShare(project.id, shareBtn);
    });

    const viewDisplay = document.createElement("div");
    viewDisplay.className = "view-display";
    viewDisplay.innerHTML = `
      <i class="fas fa-eye"></i>
      <span class="view-count">${currentViews}</span>
    `;

    const container = document.createElement("div");
    container.style.cssText = "position:relative;text-align:center;";
    container.append(media, likeBtn, shareBtn, viewDisplay);

    lightboxContent.appendChild(container);
    lightboxCaption.textContent = `${project.title} — ${project.desc}`;
    lightboxEl.style.display = "flex";
    document.body.classList.add("lightbox-open");

    // เรียก handleView ในเบื้องหลังหลังจากแสดง Lightbox ทันที
    handleView(project.id);
  }

  // Close lightbox
  lightboxClose.addEventListener("click", () => {
    lightboxEl.style.display = "none";
    lightboxContent.innerHTML = "";
    document.body.classList.remove("lightbox-open");
  });

  lightboxEl.addEventListener("click", (e) => {
    if (e.target === lightboxEl) {
      lightboxEl.style.display = "none";
      lightboxContent.innerHTML = "";
      document.body.classList.remove("lightbox-open");
    }
  });

  // Initial render
  (async function init() {
    console.log("Initializing project gallery...");
    showProjectsLoading(true); // แสดง loading spinner ก่อนเริ่มโหลด
    // ดึง project IDs ทั้งหมด
    const projectIds = projects.map(p => p.id);
    // ดึงสถิติทั้งหมดพร้อมกัน
    const allStatsMap = await fetchAllProjectStats(projectIds);

    // ค้นหาโปรเจกต์ที่มีคนดูมากที่สุด
    let mostViewedProjectId = null;
    let maxViews = -1;
    for (const id in allStatsMap) {
      if (allStatsMap.hasOwnProperty(id)) {
        if (allStatsMap[id].views > maxViews) {
          maxViews = allStatsMap[id].views;
          mostViewedProjectId = id;
        }
      }
    }

    // Render gallery โดยส่ง allStatsMap และ mostViewedProjectId เข้าไปด้วย
    await renderGallery(projects, allStatsMap, mostViewedProjectId);
    await updateTotalStatsDisplay(); // เรียกใช้เมื่อโหลดหน้าเว็บ
    console.log("Project gallery initialized.");
  })();

  // Mobile Menu Toggle
  const menuToggle = document.querySelector('.menu-toggle');
  const headerList = document.querySelector('.header-list');

  menuToggle.addEventListener('click', function () {
    this.classList.toggle('open');
    headerList.classList.toggle('active');
    if (headerList.classList.contains('active')) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  });

  // Shrink Header on Scroll
  const header = document.querySelector('.header-section');
  let lastScrollPosition = 0;

  window.addEventListener('scroll', function () {
    const currentScrollPosition = window.pageYOffset;

    if (currentScrollPosition > 100) {
      header.classList.add('shrink');
    } else {
      header.classList.remove('shrink');
    }

    // Optional: Hide header on scroll down, show on scroll up
    // if (currentScrollPosition > lastScrollPosition && currentScrollPosition > 100) {
    //   header.classList.add('hide');
    // } else {
    //   header.classList.remove('hide');
    // }

    lastScrollPosition = currentScrollPosition;
  });

  // Filter functionality
  filtersEl.addEventListener('click', async function(e) {
    if (e.target.tagName === 'BUTTON') {
      // Remove 'active' from all buttons
      filtersEl.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
      // Add 'active' to the clicked button
      e.target.classList.add('active');

      const filter = e.target.dataset.filter;
      const filteredProjects = projects.filter(project => {
        return filter === 'all' || project.category === filter;
      });

      showProjectsLoading(true); // แสดง loading spinner ก่อนเริ่มกรอง
      // ดึง project IDs ของโปรเจกต์ที่ถูกกรอง
      const filteredProjectIds = filteredProjects.map(p => p.id);
      // ดึงสถิติทั้งหมดสำหรับโปรเจกต์ที่ถูกกรองพร้อมกัน
      const allStatsMapForFiltered = await fetchAllProjectStats(filteredProjectIds);

      // ค้นหาโปรเจกต์ที่มีคนดูมากที่สุดในชุดข้อมูลที่ถูกกรอง
      let mostViewedProjectId = null;
      let maxViews = -1;
      for (const id in allStatsMapForFiltered) {
        if (allStatsMapForFiltered.hasOwnProperty(id)) {
          if (allStatsMapForFiltered[id].views > maxViews) {
            maxViews = allStatsMapForFiltered[id].views;
            mostViewedProjectId = id;
          }
        }
      }

      // Render gallery โดยส่ง allStatsMapForFiltered และ mostViewedProjectId เข้าไปด้วย
      renderGallery(filteredProjects, allStatsMapForFiltered, mostViewedProjectId);
    }
  });

  // Event listener for Clear All Likes button (เปลี่ยนเป็น Clear All Stats)
  if (clearLikesBtn) {
    clearLikesBtn.addEventListener('click', async () => {
      const confirmClear = await showConfirmModal('คุณแน่ใจหรือไม่ว่าต้องการล้างยอดไลก์, แชร์, และวิวทั้งหมดในฐานข้อมูลและ Local Storage?');
      if (confirmClear) {
        try {
          const response = await fetch('/.netlify/functions/projectStats?clear_all=true', { // เปลี่ยน endpoint
            method: 'DELETE'
          });
          if (response.ok) {
            await showInfoModal('ล้างสถิติทั้งหมดในฐานข้อมูลสำเร็จ!');
            clearAllLocalStats(); // ล้าง local storage ด้วย
          } else {
            const errorData = await response.json().catch(() => ({})); // พยายาม parse JSON, ถ้าไม่ได้ให้เป็น object ว่าง
            await showInfoModal('เกิดข้อผิดพลาดในการล้างสถิติในฐานข้อมูล: ' + (errorData.error || response.statusText));
          }
        } catch (error) {
          console.error('Error clearing all stats:', error);
          await showInfoModal('เกิดข้อผิดพลาดในการเชื่อมต่อเพื่อล้างสถิติ');
        }
      }
    });
  }

  // --- Custom Modal UI Functions ---
  // ฟังก์ชันสำหรับสร้างและแสดง Modal ข้อมูล
  function showInfoModal(message) {
    return new Promise(resolve => {
      const modal = document.createElement('div');
      modal.className = 'custom-modal';
      modal.innerHTML = `
        <div class="custom-modal-content">
          <p>${message}</p>
          <button id="modal-ok-btn" class="custom-modal-btn">ตกลง</button>
        </div>
      `;
      document.body.appendChild(modal);

      document.getElementById('modal-ok-btn').addEventListener('click', () => {
        document.body.removeChild(modal);
        resolve(true);
      });
    });
  }

  // ฟังก์ชันสำหรับสร้างและแสดง Modal ยืนยัน
  function showConfirmModal(message) {
    return new Promise(resolve => {
      const modal = document.createElement('div');
      modal.className = 'custom-modal';
      modal.innerHTML = `
        <div class="custom-modal-content">
          <p>${message}</p>
          <div class="custom-modal-actions">
            <button id="modal-confirm-btn" class="custom-modal-btn confirm">ยืนยัน</button>
            <button id="modal-cancel-btn" class="custom-modal-btn cancel">ยกเลิก</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      document.getElementById('modal-confirm-btn').addEventListener('click', () => {
        document.body.removeChild(modal);
        resolve(true);
      });

      document.getElementById('modal-cancel-btn').addEventListener('click', () => {
        document.body.removeChild(modal);
        resolve(false);
      });
    });
  }

  // Dark Mode Toggle Logic
  // ตรวจสอบสถานะ Dark Mode ที่บันทึกไว้ใน Local Storage เมื่อโหลดหน้าเว็บ
  const isDarkMode = localStorage.getItem('darkMode') === 'true';
  if (isDarkMode) {
    document.body.classList.add('dark-mode');
  }

  // Event listener สำหรับปุ่มสลับ Dark Mode
  if (darkModeToggle) {
    darkModeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      // บันทึกสถานะ Dark Mode ลงใน Local Storage
      localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    });
  }

  // New Infinity Loop Slider for Certificates
  const certSliderTrack = document.querySelector('.cert-slider-track');
  if (certSliderTrack) {
    const certCards = Array.from(certSliderTrack.children); // Get original cards

    // Duplicate cards to create seamless loop
    // We duplicate all cards to ensure a smooth transition when the animation loops
    certCards.forEach(card => {
      const clonedCard = card.cloneNode(true);
      certSliderTrack.appendChild(clonedCard);
    });

    // Pause on hover
    certSliderTrack.addEventListener('mouseenter', () => {
      certSliderTrack.style.animationPlayState = 'paused';
    });

    certSliderTrack.addEventListener('mouseleave', () => {
      certSliderTrack.style.animationPlayState = 'running';
    });
  }

  // Uptime Counter
  const startTime = new Date("2025-07-03T00:14:20");
  function updateUptime() {
    const now = new Date();
    const diff = Math.floor((now - startTime) / 1000);
    const days = Math.floor(diff / 86400);
    const hours = Math.floor((diff % 86400) / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;
    document.getElementById("uptime").textContent =
      ` ${days}d ${hours}h ${minutes}m ${seconds}s `;
  }
  setInterval(updateUptime, 1000);
  updateUptime();

  // Visitor Counter
  let count = localStorage.getItem("viewCount") || 0;
  count++;
  localStorage.setItem("viewCount", count);
  document.getElementById("visitor-count").textContent = count;

  // Random Quote Display
  const quotes = [
    "ความพยายามไม่เคยทรยศใคร",
    "เรียนรู้ในสิ่งที่ใช่ จะได้ทำในสิ่งที่รัก",
    "ทุกวันคือโอกาสใหม่",
    "อย่ารอความมั่นใจ จงเริ่มจากความตั้งใจ"
  ];
  document.getElementById("quote").textContent =
    quotes[Math.floor(Math.random() * quotes.length)];

  // Preloader Hide Logic
  window.addEventListener('load', () => {
    console.log("Window loaded. Hiding preloader and showing main content.");
    const preloader = document.getElementById('preloader');
    const mainContent = document.getElementById('main-content');

    if (preloader) {
      preloader.classList.add('hidden'); // เพิ่มคลาส hidden เพื่อ fade out
      preloader.addEventListener('transitionend', () => {
        preloader.style.display = 'none'; // ซ่อนเมื่อ transition สิ้นสุด
      }, { once: true });
    }
    if (mainContent) {
      mainContent.style.display = 'block'; // แสดงเนื้อหาหลัก
    }

    AOS.init({
      duration: 800,
      easing: 'ease-out',
      once: true,
      mirror: false,
      anchorPlacement: 'top-bottom',
    });
  });

}); // End DOMContentLoaded

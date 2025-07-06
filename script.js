// เหตุการณ์ DOMContentLoaded: ตรวจสอบให้แน่ใจว่า HTML ถูกโหลดและแยกวิเคราะห์เรียบร้อยแล้วก่อนที่จะรันสคริปต์
document.addEventListener("DOMContentLoaded", function () {
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
        document.documentElement.style.overflow = ''; // เพิ่มการปลดล็อกการเลื่อนบน html
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
  const projects = [
    {
      "id": "project-1",
      "title": "ออกแบบ แผนผังอินเตอร์เน็ต",
      "category": "it",
      "year": 2024,
      "type": "image",
      "thumbnail": "assets/images/1741780829154.jpg",
      "src": "assets/images/1741780829154.jpg",
      "desc": "ออกแบบ แผนผังโครงสร้างท่อร้อยสายเน็ตบนอาคารจากห้อง server ถึงชั้น 3 ของอาคาร",
      "shortDesc": "ออกแบบแผนผังโครงสร้างท่อร้อยสายเน็ต"
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
      "year": 2023,
      "type": "image",
      "thumbnail": "assets/images/093739.png",
      "src": "assets/images/093739.png",
      "desc": "ซ้อมแข่งหุ่นยนต์ระดับกลาง แต่ก็ได้เหรียญทองนะค้าบบบ",
      "shortDesc": "ฝึกซ้อมแข่งขันหุ่นยนต์"
    },
    {
      "id": "project-11",
      "title": "ตัดต่ออินโทร โลโก",
      "category": "ตัดต่อ",
      "year": 2024,
      "type": "image",
      "thumbnail": "assets/images/094024.png",
      "src": "assets/images/094024.png",
      "desc": "ตัดต่ออินโทร โลโก และตัดต่อ VTR ให้โรงเรียน",
      "shortDesc": "ตัดต่อ Intro และ VTR"
    },
    {
      "id": "project-12",
      "title": "ลองเล่น esp32",
      "category": "it",
      "year": 2024,
      "type": "image",
      "thumbnail": "assets/images/095615.png",
      "src": "assets/images/095615.png",
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
      "type": "image",
      "thumbnail": "assets/images/113700.png",
      "src": "assets/images/113700.png",
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
  // New Lightbox DOM Elements
  const lightboxOverlay = document.getElementById('lightbox-overlay');
  const lightboxContainer = document.getElementById('lightbox-content-container');
  const lightboxImage = document.getElementById('lightbox-image');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxClose = document.getElementById('lightbox-close');

  const totalLikesEl = document.getElementById("total-likes");
  const totalSharesEl = document.getElementById("total-shares");
  const totalViewsEl = document.getElementById("total-views");
  const darkModeToggle = document.getElementById("dark-mode-toggle");

  // Global variable to store the original bounding rectangle of the clicked image
  let originalRect = {};
  let currentMediaElement = null;

  // ===== Local stats registry =====
  const LOCAL_KEY = "project-stats";
  function loadLocalStats() { return JSON.parse(localStorage.getItem(LOCAL_KEY) || "{}"); }
  function saveLocalStats(d) { localStorage.setItem(LOCAL_KEY, JSON.stringify(d)); }

  // ฟังก์ชันสำหรับแสดง Modal ข้อความ
  function showInfoModal(message) {
    const modal = document.createElement('div');
    modal.className = 'custom-modal';
    modal.innerHTML = `
      <div class="custom-modal-content">
        <p>${message}</p>
        <div class="custom-modal-actions">
          <button class="custom-modal-btn confirm">ตกลง</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('.custom-modal-btn.confirm').addEventListener('click', () => {
      modal.remove();
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  // ===== Heart burst animation =====
  function triggerHeartBurst(btn) {
    const burst = document.createElement("div");
    burst.className = "heart-burst";
    for (let i = 0; i < 6; i++) {
      const h = document.createElement("div");
      h.className = "burst-heart";
      burst.appendChild(h);
    }
    btn.appendChild(burst);
    setTimeout(() => burst.remove(), 800);
  }

  // ===== Stat handler functions =====
  async function fetchProjectStats(id) {
    try {
      const response = await fetch(`/.netlify/functions/projectStats?id=${id}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `HTTP error! status: ${response.status}`;
        throw new Error(`Error fetching project stats for project ${id}: ${errorMessage}`);
      }
      const data = await response.json();
      return {
        likes: data.likes || 0,
        shares: data.shares || 0,
        views: data.views || 0,
        userHasLiked: data.userHasLiked || false
      };
    } catch (error) {
      console.error('Error fetching project stats:', error);
      return { likes: 0, shares: 0, views: 0, userHasLiked: false };
    }
  }

  async function fetchAllProjectStats(projectIds) {
    const statPromises = projectIds.map(id => fetchProjectStats(id));
    const results = await Promise.all(statPromises);
    const allStatsMap = {};
    projectIds.forEach((id, index) => {
      allStatsMap[id] = results[index];
    });
    return allStatsMap;
  }

  async function fetchTotalStat(type) {
    try {
      const response = await fetch(`/.netlify/functions/projectStats?total=true&type=${type}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
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

  async function handleLike(id, btn) {
    const local = loadLocalStats();
    if (local[id] && local[id].liked) {
      return;
    }

    let currentLikeCount = parseInt(btn.querySelector(".like-count").textContent);
    currentLikeCount++;
    btn.querySelector(".like-count").textContent = currentLikeCount;
    btn.classList.add("liked");
    triggerHeartBurst(btn);

    local[id] = local[id] || {};
    local[id].liked = true;
    saveLocalStats(local);

    try {
      const updatedStats = await pushStat(id, 'like');
      if (updatedStats) {
        updateTotalStatsDisplay();
      } else {
        btn.classList.remove("liked");
        const actualStats = await fetchProjectStats(id);
        btn.querySelector(".like-count").textContent = actualStats.likes;
        delete local[id].liked;
        saveLocalStats(local);
        await showInfoModal('เกิดข้อผิดพลาดในการบันทึกไลก์ กรุณาลองใหม่อีกครั้ง');
      }
    } catch (error) {
      console.error("Error in handleLike (server call):", error);
      btn.classList.remove("liked");
      const actualStats = await fetchProjectStats(id);
      btn.querySelector(".like-count").textContent = actualStats.likes;
      delete local[id].liked;
      saveLocalStats(local);
      await showInfoModal('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาตรวจสอบอินเทอร์เน็ตและลองใหม่อีกครั้ง');
    }
  }

  async function handleShare(id, btn) {
    const local = loadLocalStats();
    if (local[id] && local[id].shared) {
      return;
    }

    let currentShareCount = parseInt(btn.querySelector(".share-count").textContent);
    currentShareCount++;
    btn.querySelector(".share-count").textContent = currentShareCount;
    btn.classList.add("shared");

    local[id] = local[id] || {};
    local[id].shared = true;
    saveLocalStats(local);

    try {
      const updatedStats = await pushStat(id, 'share');
      if (updatedStats) {
        updateTotalStatsDisplay();
        if (navigator.share) {
          try {
            await navigator.share({
              title: projects.find(p => p.id === id)?.title || 'My Portfolio Project',
              text: projects.find(p => p.id === id)?.desc || 'Check out this amazing project!',
              url: window.location.href,
            });
          } catch (shareError) {
            console.log('User cancelled share');
          }
        } else {
          await showInfoModal('เบราว์เซอร์ของคุณไม่รองรับการแชร์โดยตรง กรุณาคัดลอกลิงก์ด้วยตนเอง');
        }
      } else {
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

  async function handleView(id) {
    const local = loadLocalStats();
    if (local[id] && local[id].viewed) {
      return;
    }

    local[id] = local[id] || {};
    local[id].viewed = true;
    saveLocalStats(local);

    try {
      const updatedStats = await pushStat(id, 'view');
      if (updatedStats) {
        updateTotalStatsDisplay();
      } else {
        delete local[id].viewed;
        saveLocalStats(local);
      }
    } catch (error) {
      console.error("Error in handleView (server call):", error);
      delete local[id].viewed;
      saveLocalStats(local);
    }
  }

  async function pushStat(id, type) {
    try {
      const response = await fetch(`/.netlify/functions/projectStats?id=${id}&type=${type}`, {
        method: "POST"
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `Server error: ${response.status} - Unknown error`;
        throw new Error(errorMessage);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error pushing ${type}:`, error);
      return null;
    }
  }

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

  function showProjectsLoading(show) {
    if (show) {
      galleryEl.innerHTML = `
        <div class="projects-loading-spinner">
          <div class="loader"></div>
          <p>กำลังโหลดโปรเจกต์...</p>
        </div>
      `;
      galleryEl.style.display = 'flex';
      galleryEl.style.justifyContent = 'center';
      galleryEl.style.alignItems = 'center';
      galleryEl.style.minHeight = '200px';
    } else {
      galleryEl.innerHTML = '';
      galleryEl.style.display = 'grid';
      galleryEl.style.justifyContent = '';
      galleryEl.style.alignItems = '';
      galleryEl.style.minHeight = '';
    }
  }

  // ===== Gallery render =====
  async function renderGallery(data, allStatsMap, mostViewedProjectId) {
    showProjectsLoading(false);
    galleryEl.innerHTML = "";
    const local = loadLocalStats();

    if (data.length === 0) {
      galleryEl.innerHTML = '<p class="no-projects-message">ไม่พบโปรเจกต์ในหมวดหมู่นี้</p>';
      galleryEl.style.display = 'block';
      return;
    }

    for (const project of data) {
      const item = document.createElement("div");
      item.classList.add("project-item");
      item.setAttribute('data-aos', 'fade-up');
      item.setAttribute('data-aos-duration', '800');
      item.setAttribute('data-id', project.id);

      const projectStats = allStatsMap[project.id] || { likes: 0, shares: 0, views: 0 };

      if (project.id === mostViewedProjectId && mostViewedProjectId !== null) {
        item.classList.add('most-viewed');
      }

      item.innerHTML = `
        <img src="${project.thumbnail}" alt="${project.title}">
        <div class="project-overlay">
            <h4>${project.title}</h4>
            <p>${project.shortDesc || project.desc}</p>
            <button class="view-button">
              ดูรูปภาพ
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

      item.addEventListener("click", function(e) {
        if (!e.target.closest('.stat-item') && !e.target.classList.contains('view-button')) {
          const clickedImage = this.querySelector('img');
          originalRect = clickedImage.getBoundingClientRect();
          openLightbox(project, projectStats, originalRect);
        }
      });

      const viewButton = item.querySelector(".view-button");
      if (viewButton) {
        viewButton.addEventListener("click", (e) => {
          e.stopPropagation();
          const clickedImage = item.querySelector('img');
          originalRect = clickedImage.getBoundingClientRect();
          openLightbox(project, projectStats, originalRect);
        });
      }

      const likeBtn = item.querySelector(".stat-item.likes");
      if (likeBtn) {
        likeBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          handleLike(project.id, likeBtn);
        });
      }

      const shareBtn = item.querySelector(".stat-item.shares");
      if (shareBtn) {
        if (local[project.id] && local[project.id].shared) {
          shareBtn.classList.add("shared");
        }
        shareBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          handleShare(project.id, shareBtn);
        });
      }

      galleryEl.appendChild(item);
    }
  }

  // ===== Lightbox functions =====
  // ฟังก์ชันสำหรับเปิด Lightbox และแสดงภาพ
  async function openLightbox(project, initialProjectStats, triggerRect) {
    // รีเซ็ตองค์ประกอบสื่อก่อนเปิดรายการใหม่
    lightboxImage.style.display = 'none';
    lightboxImage.src = '';
    
    let mediaElement;
    const controls = lightboxContainer.querySelector('.lightbox-controls');

    // กำหนดตำแหน่งเริ่มต้นของสื่อให้ตรงกับตำแหน่งของภาพขนาดย่อที่คลิก
    mediaElement = lightboxImage;
    mediaElement.src = project.src;
    mediaElement.alt = project.title;
    mediaElement.style.display = 'block'; // แสดงภาพทันที

    // กำหนดสไตล์เริ่มต้นสำหรับแอนิเมชัน
    mediaElement.style.left = `${triggerRect.left}px`;
    mediaElement.style.top = `${triggerRect.top}px`;
    mediaElement.style.width = `${triggerRect.width}px`;
    mediaElement.style.height = `${triggerRect.height}px`;
    mediaElement.style.objectFit = 'cover'; 
    mediaElement.style.transition = 'all 0.2s ease-in-out'; // เพิ่ม transition ที่นี่

    currentMediaElement = mediaElement;

    // สำหรับรูปภาพ ให้เรียก animateLightbox เมื่อรูปภาพโหลดเสร็จ
    mediaElement.onload = () => {
      animateLightbox(mediaElement, controls);
    };
    
    controls.innerHTML = '';

    const local = loadLocalStats();

    const currentLikes = initialProjectStats.likes;
    const currentShares = initialProjectStats.shares;
    let currentViews = initialProjectStats.views;

    if (!(local[project.id] && local[project.id].viewed)) {
      currentViews++;
    }

    const likeBtn = document.createElement('button');
    likeBtn.className = `lightbox-btn like-btn ${local[project.id] && local[project.id].liked ? 'liked' : ''}`;
    likeBtn.innerHTML = `<i class="fas fa-heart"></i> <span class="like-count">${currentLikes}</span>`;
    likeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      handleLike(project.id, likeBtn);
    });

    const shareBtn = document.createElement('button');
    shareBtn.className = `lightbox-btn share-btn ${local[project.id] && local[project.id].shared ? 'shared' : ''}`;
    shareBtn.innerHTML = `<i class="fas fa-share-alt"></i> <span class="share-count">${currentShares}</span>`;
    shareBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      handleShare(project.id, shareBtn);
    });

    const viewDisplay = document.createElement('div');
    viewDisplay.className = 'lightbox-btn view-display';
    viewDisplay.innerHTML = `<i class="fas fa-eye"></i> <span class="view-count">${currentViews}</span>`;

    controls.append(likeBtn, shareBtn, viewDisplay);

    lightboxCaption.textContent = `${project.title} — ${project.desc}`;

    lightboxOverlay.classList.add('active');
    lightboxContainer.classList.add('active');
    lightboxClose.classList.add('active');
    document.body.classList.add("lightbox-open");
    document.documentElement.classList.add("lightbox-open"); // เพิ่มการล็อกการเลื่อนบน html
    
    handleView(project.id);
  }

  // ฟังก์ชันสำหรับภาพเคลื่อนไหว Lightbox
  // การใช้ CSS transitions ช่วยให้การเคลื่อนไหวลื่นไหลและมีประสิทธิภาพ
  function animateLightbox(mediaElement, controlsElement) {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    let finalWidth, finalHeight;
    let aspectRatio;

    if (mediaElement.tagName === 'IMG') {
      aspectRatio = mediaElement.naturalWidth / mediaElement.naturalHeight;
    } else { // VIDEO - This block is now effectively removed as video functionality is removed
      // This part will not be reached if project.type is always 'image'
      aspectRatio = 16 / 9; // Fallback or default for video if it were present
    }

    const maxViewportWidth = windowWidth * 0.9;
    const maxViewportHeight = windowHeight * 0.9;

    if (maxViewportWidth / maxViewportHeight > aspectRatio) {
      finalHeight = maxViewportHeight;
      finalWidth = finalHeight * aspectRatio;
    } else {
      finalWidth = maxViewportWidth;
      finalHeight = finalWidth / aspectRatio;
    }

    const finalLeft = (windowWidth - finalWidth) / 2;
    const finalTop = (windowHeight - finalHeight) / 2;

    // กำหนดสไตล์เป้าหมายเพื่อทริกเกอร์ CSS transition
    mediaElement.style.left = `${finalLeft}px`;
    mediaElement.style.top = `${finalTop}px`;
    mediaElement.style.width = `${finalWidth}px`;
    mediaElement.style.height = `${finalHeight}px`;
    mediaElement.style.objectFit = 'cover';

    setTimeout(() => {
      lightboxCaption.classList.add('active');
      controlsElement.classList.add('active');
    }, 300);
  }

  // ฟังก์ชันสำหรับปิด Lightbox
  function closeLightbox() {
    lightboxCaption.classList.remove('active');
    const controls = lightboxContainer.querySelector('.lightbox-controls');
    if (controls) controls.classList.remove('active');

    if (currentMediaElement && originalRect) {
      // กำหนด transition ก่อนที่จะเปลี่ยนสไตล์กลับ
      currentMediaElement.style.transition = 'all 0.4s ease';
      currentMediaElement.style.left = `${originalRect.left}px`;
      currentMediaElement.style.top = `${originalRect.top}px`;
      currentMediaElement.style.width = `${originalRect.width}px`;
      currentMediaElement.style.height = `${originalRect.height}px`;
      currentMediaElement.style.objectFit = 'cover';
    }

    setTimeout(() => {
      lightboxOverlay.classList.remove('active');
      lightboxContainer.classList.remove('active');
      lightboxClose.classList.remove('active');
      
      if (currentMediaElement) {
        // ลบ transition และสไตล์อินไลน์หลังจากแอนิเมชันเสร็จสิ้น
        currentMediaElement.style.transition = ''; // ลบ transition ที่นี่
        currentMediaElement.removeAttribute('style');
        currentMediaElement.src = '';
        currentMediaElement = null;
      }

      lightboxImage.style.display = 'none';
      document.body.classList.remove("lightbox-open");
      document.documentElement.classList.remove("lightbox-open"); // เพิ่มการปลดล็อกการเลื่อนบน html

      // ตรวจสอบและลบตัวบ่งชี้การโหลดหากยังคงอยู่ (สำหรับวิดีโอ ซึ่งตอนนี้ถูกลบออกแล้ว)
      const loadingSpinner = lightboxContainer.querySelector('.lightbox-video-loading');
      if (loadingSpinner) {
        loadingSpinner.remove();
      }
    }, 400);
  }

  // Event Listeners for lightbox
  lightboxOverlay.addEventListener('click', closeLightbox);
  lightboxClose.addEventListener('click', closeLightbox);
  lightboxContainer.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  // Initial render
  (async function init() {
    showProjectsLoading(true);
    const projectIds = projects.map(p => p.id);
    const allStatsMap = await fetchAllProjectStats(projectIds);

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

    await renderGallery(projects, allStatsMap, mostViewedProjectId);
    await updateTotalStatsDisplay();
  })();

  // Mobile Menu Toggle
  const menuToggle = document.querySelector('.menu-toggle');
  const headerList = document.querySelector('.header-list');

  menuToggle.addEventListener('click', function () {
    this.classList.toggle('open');
    headerList.classList.toggle('active');
    if (headerList.classList.contains('active')) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden'; // เพิ่มการล็อกการเลื่อนบน html
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = ''; // เพิ่มการปลดล็อกการเลื่อนบน html
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

    lastScrollPosition = currentScrollPosition;
  });

  // Filter functionality
  filtersEl.addEventListener('click', async function(e) {
    if (e.target.tagName === 'BUTTON') {
      filtersEl.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');

      const filter = e.target.dataset.filter;
      const filteredProjects = projects.filter(project => {
        return filter === 'all' || project.category === filter;
      });

      showProjectsLoading(true);
      const filteredProjectIds = filteredProjects.map(p => p.id);
      const allStatsMapForFiltered = await fetchAllProjectStats(filteredProjectIds);

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

      renderGallery(filteredProjects, allStatsMapForFiltered, mostViewedProjectId);
    }
  });

  // Dark Mode Toggle Logic
  const isDarkMode = localStorage.getItem('darkMode') === 'true';
  if (isDarkMode) {
    document.body.classList.add('dark-mode');
  }

  if (darkModeToggle) {
    darkModeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    });
  }

  // New Infinity Loop Slider for Certificates
  const certSliderTrack = document.querySelector('.cert-slider-track');
  if (certSliderTrack) {
    const certCards = Array.from(certSliderTrack.children);
    certCards.forEach(card => {
      const clonedCard = card.cloneNode(true);
      certSliderTrack.appendChild(clonedCard);
    });

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
    const diff = Math.floor((now - startTime) / 1000); // Total seconds
    const days = Math.floor(diff / 86400); // Total days
    const hours = Math.floor((diff % 86400) / 3600); // Remaining hours after days
    const minutes = Math.floor((diff % 3600) / 60); // Remaining minutes after hours
    const seconds = diff % 60; // Remaining seconds after minutes
    document.getElementById("uptime").textContent =
      ` ${days}d ${hours}h ${minutes}m ${seconds}s `;
  }
  setInterval(updateUptime, 1000);
  updateUptime();

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
    const preloader = document.getElementById('preloader');
    const mainContent = document.getElementById('main-content');

    if (preloader) {
      preloader.classList.add('hidden');
      preloader.addEventListener('transitionend', () => {
        preloader.style.display = 'none';
      }, { once: true });
    }
    if (mainContent) {
      mainContent.style.display = 'block';
    }

    AOS.init({
      duration: 800,
      easing: 'ease-out',
      once: true,
      mirror: false,
      anchorPlacement: 'top-bottom',
    });
  });
});

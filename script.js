// เหตุการณ์ DOMContentLoaded: ตรวจสอบให้แน่ใจว่า HTML ถูกโหลดและแยกวิเคราะห์เรียบร้อยแล้วก่อนที่จะรันสคริปต์
document.addEventListener("DOMContentLoaded", function () {

  // Active link highlighting based on scroll position:
  // ไฮไลต์ลิงก์เมนูนำทางที่ตรงกับส่วนของหน้าเว็บที่กำลังมองเห็น
  const sections = document.querySelectorAll("section"); // เลือกทุกส่วนของหน้า (section)
  const navItems = document.querySelectorAll(".header-nav li a"); // เลือกทุกลิงก์ในเมนูนำทาง

  // เพิ่ม Event Listener สำหรับการเลื่อนหน้าจอ
  window.addEventListener("scroll", function () {
    let current = ""; // ตัวแปรสำหรับเก็บ ID ของส่วนที่กำลังมองเห็น

    // วนลูปผ่านแต่ละส่วนของหน้า
    sections.forEach((section) => {
      const sectionTop = section.offsetTop; // ตำแหน่งด้านบนของส่วน
      const sectionHeight = section.clientHeight; // ความสูงของส่วน

      // ตรวจสอบว่าส่วนนั้นอยู่ในขอบเขตการมองเห็นหรือไม่ (ปรับ -100 เพื่อให้ไฮไลต์ก่อนถึงส่วนเล็กน้อย)
      if (pageYOffset >= sectionTop - 100) {
        current = section.getAttribute("id"); // กำหนด ID ของส่วนที่กำลังมองเห็น
      }
    });

    // วนลูปผ่านแต่ละลิงก์ในเมนูนำทาง
    navItems.forEach((item) => {
      item.classList.remove("active"); // ลบคลาส 'active' ออกจากทุกลิงก์ก่อน
      // ถ้า href ของลิงก์ตรงกับ ID ของส่วนที่กำลังมองเห็น ให้เพิ่มคลาส 'active'
      if (item.getAttribute("href") === `#${current}`) {
        item.classList.add("active");
      }
    });
  });

  // Smooth scrolling for anchor links:
  // ทำให้การเลื่อนหน้าจอไปยังส่วนที่ลิงก์เชื่อมโยงเป็นไปอย่างราบรื่น
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault(); // ป้องกันการทำงานเริ่มต้นของลิงก์ (กระโดดทันที)

      const targetId = this.getAttribute("href"); // รับค่า href (ID ของส่วนเป้าหมาย)
      if (targetId === "#") return; // ถ้า href เป็นแค่ "#" ให้หยุดการทำงาน

      const targetElement = document.querySelector(targetId); // เลือกส่วนเป้าหมายด้วย ID
      if (targetElement) {
        // เลื่อนหน้าจอไปยังส่วนเป้าหมายอย่างราบรื่น (ปรับ -80 เพื่อให้เว้นระยะจาก Header)
        window.scrollTo({
          top: targetElement.offsetTop - 80,
          behavior: "smooth",
        });
      }
      // Close mobile menu if open after clicking a link:
      // ปิดเมนูมือถือหากเปิดอยู่หลังจากคลิกที่ลิงก์
      const menuToggle = document.querySelector('.menu-toggle');
      const headerList = document.querySelector('.header-list');
      if (headerList.classList.contains('active')) {
        menuToggle.classList.remove('open');
        headerList.classList.remove('active');
        document.body.style.overflow = ''; // ปลดล็อคการเลื่อนหน้าจอ
      }
    });
  });

  // ลบโค้ดแอนิเมชันเดิมสำหรับส่วนต่างๆ ที่จะใช้ AOS (Animate On Scroll)
  // โค้ดส่วนนี้ถูกคอมเมนต์ไว้เนื่องจากมีการใช้ AOS library เข้ามาจัดการอนิเมชันแล้ว
  /*
  const animatedSections = document.querySelectorAll(
    "#Home, #About, #Skills, #Projects, #Contact"
  );

  const sectionObserverOptions = {
    threshold: 0.1, // Trigger when 10% of the section is visible
    rootMargin: "0px 0px -50px 0px", // Adjust to trigger slightly before reaching the bottom
  };

  const sectionObserver = new IntersectionObserver(function (entries, observer) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.remove("section-hidden");
        entry.target.classList.add("section-reveal");
        observer.unobserve(entry.target); // Stop observing once animated
      }
    });
  }, sectionObserverOptions);

  animatedSections.forEach((section) => {
    section.classList.add("section-hidden"); // Apply initial hidden state
    sectionObserver.observe(section);
  });
  */

  // Profile image hover effect:
  // เอฟเฟกต์การซูมรูปโปรไฟล์เมื่อนำเมาส์ไปชี้
  // โค้ดส่วนนี้ถูกลบออกเนื่องจากมีการจัดการด้วย CSS ในไฟล์ style.css แล้ว
  /*
  const profileImg = document.querySelector(".about-profile");
  profileImg.addEventListener("mouseenter", function () {
    this.style.transform = "scale(1.05)";
  });

  profileImg.addEventListener("mouseleave", function () {
    this.style.transform = "scale(1)";
  });
  */

  // Typewriter effect for motto (optional):
  // เอฟเฟกต์พิมพ์ดีดสำหรับคติประจำใจ
  const motto = document.querySelector(".about-motto p");
  if (motto) { // ตรวจสอบว่ามีองค์ประกอบคติประจำใจอยู่หรือไม่
    const text = motto.textContent; // เก็บข้อความต้นฉบับ
    motto.textContent = ""; // ล้างข้อความเดิม

    let i = 0;
    // ตั้งค่า setInterval เพื่อเพิ่มตัวอักษรทีละตัว
    const typeWriter = setInterval(() => {
      if (i < text.length) {
        motto.textContent += text.charAt(i); // เพิ่มตัวอักษรทีละตัว
        i++;
      } else {
        clearInterval(typeWriter); // หยุด setInterval เมื่อพิมพ์ครบ
      }
    }, 50); // ความเร็วในการพิมพ์ (มิลลิวินาที)
  }

  // ====== DATA ======
  // ข้อมูลโปรเจกต์และกิจกรรมต่างๆ สามารถแก้ไข/เพิ่มเติมผลงานได้ตามต้องการ
  const projects = [{
      "id": 1,
      "title": "ออกแบบ แผนผังอินเตอร์เน็ต",
      "category": "it",
      "year": 2024,
      "type": "image",
      "thumbnail": "assets/images/1741780829154.jpg",
      "src": "assets/images/1741780829154.jpg",
      "desc": "ออกแบบ แผนผังโครงสร้างท่อร้อยสายเน็ตบนอาคารจากห้อง server ถึงชั้น 3 ของอาคาร"
    },
    {
      "id": 2,
      "title": "อัพเดตโปรแกรมต่างๆ",
      "category": "it",
      "year": 2024,
      "type": "image",
      "thumbnail": "assets/images/1739578807758.jpg",
      "src": "assets/images/1739578807758.jpg",
      "desc": "อัพเดตโปรแกรมต่างๆ ในคอมพิวเตอร์"
    },
    {
      "id": 3,
      "title": "เข้าหัวสายแลน",
      "category": "it",
      "year": 2024,
      "type": "image",
      "thumbnail": "assets/images/IMG20250329132925.jpg",
      "src": "assets/images/IMG20250329132925.jpg",
      "desc": "เข้าหัวสายแลนและเอาเข้าตู้ และเตรียมเทสสปีด"
    },
    {
      "id": 4,
      "title": "เทสสปีดเน็ต",
      "category": "it",
      "year": 2024,
      "type": "image",
      "thumbnail": "assets/images/IMG20250506092117.jpg",
      "src": "assets/images/IMG20250506092117.jpg",
      "desc": "เทสสปีดเน็ต ให้ได้มาตรฐาน คือ 900Mb"
    },
    {
      "id": 5,
      "title": "ตัดสายไฟ เข้าบล็อกไฟเพื่อติดตั้งภายในห้องคอม",
      "category": "it",
      "year": 2024,
      "type": "image",
      "thumbnail": "assets/images/IMG20250507104510.jpg",
      "src": "assets/images/IMG20250507104510.jpg",
      "desc": "ตัดสายไฟ เข้าบล็อกไฟเพื่ิติดตัดภายในห้องคอม"
    },
    {
      "id": 6,
      "title": "ทำโปสเตอร์ ประกาศ",
      "category": "แต่งภาพ",
      "year": 2024,
      "type": "image",
      "thumbnail": "assets/images/39a4db3b-f6e8-467f-88ce-c40193c8972aphoto.png",
      "src": "assets/images/39a4db3b-f6e8-467f-88ce-c40193c8972aphoto.png",
      "desc": "ทำโปสเตอร์ ประกาศ การเลือกตั้งประธานนักเรียน"
    },
    {
      "id": 7,
      "title": "เป็นตากล้อง ถ่ายรูปกิจกรรมต่างๆ",
      "category": "แต่งภาพ",
      "year": 2024,
      "type": "image",
      "thumbnail": "assets/images/1751162337512.jpg",
      "src": "assets/images/1751162337512.jpg",
      "desc": "เป็นตากล้อง ถ่ายรูปกิจกรรมต่างๆ"
    },
    {
      "id": 8,
      "title": "ซ้อมคอมพิวเตอร์ให้กลับมาใช้งานได้",
      "category": "it",
      "year": 2024,
      "type": "image",
      "thumbnail": "assets/images/IMG_20250313_053720.jpg",
      "src": "assets/images/IMG_20250313_053720.jpg",
      "desc": "เปลี่ยน ssd และจัดระเบียบสายไฟ"
    },
    {
      "id": 9,
      "title": "ช่วยคอมคุมเพลงและเพิ่มเกมผ่านโปรเจคเตอร์ในกิจกรรม",
      "category": "it",
      "year": 2024,
      "type": "image",
      "thumbnail": "assets/images/IMG20250529092723.jpg",
      "src": "assets/images/IMG20250529092723.jpg",
      "desc": "ช่วยคอมคุมเพลงและเพิ่มเกมผ่านโปรเจคเตอร์ในกิจกรรม เพื่อเพิ่มความสนุกสนานในกิจกรรม"
    },
    {
      "id": 10,
      "title": "ซ้อมแข่งหุ่นยนต์ระดับกลาง",
      "category": "เเข่งหุ่นยนต์",
      "year": 2024,
      "type": "video",
      "thumbnail": "assets/images/093739.png",
      "src": "assets/video/received_651238003846627.mp4",
      "desc": "ซ้อมแข่งหุ่นยนต์ระดับกลาง แต่ก็ได้เหรียญทองนะค้าบบบ"
    },
    {
      "id": 11,
      "title": "ตัดต่ออินโทร โลโก",
      "category": "ตัดต่อ",
      "year": 2024,
      "type": "video",
      "thumbnail": "assets/images/094024.png",
      "src": "assets/video/received_1793334780.mp4",
      "desc": "ตัดต่ออินโทร โลโก และตัดต่อ VTR ให้โรงเรียน"
    },
    {
      "id": 12,
      "title": "เล่น esp32",
      "category": "it",
      "year": 2024,
      "type": "video",
      "thumbnail": "assets/images/095615.png",
      "src": "assets/video/VID_20250512065631.mp4",
      "desc": "ลองเล่น esp32 โดยให้เล่น อนิเมชั่นง่ายๆ"
    },
    {
      "id": 13,
      "title": "เขียนบอทเกมใน Discord",
      "category": "code",
      "year": 2024,
      "type": "image",
      "thumbnail": "assets/images/IMG_20241212_215204.jpg",
      "src": "assets/images/IMG_20241212_215204.jpg",
      "desc": "ลองสร้างเกมง่ายๆบน discord เพื่อการศึกษา"
    },
    {
      "id": 14,
      "title": "ลองสร้างโค้ด python ด้วย ai",
      "category": "code",
      "year": 2025,
      "type": "video",
      "thumbnail": "assets/images/113700.png",
      "src": "assets/video/125002.mp4",
      "desc": "ช่วงนั่นผมได้ดึงไฟล์จาดกล้องมา แล้วผมไม่ได้ติดตั้ง แอพแปลงไฟล์เลย ลองทำโค้ดนี้ขึ้นมา โค้ดนี้สามารถดูใน github"
    },
    {
      "id": 15,
      "title": "ผมเคยเป็นผู้ช่วยตัดต่อและกำกับหนังสั้น",
      "category": "ตัดต่อ",
      "year": 2025,
      "type": "video",
      "thumbnail": "assets/images/204654.png",
      "src": "assets/video/01_1.mp4",
      "desc": "สามารถ ดูคริปได้เลยครับ"
    },
    {
      "id": 16,
      "title": "ผมได้เป็นหนึ่งในสมาชิกสภานักเรียน",
      "category": "code",
      "year": 2024,
      "type": "image",
      "thumbnail": "assets/images/IMG_20250223_115236.jpg",
      "src": "assets/images/IMG_20250223_115236.jpg",
      "desc": "ผมได้ทำหน้าที่เป็นหัวหน้าฝ่ายโสตทัศนะ"
    },
  ];

  // ====== DOM Elements ======
  // เลือกองค์ประกอบ DOM ที่จำเป็น
  const filtersEl = document.getElementById('filters');
  const galleryEl = document.getElementById('gallery');
  const lightboxEl = document.getElementById('lightbox');
  const lightboxContent = document.getElementById('lightbox-content');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxClose = document.getElementById('lightbox-close');

  // ====== LIKE SYSTEM (Toggle, localStorage) ======
  // ฟังก์ชันสำหรับโหลดสถานะ Like จาก Local Storage
  function loadLikes() {
    try {
      return JSON.parse(localStorage.getItem('likes') || '{}');
    } catch (error) {
      console.error("Error loading likes from localStorage:", error);
      return {};
    }
  }

  // ฟังก์ชันสำหรับบันทึกสถานะ Like ลง Local Storage
  function saveLikes(likes) {
    localStorage.setItem('likes', JSON.stringify(likes));
  }

  // ฟังก์ชันสำหรับรับจำนวน Like ของโปรเจกต์
  function getLikes(id) {
    const likes = loadLikes();
    return likes[id] ? 1 : 0; // ถ้ามี Like จะคืนค่า 1 มิฉะนั้นคืนค่า 0
  }

  // ฟังก์ชันสำหรับสร้างแอนิเมชันหัวใจกระจาย
  function triggerHeartBurst(btn) {
    const burst = document.createElement('div');
    burst.className = 'heart-burst';
    for (let i = 0; i < 6; i++) {
      const heart = document.createElement('div');
      heart.className = 'burst-heart';
      burst.appendChild(heart);
    }
    btn.appendChild(burst);
    // ลบแอนิเมชันออกหลังจาก 800 มิลลิวินาที
    setTimeout(() => burst.remove(), 800);
  }

  // ฟังก์ชันสำหรับจัดการการกด Like
  function handleLike(id, btn) {
    const likes = loadLikes();
    if (likes[id]) { // ถ้าเคย Like แล้ว
      delete likes[id]; // ลบ Like ออก
      btn.classList.remove('liked'); // ลบคลาส 'liked'
    } else { // ถ้ายังไม่เคย Like
      likes[id] = true; // เพิ่ม Like
      btn.classList.add('liked'); // เพิ่มคลาส 'liked'
      triggerHeartBurst(btn); // เรียกใช้แอนิเมชันหัวใจกระจาย
    }
    saveLikes(likes); // บันทึกสถานะ Like
    // อัพเดตจำนวน Like ที่แสดงบน UI
    btn.querySelector('.like-count').textContent = likes[id] ? 1 : 0;
  }

  // ฟังก์ชันสำหรับเรนเดอร์แกลเลอรีผลงาน
  function renderGallery(data) {
    galleryEl.innerHTML = ''; // ล้างเนื้อหาในแกลเลอรีเดิม
    const likes = loadLikes(); // โหลดสถานะ Like

    data.forEach(p => {
      const item = document.createElement('div');
      item.className = 'gallery-item';
      item.setAttribute('data-type', p.type || '');
      // เพิ่ม data-aos attribute ให้กับแต่ละ item ใน gallery สำหรับอนิเมชัน
      item.setAttribute('data-aos', 'zoom-in');
      item.setAttribute('data-aos-duration', '500');
      item.setAttribute('data-aos-once', 'true');

      const likedClass = likes[p.id] ? 'liked' : ''; // กำหนดคลาส 'liked' ถ้าโปรเจกต์ถูก Like

      item.innerHTML = `
      <img src="${p.thumbnail}" alt="${p.title}">
      <div class="gallery-info">
        <h3>${p.title}</h3>
        <p>${p.desc}</p>
        <button class="like-btn ${likedClass}" aria-label="Like ${p.title}">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" class="heart">
            <path d="M12.1 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.65 11.54l-1.45 1.31z"/>
          </svg>
          <span class="like-count">${getLikes(p.id)}</span>
        </button>
      </div>`;

      const likeBtn = item.querySelector('.like-btn');
      // เพิ่ม Event Listener สำหรับปุ่ม Like
      likeBtn.addEventListener('click', e => {
        e.stopPropagation(); // หยุดการแพร่กระจายของเหตุการณ์ (ป้องกันไม่ให้เปิด Lightbox)
        handleLike(p.id, likeBtn);
      });

      // เพิ่ม Event Listener สำหรับเปิด Lightbox เมื่อคลิกที่ไอเท็มแกลเลอรี
      item.addEventListener('click', () => openLightbox(p));
      galleryEl.appendChild(item); // เพิ่มไอเท็มลงในแกลเลอรี
    });
  }

  // Event Listener สำหรับปุ่ม Filter
  filtersEl.addEventListener('click', e => {
    if (e.target.tagName !== 'BUTTON') return; // ตรวจสอบว่าคลิกที่ปุ่มเท่านั้น
    // ลบคลาส 'active' ออกจากปุ่ม Filter ทั้งหมด
    document.querySelectorAll('#filters button').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active'); // เพิ่มคลาส 'active' ให้กับปุ่มที่ถูกคลิก
    const filter = e.target.getAttribute('data-filter'); // รับค่า filter
    // เรนเดอร์แกลเลอรีใหม่ตาม filter ที่เลือก
    renderGallery(filter === 'all' ? projects : projects.filter(p => p.category === filter));
  });

  // ฟังก์ชันสำหรับเปิด Lightbox
  function openLightbox(project) {
    lightboxContent.innerHTML = ''; // ล้างเนื้อหา Lightbox เดิม
    // สร้างองค์ประกอบ media (video หรือ img) ตามประเภทของโปรเจกต์
    const media = document.createElement(project.type === 'video' ? 'video' : 'img');
    media.src = project.src;
    media.alt = project.title;
    if (project.type === 'video') {
      media.controls = true; // แสดง controls สำหรับวิดีโอ
      media.autoplay = true; // เล่นวิดีโออัตโนมัติ
    }
    media.style.maxWidth = '90vw';
    media.style.maxHeight = '80vh';

    const likes = loadLikes();
    const likedClass = likes[project.id] ? 'liked' : '';
    const likeBtn = document.createElement('button');
    likeBtn.className = `like-btn ${likedClass}`;
    likeBtn.style.position = 'absolute';
    likeBtn.style.top = '1rem';
    likeBtn.style.left = '1rem';
    likeBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" class="heart">
      <path d="M12.1 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.65 11.54l-1.45 1.31z"/>
    </svg>
    <span class="like-count">${getLikes(project.id)}</span>
  `;

    // เพิ่ม Event Listener สำหรับปุ่ม Like ใน Lightbox
    likeBtn.addEventListener('click', e => {
      e.stopPropagation();
      handleLike(project.id, likeBtn);
    });

    const container = document.createElement('div');
    container.style.position = 'relative';
    container.style.textAlign = 'center';
    container.appendChild(media);
    container.appendChild(likeBtn);

    lightboxContent.appendChild(container);
    lightboxCaption.textContent = `${project.title} — ${project.desc}`; // แสดงคำบรรยาย
    lightboxEl.style.display = 'flex'; // แสดง Lightbox

    // ป้องกันการเลื่อนหน้าจอเมื่อ Lightbox เปิดอยู่
    document.body.classList.add('lightbox-open');
  }

  // Event Listener สำหรับปุ่มปิด Lightbox
  lightboxClose.addEventListener('click', () => {
    lightboxEl.style.display = 'none'; // ซ่อน Lightbox
    lightboxContent.innerHTML = ''; // ล้างเนื้อหา Lightbox
    document.body.classList.remove('lightbox-open'); // ปลดล็อคการเลื่อนหน้าจอ
  });

  // Event Listener สำหรับปิด Lightbox เมื่อคลิกนอกเนื้อหา
  lightboxEl.addEventListener('click', e => {
    if (e.target === lightboxEl) {
      lightboxEl.style.display = 'none';
      lightboxContent.innerHTML = '';
      document.body.classList.remove('lightbox-open');
    }
  });

  renderGallery(projects); // เรียกใช้ฟังก์ชันเพื่อเรนเดอร์แกลเลอรีครั้งแรก

  // Mobile Menu Toggle:
  // การจัดการการเปิด/ปิดเมนูสำหรับหน้าจอมือถือ
  const menuToggle = document.querySelector('.menu-toggle');
  const headerList = document.querySelector('.header-list');

  menuToggle.addEventListener('click', function () {
    this.classList.toggle('open'); // สลับคลาส 'open' บนปุ่ม Hamburger
    headerList.classList.toggle('active'); // สลับคลาส 'active' บนเมนู
    // ล็อค/ปลดล็อคการเลื่อนหน้าจอตามสถานะเมนู
    if (headerList.classList.contains('active')) {
      document.body.style.overflow = 'hidden'; // ล็อคการเลื่อน
    } else {
      document.body.style.overflow = ''; // ปลดล็อคการเลื่อน
    }
  });

  // Shrink Header on Scroll:
  // ทำให้ Header ย่อขนาดลงเมื่อเลื่อนหน้าจอ
  const header = document.querySelector('.header-section');
  let lastScrollPosition = 0; // เก็บตำแหน่งการเลื่อนครั้งล่าสุด

  window.addEventListener('scroll', function () {
    const currentScrollPosition = window.pageYOffset; // ตำแหน่งการเลื่อนปัจจุบัน

    // เอฟเฟกต์ย่อ Header
    if (currentScrollPosition > 100) {
      header.classList.add('shrink');
    } else {
      header.classList.remove('shrink');
    }

    // ซ่อน Header เมื่อเลื่อนลง, แสดงเมื่อเลื่อนขึ้น
    if (currentScrollPosition > lastScrollPosition && currentScrollPosition > 100) {
      // เลื่อนลง
      header.classList.add('hide');
    } else {
      // เลื่อนขึ้น
      header.classList.remove('hide');
    }

    lastScrollPosition = currentScrollPosition; // อัพเดตตำแหน่งการเลื่อนครั้งล่าสุด
  });

}); // สิ้นสุด DOMContentLoaded

// ===== Scroll Animation with Intersection Observer for Certificates section =====
// ส่วนนี้สำหรับแอนิเมชันการ์ดใบรับรองที่ใช้การเลื่อนแบบ Sticky
const section = document.querySelector('#Certificates'); // เลือกส่วน Certificates
const cards = section.querySelectorAll('.cert-card'); // เลือกการ์ดใบรับรองทั้งหมด
const total = cards.length; // จำนวนการ์ดทั้งหมด

// ฟังก์ชันสำหรับอัพเดตสถานะการแสดงผลของการ์ดใบรับรองตามตำแหน่งการเลื่อน
function updateCards() {
  const start = section.offsetTop; // ตำแหน่งเริ่มต้นของส่วน Certificates
  const end = start + section.offsetHeight; // ตำแหน่งสิ้นสุดของส่วน Certificates
  const midY = window.scrollY + window.innerHeight / 2; // ตำแหน่งกึ่งกลางของหน้าจอที่กำลังมองเห็น

  // ถ้าตำแหน่งกึ่งกลางของหน้าจออยู่นอกส่วน Certificates ให้ซ่อนการ์ดทั้งหมด
  if (midY < start || midY > end) {
    cards.forEach((c) => {
      c.classList.remove('active', 'shown'); // ลบคลาส active และ shown
      const rankEl = c.querySelector('.rank');
      if (rankEl) rankEl.textContent = ''; // ลบข้อความอันดับ
    });
    return;
  }

  // คำนวณความคืบหน้าของการเลื่อนภายในส่วน Certificates
  const progress = (midY - start) / section.offsetHeight;
  // คำนวณดัชนีของการ์ดที่ควรจะ Active
  const index = Math.min(total - 1, Math.floor(progress * total));

  // วนลูปผ่านแต่ละการ์ดเพื่ออัพเดตสถานะ
  cards.forEach((c, i) => {
    const rankEl = c.querySelector('.rank');
    if (i <= index) { // ถ้าการ์ดอยู่ในตำแหน่งที่ควรแสดง
      c.classList.add('shown'); // เพิ่มคลาส shown
      if (rankEl) rankEl.textContent = `#${i + 1}`; // แสดงอันดับ

      if (i === index) { // ถ้าเป็นการ์ดที่ Active
        c.classList.add('active'); // เพิ่มคลาส active
      } else {
        c.classList.remove('active'); // ลบคลาส active
      }
    } else { // ถ้าการ์ดอยู่นอกตำแหน่งที่ควรแสดง
      c.classList.remove('shown', 'active'); // ลบคลาส shown และ active
      if (rankEl) rankEl.textContent = ''; // ลบข้อความอันดับ
    }
  });
}

// Init & listeners: เรียกใช้ฟังก์ชัน updateCards ครั้งแรกและเพิ่ม Event Listener
updateCards();
window.addEventListener('scroll', updateCards); // อัพเดตเมื่อเลื่อนหน้าจอ
window.addEventListener('resize', updateCards); // อัพเดตเมื่อปรับขนาดหน้าจอ

// Uptime Counter:
// ตัวนับเวลาที่เว็บไซต์ออนไลน์อยู่
const startTime = new Date("2025-07-03T00:14:20"); // เปลี่ยนเป็นวันที่เริ่มเผยแพร่จริง
function updateUptime() {
  const now = new Date(); // เวลาปัจจุบัน
  const diff = Math.floor((now - startTime) / 1000); // ผลต่างเป็นวินาที
  const days = Math.floor(diff / 86400); // จำนวนวัน
  const hours = Math.floor((diff % 86400) / 3600); // จำนวนชั่วโมง
  const minutes = Math.floor((diff % 3600) / 60); // จำนวนนาที
  const seconds = diff % 60; // จำนวนวินาที
  // แสดงผลในรูปแบบ วันd ชั่วโมงh นาทีm วินาทีs
  document.getElementById("uptime").textContent =
    ` ${days}d ${hours}h ${minutes}m ${seconds}s `;
}
setInterval(updateUptime, 1000); // อัพเดตทุก 1 วินาที
updateUptime(); // เรียกใช้ครั้งแรกเพื่อแสดงผลทันที

// Visitor Counter:
// ตัวนับจำนวนผู้เข้าชม (ใช้ Local Storage)
let count = localStorage.getItem("viewCount") || 0; // โหลดค่าจาก Local Storage หรือเริ่มต้นที่ 0
count++; // เพิ่มจำนวนผู้เข้าชม
localStorage.setItem("viewCount", count); // บันทึกค่าลง Local Storage
document.getElementById("visitor-count").textContent = count; // แสดงผลจำนวนผู้เข้าชม

// Random Quote Display:
// แสดงคำคมแบบสุ่ม
const quotes = [
  "ความพยายามไม่เคยทรยศใคร",
  "เรียนรู้ในสิ่งที่ใช่ จะได้ทำในสิ่งที่รัก",
  "ทุกวันคือโอกาสใหม่",
  "อย่ารอความมั่นใจ จงเริ่มจากความตั้งใจ"
];
// เลือกคำคมแบบสุ่มและแสดงผล
document.getElementById("quote").textContent =
  quotes[Math.floor(Math.random() * quotes.length)];

// Preloader Hide Logic:
// ซ่อน Preloader เมื่อหน้าเว็บโหลดเสร็จสมบูรณ์
window.addEventListener('load', () => {
  const preloader = document.getElementById('preloader');
  const mainContent = document.getElementById('main-content'); // ใช้ ID ที่เพิ่มใน index.html

  if (preloader) {
    preloader.style.display = 'none'; // ซ่อน Preloader
  }
  if (mainContent) {
    mainContent.style.display = 'block'; // แสดงเนื้อหาหลัก
  }
  // เรียกใช้ AOS.init() หลังจากที่เนื้อหาหลักแสดงผลแล้ว
  AOS.init({
    duration: 800, // ระยะเวลาของแอนิเมชัน (เป็นมิลลิวินาที)
    easing: 'ease-out', // ฟังก์ชันการเร่งความเร็วของแอนิเมชัน
    once: false, // กำหนดให้แอนิเมชันเล่นเพียงครั้งเดียวเมื่อเลื่อนผ่าน
    mirror: true, // กำหนดให้แอนิเมชันเล่นซ้ำเมื่อเลื่อนขึ้น/ลง
    anchorPlacement: 'top-bottom', // ตำแหน่งที่จะทริกเกอร์แอนิเมชัน
  });
});

import { projects } from "./data/projectsData.js";

document.addEventListener("DOMContentLoaded", function () {
  // Active link highlighting based on scroll position
  const sections = document.querySelectorAll("section");
  const navItems = document.querySelectorAll(".header-nav li a");

  window.addEventListener("scroll", function () {
    let current = "";

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      if (pageYOffset >= sectionTop - 100) {
        current = section.getAttribute("id");
      }
    });

    navItems.forEach((item) => {
      item.classList.remove("active");
      if (item.getAttribute("href") === `#${current}`) {
        item.classList.add("active");
      }
    });
  });

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();

      const targetId = this.getAttribute("href");
      if (targetId === "#") return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        const headerOffset = document.querySelector('.header-section').offsetHeight;
        const elementPosition = targetElement.offsetTop;
        const offsetPosition = elementPosition - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }

      const menuToggle = document.querySelector('.menu-toggle');
      const headerList = document.querySelector('.header-list');
      if (headerList.classList.contains('active')) {
        menuToggle.classList.remove('open');
        headerList.classList.remove('active');
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
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

  // Project Data

  // DOM Elements
  const filtersEl = document.getElementById("filters");
  const galleryEl = document.getElementById("gallery");
  const lightboxOverlay = document.getElementById('lightbox-overlay');
  const lightboxContainer = document.getElementById('lightbox-content-container');
  const lightboxImage = document.getElementById('lightbox-image');
  const lightboxInfoContainer = document.getElementById('lightbox-info-container');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxClose = document.getElementById('lightbox-close');

  const totalLikesEl = document.getElementById("total-likes");
  const totalSharesEl = document.getElementById("total-shares");
  const totalViewsEl = document.getElementById("total-views");
  const darkModeToggle = document.getElementById("dark-mode-toggle");

  let originalRect = {};
  let currentMediaElement = null;

  // Local stats registry
  const LOCAL_KEY = "project-stats";
  function loadLocalStats() { return JSON.parse(localStorage.getItem(LOCAL_KEY) || "{}"); }
  function saveLocalStats(d) { localStorage.setItem(LOCAL_KEY, JSON.stringify(d)); }

  // Function to show info modal
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

  // Heart burst animation
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

  function triggerFullscreenHeart() {
    const heart = document.createElement('div');
    heart.className = 'fullscreen-heart-animation';
    heart.innerHTML = '<i class="fas fa-heart"></i>';
    document.body.appendChild(heart);

    setTimeout(() => {
      heart.remove();
    }, 800); // Match animation duration
  }
 
  // Stat handler functions
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

    if (btn.closest('.lightbox-controls')) {
      triggerFullscreenHeart();
    }
 
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

  // Gallery rendering
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
        <div class="project-image-container">
          <img src="${project.thumbnail}" alt="${project.title}">
          <div class="view-icon"><i class="fas fa-plus"></i></div>
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

      item.addEventListener("click", function (e) {
        if (e.target.closest('.stat-item') || e.target.closest('.read-more-project-btn')) {
          return;
        }
        const clickedImage = this.querySelector('img');
        originalRect = clickedImage.getBoundingClientRect();
        openLightbox(project, projectStats, originalRect);
      });

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

      const descP = item.querySelector('.project-content p');
      if (descP.scrollHeight > descP.clientHeight) {
        const readMoreBtn = document.createElement('button');
        readMoreBtn.className = 'read-more-project-btn';
        readMoreBtn.textContent = 'อ่านเพิ่มเติม';
        descP.insertAdjacentElement('afterend', readMoreBtn);

        readMoreBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          descP.classList.toggle('expanded');
          readMoreBtn.textContent = descP.classList.contains('expanded') ? 'ย่อลง' : 'อ่านเพิ่มเติม';
        });
      }
    }
  }

  // Lightbox functions
  async function openLightbox(project, initialProjectStats, triggerRect) {
    // Clear previous content immediately to prevent flash of old text
    const captionContent = lightboxCaption.querySelector('.lightbox-caption-content');
    if (captionContent) {
      captionContent.textContent = '';
    }
    const existingBtn = lightboxCaption.querySelector('.read-more-btn');
    if (existingBtn) {
      existingBtn.remove();
    }
    lightboxCaption.classList.remove('expanded');

    lightboxImage.style.display = 'none';
    lightboxImage.src = '';
    
    let mediaElement;
    const controls = lightboxInfoContainer.querySelector('.lightbox-controls');

    mediaElement = lightboxImage;
    mediaElement.src = project.src;
    mediaElement.alt = project.title;
    mediaElement.style.display = 'block';

    mediaElement.style.left = `${triggerRect.left}px`;
    mediaElement.style.top = `${triggerRect.top}px`;
    mediaElement.style.width = `${triggerRect.width}px`;
    mediaElement.style.height = `${triggerRect.height}px`;
    mediaElement.style.objectFit = 'cover'; 
    mediaElement.style.transition = 'all 0.5s ease-out';

    currentMediaElement = mediaElement;

    mediaElement.onload = () => {
      animateLightbox(mediaElement, lightboxInfoContainer, project);
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

    lightboxOverlay.classList.add('active');
    lightboxContainer.classList.add('active');
    lightboxClose.classList.add('active');
    document.body.classList.add("lightbox-open");
    document.documentElement.classList.add("lightbox-open");
    
    handleView(project.id);
  }

  function setupLightboxCaption(project) {
    const captionContent = lightboxCaption.querySelector('.lightbox-caption-content');
    if (!captionContent) return;

    // Reset state
    lightboxCaption.classList.remove('expanded');
    const existingBtn = lightboxCaption.querySelector('.read-more-btn');
    if (existingBtn) {
        existingBtn.remove();
    }

    captionContent.textContent = `${project.title} — ${project.desc}`;

    // Use line-height calculation for a more reliable overflow check
    const style = window.getComputedStyle(captionContent);
    const lineHeight = parseFloat(style.lineHeight);
    const clampLines = parseInt(style.webkitLineClamp || '2');
    const clampedHeight = lineHeight * clampLines;

    // Check if the actual scroll height exceeds the calculated clamped height (with a small buffer)
    if (captionContent.scrollHeight > clampedHeight + 2) {
        const readMoreBtn = document.createElement('button');
        readMoreBtn.className = 'read-more-btn';
        readMoreBtn.textContent = 'เพิ่มเติม';
        
        lightboxCaption.appendChild(readMoreBtn);

        readMoreBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            lightboxCaption.classList.toggle('expanded');
            readMoreBtn.textContent = lightboxCaption.classList.contains('expanded') ? 'ย่อลง' : 'เพิ่มเติม';
        });
    }
  }

  function animateLightbox(mediaElement, controlsElement, project) {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    let finalWidth, finalHeight;
    let aspectRatio;

    if (mediaElement.tagName === 'IMG') {
      aspectRatio = mediaElement.naturalWidth / mediaElement.naturalHeight;
    } else {
      aspectRatio = 16 / 9;
    }

    const maxViewportWidth = windowWidth * 0.9;
    const maxViewportHeight = windowHeight * 0.8; // Give more space for the info container

    if (maxViewportWidth / maxViewportHeight > aspectRatio) {
      finalHeight = maxViewportHeight;
      finalWidth = finalHeight * aspectRatio;
    } else {
      finalWidth = maxViewportWidth;
      finalHeight = finalWidth / aspectRatio;
    }

    const finalLeft = (windowWidth - finalWidth) / 2;
    const finalTop = (windowHeight - finalHeight) / 2 - 30; // Move image up slightly

    mediaElement.style.left = `${finalLeft}px`;
    mediaElement.style.top = `${finalTop}px`;
    mediaElement.style.width = `${finalWidth}px`;
    mediaElement.style.height = `${finalHeight}px`;
    mediaElement.style.objectFit = 'cover';

    // Set up the caption content *before* the animation starts
    setupLightboxCaption(project);

    // Use a small timeout to ensure the browser has rendered the initial state
    // before adding the class that triggers the transition.
    setTimeout(() => {
      controlsElement.classList.add('active');
    }, 50);
  }

  function closeLightbox() {
    lightboxInfoContainer.classList.remove('active');

    if (currentMediaElement && originalRect) {
      currentMediaElement.style.transition = 'all 0.2s ease-out';
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
        currentMediaElement.style.transition = '';
        currentMediaElement.removeAttribute('style');
        currentMediaElement.src = '';
        currentMediaElement = null;
      }

      lightboxImage.style.display = 'none';
      document.body.classList.remove("lightbox-open");
      document.documentElement.classList.remove("lightbox-open");

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
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
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

  // Infinity Loop Slider for Certificates
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

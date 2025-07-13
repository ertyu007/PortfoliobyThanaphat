import { projects } from "./data/projectsData.js";
import {
  createRipple,
  mobileMenuToggle,
  shrinkHeader,
  backToTop,
  preloaderHide,
  aosInit,
  showInfoModal, // Keep showInfoModal import for logging
  CONSENT_KEY,
  PREFERENCES_KEY,
  getConsentPreferences,
  hasConsentFor,
  showConsentBanner,
  hideConsentBanner,
  showPreferencesModal,
  hidePreferencesModal,
  handleAcceptAllCookies,
  handleManagePreferences,
  handleSavePreferences,
  handleCancelPreferences
} from "./common-utils.js"; // Import shared utilities

document.addEventListener("DOMContentLoaded", function () {
  // Add Ripple effect to desired elements
  const rippleElements = document.querySelectorAll(
    ".hero-btn-primary a, .filter-btn, .project-item, .tab-btn, .section-tab, .cert-card"
  );

  rippleElements.forEach((element) => {
    element.classList.add("ripple");
    element.addEventListener("click", createRipple);
    element.addEventListener("touchend", createRipple); // For mobile
  });

  // Active link highlighting based on scroll position
  const sections = document.querySelectorAll("section");
  const navItems = document.querySelectorAll(".header-nav li a");
  const header = document.querySelector('.header-section');
  // Get initial header height, or a default if not available immediately
  const getHeaderOffset = () => header ? header.offsetHeight : 80; // Fallback to 80px if header not found

  // Use Intersection Observer for more efficient scroll highlighting
  const observerOptions = {
    root: null,
    // Adjust margin based on header height. Use a function to get current height.
    // This margin effectively shifts the "trigger point" for intersection.
    rootMargin: `-${getHeaderOffset()}px 0px 0px 0px`,
    threshold: 0.3, // Trigger when 30% of the section is visible (adjusted from 0.5)
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      // เพิ่ม console.log เพื่อช่วยในการดีบั๊ก
      console.log(`Section: ${entry.target.id}, isIntersecting: ${entry.isIntersecting}, IntersectionRatio: ${entry.intersectionRatio}`);
      if (entry.isIntersecting) {
        const current = entry.target.getAttribute("id");
        navItems.forEach((item) => {
          item.classList.remove("active");
          // Check if the href matches the current section ID
          if (item.getAttribute("href") === `#${current}`) {
            item.classList.add("active");
            console.log(`Active class added to: ${item.getAttribute("href")}`); // บันทึกเมื่อมีการเพิ่มคลาส active
          }
        });
      } else {
        // Remove active class when a section exits the viewport
        const current = entry.target.getAttribute("id");
        navItems.forEach((item) => {
          if (item.getAttribute("href") === `#${current}`) {
            item.classList.remove("active");
            console.log(`Active class removed from: ${item.getAttribute("href")}`); // บันทึกเมื่อมีการลบคลาส active
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach((section) => {
    observer.observe(section);
  });

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();

      const targetId = this.getAttribute("href");
      if (targetId === "#") return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        // Recalculate headerOffset in case it changed (e.g., shrink class)
        const currentHeaderOffset = getHeaderOffset();
        const elementPosition = targetElement.offsetTop;
        const offsetPosition = elementPosition - currentHeaderOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }

      // Close mobile menu after clicking a link
      mobileMenuToggle(); // Use the imported shared function
    });
  });

  // Project Data
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
  const clearLocalDataBtn = document.getElementById("clear-local-data");

  let originalRect = {};
  let currentMediaElement = null;

  // --- Cookie Consent & Local Storage Management ---
  const LOCAL_STATS_KEY = "project-stats";

  const cookieConsentBanner = document.getElementById('cookie-consent-banner');
  const acceptAllCookiesBtn = document.getElementById('accept-all-cookies');
  const managePreferencesBtn = document.getElementById('manage-preferences');

  const cookiePreferencesModal = document.getElementById('cookie-preferences-modal');
  const essentialStorageCheckbox = document.getElementById('essential-storage');
  const analyticsStorageCheckbox = document.getElementById('analytics-storage');
  const uiStorageCheckbox = document.getElementById('ui-storage'); // New checkbox for UI preferences
  const savePreferencesBtn = document.getElementById('save-preferences');
  const cancelPreferencesBtn = document.getElementById('cancel-preferences');

  // Handle "Accept All"
  if (acceptAllCookiesBtn) {
    acceptAllCookiesBtn.addEventListener('click', () => handleAcceptAllCookies(initFeaturesBasedOnConsent));
  }

  // Handle "Manage Preferences"
  if (managePreferencesBtn) {
    managePreferencesBtn.addEventListener('click', handleManagePreferences);
  }

  // Handle "Save Preferences"
  if (savePreferencesBtn) {
    savePreferencesBtn.addEventListener('click', () => handleSavePreferences(initFeaturesBasedOnConsent));
  }

  // Handle "Cancel Preferences"
  if (cancelPreferencesBtn) {
    cancelPreferencesBtn.addEventListener('click', handleCancelPreferences);
  }

  // Function to initialize/re-initialize features based on consent
  function initFeaturesBasedOnConsent() {
    const consentStatus = localStorage.getItem(CONSENT_KEY);
    const preferences = getConsentPreferences();

    // Dark Mode
    if (darkModeToggle) {
      if (preferences.ui) { // Check for 'ui' consent
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        if (isDarkMode) {
          document.body.classList.add('dark-mode');
        }
      } else {
        // If UI preferences consent is revoked, remove dark mode and clear setting
        document.body.classList.remove('dark-mode');
        localStorage.removeItem('darkMode');
      }
    }

    // Project Stats (Likes, Shares, Views)
    if (galleryEl) {
      if (preferences.analytics) { // Check for 'analytics' consent
        // Re-render gallery with stats if consent is granted
        (async function () {
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
          renderGallery(projects, allStatsMap, mostViewedProjectId);
        })();
        updateTotalStatsDisplay();
      } else {
        // Clear project stats from local storage if consent is revoked
        localStorage.removeItem(LOCAL_STATS_KEY);
        // Render gallery without stats functionality
        renderGallery(projects, {}, null); // Pass empty stats, no most viewed
        if (totalLikesEl) totalLikesEl.textContent = '0';
        if (totalSharesEl) totalSharesEl.textContent = '0';
        if (totalViewsEl) totalViewsEl.textContent = '0';
      }
    }
  }

  // Check consent on initial load
  const initialConsent = localStorage.getItem(CONSENT_KEY);
  if (!initialConsent) {
    showConsentBanner();
  } else {
    initFeaturesBasedOnConsent(); // Initialize features based on existing consent
  }

  // Function to clear all non-essential local storage data
  function clearUserData() {
    showInfoModal('คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลการใช้งานทั้งหมด (เช่น สถิติโปรเจกต์, การตั้งค่าโหมดมืด) ซึ่งอาจส่งผลต่อประสบการณ์การใช้งานเว็บไซต์?', true, () => {
      localStorage.removeItem(LOCAL_STATS_KEY); // Clear project stats
      localStorage.removeItem('darkMode'); // Clear dark mode setting
      localStorage.removeItem(CONSENT_KEY); // Reset consent
      localStorage.removeItem(PREFERENCES_KEY); // Reset preferences

      // Re-initialize the page to reflect changes
      document.body.classList.remove('dark-mode'); // Ensure dark mode is off
      showConsentBanner(); // Show consent banner again
      initFeaturesBasedOnConsent(); // Re-initialize features
      console.log('ข้อมูลการใช้งานถูกลบเรียบร้อยแล้ว'); // Log success instead of modal
    });
  }

  // Attach event listener to the "Clear Data" button
  if (clearLocalDataBtn) {
    clearLocalDataBtn.addEventListener('click', clearUserData);
  }

  // --- End Cookie Consent & Local Storage Management ---

  // Local stats registry - now conditional
  function loadLocalStats() {
    if (hasConsentFor('analytics')) {
      return JSON.parse(localStorage.getItem(LOCAL_STATS_KEY) || "{}");
    }
    return {}; // Return empty if no consent
  }

  function saveLocalStats(d) {
    if (hasConsentFor('analytics')) {
      localStorage.setItem(LOCAL_STATS_KEY, JSON.stringify(d));
    }
  }

  // Function to trigger heart burst animation
  function triggerHeartBurst(btn) {
    const burst = document.createElement("div");
    burst.className = "heart-burst";
    for (let i = 0; i < 16; i++) {
      const h = document.createElement("div");
      h.className = "burst-heart";

      const angle = Math.random() * Math.PI * 2;
      const distance = 40 + Math.random() * 60;
      h.style.setProperty('--x', `${Math.cos(angle) * distance}px`);
      h.style.setProperty('--y', `${Math.sin(angle) * distance}px`);

      h.style.animationDelay = `${Math.random() * 0.4}s`;

      burst.appendChild(h);
    }

    btn.appendChild(burst);
    setTimeout(() => burst.remove(), 1000);
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

  // Stat handler functions - now conditional
  async function fetchProjectStats(id) {
    if (!hasConsentFor('analytics')) return { likes: 0, shares: 0, views: 0, userHasLiked: false };
    try {
      const response = await fetch(`/.netlify/functions/projectStats?id=${id}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `HTTP error! status: ${response.status}`;
        console.error(`Error fetching project stats for project ${id}: ${errorMessage}`); // Log error
        return { likes: 0, shares: 0, views: 0, userHasLiked: false };
      }
      const data = await response.json();
      return {
        likes: data.likes || 0,
        shares: data.shares || 0,
        views: data.views || 0,
        userHasLiked: data.userHasLiked || false
      };
    } catch (error) {
      console.error('Error fetching project stats:', error); // Log error
      return { likes: 0, shares: 0, views: 0, userHasLiked: false };
    }
  }

  async function fetchAllProjectStats(projectIds) {
    if (!hasConsentFor('analytics')) return {};
    const statPromises = projectIds.map(id => fetchProjectStats(id));
    const results = await Promise.all(statPromises);
    const allStatsMap = {};
    projectIds.forEach((id, index) => {
      allStatsMap[id] = results[index];
    });
    return allStatsMap;
  }

  async function fetchTotalStat(type) {
    if (!hasConsentFor('analytics')) return 0;
    try {
      const response = await fetch(`/.netlify/functions/projectStats?total=true&type=${type}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `HTTP error! status: ${response.status}`;
        console.error(`Error fetching total ${type}: ${errorMessage}`); // Log error
        return 0;
      }
      const data = await response.json();
      return data.totalCount || 0;
    } catch (error) {
      console.error(`Error fetching total ${type}:`, error); // Log error
      return 0;
    }
  }

  async function handleLike(id, btn) {
    if (!hasConsentFor('analytics')) {
      console.log('โปรดกดยอมรับ "สถิติและการตั้งค่า" ในการจัดการความเป็นส่วนตัวเพื่อใช้งานฟังก์ชันนี้'); // Log message
      return;
    }
    const local = loadLocalStats();
    if (local[id] && local[id].liked) {
      return;
    }

    let currentLikeCount = parseInt(btn.querySelector(".like-count").textContent);
    currentLikeCount++;
    btn.querySelector(".like-count").textContent = currentLikeCount;
    btn.classList.add("liked");

    triggerHeartBurst(btn);
    triggerFullscreenHeart();

    local[id] = local[id] || {};
    local[id].liked = true;
    saveLocalStats(local);

    try {
      const updatedStats = await pushStat(id, 'like');
      if (updatedStats) {
        updateTotalStatsDisplay();
      } else {
        // Rollback if failed
        btn.classList.remove("liked");
        const actualStats = await fetchProjectStats(id);
        btn.querySelector(".like-count").textContent = actualStats.likes;
        delete local[id].liked;
        saveLocalStats(local);
        console.error('เกิดข้อผิดพลาดในการบันทึกไลก์ กรุณาลองใหม่อีกครั้ง'); // Log error
      }
    } catch (error) {
      console.error("Error in handleLike (server call):", error); // Log error
      btn.classList.remove("liked");
      const actualStats = await fetchProjectStats(id);
      btn.querySelector(".like-count").textContent = actualStats.likes;
      delete local[id].liked;
      saveLocalStats(local);
      console.error(`เกิดข้อผิดพลาดในการเชื่อมต่อเพื่อบันทึกไลก์: ${error.message} กรุณาตรวจสอบอินเทอร์เน็ตและลองใหม่อีกครั้ง`); // Log error
    }
  }

  async function handleShare(id, btn) {
    if (!hasConsentFor('analytics')) {
      console.log('โปรดกดยอมรับ "สถิติและการตั้งค่า" ในการจัดการความเป็นส่วนตัวเพื่อใช้งานฟังก์ชันนี้'); // Log message
      return;
    }
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
            console.log('User cancelled share or share failed:', shareError); // Log share error
          }
        } else {
          console.log('เบราว์เซอร์ของคุณไม่รองรับการแชร์โดยตรง กรุณาคัดลอกลิงก์ด้วยตนเอง'); // Log message
        }
      } else {
        btn.classList.remove("shared");
        delete local[id].shared;
        saveLocalStats(local);
        const actualStats = await fetchProjectStats(id);
        btn.querySelector(".share-count").textContent = actualStats.shares;
        console.error('เกิดข้อผิดพลาดในการบันทึกการแชร์ กรุณาลองใหม่อีกครั้ง'); // Log error
      }
    } catch (error) {
      console.error("Error in handleShare (server call):", error); // Log error
      btn.classList.remove("shared");
      delete local[id].shared;
      saveLocalStats(local);
      const actualStats = await fetchProjectStats(id);
      btn.querySelector(".share-count").textContent = actualStats.shares;
      console.error(`เกิดข้อผิดพลาดในการเชื่อมต่อเพื่อบันทึกการแชร์: ${error.message} กรุณาตรวจสอบอินเทอร์เน็ตและลองใหม่อีกครั้ง`); // Log error
    }
  }

  async function handleView(id) {
    if (!hasConsentFor('analytics')) return;
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
      console.error("Error in handleView (server call):", error); // Log error
      delete local[id].viewed;
      saveLocalStats(local);
      console.error(`เกิดข้อผิดพลาดในการเชื่อมต่อเพื่อบันทึกการเข้าชม: ${error.message}`); // Log error
    }
  }

  async function pushStat(id, type) {
    if (!hasConsentFor('analytics')) return null;
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
      console.error(`Error pushing ${type}:`, error); // Log error
      return null;
    }
  }

  async function updateTotalStatsDisplay() {
    if (!hasConsentFor('analytics')) {
      if (totalLikesEl) totalLikesEl.textContent = '0';
      if (totalSharesEl) totalSharesEl.textContent = '0';
      if (totalViewsEl) totalViewsEl.textContent = '0';
      return;
    }
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

  // Gallery rendering - now conditional for stats display
  async function renderGallery(data, allStatsMap, mostViewedProjectId) {
    showProjectsLoading(false);
    galleryEl.innerHTML = "";
    const local = loadLocalStats(); // This will be empty if no analytics consent

    if (data.length === 0) {
      galleryEl.innerHTML = '<p class="no-projects-message">ไม่พบโปรเจกต์ในหมวดหมู่นี้</p>';
      galleryEl.style.display = 'block';
      return;
    }

    const fragment = document.createDocumentFragment(); // Use DocumentFragment for performance

    for (const project of data) {
      const item = document.createElement("div");
      item.classList.add("project-item");
      item.setAttribute('data-aos', 'fade-up');
      item.setAttribute('data-aos-duration', '800');
      item.setAttribute('data-id', project.id);

      const projectStats = hasConsentFor('analytics') ? (allStatsMap[project.id] || { likes: 0, shares: 0, views: 0 }) : { likes: 0, shares: 0, views: 0 };

      if (project.id === mostViewedProjectId && mostViewedProjectId !== null && hasConsentFor('analytics')) {
        item.classList.add('most-viewed');
      }

      item.innerHTML = `
        <div class="project-image-container">
          <img src="${project.thumbnail}" alt="${project.title}" loading="lazy">
          <div class="view-icon" aria-label="ดูรายละเอียดโปรเจกต์"><i class="fas fa-plus"></i></div>
        </div>
        <div class="project-content">
            <h3>${project.title}</h3>
            <p>${project.desc}</p>
            <div class="project-meta">
                <span class="category">${project.category}</span>
                <div class="stats">
                    <button class="stat-item likes ${hasConsentFor('analytics') && local[project.id] && local[project.id].liked ? 'liked' : ''}" aria-label="กดไลก์โปรเจกต์นี้">
                      <i class="fas fa-heart"></i>
                      <span class="like-count">${projectStats.likes}</span>
                    </button>
                    <button class="stat-item shares" aria-label="แชร์โปรเจกต์นี้">
                      <i class="fas fa-share-alt"></i>
                      <span class="share-count">${projectStats.shares}</span>
                    </button>
                    <span class="stat-item views" aria-label="จำนวนการเข้าชม">
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
        if (hasConsentFor('analytics') && local[project.id] && local[project.id].shared) {
          shareBtn.classList.add("shared");
        }
        shareBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          handleShare(project.id, shareBtn);
        });
      }

      const descP = item.querySelector('.project-content p');
      if (descP.scrollHeight > descP.clientHeight) {
        const readMoreBtn = document.createElement('button');
        readMoreBtn.className = 'read-more-project-btn';
        readMoreBtn.textContent = 'อ่านเพิ่มเติม';
        readMoreBtn.setAttribute('aria-expanded', 'false'); // A11y
        readMoreBtn.setAttribute('aria-controls', `project-desc-${project.id}`); // A11y
        descP.id = `project-desc-${project.id}`; // A11y

        descP.insertAdjacentElement('afterend', readMoreBtn);

        readMoreBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const isExpanded = descP.classList.toggle('expanded');
          readMoreBtn.textContent = isExpanded ? 'ย่อลง' : 'อ่านเพิ่มเติม';
          readMoreBtn.setAttribute('aria-expanded', isExpanded); // A11y
        });
      }
      fragment.appendChild(item);
    }
    galleryEl.appendChild(fragment); // Append all elements at once
  }

  // Lightbox functions - now conditional for stats display
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

    let mediaElement = lightboxImage;
    mediaElement.src = project.src;
    mediaElement.alt = project.title;
    mediaElement.style.display = 'block';
    mediaElement.setAttribute('loading', 'lazy'); // Add lazy loading to lightbox images

    mediaElement.style.left = `${triggerRect.left}px`;
    mediaElement.style.top = `${triggerRect.top}px`;
    mediaElement.style.width = `${triggerRect.width}px`;
    mediaElement.style.height = `${triggerRect.height}px`;
    mediaElement.style.objectFit = 'cover';
    mediaElement.style.transition = 'all 0.7s ease-out';
    mediaElement.style.willChange = 'left, top, width, height'; // Optimize for animation

    currentMediaElement = mediaElement;

    mediaElement.onload = () => {
      animateLightbox(mediaElement, lightboxInfoContainer, project);
    };

    const controls = lightboxInfoContainer.querySelector('.lightbox-controls');
    controls.innerHTML = '';

    if (hasConsentFor('analytics')) {
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
      likeBtn.setAttribute('aria-label', 'กดไลก์โปรเจกต์นี้'); // A11y
      likeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        handleLike(project.id, likeBtn);
      });

      const shareBtn = document.createElement('button');
      shareBtn.className = `lightbox-btn share-btn ${local[project.id] && local[project.id].shared ? 'shared' : ''}`;
      shareBtn.innerHTML = `<i class="fas fa-share-alt"></i> <span class="share-count">${currentShares}</span>`;
      shareBtn.setAttribute('aria-label', 'แชร์โปรเจกต์นี้'); // A11y
      shareBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        handleShare(project.id, shareBtn);
      });

      const viewDisplay = document.createElement('div');
      viewDisplay.className = 'lightbox-btn view-display';
      viewDisplay.innerHTML = `<i class="fas fa-eye"></i> <span class="view-count">${currentViews}</span>`;
      viewDisplay.setAttribute('aria-label', 'จำนวนการเข้าชม'); // A11y

      controls.append(likeBtn, shareBtn, viewDisplay);

      handleView(project.id); // Track view only if analytics consent is given
    } else {
      // If no analytics consent, display basic info without interactive stats
      const noStatsMessage = document.createElement('p');
      noStatsMessage.textContent = 'โปรดกดยอมรับ "สถิติและการตั้งค่า" ในการจัดการความเป็นส่วนตัวเพื่อดูยอดไลก์, แชร์ และวิว';
      noStatsMessage.style.fontSize = '0.9rem';
      noStatsMessage.style.textAlign = 'center';
      noStatsMessage.style.color = 'var(--color-text-light)';
      controls.appendChild(noStatsMessage);
    }

    lightboxOverlay.classList.add('active');
    lightboxContainer.classList.add('active');
    lightboxClose.classList.add('active');
    document.body.classList.add("lightbox-open");
    document.documentElement.classList.add("lightbox-open");
    lightboxContainer.setAttribute('role', 'dialog'); // A11y
    lightboxContainer.setAttribute('aria-modal', 'true'); // A11y
    lightboxClose.setAttribute('aria-label', 'ปิด'); // A11y
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
      readMoreBtn.setAttribute('aria-expanded', 'false'); // A11y
      readMoreBtn.setAttribute('aria-controls', 'lightbox-caption-content'); // A11y
      captionContent.id = 'lightbox-caption-content'; // A11y

      lightboxCaption.appendChild(readMoreBtn);

      readMoreBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isExpanded = lightboxCaption.classList.toggle('expanded');
        readMoreBtn.textContent = isExpanded ? 'ย่อลง' : 'เพิ่มเติม';
        readMoreBtn.setAttribute('aria-expanded', isExpanded); // A11y
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
    mediaElement.style.objectFit = 'contain'; // Use 'contain' to ensure full image visibility
    mediaElement.style.willChange = 'left, top, width, height'; // Optimize for animation

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
      currentMediaElement.style.willChange = 'left, top, width, height'; // Optimize for animation
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
      lightboxContainer.removeAttribute('role'); // A11y
      lightboxContainer.removeAttribute('aria-modal'); // A11y

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

  // Mobile Menu Toggle
  const menuToggle = document.querySelector('.menu-toggle');
  if (menuToggle) {
    menuToggle.addEventListener('click', mobileMenuToggle); // Use the imported shared function
  }

  // Shrink Header on Scroll
  window.addEventListener('scroll', shrinkHeader, { passive: true }); // Use the imported shared function

  // Filter functionality
  if (filtersEl) {
    filtersEl.addEventListener('click', async function (e) {
      if (e.target.tagName === 'BUTTON') {
        filtersEl.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');

        const filter = e.target.dataset.filter;
        const filteredProjects = projects.filter(project => {
          return filter === 'all' || project.category === filter;
        });

        // Only fetch/render with stats if analytics consent is given
        if (hasConsentFor('analytics')) {
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
        } else {
          renderGallery(filteredProjects, {}, null); // Render without stats
        }
      }
    });
  }

  // Dark Mode Toggle Logic - now conditional
  if (darkModeToggle) {
    darkModeToggle.addEventListener('click', () => {
      if (!hasConsentFor('ui')) { // Check for 'ui' consent
        console.log('โปรดกดยอมรับ "การตั้งค่า UI" ในการจัดการความเป็นส่วนตัวเพื่อใช้งานโหมดมืด'); // Log message
        return;
      }
      document.body.classList.toggle('dark-mode');
      localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    });
  }

  // Infinity Loop Slider for Certificates (only for index.html)
  const certSliderTrack = document.querySelector('.cert-slider-track');
  if (certSliderTrack) {
    const certCards = Array.from(certSliderTrack.children);
    // Clone only if there are enough cards to make a seamless loop
    if (certCards.length > 0) {
      const numClones = Math.ceil(certSliderTrack.offsetWidth / certCards[0].offsetWidth) + 2; // Clone enough to fill the visible area + buffer
      for (let i = 0; i < numClones; i++) {
        const clonedCard = certCards[i % certCards.length].cloneNode(true); // Cycle through original cards
        clonedCard.querySelector('img')?.setAttribute('loading', 'lazy'); // Add lazy loading to cloned images
        certSliderTrack.appendChild(clonedCard);
      }
    }

    certSliderTrack.addEventListener('mouseenter', () => {
      certSliderTrack.style.animationPlayState = 'paused';
    });

    certSliderTrack.addEventListener('mouseleave', () => {
      certSliderTrack.style.animationPlayState = 'running';
    });
  }

  // Uptime Counter
  const uptimeElement = document.getElementById("uptime");
  if (uptimeElement) { // Only run if uptime element exists
    // Note: The start time is hardcoded. For a real application, this should be dynamic.
    const startTime = new Date("2025-07-03T00:14:20");
    function updateUptime() {
      const now = new Date();
      const diff = Math.floor((now - startTime) / 1000);
      const days = Math.floor(diff / 86400);
      const hours = Math.floor((diff % 86400) / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;
      uptimeElement.textContent =
        ` ${days}d ${hours}h ${minutes}m ${seconds}s `;
    }
    setInterval(updateUptime, 1000);
    updateUptime();
  }

  // Random Quote Display
  const quoteElement = document.getElementById("quote");
  if (quoteElement) { // Only run if quote element exists
    const quotes = [
      "ความพยายามไม่เคยทรยศใคร",
      "เรียนรู้ในสิ่งที่ใช่ จะได้ทำในสิ่งที่รัก",
      "ทุกวันคือโอกาสใหม่",
      "อย่ารอความมั่นใจ จงเริ่มจากความตั้งใจ"
    ];
    quoteElement.textContent =
      quotes[Math.floor(Math.random() * quotes.length)];
  }

  // Preloader Hide Logic
  window.addEventListener('load', preloaderHide); // Use the imported shared function

  // Initialize AOS
  window.addEventListener('load', aosInit); // Use the imported shared function

  // Tab Functionality for the new About section
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  // Only proceed if tab buttons exist on the page
  if (tabBtns.length > 0) {
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // Remove active class from all buttons and contents
        tabBtns.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        // Add active class to clicked button
        btn.classList.add('active');

        // Show corresponding content
        const tabId = btn.getAttribute('data-tab');
        document.getElementById(tabId).classList.add('active');
      });
    });

    // Make first tab active by default
    tabBtns[0].click();
  }

  // Tab Functionality for Skills & Experience section
  const sectionTabBtns = document.querySelectorAll('.section-tab');
  const sectionTabContents = document.querySelectorAll('.skills-experience-section .tab-content');

  // Only proceed if section tab buttons exist on the page
  if (sectionTabBtns.length > 0) {
    sectionTabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // Remove active class from all section tabs and contents
        sectionTabBtns.forEach(t => t.classList.remove('active'));
        sectionTabContents.forEach(c => c.classList.remove('active'));

        // Add active class to clicked section tab
        btn.classList.add('active');

        // Show corresponding content
        const tabId = btn.getAttribute('data-tab');
        document.getElementById(tabId).classList.add('active');
      });
    });

    // Make first section tab active by default
    sectionTabBtns[0].click();
  }

  // Optional: Add interactive effects
  const headerLogo = document.querySelector('.header-logo');
  if (headerLogo) { // Only add event listener if headerLogo exists
    headerLogo.addEventListener('mouseenter', function() {
      this.classList.add('hover-active');
      setTimeout(() => {
        this.classList.remove('hover-active');
      }, 1000);
    });
  }
});

// Back to Top Button visibility and click handler
window.addEventListener('scroll', backToTop); // Use the imported shared function
document.querySelector('.back-to-top-btn')?.addEventListener('click', (e) => {
  e.preventDefault();
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});

import { projects } from "./data/projectsData.js";

// ============================================================================
// Global Utility Functions
// ============================================================================

/**
 * Creates a ripple effect on the clicked button.
 * @param {Event} event - The click or touch event.
 */
function createRipple(event) {
  const button = event.currentTarget;
  const ripple = document.createElement("span");
  const diameter = Math.max(button.clientWidth, button.clientHeight);
  const radius = diameter / 2;

  ripple.style.width = ripple.style.height = `${diameter}px`;
  ripple.style.left = `${event.clientX - button.getBoundingClientRect().left - radius}px`;
  ripple.style.top = `${event.clientY - button.getBoundingClientRect().top - radius}px`;
  ripple.classList.add("ripple-effect");

  // Remove old ripples to prevent accumulation
  const oldRipple = button.querySelector(".ripple-effect");
  if (oldRipple) oldRipple.remove();

  button.appendChild(ripple);

  // Remove ripple after animation ends
  ripple.addEventListener("animationend", () => ripple.remove(), { once: true });
}

/**
 * Displays a custom modal with a message.
 * @param {string} message - The message to display in the modal.
 * @returns {Promise<void>} A promise that resolves when the modal is closed.
 */
function showInfoModal(message) {
  return new Promise(resolve => {
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

    const closeModal = () => {
      modal.remove();
      resolve();
    };

    modal.querySelector('.custom-modal-btn.confirm').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  });
}

/**
 * Triggers a heart burst animation on a given button.
 * @param {HTMLElement} btn - The button element to apply the animation to.
 */
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

/**
 * Triggers a fullscreen heart animation.
 */
function triggerFullscreenHeart() {
  const heart = document.createElement('div');
  heart.className = 'fullscreen-heart-animation';
  heart.innerHTML = '<i class="fas fa-heart"></i>';
  document.body.appendChild(heart);

  setTimeout(() => {
    heart.remove();
  }, 800); // Match animation duration
}

// ============================================================================
// Project Statistics Handling (Simulated API Calls)
// ============================================================================

// Local storage key for project stats
const LOCAL_KEY = "project-stats";

/**
 * Loads project statistics from local storage.
 * @returns {Object} An object containing project statistics.
 */
function loadLocalStats() {
  return JSON.parse(localStorage.getItem(LOCAL_KEY) || "{}");
}

/**
 * Saves project statistics to local storage.
 * @param {Object} data - The project statistics object to save.
 */
function saveLocalStats(data) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
}

/**
 * Simulates fetching project statistics from a server.
 * In a real application, this would be an actual API call.
 * @param {string} id - The ID of the project.
 * @returns {Promise<Object>} A promise resolving to project stats (likes, shares, views, userHasLiked).
 */
async function fetchProjectStats(id) {
  try {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    const localStats = loadLocalStats();
    const projectData = localStats[id] || { likes: 0, shares: 0, views: 0, liked: false, shared: false, viewed: false };
    return {
      likes: projectData.likes || 0,
      shares: projectData.shares || 0,
      views: projectData.views || 0,
      userHasLiked: projectData.liked || false
    };
  } catch (error) {
    console.error('Error fetching project stats:', error);
    return { likes: 0, shares: 0, views: 0, userHasLiked: false };
  }
}

/**
 * Fetches statistics for multiple projects.
 * @param {string[]} projectIds - An array of project IDs.
 * @returns {Promise<Object>} A map of project IDs to their statistics.
 */
async function fetchAllProjectStats(projectIds) {
  const allStatsMap = {};
  for (const id of projectIds) {
    allStatsMap[id] = await fetchProjectStats(id);
  }
  return allStatsMap;
}

/**
 * Simulates fetching total statistics for a given type (likes, shares, views).
 * @param {string} type - The type of statistic to fetch ('likes', 'shares', 'views').
 * @returns {Promise<number>} A promise resolving to the total count.
 */
async function fetchTotalStat(type) {
  try {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    const localStats = loadLocalStats();
    let total = 0;
    for (const projectId in localStats) {
      if (localStats.hasOwnProperty(projectId)) {
        total += localStats[projectId][type] || 0;
      }
    }
    return total;
  } catch (error) {
    console.error(`Error fetching total ${type}:`, error);
    return 0;
  }
}

/**
 * Simulates pushing a statistic update to a server.
 * In a real application, this would be an actual API call.
 * @param {string} id - The project ID.
 * @param {string} type - The type of stat to increment ('like', 'share', 'view').
 * @returns {Promise<Object|null>} Updated stats or null if failed.
 */
async function pushStat(id, type) {
  try {
    // Simulate successful update
    await new Promise(resolve => setTimeout(resolve, 200));
    const localStats = loadLocalStats();
    localStats[id] = localStats[id] || { likes: 0, shares: 0, views: 0 };
    if (type === 'like') localStats[id].likes = (localStats[id].likes || 0) + 1;
    if (type === 'share') localStats[id].shares = (localStats[id].shares || 0) + 1;
    if (type === 'view') localStats[id].views = (localStats[id].views || 0) + 1;
    saveLocalStats(localStats);
    return localStats[id];
  } catch (error) {
    console.error(`Error pushing ${type}:`, error);
    return null;
  }
}

/**
 * Handles the like action for a project.
 * @param {string} id - The project ID.
 * @param {HTMLElement} btn - The like button element.
 */
async function handleLike(id, btn) {
  const local = loadLocalStats();
  if (local[id] && local[id].liked) {
    return; // Already liked
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
      // Rollback if server update failed
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

/**
 * Handles the share action for a project.
 * @param {string} id - The project ID.
 * @param {HTMLElement} btn - The share button element.
 */
async function handleShare(id, btn) {
  const local = loadLocalStats();
  if (local[id] && local[id].shared) {
    return; // Already shared
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
          console.log('User cancelled share or sharing failed:', shareError);
        }
      } else {
        await showInfoModal('เบราว์เซอร์ของคุณไม่รองรับการแชร์โดยตรง กรุณาคัดลอกลิงก์ด้วยตนเอง');
      }
    } else {
      // Rollback if server update failed
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

/**
 * Handles the view action for a project.
 * @param {string} id - The project ID.
 */
async function handleView(id) {
  const local = loadLocalStats();
  if (local[id] && local[id].viewed) {
    return; // Already viewed
  }

  local[id] = local[id] || {};
  local[id].viewed = true;
  saveLocalStats(local);

  try {
    const updatedStats = await pushStat(id, 'view');
    if (updatedStats) {
      updateTotalStatsDisplay();
    } else {
      // Rollback if server update failed
      delete local[id].viewed;
      saveLocalStats(local);
    }
  } catch (error) {
    console.error("Error in handleView (server call):", error);
    delete local[id].viewed;
    saveLocalStats(local);
  }
}

/**
 * Updates the display of total likes, shares, and views.
 */
async function updateTotalStatsDisplay() {
  const totalLikesEl = document.getElementById("total-likes");
  const totalSharesEl = document.getElementById("total-shares");
  const totalViewsEl = document.getElementById("total-views");

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

// ============================================================================
// Gallery and Lightbox Functions
// ============================================================================

const galleryEl = document.getElementById("gallery");
const lightboxOverlay = document.getElementById('lightbox-overlay');
const lightboxContainer = document.getElementById('lightbox-content-container');
const lightboxImage = document.getElementById('lightbox-image');
const lightboxInfoContainer = document.getElementById('lightbox-info-container');
const lightboxCaption = document.getElementById('lightbox-caption');
const lightboxClose = document.getElementById('lightbox-close');

let originalRect = {}; // Stores the bounding rect of the clicked image for lightbox animation
let currentMediaElement = null; // Stores the currently displayed media element in lightbox

/**
 * Shows or hides a loading spinner in the project gallery.
 * @param {boolean} show - True to show, false to hide.
 */
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

/**
 * Renders the project gallery with given data and statistics.
 * @param {Array<Object>} data - Array of project objects.
 * @param {Object} allStatsMap - Map of project IDs to their statistics.
 * @param {string|null} mostViewedProjectId - ID of the most viewed project, or null.
 */
async function renderGallery(data, allStatsMap, mostViewedProjectId) {
  showProjectsLoading(false);
  galleryEl.innerHTML = "";
  const local = loadLocalStats();

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

    // Event listener for opening lightbox
    item.addEventListener("click", function (e) {
      // Prevent lightbox from opening if a stat button or read more button was clicked
      if (e.target.closest('.stat-item') || e.target.closest('.read-more-project-btn')) {
        return;
      }
      const clickedImage = this.querySelector('img');
      originalRect = clickedImage.getBoundingClientRect();
      openLightbox(project, projectStats, originalRect);
    });

    // Event listeners for like and share buttons
    const likeBtn = item.querySelector(".stat-item.likes");
    if (likeBtn) {
      likeBtn.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent opening lightbox
        handleLike(project.id, likeBtn);
      });
    }

    const shareBtn = item.querySelector(".stat-item.shares");
    if (shareBtn) {
      if (local[project.id] && local[project.id].shared) {
        shareBtn.classList.add("shared");
      }
      shareBtn.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent opening lightbox
        handleShare(project.id, shareBtn);
      });
    }

    // Read more button for project description
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
    fragment.appendChild(item);
  }
  galleryEl.appendChild(fragment); // Append all elements at once
}

/**
 * Opens the lightbox with the specified project media.
 * @param {Object} project - The project object containing media details.
 * @param {Object} initialProjectStats - Initial statistics for the project.
 * @param {DOMRect} triggerRect - The bounding rectangle of the element that triggered the lightbox.
 */
async function openLightbox(project, initialProjectStats, triggerRect) {
  // Clear previous content immediately
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

  // Set initial position for animation
  mediaElement.style.left = `${triggerRect.left}px`;
  mediaElement.style.top = `${triggerRect.top}px`;
  mediaElement.style.width = `${triggerRect.width}px`;
  mediaElement.style.height = `${triggerRect.height}px`;
  mediaElement.style.objectFit = 'cover';
  mediaElement.style.transition = 'all 0.5s ease-out';
  mediaElement.style.willChange = 'left, top, width, height';

  currentMediaElement = mediaElement;

  mediaElement.onload = () => {
    animateLightbox(mediaElement, lightboxInfoContainer, project);
  };

  const controls = lightboxInfoContainer.querySelector('.lightbox-controls');
  controls.innerHTML = ''; // Clear previous controls

  const local = loadLocalStats();

  const currentLikes = initialProjectStats.likes;
  const currentShares = initialProjectStats.shares;
  let currentViews = initialProjectStats.views;

  // Increment view count if not already viewed in this session
  if (!(local[project.id] && local[project.id].viewed)) {
    currentViews++;
  }

  // Create like button
  const likeBtn = document.createElement('button');
  likeBtn.className = `lightbox-btn like-btn ${local[project.id] && local[project.id].liked ? 'liked' : ''}`;
  likeBtn.innerHTML = `<i class="fas fa-heart"></i> <span class="like-count">${currentLikes}</span>`;
  likeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    handleLike(project.id, likeBtn);
  });

  // Create share button
  const shareBtn = document.createElement('button');
  shareBtn.className = `lightbox-btn share-btn ${local[project.id] && local[project.id].shared ? 'shared' : ''}`;
  shareBtn.innerHTML = `<i class="fas fa-share-alt"></i> <span class="share-count">${currentShares}</span>`;
  shareBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    handleShare(project.id, shareBtn);
  });

  // Create view display
  const viewDisplay = document.createElement('div');
  viewDisplay.className = 'lightbox-btn view-display';
  viewDisplay.innerHTML = `<i class="fas fa-eye"></i> <span class="view-count">${currentViews}</span>`;

  controls.append(likeBtn, shareBtn, viewDisplay);

  lightboxOverlay.classList.add('active');
  lightboxContainer.classList.add('active');
  lightboxClose.classList.add('active');
  document.body.classList.add("lightbox-open");
  document.documentElement.classList.add("lightbox-open");

  handleView(project.id); // Track view
}

/**
 * Sets up the content for the lightbox caption and adds a "read more" button if needed.
 * @param {Object} project - The project object.
 */
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

  // Check if content overflows and add "read more" button
  const style = window.getComputedStyle(captionContent);
  const lineHeight = parseFloat(style.lineHeight);
  const clampLines = parseInt(style.webkitLineClamp || '2'); // Default to 2 lines if not set
  const clampedHeight = lineHeight * clampLines;

  if (captionContent.scrollHeight > clampedHeight + 2) { // Add a small buffer
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

/**
 * Animates the lightbox media and controls into view.
 * @param {HTMLElement} mediaElement - The image or video element in the lightbox.
 * @param {HTMLElement} controlsElement - The container for lightbox controls.
 * @param {Object} project - The project data.
 */
function animateLightbox(mediaElement, controlsElement, project) {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  let finalWidth, finalHeight;
  let aspectRatio;

  if (mediaElement.tagName === 'IMG') {
    aspectRatio = mediaElement.naturalWidth / mediaElement.naturalHeight;
  } else {
    aspectRatio = 16 / 9; // Default aspect ratio for videos if any are added
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

  setupLightboxCaption(project); // Set up caption content before animation

  // Use a small timeout to ensure the browser has rendered the initial state
  setTimeout(() => {
    controlsElement.classList.add('active');
  }, 50);
}

/**
 * Closes the lightbox and resets its state.
 */
function closeLightbox() {
  lightboxInfoContainer.classList.remove('active');

  if (currentMediaElement && originalRect) {
    currentMediaElement.style.transition = 'all 0.2s ease-out';
    currentMediaElement.style.left = `${originalRect.left}px`;
    currentMediaElement.style.top = `${originalRect.top}px`;
    currentMediaElement.style.width = `${originalRect.width}px`;
    currentMediaElement.style.height = `${originalRect.height}px`;
    currentMediaElement.style.objectFit = 'cover';
    currentMediaElement.style.willChange = 'left, top, width, height';
  }

  setTimeout(() => {
    lightboxOverlay.classList.remove('active');
    lightboxContainer.classList.remove('active');
    lightboxClose.classList.remove('active');

    if (currentMediaElement) {
      currentMediaElement.style.transition = ''; // Remove transition for next use
      currentMediaElement.removeAttribute('style'); // Clear inline styles
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
  }, 400); // Match transition duration for smooth close
}

// ============================================================================
// Initialization Functions (Called on DOMContentLoaded)
// ============================================================================

/**
 * Initializes ripple effects on specified elements.
 */
function initRippleEffects() {
  const rippleElements = document.querySelectorAll(
    ".hero-btn-primary a, .filter-btn, .project-item, .cert-card, .tab-btn, .section-tab"
  );
  rippleElements.forEach((element) => {
    element.classList.add("ripple");
    element.addEventListener("click", createRipple);
    element.addEventListener("touchend", createRipple); // For mobile touch events
  });
}

/**
 * Sets up navigation functionality, including active link highlighting and smooth scrolling.
 */
function setupNavigation() {
  const sections = document.querySelectorAll("section");
  const navItems = document.querySelectorAll(".header-nav li a");
  const header = document.querySelector('.header-section');

  // Use Intersection Observer for more efficient scroll highlighting
  const observerOptions = {
    root: null,
    // Adjust margin based on header height, dynamically calculated if header shrinks
    rootMargin: `-${header.offsetHeight}px 0px 0px 0px`,
    threshold: 0.5, // Trigger when 50% of the section is visible
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const current = entry.target.getAttribute("id");
        navItems.forEach((item) => {
          item.classList.remove("active");
          if (item.getAttribute("href") === `#${current}`) {
            item.classList.add("active");
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
        const currentHeaderOffset = document.querySelector('.header-section').offsetHeight;
        const elementPosition = targetElement.offsetTop;
        const offsetPosition = elementPosition - currentHeaderOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }

      // Close mobile menu after clicking a link
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
  window.addEventListener('scroll', function () {
    const currentScrollPosition = window.pageYOffset;
    if (currentScrollPosition > 100) {
      header.classList.add('shrink');
    } else {
      header.classList.remove('shrink');
    }
  }, { passive: true }); // Use passive listener for better scroll performance
}

/**
 * Initializes the project gallery, fetches stats, and sets up filtering.
 */
async function initProjectGallery() {
  const filtersEl = document.getElementById("filters");

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

  // Filter functionality
  filtersEl.addEventListener('click', async function (e) {
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

      let currentMostViewedProjectId = null;
      let currentMaxViews = -1;
      for (const id in allStatsMapForFiltered) {
        if (allStatsMapForFiltered.hasOwnProperty(id)) {
          if (allStatsMapForFiltered[id].views > currentMaxViews) {
            currentMaxViews = allStatsMapForFiltered[id].views;
            currentMostViewedProjectId = id;
          }
        }
      }
      renderGallery(filteredProjects, allStatsMapForFiltered, currentMostViewedProjectId);
    }
  });

  // Event Listeners for lightbox
  lightboxOverlay.addEventListener('click', closeLightbox);
  lightboxClose.addEventListener('click', closeLightbox);
  lightboxContainer.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent closing lightbox when clicking inside the content area
  });
}

/**
 * Sets up the dark mode toggle functionality.
 */
function setupDarkModeToggle() {
  const darkModeToggle = document.getElementById("dark-mode-toggle");
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
}

/**
 * Sets up the infinity loop slider for certificates.
 */
function setupCertificateSlider() {
  const certSliderTrack = document.querySelector('.cert-slider-track');
  if (certSliderTrack) {
    const certCards = Array.from(certSliderTrack.children);
    // Clone only if there are enough cards to make a seamless loop
    if (certCards.length > 0) {
      // Clone enough cards to fill the visible area plus a buffer for smooth looping
      const numClones = Math.ceil(certSliderTrack.offsetWidth / certCards[0].offsetWidth) + 2;
      for (let i = 0; i < numClones; i++) {
        const clonedCard = certCards[i % certCards.length].cloneNode(true);
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
}

/**
 * Starts the uptime counter for the website.
 */
function startUptimeCounter() {
  const startTime = new Date("2025-07-03T00:14:20"); // Fixed start time
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
  updateUptime(); // Initial call to display immediately
}

/**
 * Displays a random quote from a predefined list.
 */
function displayRandomQuote() {
  const quotes = [
    "ความพยายามไม่เคยทรยศใคร",
    "เรียนรู้ในสิ่งที่ใช่ จะได้ทำในสิ่งที่รัก",
    "ทุกวันคือโอกาสใหม่",
    "อย่ารอความมั่นใจ จงเริ่มจากความตั้งใจ"
  ];
  document.getElementById("quote").textContent =
    quotes[Math.floor(Math.random() * quotes.length)];
}

/**
 * Hides the preloader and initializes AOS (Animate On Scroll) library.
 */
function hidePreloaderAndInitAOS() {
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

    // Initialize AOS after the page has loaded
    AOS.init({
      duration: 800, // Animation duration
      easing: 'ease-out-quad', // Animation easing
      once: true, // Animation plays only once when scrolling down
      mirror: false, // Do not replay animation when scrolling up
      anchorPlacement: 'top-bottom', // Element position to trigger animation
      offset: 120, // Distance from the top of the screen when triggered
    });
  });
}

/**
 * Sets up tab functionality for a given set of buttons and content.
 * @param {string} btnSelector - CSS selector for the tab buttons.
 * @param {string} contentSelector - CSS selector for the tab content elements.
 */
function setupTabs(btnSelector, contentSelector) {
  const tabBtns = document.querySelectorAll(btnSelector);
  const tabContents = document.querySelectorAll(contentSelector);

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active class from all buttons and contents in this group
      tabBtns.forEach(t => t.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      // Add active class to clicked button
      btn.classList.add('active');

      // Show corresponding content
      const tabId = btn.getAttribute('data-tab');
      document.getElementById(tabId).classList.add('active');
    });
  });

  // Make the first tab active by default if buttons exist
  if (tabBtns.length > 0) {
    tabBtns[0].click();
  }
}

/**
 * Sets up accordion functionality (if any, though not currently used in tabbed layout).
 */
function setupAccordion() {
  document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      item.classList.toggle('active');
    });
  });
}

// ============================================================================
// Main Entry Point: DOMContentLoaded
// ============================================================================

document.addEventListener("DOMContentLoaded", function () {
  initRippleEffects();
  setupNavigation();
  initProjectGallery();
  setupDarkModeToggle();
  setupCertificateSlider();
  startUptimeCounter();
  displayRandomQuote();
  hidePreloaderAndInitAOS();

  // Setup tabs for About section
  setupTabs('.tab-btn', '.about-section .tab-content');

  // Setup tabs for Skills & Experience section
  setupTabs('.section-tab', '.skills-experience-section .tab-content');

  setupAccordion(); // For any existing accordion elements
});

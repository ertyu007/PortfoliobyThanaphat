import { projects } from "./data/projectsData.js";
import { certificates } from "./data/certificateData.js";

// ============================================================================
// Global Constants and DOM Elements
// ============================================================================
const LOCAL_STORAGE_STATS_KEY = "project-stats";

const galleryEl = document.getElementById("gallery");
const certificatesGrid = document.getElementById('certificates-grid');
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

const filtersEl = document.getElementById("filters");
const certSliderTrack = document.getElementById('cert-slider-track');
const pauseSliderBtn = document.getElementById('pause-slider-btn');
const playSliderBtn = document.getElementById('play-slider-btn');

let originalRect = {}; // Stores initial position and size of clicked thumbnail
let currentMediaElement = null; // Stores the media element displayed in the Lightbox

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Creates a ripple effect on the clicked button or element.
 * @param {Event} event - The click event.
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

  // Remove old ripple to prevent accumulation
  const oldRipple = button.querySelector(".ripple-effect");
  if (oldRipple) oldRipple.remove();

  button.appendChild(ripple);

  // Remove ripple after animation ends
  ripple.addEventListener("animationend", () => ripple.remove(), { once: true });
}

/**
 * Loads local user interaction stats from localStorage.
 * @returns {Object} - An object containing project stats (liked, shared, viewed).
 */
function loadLocalStats() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_STATS_KEY) || "{}");
  } catch (e) {
    console.error("Error parsing local stats from localStorage:", e);
    return {};
  }
}

/**
 * Saves local user interaction stats to localStorage.
 * @param {Object} data - The object containing project stats to save.
 */
function saveLocalStats(data) {
  try {
    localStorage.setItem(LOCAL_STORAGE_STATS_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Error saving local stats to localStorage:", e);
  }
}

/**
 * MOCK FUNCTION: Simulates fetching project statistics from a backend.
 * In a real application, this would make an API call (e.g., to Netlify Functions).
 * @param {string} id - The ID of the project.
 * @returns {Promise<Object>} - A promise resolving to an object with likes, shares, and views.
 */
async function fetchProjectStats(id) {
  console.log(`MOCK: Fetching stats for project ID: ${id}`);
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100));
  // Return random stats for demonstration
  return {
    likes: Math.floor(Math.random() * 100) + 10,
    shares: Math.floor(Math.random() * 50) + 5,
    views: Math.floor(Math.random() * 200) + 20,
  };
}

/**
 * MOCK FUNCTION: Simulates fetching statistics for multiple projects.
 * @param {string[]} projectIds - An array of project IDs.
 * @returns {Promise<Object>} - A promise resolving to a map of project IDs to their stats.
 */
async function fetchAllProjectStats(projectIds) {
  console.log(`MOCK: Fetching all stats for project IDs: ${projectIds.join(', ')}`);
  const statPromises = projectIds.map(id => fetchProjectStats(id));
  const results = await Promise.allSettled(statPromises);
  const allStatsMap = {};
  projectIds.forEach((id, index) => {
    if (results[index].status === 'fulfilled') {
      allStatsMap[id] = results[index].value;
    } else {
      console.warn(`MOCK: Failed to fetch stats for project ID ${id}:`, results[index].reason);
      allStatsMap[id] = { likes: 0, shares: 0, views: 0 }; // Default values on failure
    }
  });
  return allStatsMap;
}

/**
 * MOCK FUNCTION: Simulates fetching total statistics (likes, shares, views) from a backend.
 * @param {string} type - The type of stat to fetch ('likes', 'shares', 'views').
 * @returns {Promise<number>} - A promise resolving to the total count.
 */
async function fetchTotalStat(type) {
  console.log(`MOCK: Fetching total ${type}.`);
  await new Promise(resolve => setTimeout(resolve, 50));
  // Return a random large number for demonstration
  return Math.floor(Math.random() * 1000) + 500;
}

/**
 * MOCK FUNCTION: Simulates pushing a stat update to the backend.
 * @param {string} id - The ID of the project.
 * @param {string} type - The type of stat to push ('like', 'share', 'view').
 * @returns {Promise<Object|null>} - A promise resolving to success data or null on failure.
 */
async function pushStat(id, type) {
  console.log(`MOCK: Pushing ${type} for project ID: ${id}`);
  await new Promise(resolve => setTimeout(resolve, 200));
  // Simulate success
  return { success: true, message: `${type} recorded for ${id}` };
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
 * Handles the like action for a project.
 * @param {string} id - The ID of the project.
 * @param {HTMLElement} btn - The like button element.
 */
async function handleLike(id, btn) {
  const local = loadLocalStats();
  // Prevent duplicate likes from the same user/session
  if (local[id] && local[id].liked) {
    console.log(`Project ${id} already liked by this user session.`);
    return;
  }

  let currentLikeCount = parseInt(btn.querySelector(".like-count").textContent);
  currentLikeCount++;
  btn.querySelector(".like-count").textContent = currentLikeCount;
  btn.classList.add("liked");
  btn.setAttribute('aria-label', `คุณกดถูกใจแล้ว. จำนวนถูกใจ: ${currentLikeCount}`);

  triggerHeartBurst(btn);

  // Update Local Storage immediately
  local[id] = local[id] || {};
  local[id].liked = true;
  saveLocalStats(local);

  try {
    const updatedStats = await pushStat(id, 'like');
    if (updatedStats) {
      updateTotalStatsDisplay();
    } else {
      // Rollback UI and Local Storage if server update fails
      btn.classList.remove("liked");
      btn.setAttribute('aria-label', `กดถูกใจโปรเจกต์นี้. จำนวนถูกใจ: ${currentLikeCount - 1}`);
      const actualStats = await fetchProjectStats(id); // Fetch actual stats to revert count
      btn.querySelector(".like-count").textContent = actualStats.likes;
      if (local[id]) {
        delete local[id].liked;
        saveLocalStats(local);
      }
      console.error('Failed to save like to server, rolling back UI.');
    }
  } catch (error) {
    console.error("Error in handleLike (server call):", error);
    // Rollback UI and Local Storage on network/server error
    btn.classList.remove("liked");
    btn.setAttribute('aria-label', `กดถูกใจโปรเจกต์นี้. จำนวนถูกใจ: ${currentLikeCount - 1}`);
    const actualStats = await fetchProjectStats(id); // Fetch actual stats to revert count
    btn.querySelector(".like-count").textContent = actualStats.likes;
    if (local[id]) {
      delete local[id].liked;
      saveLocalStats(local);
    }
    console.error('Error connecting to server for like, rolling back UI.');
  }
}

/**
 * Handles the share action for a project.
 * @param {string} id - The ID of the project.
 * @param {HTMLElement} btn - The share button element.
 */
async function handleShare(id, btn) {
  const local = loadLocalStats();
  // Prevent duplicate shares from the same user/session
  if (local[id] && local[id].shared) {
    console.log(`Project ${id} already shared by this user session.`);
    return;
  }

  let currentShareCount = parseInt(btn.querySelector(".share-count").textContent);
  currentShareCount++;
  btn.querySelector(".share-count").textContent = currentShareCount;
  btn.classList.add("shared");
  btn.setAttribute('aria-label', `คุณได้แชร์แล้ว. จำนวนแชร์: ${currentShareCount}`);

  // Update Local Storage immediately
  local[id] = local[id] || {};
  local[id].shared = true;
  saveLocalStats(local);

  try {
    const updatedStats = await pushStat(id, 'share');
    if (updatedStats) {
      updateTotalStatsDisplay();
      // Attempt to use Web Share API if available
      if (navigator.share) {
        try {
          await navigator.share({
            title: projects.find(p => p.id === id)?.title || 'My Portfolio Project',
            text: projects.find(p => p.id === id)?.desc || 'Check out this amazing project!',
            url: window.location.href, // Share URL of the current page
          });
        } catch (shareError) {
          console.log('User cancelled share or Web Share API failed:', shareError);
          // If user cancels, no rollback needed as server call succeeded
        }
      } else {
        console.warn('Browser does not support Web Share API. Consider implementing a fallback like copying URL to clipboard.');
        // Fallback: Copy URL to Clipboard (not implemented here)
      }
    } else {
      // Rollback UI and Local Storage if server update fails
      btn.classList.remove("shared");
      btn.setAttribute('aria-label', `แชร์โปรเจกต์นี้. จำนวนแชร์: ${currentShareCount - 1}`);
      if (local[id]) {
        delete local[id].shared;
        saveLocalStats(local);
      }
      const actualStats = await fetchProjectStats(id); // Fetch actual stats to revert count
      btn.querySelector(".share-count").textContent = actualStats.shares;
      console.error('Failed to save share to server, rolling back UI.');
    }
  } catch (error) {
    console.error("Error in handleShare (server call):", error);
    // Rollback UI and Local Storage on network/server error
    btn.classList.remove("shared");
    btn.setAttribute('aria-label', `แชร์โปรเจกต์นี้. จำนวนแชร์: ${currentShareCount - 1}`);
    if (local[id]) {
      delete local[id].shared;
      saveLocalStats(local);
    }
    const actualStats = await fetchProjectStats(id); // Fetch actual stats to revert count
    btn.querySelector(".share-count").textContent = actualStats.shares;
    console.error('Error connecting to server for share, rolling back UI.');
  }
}

/**
 * Handles the view action for a project.
 * @param {string} id - The ID of the project.
 */
async function handleView(id) {
  const local = loadLocalStats();
  // Prevent duplicate views from the same user/session for the same project
  if (local[id] && local[id].viewed) {
    return;
  }

  local[id] = local[id] || {};
  local[id].viewed = true;
  saveLocalStats(local);

  try {
    const updatedStats = await pushStat(id, 'view');
    if (!updatedStats) {
      // If server update fails, rollback Local Storage
      if (local[id]) {
        delete local[id].viewed;
        saveLocalStats(local);
      }
      console.error('Failed to save view to server.');
    }
    // Update Total Views Display even if Local Storage is already marked as Viewed
    updateTotalStatsDisplay();
  } catch (error) {
    console.error("Error in handleView (server call):", error);
    // If network/server error occurs, rollback Local Storage
    if (local[id]) {
      delete local[id].viewed;
      saveLocalStats(local);
    }
    console.error('Error connecting to server for view.');
  }
}

/**
 * Updates the display of total likes, shares, and views.
 */
async function updateTotalStatsDisplay() {
  // Update only if elements exist (e.g., on index.html)
  if (totalLikesEl && totalSharesEl && totalViewsEl) {
    // Fetch all total stats concurrently for efficiency
    const [totalLikes, totalShares, totalViews] = await Promise.all([
      fetchTotalStat('likes'),
      fetchTotalStat('shares'),
      fetchTotalStat('views')
    ]);

    totalLikesEl.textContent = totalLikes;
    totalSharesEl.textContent = totalShares;
    totalViewsEl.textContent = totalViews;
  }
}

/**
 * Shows or hides a loading spinner in the projects gallery.
 * @param {boolean} show - True to show, false to hide.
 */
function showProjectsLoading(show) {
  if (galleryEl) { // Ensure galleryEl exists (only on index.html)
    if (show) {
      galleryEl.innerHTML = `
        <div class="projects-loading-spinner">
          <div class="loader" role="status" aria-label="กำลังโหลดโปรเจกต์"></div>
          <p>กำลังโหลดโปรเจกต์...</p>
        </div>
      `;
      galleryEl.style.display = 'flex';
      galleryEl.style.justifyContent = 'center';
      galleryEl.style.alignItems = 'center';
      galleryEl.style.minHeight = '200px';
    } else {
      galleryEl.innerHTML = '';
      galleryEl.style.display = 'grid'; // Revert to grid display
      galleryEl.style.justifyContent = '';
      galleryEl.style.alignItems = '';
      galleryEl.style.minHeight = '';
    }
  }
}

/**
 * Renders project items into the gallery grid.
 * @param {Array<Object>} data - Array of project objects.
 * @param {Object} allStatsMap - Map of project IDs to their statistics.
 * @param {string|null} mostViewedProjectId - ID of the most viewed project, or null.
 */
async function renderGallery(data, allStatsMap, mostViewedProjectId) {
  if (!galleryEl) return; // Only run on index.html

  showProjectsLoading(false); // Hide loading spinner
  galleryEl.innerHTML = ""; // Clear existing content

  if (!data || data.length === 0) {
    galleryEl.innerHTML = '<p class="no-projects-message">ไม่พบโปรเจกต์ในหมวดหมู่นี้</p>';
    galleryEl.style.display = 'block'; // Ensure message is displayed
    return;
  }

  const local = loadLocalStats(); // Load local stats once for rendering

  const fragment = document.createDocumentFragment(); // Use DocumentFragment for performance

  data.forEach(project => {
    const item = document.createElement("div");
    item.classList.add("project-item");
    item.setAttribute('data-aos', 'fade-up');
    item.setAttribute('data-aos-duration', '800');
    item.setAttribute('data-id', project.id);
    item.setAttribute('role', 'group'); // For accessibility

    const projectStats = allStatsMap[project.id] || { likes: 0, shares: 0, views: 0 };

    if (project.id === mostViewedProjectId && mostViewedProjectId !== null) {
      item.classList.add('most-viewed');
    }

    item.innerHTML = `
      <div class="project-image-container">
        <img src="${project.thumbnail}" alt="${project.title}" loading="lazy" onerror="this.onerror=null;this.src='https://placehold.co/300x225/cccccc/333333?text=Image+Not+Found';">
        <div class="view-icon" aria-hidden="true"><i class="fas fa-plus"></i></div>
      </div>
      <div class="project-content">
          <h3>${project.title}</h3>
          <p>${project.desc}</p>
          <div class="project-meta">
              <span class="category">${project.category}</span>
              <div class="stats">
                  <button class="stat-item likes ${local[project.id] && local[project.id].liked ? 'liked' : ''}" aria-label="ถูกใจโปรเจกต์นี้. จำนวนถูกใจ: ${projectStats.likes}">
                    <i class="fas fa-heart" aria-hidden="true"></i>
                    <span class="like-count">${projectStats.likes}</span>
                  </button>
                  <button class="stat-item shares ${local[project.id] && local[project.id].shared ? 'shared' : ''}" aria-label="แชร์โปรเจกต์นี้. จำนวนแชร์: ${projectStats.shares}">
                    <i class="fas fa-share-alt" aria-hidden="true"></i>
                    <span class="share-count">${projectStats.shares}</span>
                  </button>
                  <span class="stat-item views" aria-label="จำนวนการเข้าชม: ${projectStats.views}">
                    <i class="fas fa-eye" aria-hidden="true"></i>
                    <span class="view-count">${projectStats.views}</span>
                  </span>
              </div>
          </div>
      </div>
    `;

    // Event Listener for opening Lightbox
    item.addEventListener("click", function (e) {
      // Prevent lightbox from opening if clicking on a stat button or read more button
      if (e.target.closest('.stat-item') || e.target.closest('.read-more-project-btn')) {
        return;
      }
      const clickedImage = this.querySelector('img');
      originalRect = clickedImage.getBoundingClientRect();
      openLightbox(project, projectStats, originalRect, false); // isCertificate = false
    });

    // Event Listeners for Stat buttons
    const likeBtn = item.querySelector(".stat-item.likes");
    if (likeBtn) {
      likeBtn.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent click from bubbling to Project Item
        handleLike(project.id, likeBtn);
      });
    }

    const shareBtn = item.querySelector(".stat-item.shares");
    if (shareBtn) {
      shareBtn.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent click from bubbling to Project Item
        handleShare(project.id, shareBtn);
      });
    }

    fragment.appendChild(item);

    // Handle "Read More" button for project descriptions
    const descP = item.querySelector('.project-content p');
    // Check if text overflows by comparing scrollHeight with clientHeight
    const style = window.getComputedStyle(descP);
    const lineHeight = parseFloat(style.lineHeight);
    const clientHeight = descP.clientHeight;

    // Check if content overflows (add a small buffer for precision)
    if (descP.scrollHeight > clientHeight + 2) {
      const readMoreBtn = document.createElement('button');
      readMoreBtn.className = 'read-more-project-btn';
      readMoreBtn.textContent = 'อ่านเพิ่มเติม';
      readMoreBtn.setAttribute('aria-expanded', 'false'); // For Accessibility
      descP.insertAdjacentElement('afterend', readMoreBtn);

      readMoreBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent click from bubbling to Project Item
        const isExpanded = descP.classList.toggle('expanded');
        readMoreBtn.textContent = isExpanded ? 'ย่อลง' : 'อ่านเพิ่มเติม';
        readMoreBtn.setAttribute('aria-expanded', isExpanded);
      });
    }
  });
  galleryEl.appendChild(fragment); // Append all elements at once
}

/**
 * Renders certificate cards into the certificates grid.
 * @param {Array<Object>} certs - Array of certificate objects.
 */
function renderCertificates(certs) {
  if (!certificatesGrid) {
    console.warn("renderCertificates: Element 'certificates-grid' not found.");
    return; // Only run on certificates.html
  }

  if (!certs || certs.length === 0) {
    certificatesGrid.innerHTML = '<p class="no-certs-message" style="text-align: center; color: var(--color-text-light); padding: 20px;">ไม่พบประกาศนียบัตรที่จะแสดง.</p>';
    console.warn("renderCertificates: No certificate data to display.");
    return;
  }

  certificatesGrid.innerHTML = ''; // Clear existing content
  const fragment = document.createDocumentFragment();

  certs.forEach(cert => {
    const certCard = document.createElement('div');
    certCard.classList.add('cert-card-full'); // New class for full-page Certificate Card
    certCard.setAttribute('data-aos', 'fade-up');
    certCard.setAttribute('data-aos-duration', '800');
    certCard.setAttribute('data-id', cert.id); // Add data-id for Lightbox
    certCard.setAttribute('role', 'group'); // For accessibility

    certCard.innerHTML = `
      <img src="${cert.src}" alt="${cert.title}" loading="lazy" onerror="this.onerror=null;this.src='https://placehold.co/300x400/cccccc/333333?text=Certificate+Image+Not+Found';">
      <div class="cert-info">
        <h3>${cert.title}</h3>
        <p>${cert.desc}</p>
      </div>
    `;

    // Add Click Listener to open Lightbox for Certificates
    certCard.addEventListener('click', function() {
      const clickedImage = this.querySelector('img');
      originalRect = clickedImage.getBoundingClientRect();
      // Certificates don't have stats, so pass default values
      openLightbox(cert, { likes: 0, shares: 0, views: 0 }, originalRect, true); // isCertificate = true
    });

    fragment.appendChild(certCard);
  });
  certificatesGrid.appendChild(fragment);
  console.log(`renderCertificates: Displayed ${certs.length} certificates.`);
}

/**
 * Opens the lightbox with the given item's details.
 * @param {Object} item - The project or certificate object.
 * @param {Object} initialStats - Initial statistics for the item.
 * @param {DOMRect} triggerRect - Bounding rectangle of the clicked thumbnail for animation.
 * @param {boolean} isCertificate - True if the item is a certificate, false if a project.
 */
async function openLightbox(item, initialStats, triggerRect, isCertificate = false) {
  // Clear previous content immediately to prevent brief display of old text
  const captionContent = lightboxCaption.querySelector('.lightbox-caption-content');
  if (captionContent) {
    captionContent.textContent = '';
  }
  const existingBtn = lightboxCaption.querySelector('.read-more-btn');
  if (existingBtn) {
    existingBtn.remove();
  }
  lightboxCaption.classList.remove('expanded');

  lightboxImage.classList.add('hidden'); // Use class to hide
  lightboxImage.src = ''; // Clear image source

  let mediaElement = lightboxImage; // Currently only images are supported in the lightbox
  mediaElement.src = item.src;
  mediaElement.alt = item.title;
  mediaElement.classList.remove('hidden'); // Use class to show

  // Set initial position and size for smooth transition from thumbnail
  mediaElement.style.left = `${triggerRect.left}px`;
  mediaElement.style.top = `${triggerRect.top}px`;
  mediaElement.style.width = `${triggerRect.width}px`;
  mediaElement.style.height = `${triggerRect.height}px`;
  mediaElement.style.objectFit = 'cover';
  mediaElement.style.transition = 'all 0.5s ease-out';
  mediaElement.style.willChange = 'left, top, width, height'; // Optimize for animation

  currentMediaElement = mediaElement;

  // When image loads, animate to final position
  mediaElement.onload = () => {
    animateLightbox(mediaElement, lightboxInfoContainer, item);
  };
  // Handle cases where image might be cached and onload doesn't fire
  if (mediaElement.complete) {
    animateLightbox(mediaElement, lightboxInfoContainer, item);
  }

  // Clear old controls
  const controls = lightboxInfoContainer.querySelector('.lightbox-controls');
  controls.innerHTML = '';

  const local = loadLocalStats();

  let currentLikes = initialStats.likes;
  let currentShares = initialStats.shares;
  let currentViews = initialStats.views;

  // If it's a Project and not already viewed in this session, increment view count
  if (!isCertificate && !(local[item.id] && local[item.id].viewed)) {
    currentViews++;
  }

  // Create Like button (only for Projects, not Certificates)
  if (!isCertificate) {
    const likeBtn = document.createElement('button');
    likeBtn.className = `lightbox-btn like-btn ${local[item.id] && local[item.id].liked ? 'liked' : ''}`;
    likeBtn.innerHTML = `<i class="fas fa-heart" aria-hidden="true"></i> <span class="like-count">${currentLikes}</span>`;
    likeBtn.setAttribute('aria-label', `ถูกใจโปรเจกต์นี้. จำนวนถูกใจ: ${currentLikes}`);
    likeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      handleLike(item.id, likeBtn);
    });
    controls.append(likeBtn);
  }

  // Create Share button (only for Projects, not Certificates)
  if (!isCertificate) {
    const shareBtn = document.createElement('button');
    shareBtn.className = `lightbox-btn share-btn ${local[item.id] && local[item.id].shared ? 'shared' : ''}`;
    shareBtn.innerHTML = `<i class="fas fa-share-alt" aria-hidden="true"></i> <span class="share-count">${currentShares}</span>`;
    shareBtn.setAttribute('aria-label', `แชร์โปรเจกต์นี้. จำนวนแชร์: ${currentShares}`);
    shareBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      handleShare(item.id, shareBtn);
    });
    controls.append(shareBtn);
  }

  // Display View count (only for Projects, not Certificates)
  if (!isCertificate) {
    const viewDisplay = document.createElement('div');
    viewDisplay.className = 'lightbox-btn view-display';
    viewDisplay.innerHTML = `<i class="fas fa-eye" aria-hidden="true"></i> <span class="view-count">${currentViews}</span>`;
    viewDisplay.setAttribute('aria-label', `จำนวนการเข้าชม: ${currentViews}`);
    controls.append(viewDisplay);
  }

  // Activate lightbox elements
  lightboxOverlay.classList.add('active');
  lightboxContainer.classList.add('active');
  lightboxClose.classList.add('active');
  document.body.classList.add("lightbox-open");
  document.documentElement.classList.add("lightbox-open");

  // Push View Stat to Server (only for Projects, only if not already viewed in this session)
  if (!isCertificate) {
    handleView(item.id);
  }
}

/**
 * Sets up the caption content and "read more" functionality for the lightbox.
 * @param {Object} item - The project or certificate item.
 */
function setupLightboxCaption(item) {
  const captionContent = lightboxCaption.querySelector('.lightbox-caption-content');
  if (!captionContent) return;

  // Reset state
  lightboxCaption.classList.remove('expanded');
  const existingBtn = lightboxCaption.querySelector('.read-more-btn');
  if (existingBtn) {
    existingBtn.remove();
  }

  captionContent.textContent = `${item.title} — ${item.desc}`;

  // Use line-height calculation to check for overflow more reliably
  const style = window.getComputedStyle(captionContent);
  const lineHeight = parseFloat(style.lineHeight);
  // Assume we want to show 2 lines initially
  const clampedHeight = lineHeight * 2;

  // Check if actual scroll height exceeds calculated clamped height (with a small buffer)
  if (captionContent.scrollHeight > clampedHeight + 2) {
    const readMoreBtn = document.createElement('button');
    readMoreBtn.className = 'read-more-btn';
    readMoreBtn.textContent = 'เพิ่มเติม';
    readMoreBtn.setAttribute('aria-expanded', 'false'); // For Accessibility

    lightboxCaption.appendChild(readMoreBtn);

    readMoreBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isExpanded = lightboxCaption.classList.toggle('expanded');
      readMoreBtn.textContent = isExpanded ? 'ย่อลง' : 'เพิ่มเติม';
      readMoreBtn.setAttribute('aria-expanded', isExpanded);
    });
  }
}

/**
 * Animates the lightbox media element to its final display position.
 * @param {HTMLElement} mediaElement - The image or video element in the lightbox.
 * @param {HTMLElement} controlsElement - The container for lightbox controls.
 * @param {Object} item - The project or certificate item.
 */
function animateLightbox(mediaElement, controlsElement, item) {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  let finalWidth, finalHeight;
  let aspectRatio;

  if (mediaElement.tagName === 'IMG') {
    aspectRatio = mediaElement.naturalWidth / mediaElement.naturalHeight;
    if (isNaN(aspectRatio) || !isFinite(aspectRatio)) { // Fallback for invalid natural dimensions
      aspectRatio = 16 / 9; // Default aspect ratio
    }
  } else {
    aspectRatio = 16 / 9; // Fallback for non-image media or if no natural dimensions
  }

  const maxViewportWidth = windowWidth * 0.9;
  const maxViewportHeight = windowHeight * 0.8; // Leave space for info container

  if (maxViewportWidth / maxViewportHeight > aspectRatio) {
    finalHeight = maxViewportHeight;
    finalWidth = finalHeight * aspectRatio;
  } else {
    finalWidth = maxViewportWidth;
    finalHeight = finalWidth / aspectRatio;
  }

  const finalLeft = (windowWidth - finalWidth) / 2;
  const finalTop = (windowHeight - finalHeight) / 2 - (windowHeight * 0.03); // Shift image up slightly

  mediaElement.style.left = `${finalLeft}px`;
  mediaElement.style.top = `${finalTop}px`;
  mediaElement.style.width = `${finalWidth}px`;
  mediaElement.style.height = `${finalHeight}px`;
  mediaElement.style.objectFit = 'contain'; // Use 'contain' to ensure the whole image is visible
  mediaElement.style.willChange = 'left, top, width, height'; // Optimize for animation

  // Set up caption content *before* animation starts
  setupLightboxCaption(item);

  // Use a small timeout to allow browser to render initial state
  // before adding class that triggers transition
  setTimeout(() => {
    controlsElement.classList.add('active');
  }, 50);
}

/**
 * Closes the lightbox and reverts elements to their original state.
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
    currentMediaElement.style.willChange = 'left, top, width, height'; // Optimize for animation
  }

  setTimeout(() => {
    lightboxOverlay.classList.remove('active');
    lightboxContainer.classList.remove('active');
    lightboxClose.classList.remove('active');

    if (currentMediaElement) {
      currentMediaElement.style.transition = ''; // Remove transition for next use
      currentMediaElement.removeAttribute('style'); // Clear inline styles
      currentMediaElement.src = ''; // Clear image source
      currentMediaElement = null;
    }

    lightboxImage.classList.add('hidden'); // Use class to hide
    document.body.classList.remove("lightbox-open");
    document.documentElement.classList.remove("lightbox-open");

    // Remove video loading spinner (if it was ever added)
    const loadingSpinner = lightboxContainer.querySelector('.lightbox-video-loading');
    if (loadingSpinner) {
      loadingSpinner.remove();
    }
  }, 400); // This timeout should match the transition duration of lightbox elements
}

// ============================================================================
// Main Initialization Logic
// ============================================================================

document.addEventListener("DOMContentLoaded", function () {
  // --- START: Data Loading Check and Error Display ---
  // Check if certificate data loaded successfully
  if (!certificates || certificates.length === 0) {
    console.error("certificateData.js: Could not load certificate data or data is empty. Please check the file path './data/certificateData.js' and its content on the server (case sensitivity).");
    if (certificatesGrid) {
      certificatesGrid.innerHTML = '<p class="error-message" style="text-align: center; color: red; font-size: 1.2em; padding: 20px;">ไม่สามารถโหลดข้อมูลประกาศนียบัตรได้ โปรดตรวจสอบ Console สำหรับรายละเอียดเพิ่มเติม.</p>';
    }
  } else {
    console.log("certificateData.js: Certificate data loaded successfully.");
  }

  // Check if project data loaded successfully
  if (typeof projects === 'undefined' || !projects || projects.length === 0) {
    console.error("projectsData.js: Could not load project data or data is empty. Please check the file path './data/projectsData.js' and its content on the server (case sensitivity).");
    if (galleryEl) {
      galleryEl.innerHTML = '<p class="error-message" style="text-align: center; color: red; font-size: 1.2em; padding: 20px;">ไม่สามารถโหลดข้อมูลโปรเจกต์ได้ โปรดตรวจสอบ Console สำหรับรายละเอียดเพิ่มเติม.</p>';
    }
  } else {
    console.log("projectsData.js: Project data loaded successfully.");
  }
  // --- END: Data Loading Check and Error Display ---

  // Add Ripple effect to desired elements
  const rippleElements = document.querySelectorAll(
    ".hero-btn-primary a, .filter-btn, .project-item, .cert-card, .tab-btn, .section-tab, .view-all-certs-btn, .cert-card-full"
  );
  rippleElements.forEach((element) => {
    element.classList.add("ripple");
    element.addEventListener("click", createRipple);
    element.addEventListener("touchend", createRipple); // For mobile devices
  });

  // ============================================================================
  // Navigation and Header Logic
  // ============================================================================

  const sections = document.querySelectorAll("section");
  const navItems = document.querySelectorAll(".header-nav li a");
  const header = document.querySelector('.header-section');

  let currentObserver = null; // Stores the current Intersection Observer instance

  /**
   * Sets up and observes sections for active navigation highlighting.
   */
  function setupIntersectionObserver() {
    // Disconnect existing observer if any
    if (currentObserver) {
      currentObserver.disconnect();
    }

    // Calculate dynamic headerOffset before creating Observer
    const headerOffset = header.offsetHeight;

    const observerOptions = {
      root: null,
      // Dynamically adjust rootMargin based on current Header height
      rootMargin: `-${headerOffset}px 0px 0px 0px`,
      threshold: 0.5, // Trigger when 50% of the Section is visible
    };

    currentObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const currentSectionId = entry.target.getAttribute("id");
          navItems.forEach((item) => {
            // Check if href matches current Section ID or is the certificates.html page
            const href = item.getAttribute("href");
            const isCertificatesPage = window.location.pathname.includes('certificates.html');

            item.classList.remove("active");
            item.removeAttribute("aria-current"); // Remove aria-current first

            if (href === `#${currentSectionId}` || (isCertificatesPage && href.includes('certificates.html'))) {
              item.classList.add("active");
              item.setAttribute("aria-current", "page"); // Set aria-current for the active link
            }
          });
        }
      });
    }, observerOptions);

    sections.forEach((section) => {
      currentObserver.observe(section);
    });
  }

  // Set up initial observer
  setupIntersectionObserver();

  // Re-setup observer when header height might change (e.g., shrink/expand)
  const headerResizeObserver = new ResizeObserver(entries => {
    const newHeaderHeight = entries[0].contentRect.height;
    if (Math.abs(newHeaderHeight - header.offsetHeight) > 1) { // Small tolerance
      setupIntersectionObserver();
    }
  });
  headerResizeObserver.observe(header);

  // Smooth scrolling for Anchor Links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      // Prevent default behavior only for anchor links within the current page
      if (this.hostname === window.location.hostname && this.pathname === window.location.pathname) {
        e.preventDefault();

        const targetId = this.getAttribute("href");
        if (targetId === "#") return; // Do nothing if it's just #

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          // Recalculate headerOffset in case it changed (e.g., 'shrink' class)
          const currentHeaderOffset = document.querySelector('.header-section').offsetHeight;
          const elementPosition = targetElement.offsetTop;
          const offsetPosition = elementPosition - currentHeaderOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }
      }

      // Close Mobile Menu if open after clicking a Link
      const menuToggle = document.querySelector('.menu-toggle');
      const headerList = document.querySelector('.header-list');
      if (headerList.classList.contains('active')) {
        menuToggle.classList.remove('open');
        headerList.classList.remove('active');
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        // Remove 'show' class from all Menu Items when closing Menu
        document.querySelectorAll('.header-nav li').forEach(item => {
          item.classList.remove('show');
        });
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // Mobile Menu Toggle
  const menuToggle = document.querySelector('.menu-toggle');
  const headerList = document.querySelector('.header-list');

  menuToggle.addEventListener('click', function () {
    const isOpen = this.classList.toggle('open');
    headerList.classList.toggle('active');
    this.setAttribute('aria-expanded', isOpen); // Update aria-expanded

    const menuItems = document.querySelectorAll('.header-nav li');

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';

      // Add 'show' class to each Menu Item with a delay for staggered animation
      menuItems.forEach((item, index) => {
        setTimeout(() => {
          item.classList.add('show');
        }, index * 100 + 100); // Delay each item 100ms + 100ms Base Delay
      });
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      // Remove 'show' class from all Menu Items when closing Menu
      menuItems.forEach(item => {
        item.classList.remove('show');
      });
    }
  });

  // Shrink Header on Scroll and Parallax Effect
  let ticking = false; // For throttling scroll events
  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        const currentScrollPosition = window.pageYOffset;
        const header = document.querySelector('.header-section');
        const heroSection = document.querySelector('.hero-section'); // Only exists on index.html

        if (currentScrollPosition > 100) {
          header.classList.add('shrink');
          header.style.transition = 'all 0.5s ease-out';
        } else {
          header.classList.remove('shrink');
        }

        // Parallax Effect for Hero Section (only on index.html)
        if (heroSection) {
          heroSection.style.setProperty('--parallax-translateY', `${currentScrollPosition * 0.3}px`);
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true }); // Use Passive Listener for better scroll performance

  // ============================================================================
  // Lightbox Event Listeners
  // ============================================================================
  lightboxOverlay.addEventListener('click', closeLightbox);
  lightboxClose.addEventListener('click', closeLightbox);
  lightboxContainer.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent clicks inside lightbox content from closing the lightbox
  });

  // ============================================================================
  // Initial Rendering Logic based on Current Page
  // ============================================================================
  (async function init() {
    if (window.location.pathname.includes('certificates.html')) {
      // Render Certificates on certificates.html
      renderCertificates(certificates);
    } else {
      // Render Projects on index.html
      showProjectsLoading(true); // Show Loading Spinner
      // Ensure projects data is loaded before mapping
      const projectIds = projects ? projects.map(p => p.id) : [];
      const allStatsMap = await fetchAllProjectStats(projectIds);

      let mostViewedProjectId = null;
      let maxViews = -1;
      if (projects) { // Check again before looping
        for (const id in allStatsMap) {
          if (allStatsMap.hasOwnProperty(id)) {
            if (allStatsMap[id].views > maxViews) {
              maxViews = allStatsMap[id].views;
              mostViewedProjectId = id;
            }
          }
        }
      }
      renderGallery(projects, allStatsMap, mostViewedProjectId);
      await updateTotalStatsDisplay();
    }
  })();

  // ============================================================================
  // Project Filter Functionality (only on index.html)
  // ============================================================================
  if (filtersEl) {
    filtersEl.addEventListener('click', async function (e) {
      if (e.target.tagName === 'BUTTON') {
        filtersEl.querySelectorAll('button').forEach(btn => {
          btn.classList.remove('active');
          btn.setAttribute('aria-pressed', 'false'); // Update aria-pressed
        });
        e.target.classList.add('active');
        e.target.setAttribute('aria-pressed', 'true'); // Update aria-pressed

        const filter = e.target.dataset.filter;
        const filteredProjects = projects ? projects.filter(project => {
          return filter === 'all' || project.category === filter;
        }) : [];

        showProjectsLoading(true); // Show Loading Spinner while filtering
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
  }

  // ============================================================================
  // Dark Mode Toggle Logic
  // ============================================================================
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

  // ============================================================================
  // Infinite Loop Slider for Certificates (only on index.html)
  // ============================================================================
  if (certSliderTrack && pauseSliderBtn && playSliderBtn) {
    const certCards = Array.from(certSliderTrack.children);
    // Clone only if there are enough cards to create a smooth loop
    if (certCards.length > 0) {
      // Calculate number of clones needed to fill the track and ensure smooth loop
      const cardWidth = certCards[0].getBoundingClientRect().width + parseFloat(window.getComputedStyle(certCards[0]).marginRight || '0');
      const trackWidth = certSliderTrack.offsetWidth;
      // Add enough clones to cover at least twice the track area for seamless looping
      const numClones = Math.ceil(trackWidth / cardWidth) * 2 + 2; // +2 for buffer

      for (let i = 0; i < numClones; i++) {
        const clonedCard = certCards[i % certCards.length].cloneNode(true);
        // Add Event Listener for Error Fallback to cloned images
        clonedCard.querySelector('img').onerror = function() {
          this.onerror=null;this.src='https://placehold.co/300x400/cccccc/333333?text=Certificate+Image+Not+Found';
        };
        // Add click listener to cloned cards for lightbox
        clonedCard.addEventListener('click', function() {
          const originalCertId = clonedCard.getAttribute('data-index'); // Assuming original index is stored
          const originalCert = certificates[originalCertId];
          const clickedImage = this.querySelector('img');
          originalRect = clickedImage.getBoundingClientRect();
          openLightbox(originalCert, { likes: 0, shares: 0, views: 0 }, originalRect, true);
        });
        certSliderTrack.appendChild(clonedCard);
      }
    }

    // Event Listeners for pausing/playing animation
    pauseSliderBtn.addEventListener('click', () => {
      certSliderTrack.style.animationPlayState = 'paused';
      pauseSliderBtn.classList.add('active');
      playSliderBtn.classList.remove('active');
      pauseSliderBtn.setAttribute('aria-pressed', 'true');
      playSliderBtn.setAttribute('aria-pressed', 'false');
    });

    playSliderBtn.addEventListener('click', () => {
      certSliderTrack.style.animationPlayState = 'running';
      playSliderBtn.classList.add('active');
      pauseSliderBtn.classList.remove('active');
      playSliderBtn.setAttribute('aria-pressed', 'true');
      pauseSliderBtn.setAttribute('aria-pressed', 'false');
    });

    // Pause on Hover (existing functionality)
    certSliderTrack.addEventListener('mouseenter', () => {
      certSliderTrack.style.animationPlayState = 'paused';
      pauseSliderBtn.classList.add('active');
      playSliderBtn.classList.remove('active');
      pauseSliderBtn.setAttribute('aria-pressed', 'true');
      playSliderBtn.setAttribute('aria-pressed', 'false');
    });

    certSliderTrack.addEventListener('mouseleave', () => {
      // Resume playing only if the Play button is active (i.e., user didn't manually stop it)
      if (playSliderBtn.classList.contains('active')) {
        certSliderTrack.style.animationPlayState = 'running';
      }
    });

    // Initial state: Play button active by default or paused if Prefer-Reduced-Motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      certSliderTrack.style.animationPlayState = 'paused';
      pauseSliderBtn.classList.add('active');
      playSliderBtn.classList.remove('active');
      pauseSliderBtn.setAttribute('aria-pressed', 'true');
      playSliderBtn.setAttribute('aria-pressed', 'false');
    } else {
      playSliderBtn.classList.add('active');
      pauseSliderBtn.classList.remove('active');
      playSliderBtn.setAttribute('aria-pressed', 'true');
      pauseSliderBtn.setAttribute('aria-pressed', 'false');
    }
  }

  // ============================================================================
  // Uptime Counter (only on index.html)
  // ============================================================================
  if (document.getElementById("uptime")) {
    const startTime = new Date("2025-07-03T00:14:20"); // Set start time
    function updateUptime() {
      const now = new Date();
      const diff = Math.floor((now - startTime) / 1000);
      const days = Math.floor(diff / 86400);
      const hours = Math.floor((diff % 86400) / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;
      document.getElementById("uptime").textContent =
        `เวลาที่ใช้งาน: ${days}d ${hours}h ${minutes}m ${seconds}s`;
    }
    setInterval(updateUptime, 1000);
    updateUptime(); // Call immediately to avoid initial "0d 0h 0m 0s"
  }

  // ============================================================================
  // Random Quote Display (only on index.html)
  // ============================================================================
  if (document.getElementById("quote")) {
    const quotes = [
      "ความพยายามไม่เคยทรยศใคร",
      "เรียนรู้ในสิ่งที่ใช่ จะได้ทำในสิ่งที่รัก",
      "ทุกวันคือโอกาสใหม่",
      "อย่ารอความมั่นใจ จงเริ่มจากความตั้งใจ"
    ];
    document.getElementById("quote").textContent =
      quotes[Math.floor(Math.random() * quotes.length)];
  }

  // ============================================================================
  // Preloader Hide Logic and AOS Initialization
  // ============================================================================
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
      mainContent.classList.remove('hidden'); // Use class to show
    }

    // Initialize AOS after page load to ensure elements are ready
    AOS.init({
      duration: 800, // Animation duration
      easing: 'ease-out-quad', // Animation easing
      once: true, // Animation plays only once when scrolling down
      mirror: false, // Do not replay animation when scrolling up
      anchorPlacement: 'top-bottom', // Element position to trigger animation
      offset: 120, // Distance from the top of the screen when triggering
    });
  });

  // ============================================================================
  // Tab Functionality for About Section (only on index.html)
  // ============================================================================
  const aboutSection = document.querySelector('.about-section');
  if (aboutSection) {
    const tabBtns = aboutSection.querySelectorAll('.tab-btn');
    const tabContents = aboutSection.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(btn => {
          btn.classList.remove('active');
          btn.setAttribute('aria-selected', 'false');
          btn.setAttribute('tabindex', '-1'); // Make inactive tabs unfocusable
        });
        tabContents.forEach(content => content.classList.remove('active'));
        tabContents.forEach(content => content.setAttribute('hidden', 'true')); // Hide inactive tab panels

        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        btn.setAttribute('tabindex', '0'); // Make active tab focusable

        const tabId = btn.getAttribute('data-tab');
        const activeContent = aboutSection.querySelector(`#${tabId}`);
        activeContent.classList.add('active');
        activeContent.removeAttribute('hidden'); // Show active tab panel
      });
    });

    // Click the first tab on page load
    if (tabBtns.length > 0) {
      tabBtns[0].click();
    }
  }

  // ============================================================================
  // Tab Functionality for Skills & Experience Section (only on index.html)
  // ============================================================================
  const skillsExperienceSection = document.querySelector('.skills-experience-section');
  if (skillsExperienceSection) {
    const sectionTabBtns = skillsExperienceSection.querySelectorAll('.section-tab');
    const sectionTabContents = skillsExperienceSection.querySelectorAll('.tab-content');

    sectionTabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        sectionTabBtns.forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
          t.setAttribute('tabindex', '-1'); // Make inactive tabs unfocusable
        });
        sectionTabContents.forEach(c => c.classList.remove('active'));
        sectionTabContents.forEach(c => c.setAttribute('hidden', 'true')); // Hide inactive tab panels

        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        btn.setAttribute('tabindex', '0'); // Make active tab focusable

        const tabId = btn.getAttribute('data-tab');
        const activeContent = skillsExperienceSection.querySelector(`#${tabId}`);
        activeContent.classList.add('active');
        activeContent.removeAttribute('hidden'); // Show active tab panel
      });
    });

    // Click the first tab on page load
    if (sectionTabBtns.length > 0) {
      sectionTabBtns[0].click();
    }
  }
});

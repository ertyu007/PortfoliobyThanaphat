import { projects } from "./data/projectsData.js";
import { certificates } from "./data/CertificateData.js";

// Function: สร้าง Ripple Effect
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

document.addEventListener("DOMContentLoaded", function () {
  // Add Ripple effect to desired elements
  const rippleElements = document.querySelectorAll(
    ".hero-btn-primary a, .filter-btn, .project-item, .cert-card, .tab-btn, .section-tab, .view-all-certs-btn"
  );

  rippleElements.forEach((element) => {
    element.classList.add("ripple");
    element.addEventListener("click", createRipple);
    element.addEventListener("touchend", createRipple); // For mobile
  });

  // Active link highlighting based on scroll position using Intersection Observer
  const sections = document.querySelectorAll("section");
  const navItems = document.querySelectorAll(".header-nav li a");
  const header = document.querySelector('.header-section');

  // Store the current observer instance
  let currentObserver = null;

  // Function to create and observe sections
  function setupIntersectionObserver() {
    // Disconnect existing observer if it exists
    if (currentObserver) {
      currentObserver.disconnect();
    }

    // Recalculate headerOffset dynamically before creating the observer
    // This ensures the rootMargin is correct for the current header state (shrunk or not)
    const headerOffset = header.offsetHeight;

    const observerOptions = {
      root: null,
      // Adjust rootMargin dynamically based on current header height
      rootMargin: `-${headerOffset}px 0px 0px 0px`,
      threshold: 0.5, // Trigger when 50% of the section is visible
    };

    currentObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const current = entry.target.getAttribute("id");
          navItems.forEach((item) => {
            // Check if the href matches the current section ID or is the certificates.html page
            const href = item.getAttribute("href");
            const isCertificatesPage = window.location.pathname.includes('certificates.html');

            item.classList.remove("active");
            if (href === `#${current}` || (isCertificatesPage && href.includes('#Certificates'))) {
              item.classList.add("active");
            }
          });
        }
      });
    }, observerOptions);

    sections.forEach((section) => {
      currentObserver.observe(section);
    });
  }

  // Initial setup of the observer
  setupIntersectionObserver();

  // Re-setup observer when header height might change (e.g., on shrink/expand)
  // Using a ResizeObserver on the header for more robust detection of height changes
  const headerResizeObserver = new ResizeObserver(entries => {
    // Only re-setup if the header's bounding box height has actually changed
    // This prevents unnecessary re-creations if other properties change but not height
    const newHeaderHeight = entries[0].contentRect.height;
    if (Math.abs(newHeaderHeight - header.offsetHeight) > 1) { // Small tolerance for minor fluctuations
      setupIntersectionObserver();
    }
  });

  headerResizeObserver.observe(header);


  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      // Only prevent default if it's an internal anchor on the current page
      if (this.hostname === window.location.hostname && this.pathname === window.location.pathname) {
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
      }


      // Close mobile menu if open after clicking a link
      const menuToggle = document.querySelector('.menu-toggle');
      const headerList = document.querySelector('.header-list');
      if (headerList.classList.contains('active')) {
        menuToggle.classList.remove('open');
        headerList.classList.remove('active');
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        // Remove 'show' class from all menu items when closing
        document.querySelectorAll('.header-nav li').forEach(item => {
          item.classList.remove('show');
        });
      }
    });
  });

  // Project Data and Lightbox Elements
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

  // Local stats registry for user's unique actions (like, share, view)
  const LOCAL_KEY = "project-stats";
  function loadLocalStats() { return JSON.parse(localStorage.getItem(LOCAL_KEY) || "{}"); }
  function saveLocalStats(d) { localStorage.setItem(LOCAL_KEY, JSON.stringify(d)); }

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

  // Stat handler functions
  async function fetchProjectStats(id) {
    try {
      const response = await fetch(`/.netlify/functions/projectStats?id=${id}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `HTTP error! status: ${response.status}`;
        console.error(`Error fetching project stats for project ${id}: ${errorMessage}`); // Keep for debugging in Canvas
        throw new Error(`Error fetching project stats for project ${id}: ${errorMessage}`);
      }
      const data = await response.json();
      return {
        likes: data.likes || 0,
        shares: data.shares || 0,
        views: data.views || 0,
      };
    } catch (error) {
      console.error('Error fetching project stats:', error); // Keep for debugging in Canvas
      return { likes: 0, shares: 0, views: 0 };
    }
  }

  async function fetchAllProjectStats(projectIds) {
    // Using Promise.allSettled to ensure all promises resolve regardless of individual failures
    const statPromises = projectIds.map(id => fetchProjectStats(id));
    const results = await Promise.allSettled(statPromises);
    const allStatsMap = {};
    projectIds.forEach((id, index) => {
      if (results[index].status === 'fulfilled') {
        allStatsMap[id] = results[index].value;
      } else {
        console.warn(`Failed to fetch stats for project ID ${id}:`, results[index].reason); // Keep for debugging in Canvas
        allStatsMap[id] = { likes: 0, shares: 0, views: 0 }; // Default on failure
      }
    });
    return allStatsMap;
  }

  async function fetchTotalStat(type) {
    try {
      const response = await fetch(`/.netlify/functions/projectStats?total=true&type=${type}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `HTTP error! status: ${response.status}`;
        console.error(`Error fetching total ${type}: ${errorMessage}`); // Keep for debugging in Canvas
        throw new Error(`Error fetching total ${type}: ${errorMessage}`);
      }
      const data = await response.json();
      return data.totalCount || 0;
    } catch (error) {
      console.error(`Error fetching total ${type}:`, error); // Keep for debugging in Canvas
      return 0;
    }
  }

  async function handleLike(id, btn) {
    const local = loadLocalStats();
    // Prevent multiple likes from the same user/session
    if (local[id] && local[id].liked) {
      console.log(`Project ${id} already liked by this user session.`);
      return;
    }

    let currentLikeCount = parseInt(btn.querySelector(".like-count").textContent);
    currentLikeCount++;
    btn.querySelector(".like-count").textContent = currentLikeCount;
    btn.classList.add("liked");

    triggerHeartBurst(btn);

    // Update local storage immediately
    local[id] = local[id] || {};
    local[id].liked = true;
    saveLocalStats(local);

    try {
      const updatedStats = await pushStat(id, 'like');
      if (updatedStats) {
        updateTotalStatsDisplay();
      } else {
        // Rollback UI and local storage if server update failed
        btn.classList.remove("liked");
        const actualStats = await fetchProjectStats(id); // Fetch actual stats to revert count
        btn.querySelector(".like-count").textContent = actualStats.likes;
        if (local[id]) { // Check if local[id] exists before deleting property
          delete local[id].liked;
          saveLocalStats(local);
        }
        console.error('Failed to save like to server, rolling back UI.'); // Keep for debugging in Canvas
      }
    } catch (error) {
      console.error("Error in handleLike (server call):", error); // Keep for debugging in Canvas
      // Rollback UI and local storage on network/server error
      btn.classList.remove("liked");
      const actualStats = await fetchProjectStats(id); // Fetch actual stats to revert count
      btn.querySelector(".like-count").textContent = actualStats.likes;
      if (local[id]) { // Check if local[id] exists before deleting property
        delete local[id].liked;
        saveLocalStats(local);
      }
      console.error('Error connecting to server for like, rolling back UI.'); // Keep for debugging in Canvas
    }
  }

  async function handleShare(id, btn) {
    const local = loadLocalStats();
    // Prevent multiple shares from the same user/session
    if (local[id] && local[id].shared) {
      console.log(`Project ${id} already shared by this user session.`);
      return;
    }

    let currentShareCount = parseInt(btn.querySelector(".share-count").textContent);
    currentShareCount++;
    btn.querySelector(".share-count").textContent = currentShareCount;
    btn.classList.add("shared");

    // Update local storage immediately
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
              url: window.location.href, // Share current page URL
            });
          } catch (shareError) {
            console.log('User cancelled share or Web Share API failed:', shareError); // Keep for debugging in Canvas
            // If user cancels share, don't rollback as the server call already succeeded
          }
        } else {
          console.warn('Browser does not support Web Share API. Consider implementing a fallback like copying URL to clipboard.'); // Keep for debugging in Canvas
          // Fallback: Copy URL to clipboard (example, not implemented here for brevity)
          // const projectUrl = window.location.href;
          // document.execCommand('copy'); // Fallback for navigator.clipboard.writeText due to iFrame restrictions
        }
      } else {
        // Rollback UI and local storage if server update failed
        btn.classList.remove("shared");
        if (local[id]) { // Check if local[id] exists before deleting property
          delete local[id].shared;
          saveLocalStats(local);
        }
        const actualStats = await fetchProjectStats(id); // Fetch actual stats to revert count
        btn.querySelector(".share-count").textContent = actualStats.shares;
        console.error('Failed to save share to server, rolling back UI.'); // Keep for debugging in Canvas
      }
    } catch (error) {
      console.error("Error in handleShare (server call):", error); // Keep for debugging in Canvas
      // Rollback UI and local storage on network/server error
      btn.classList.remove("shared");
      if (local[id]) { // Check if local[id] exists before deleting property
        delete local[id].shared;
        saveLocalStats(local);
      }
      const actualStats = await fetchProjectStats(id); // Fetch actual stats to revert count
      btn.querySelector(".share-count").textContent = actualStats.shares;
      console.error('Error connecting to server for share, rolling back UI.'); // Keep for debugging in Canvas
    }
  }

  async function handleView(id) {
    const local = loadLocalStats();
    // Prevent multiple views from the same user/session for the same project
    if (local[id] && local[id].viewed) {
      return;
    }

    local[id] = local[id] || {};
    local[id].viewed = true;
    saveLocalStats(local);

    try {
      const updatedStats = await pushStat(id, 'view');
      if (!updatedStats) {
        // If server update failed, rollback local storage
        if (local[id]) { // Check if local[id] exists before deleting property
          delete local[id].viewed;
          saveLocalStats(local);
        }
        console.error('Failed to save view to server.'); // Keep for debugging in Canvas
      }
      // Update total views display even if local storage already marked it as viewed
      updateTotalStatsDisplay();
    } catch (error) {
      console.error("Error in handleView (server call):", error); // Keep for debugging in Canvas
      // If network/server error, rollback local storage
      if (local[id]) { // Check if local[id] exists before deleting property
        delete local[id].viewed;
        saveLocalStats(local);
      }
      console.error('Error connecting to server for view.'); // Keep for debugging in Canvas
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
      console.error(`Error pushing ${type}:`, error); // Keep for debugging in Canvas
      return null;
    }
  }

  async function updateTotalStatsDisplay() {
    // Only update if elements exist (i.e., on index.html)
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

  function showProjectsLoading(show) {
    if (galleryEl) { // Check if galleryEl exists (only on index.html)
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
        galleryEl.style.display = 'grid'; // Revert to grid display
        galleryEl.style.justifyContent = '';
        galleryEl.style.alignItems = '';
        galleryEl.style.minHeight = '';
      }
    }
  }

  // Gallery rendering (for index.html)
  async function renderGallery(data, allStatsMap, mostViewedProjectId) {
    if (!galleryEl) return; // Only run if on index.html

    showProjectsLoading(false); // Hide loading spinner
    galleryEl.innerHTML = ""; // Clear existing content

    if (data.length === 0) {
      galleryEl.innerHTML = '<p class="no-projects-message">ไม่พบโปรเจกต์ในหมวดหมู่นี้</p>';
      galleryEl.style.display = 'block'; // Ensure message is visible
      return;
    }

    const local = loadLocalStats(); // Load local stats once for rendering

    const fragment = document.createDocumentFragment(); // Use DocumentFragment for performance

    data.forEach(project => { // Use forEach as we are not awaiting inside the loop for element creation
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
          <img src="${project.thumbnail}" alt="${project.title}" loading="lazy"> <!-- Added lazy loading -->
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

      // Event listeners for stat buttons (delegation not strictly needed here as elements are created once per render)
      const likeBtn = item.querySelector(".stat-item.likes");
      if (likeBtn) {
        likeBtn.addEventListener("click", (e) => {
          e.stopPropagation(); // Prevent click from bubbling up to project item
          handleLike(project.id, likeBtn);
        });
      }

      const shareBtn = item.querySelector(".stat-item.shares");
      if (shareBtn) {
        if (local[project.id] && local[project.id].shared) {
          shareBtn.classList.add("shared");
        }
        shareBtn.addEventListener("click", (e) => {
          e.stopPropagation(); // Prevent click from bubbling up to project item
          handleShare(project.id, shareBtn);
        });
      }

      fragment.appendChild(item);

      // Handle "Read More" button for project descriptions
      const descP = item.querySelector('.project-content p');
      if (descP.scrollHeight > descP.clientHeight) {
        const readMoreBtn = document.createElement('button');
        readMoreBtn.className = 'read-more-project-btn';
        readMoreBtn.textContent = 'อ่านเพิ่มเติม';
        descP.insertAdjacentElement('afterend', readMoreBtn);

        readMoreBtn.addEventListener('click', (e) => {
          e.stopPropagation(); // Prevent click from bubbling up to project item
          descP.classList.toggle('expanded');
          readMoreBtn.textContent = descP.classList.contains('expanded') ? 'ย่อลง' : 'อ่านเพิ่มเติม';
        });
      }
    });
    galleryEl.appendChild(fragment); // Append all elements at once
  }

  // Render Certificates (for certificates.html)
  function renderCertificates(certs) {
    const certificatesGrid = document.getElementById('certificates-grid');
    if (!certificatesGrid) return; // Only run if on certificates.html

    certificatesGrid.innerHTML = ''; // Clear existing content
    const fragment = document.createDocumentFragment();

    certs.forEach(cert => {
      const certCard = document.createElement('div');
      certCard.classList.add('cert-card-full'); // New class for full page certificate cards
      certCard.setAttribute('data-aos', 'fade-up');
      certCard.setAttribute('data-aos-duration', '800');
      certCard.setAttribute('data-id', cert.id); // Add data-id for lightbox

      certCard.innerHTML = `
        <img src="${cert.src}" alt="${cert.title}" loading="lazy">
        <div class="cert-info">
          <h3>${cert.title}</h3>
          <p>${cert.desc}</p>
        </div>
      `;

      // Add click listener to open lightbox for certificates
      certCard.addEventListener('click', function() {
        const clickedImage = this.querySelector('img');
        originalRect = clickedImage.getBoundingClientRect();
        openLightbox(cert, { likes: 0, shares: 0, views: 0 }, originalRect, true); // Pass true for isCertificate
      });

      fragment.appendChild(certCard);
    });
    certificatesGrid.appendChild(fragment);
  }

  // Lightbox functions (modified to handle both projects and certificates)
  async function openLightbox(item, initialStats, triggerRect, isCertificate = false) {
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

    lightboxImage.classList.add('hidden'); // Use class to hide
    lightboxImage.src = '';

    let mediaElement = lightboxImage; // Always use lightboxImage for now
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

    // Once image is loaded, animate to final position
    mediaElement.onload = () => {
      animateLightbox(mediaElement, lightboxInfoContainer, item);
    };
    // Handle cases where image might be cached and onload doesn't fire
    if (mediaElement.complete) {
      animateLightbox(mediaElement, lightboxInfoContainer, item);
    }

    // Clear previous controls
    const controls = lightboxInfoContainer.querySelector('.lightbox-controls');
    controls.innerHTML = '';

    const local = loadLocalStats();

    let currentLikes = initialStats.likes;
    let currentShares = initialStats.shares;
    let currentViews = initialStats.views;

    // If it's a project and not already viewed, increment view count
    if (!isCertificate && !(local[item.id] && local[item.id].viewed)) {
      currentViews++;
    }

    // Create Like Button (only for projects, not certificates)
    if (!isCertificate) {
      const likeBtn = document.createElement('button');
      likeBtn.className = `lightbox-btn like-btn ${local[item.id] && local[item.id].liked ? 'liked' : ''}`;
      likeBtn.innerHTML = `<i class="fas fa-heart"></i> <span class="like-count">${currentLikes}</span>`;
      likeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        handleLike(item.id, likeBtn);
      });
      controls.append(likeBtn);
    }


    // Create Share Button (only for projects, not certificates)
    if (!isCertificate) {
      const shareBtn = document.createElement('button');
      shareBtn.className = `lightbox-btn share-btn ${local[item.id] && local[item.id].shared ? 'shared' : ''}`;
      shareBtn.innerHTML = `<i class="fas fa-share-alt"></i> <span class="share-count">${currentShares}</span>`;
      shareBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        handleShare(item.id, shareBtn);
      });
      controls.append(shareBtn);
    }


    // Create View Display (only for projects, not certificates)
    if (!isCertificate) {
      const viewDisplay = document.createElement('div');
      viewDisplay.className = 'lightbox-btn view-display';
      viewDisplay.innerHTML = `<i class="fas fa-eye"></i> <span class="view-count">${currentViews}</span>`;
      controls.append(viewDisplay);
    }


    // Activate lightbox elements
    lightboxOverlay.classList.add('active');
    lightboxContainer.classList.add('active');
    lightboxClose.classList.add('active');
    document.body.classList.add("lightbox-open");
    document.documentElement.classList.add("lightbox-open");

    // Push view stat to server (only for projects, only if not already viewed in this session)
    if (!isCertificate) {
      handleView(item.id);
    }
  }

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

    // Use line-height calculation for a more reliable overflow check
    const style = window.getComputedStyle(captionContent);
    const lineHeight = parseFloat(style.lineHeight);
    const clampLines = parseInt(style.webkitLineClamp || '1'); // Default to 1 line for lightbox
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

  function animateLightbox(mediaElement, controlsElement, item) {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    let finalWidth, finalHeight;
    let aspectRatio;

    if (mediaElement.tagName === 'IMG') {
      aspectRatio = mediaElement.naturalWidth / mediaElement.naturalHeight;
    } else {
      // Fallback for non-image media or if natural dimensions are not available
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
    setupLightboxCaption(item);

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
        currentMediaElement.style.transition = ''; // Remove transition for next use
        currentMediaElement.removeAttribute('style'); // Clear inline styles
        currentMediaElement.src = ''; // Clear image source
        currentMediaElement = null;
      }

      lightboxImage.classList.add('hidden'); // Use class to hide
      document.body.classList.remove("lightbox-open");
      document.documentElement.classList.remove("lightbox-open");

      const loadingSpinner = lightboxContainer.querySelector('.lightbox-video-loading'); // This class is not used
      if (loadingSpinner) {
        loadingSpinner.remove();
      }
    }, 400); // This timeout should match the transition duration of the lightbox elements
  }

  // Event Listeners for lightbox
  lightboxOverlay.addEventListener('click', closeLightbox);
  lightboxClose.addEventListener('click', closeLightbox);
  lightboxContainer.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent clicks inside lightbox content from closing it
  });

  // Initial render logic based on current page
  (async function init() {
    if (window.location.pathname.includes('certificates.html')) {
      // Render certificates on certificates.html
      renderCertificates(certificates);
    } else {
      // Render projects on index.html
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
      await updateTotalStatsDisplay();
    }
  })();

  // Mobile Menu Toggle
  const menuToggle = document.querySelector('.menu-toggle');
  const headerList = document.querySelector('.header-list');

  menuToggle.addEventListener('click', function () {
    this.classList.toggle('open');
    headerList.classList.toggle('active');
    const menuItems = document.querySelectorAll('.header-nav li');

    if (headerList.classList.contains('active')) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';

      // Add 'show' class to each menu item with a delay for staggered animation
      menuItems.forEach((item, index) => {
        setTimeout(() => {
          item.classList.add('show');
        }, index * 100 + 100); // Delay each item by 100ms + 100ms base delay
      });
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      // Remove 'show' class from all menu items when closing
      menuItems.forEach(item => {
        item.classList.remove('show');
      });
    }
  });

  // Shrink Header on Scroll and Parallax Effect
  // Using a throttled scroll handler for better performance
  let ticking = false;
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

        // Parallax effect for Hero Section (only on index.html)
        if (heroSection) {
          heroSection.style.setProperty('--parallax-translateY', `${currentScrollPosition * 0.3}px`);
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true }); // Use passive listener for better scroll performance

  // Filter functionality (only on index.html)
  if (filtersEl) {
    filtersEl.addEventListener('click', async function (e) {
      if (e.target.tagName === 'BUTTON') {
        filtersEl.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');

        const filter = e.target.dataset.filter;
        const filteredProjects = projects.filter(project => {
          return filter === 'all' || project.category === filter;
        });

        showProjectsLoading(true); // Show loading spinner while filtering
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

  // Infinity Loop Slider for Certificates (only on index.html)
  const certSliderTrack = document.getElementById('cert-slider-track');
  const pauseSliderBtn = document.getElementById('pause-slider-btn');
  const playSliderBtn = document.getElementById('play-slider-btn');

  if (certSliderTrack && pauseSliderBtn && playSliderBtn) {
    const certCards = Array.from(certSliderTrack.children);
    // Clone only if there are enough cards to make a seamless loop
    if (certCards.length > 0) {
      // Calculate how many clones are needed to fill the track and ensure seamless loop
      const cardWidth = certCards[0].offsetWidth + (parseFloat(window.getComputedStyle(certCards[0]).marginRight) * 2);
      const trackWidth = certSliderTrack.offsetWidth;
      const numVisibleCards = Math.ceil(trackWidth / cardWidth);
      const numClones = numVisibleCards * 2;

      for (let i = 0; i < numClones; i++) {
        const clonedCard = certCards[i % certCards.length].cloneNode(true);
        certSliderTrack.appendChild(clonedCard);
      }
    }

    // Event listeners for pausing/playing animation
    pauseSliderBtn.addEventListener('click', () => {
      certSliderTrack.style.animationPlayState = 'paused';
      pauseSliderBtn.classList.add('active');
      playSliderBtn.classList.remove('active');
    });

    playSliderBtn.addEventListener('click', () => {
      certSliderTrack.style.animationPlayState = 'running';
      playSliderBtn.classList.add('active');
      pauseSliderBtn.classList.remove('active');
    });

    // Pause on hover (existing functionality)
    certSliderTrack.addEventListener('mouseenter', () => {
      certSliderTrack.style.animationPlayState = 'paused';
      pauseSliderBtn.classList.add('active');
      playSliderBtn.classList.remove('active');
    });

    certSliderTrack.addEventListener('mouseleave', () => {
      // Only resume if the play button is currently active (i.e., user didn't manually pause)
      if (playSliderBtn.classList.contains('active')) {
        certSliderTrack.style.animationPlayState = 'running';
      }
    });

    // Initial state: Play button active by default, or pause if prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      certSliderTrack.style.animationPlayState = 'paused';
      pauseSliderBtn.classList.add('active');
      playSliderBtn.classList.remove('active');
    } else {
      playSliderBtn.classList.add('active');
      pauseSliderBtn.classList.remove('active');
    }
  }

  // Uptime Counter (only on index.html)
  if (document.getElementById("uptime")) {
    const startTime = new Date("2025-07-03T00:14:20");
    function updateUptime() {
      const now = new Date();
      const diff = Math.floor((now - startTime) / 1000);
      const days = Math.floor(diff / 86400);
      const hours = Math.floor((diff % 86400) / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;
      document.getElementById("uptime").textContent =
        ` ${days}d ${hours}m ${minutes}m ${seconds}s `;
    }
    setInterval(updateUptime, 1000);
    updateUptime(); // Call once immediately to avoid initial "0d 0h 0m 0s"
  }


  // Random Quote Display (only on index.html)
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
      mainContent.classList.remove('hidden'); // Use class to show
    }

    // Initialize AOS after the page has loaded to ensure elements are ready
    AOS.init({
      duration: 800, // Animation duration
      easing: 'ease-out-quad', // Animation easing
      once: true, // Animation plays only once when scrolling down
      mirror: false, // Do not replay animation when scrolling up
      anchorPlacement: 'top-bottom', // Element position to trigger animation
      offset: 120, // Distance from the top of the screen when triggered
    });
  });

  // Tab Functionality for the new About section (only on index.html)
  const aboutSection = document.querySelector('.about-section');
  if (aboutSection) {
    const tabBtns = aboutSection.querySelectorAll('.tab-btn');
    const tabContents = aboutSection.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        btn.classList.add('active');

        const tabId = btn.getAttribute('data-tab');
        aboutSection.querySelector(`#${tabId}`).classList.add('active');
      });
    });

    if (tabBtns.length > 0) {
      tabBtns[0].click();
    }
  }


  // Tab Functionality for Skills & Experience section (only on index.html)
  const skillsExperienceSection = document.querySelector('.skills-experience-section');
  if (skillsExperienceSection) {
    const sectionTabBtns = skillsExperienceSection.querySelectorAll('.section-tab');
    const sectionTabContents = skillsExperienceSection.querySelectorAll('.tab-content');

    sectionTabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        sectionTabBtns.forEach(t => t.classList.remove('active'));
        sectionTabContents.forEach(c => c.classList.remove('active'));

        btn.classList.add('active');

        const tabId = btn.getAttribute('data-tab');
        skillsExperienceSection.querySelector(`#${tabId}`).classList.add('active');
      });
    });
  }
});


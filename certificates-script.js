// certificates-script.js

import { certificates } from "./data/certificatesData.js"; // Corrected path
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
    ".header-contact a, .header-nav li a, .header-logo a"
  );

  rippleElements.forEach((element) => {
    element.classList.add("ripple");
    element.addEventListener("click", createRipple);
    element.addEventListener("touchend", createRipple); // For mobile
  });

  const certificatesGrid = document.getElementById("certificates-grid");
  const lightboxOverlay = document.getElementById('lightbox-overlay');
  const lightboxContainer = document.getElementById('lightbox-content-container');
  const lightboxImage = document.getElementById('lightbox-image');
  const lightboxInfoContainer = document.getElementById('lightbox-info-container');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxClose = document.getElementById('lightbox-close');

  let originalRect = {};
  let currentMediaElement = null;

  // --- Cookie Consent & Local Storage Management for certificates.html ---
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

  // Function to initialize/re-initialize features based on consent (simplified for certificates.html)
  function initFeaturesBasedOnConsent() {
    const preferences = getConsentPreferences();

    // Dark Mode (if applicable on this page)
    const darkModeToggle = document.getElementById("dark-mode-toggle"); // Assuming this might exist on certificates.html header
    if (darkModeToggle) {
      if (preferences.ui) { // Check for 'ui' consent
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        if (isDarkMode) {
          document.body.classList.add('dark-mode');
        }
      } else {
        document.body.classList.remove('dark-mode');
        localStorage.removeItem('darkMode');
      }
    }
    // No project stats on this page, so no need to re-render gallery
  }

  // Check consent on initial load for certificates.html
  const initialConsent = localStorage.getItem(CONSENT_KEY);
  if (!initialConsent) {
    showConsentBanner();
  } else {
    initFeaturesBasedOnConsent();
  }
  // --- End Cookie Consent & Local Storage Management ---

  // Function to render certificates dynamically
  function renderCertificates() {
    if (!certificatesGrid) return; // Exit if the grid container doesn't exist

    certificatesGrid.innerHTML = ""; // Clear existing content

    certificates.forEach((cert, index) => {
      const certItem = document.createElement("div");
      certItem.classList.add("cert-grid-item");
      certItem.setAttribute('data-aos', 'fade-up');
      certItem.setAttribute('data-aos-delay', (index * 100).toString()); // Stagger animation delay

      certItem.innerHTML = `
        <div class="cert-grid-image" aria-label="ดูประกาศนียบัตร ${cert.title} ขนาดเต็ม">
          <img src="${cert.thumbnail}" alt="${cert.title}" loading="lazy">
        </div>
        <div class="cert-grid-details">
          <h3>${cert.title}</h3>
          <p class="cert-date">ปีที่ได้รับ: ${cert.year}</p>
          <p class="cert-desc">${cert.desc}</p>
        </div>
      `; // Removed <a href="${cert.src}" class="cert-view-btn" target="_blank">ดูขนาดเต็ม</a>

      // Add click listener to open lightbox for the image
      const certImageContainer = certItem.querySelector('.cert-grid-image');
      certImageContainer.addEventListener('click', function() {
        const clickedImage = this.querySelector('img');
        originalRect = clickedImage.getBoundingClientRect();
        openLightbox(cert, originalRect);
      });

      certificatesGrid.appendChild(certItem);
    });
  }

  // Lightbox functions (adapted from script.js)
  function openLightbox(item, triggerRect) {
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
    mediaElement.src = item.src;
    mediaElement.alt = item.title;
    mediaElement.style.display = 'block';
    mediaElement.setAttribute('loading', 'lazy'); // Add lazy loading to lightbox images

    mediaElement.style.left = `${triggerRect.left}px`;
    mediaElement.style.top = `${triggerRect.top}px`;
    mediaElement.style.width = `${triggerRect.width}px`;
    mediaElement.style.height = `${triggerRect.height}px`;
    mediaElement.style.objectFit = 'cover';
    mediaElement.style.transition = 'all 0.5s ease-out';
    mediaElement.style.willChange = 'left, top, width, height'; // Optimize for animation

    currentMediaElement = mediaElement;

    mediaElement.onload = () => {
      animateLightbox(mediaElement, lightboxInfoContainer, item);
    };

    // No like/share/view buttons for certificates, clear controls
    const controls = lightboxInfoContainer.querySelector('.lightbox-controls');
    if (controls) {
      controls.innerHTML = '';
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

  function setupLightboxCaption(item) {
    const captionContent = lightboxCaption.querySelector('.lightbox-caption-content');
    if (!captionContent) return;

    // Reset state
    lightboxCaption.classList.remove('expanded');
    const existingBtn = lightboxCaption.querySelector('.read-more-btn');
    if (existingBtn) {
      existingBtn.remove();
    }

    captionContent.textContent = `${item.title} (${item.year}) — ${item.desc}`;

    // Use line-height calculation for a more reliable overflow check
    const style = window.getComputedStyle(captionContent);
    const lineHeight = parseFloat(style.lineHeight);
    const clampLines = parseInt(style.webkitLineClamp || '2'); // Assuming 2 lines clamp by default
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

  function animateLightbox(mediaElement, controlsElement, item) {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    let finalWidth, finalHeight;
    let aspectRatio;

    if (mediaElement.tagName === 'IMG') {
      aspectRatio = mediaElement.naturalWidth / mediaElement.naturalHeight;
    } else {
      aspectRatio = 16 / 9; // Fallback for non-image media if any
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

  // Back to Top Button visibility
  window.addEventListener('scroll', backToTop); // Use the imported shared function

  document.querySelector('.back-to-top-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  // Preloader Hide Logic
  window.addEventListener('load', preloaderHide); // Use the imported shared function

  // Initialize AOS after the page has loaded
  window.addEventListener('load', aosInit); // Use the imported shared function

  // Initial render of certificates
  renderCertificates();
});

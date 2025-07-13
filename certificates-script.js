// certificates-script.js

import { certificates } from "./data/certificatesData.js"; // Corrected path

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
    ".header-contact a, .header-nav li a, .header-logo a" // Removed .cert-view-btn
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
  const CONSENT_KEY = 'cookieConsent';
  const PREFERENCES_KEY = 'cookiePreferences';

  const cookieConsentBanner = document.getElementById('cookie-consent-banner');
  const acceptAllCookiesBtn = document.getElementById('accept-all-cookies');
  const managePreferencesBtn = document.getElementById('manage-preferences');

  const cookiePreferencesModal = document.getElementById('cookie-preferences-modal');
  const essentialStorageCheckbox = document.getElementById('essential-storage');
  const analyticsStorageCheckbox = document.getElementById('analytics-storage');
  const savePreferencesBtn = document.getElementById('save-preferences');
  const cancelPreferencesBtn = document.getElementById('cancel-preferences');

  // Function to get current consent preferences
  function getConsentPreferences() {
    const preferences = localStorage.getItem(PREFERENCES_KEY);
    return preferences ? JSON.parse(preferences) : { essential: false, analytics: false, preferences: false };
  }

  // Function to show the cookie consent banner
  function showConsentBanner() {
    if (cookieConsentBanner) {
      cookieConsentBanner.classList.add('show');
    }
  }

  // Function to hide the cookie consent banner
  function hideConsentBanner() {
    if (cookieConsentBanner) {
      cookieConsentBanner.classList.remove('show');
    }
  }

  // Function to show the preferences modal
  function showPreferencesModal() {
    if (cookiePreferencesModal) {
      cookiePreferencesModal.classList.add('show');
      document.body.classList.add('cookie-modal-open'); // Prevent scrolling
      const preferences = getConsentPreferences();
      analyticsStorageCheckbox.checked = preferences.analytics;
    }
  }

  // Function to hide the preferences modal
  function hidePreferencesModal() {
    if (cookiePreferencesModal) {
      cookiePreferencesModal.classList.remove('show');
      document.body.classList.remove('cookie-modal-open'); // Allow scrolling
    }
  }

  // Handle "Accept All"
  if (acceptAllCookiesBtn) {
    acceptAllCookiesBtn.addEventListener('click', () => {
      localStorage.setItem(CONSENT_KEY, 'granted');
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify({ essential: true, analytics: true, preferences: true }));
      hideConsentBanner();
      // No specific features to re-init on this page based on consent, but good practice
    });
  }

  // Handle "Manage Preferences"
  if (managePreferencesBtn) {
    managePreferencesBtn.addEventListener('click', () => {
      hideConsentBanner();
      showPreferencesModal();
    });
  }

  // Handle "Save Preferences"
  if (savePreferencesBtn) {
    savePreferencesBtn.addEventListener('click', () => {
      const newPreferences = {
        essential: true, // Essential is always true
        analytics: analyticsStorageCheckbox.checked,
        preferences: analyticsStorageCheckbox.checked
      };
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(newPreferences));

      if (newPreferences.analytics || newPreferences.preferences) {
        localStorage.setItem(CONSENT_KEY, 'granted');
      } else {
        localStorage.setItem(CONSENT_KEY, 'denied_non_essential');
      }

      hidePreferencesModal();
    });
  }

  // Handle "Cancel Preferences"
  if (cancelPreferencesBtn) {
    cancelPreferencesBtn.addEventListener('click', () => {
      hidePreferencesModal();
      if (!localStorage.getItem(CONSENT_KEY)) {
        showConsentBanner();
      }
    });
  }

  // Check consent on initial load for certificates.html
  const initialConsent = localStorage.getItem(CONSENT_KEY);
  if (!initialConsent) {
    showConsentBanner();
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
        <div class="cert-grid-image">
          <img src="${cert.thumbnail}" alt="${cert.title}">
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
    }, 400);
  }

  // Event Listeners for lightbox
  lightboxOverlay.addEventListener('click', closeLightbox);
  lightboxClose.addEventListener('click', closeLightbox);
  lightboxContainer.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  // Mobile Menu Toggle (copied from script.js)
  const menuToggle = document.querySelector('.menu-toggle');
  const headerList = document.querySelector('.header-list');

  menuToggle.addEventListener('click', function () {
    this.classList.toggle('open');
    headerList.classList.toggle('active');
    const menuItems = document.querySelectorAll('.header-nav li');

    if (headerList.classList.contains('active')) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';

      // Add 'show' class to each menu item with a delay
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

  // Shrink Header on Scroll (copied from script.js, simplified for this page)
  window.addEventListener('scroll', function () {
    const currentScrollPosition = window.pageYOffset;
    const header = document.querySelector('.header-section');

    if (currentScrollPosition > 100) {
      header.classList.add('shrink');
      header.style.transition = 'all 0.5s ease-out';
    } else {
      header.classList.remove('shrink');
    }
  }, { passive: true }); // Use passive listener for better scroll performance

  // Back to Top Button visibility (copied from script.js)
  const backToTopBtn = document.querySelector('.back-to-top-btn');
  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) { // Show button after scrolling 300px
      backToTopBtn.style.opacity = '1';
      backToTopBtn.style.visibility = 'visible';
    } else {
      backToTopBtn.style.opacity = '0';
      backToTopBtn.style.visibility = 'hidden';
    }
  });

  backToTopBtn.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  // Preloader Hide Logic (copied from script.js)
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

  // Initial render of certificates
  renderCertificates();
});

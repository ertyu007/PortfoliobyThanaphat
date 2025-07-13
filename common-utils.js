// common-utils.js - Shared utility functions

/**
 * Creates a ripple effect on the clicked element.
 * @param {Event} event - The click or touchend event.
 */
export function createRipple(event) {
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
 * Toggles the mobile menu open/close state.
 */
export function mobileMenuToggle() {
  const menuToggle = document.querySelector('.menu-toggle');
  const headerList = document.querySelector('.header-list');
  const menuItems = document.querySelectorAll('.header-nav li');

  if (!menuToggle || !headerList) return;

  menuToggle.classList.toggle('open');
  headerList.classList.toggle('active');

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
}

/**
 * Handles the header shrinking on scroll.
 */
export function shrinkHeader() {
  const currentScrollPosition = window.pageYOffset;
  const header = document.querySelector('.header-section');
  const heroSection = document.querySelector('.hero-section'); // Get hero section

  if (!header) return;

  if (currentScrollPosition > 100) {
    header.classList.add('shrink');
    header.style.transition = 'all 0.5s ease-out';
  } else {
    header.classList.remove('shrink');
  }

  // Parallax effect for Hero Section (only if heroSection exists)
  // Removed parallax effect code as requested by the user
  // if (heroSection) {
  //   heroSection.style.backgroundPositionY = `calc(50% - ${currentScrollPosition * 0.3}px)`;
  //   heroSection.style.setProperty('--parallax-translateY', `${currentScrollPosition * 0.3}px`);
  // }
}

/**
 * Handles the visibility and scroll-to-top functionality of the back-to-top button.
 */
export function backToTop() {
  const backToTopBtn = document.querySelector('.back-to-top-btn');
  if (!backToTopBtn) return;

  if (window.pageYOffset > 300) { // Show button after scrolling 300px
    backToTopBtn.style.opacity = '1';
    backToTopBtn.style.visibility = 'visible';
  } else {
    backToTopBtn.style.opacity = '0';
    backToTopBtn.style.visibility = 'hidden';
  }
}

/**
 * Hides the preloader and shows the main content.
 */
export function preloaderHide() {
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
}

/**
 * Initializes AOS (Animate On Scroll) library.
 */
export function aosInit() {
  // Initialize AOS after the page has loaded
  AOS.init({
    duration: 800, // Animation duration
    easing: 'ease-out-quad', // Animation easing
    once: true, // Animation plays only once when scrolling down
    mirror: false, // Do not replay animation when scrolling up
    anchorPlacement: 'top-bottom', // Element position to trigger animation
    offset: 120, // Distance from the top of the screen when triggered
  });
}

/**
 * Shows a custom informational or confirmation modal.
 * @param {string} message - The message to display in the modal.
 * @param {boolean} [isConfirm=false] - Whether the modal should have a "Cancel" button for confirmation.
 * @param {Function} [onConfirm=null] - Callback function to execute if "Confirm" is clicked in a confirmation modal.
 */
export function showInfoModal(message, isConfirm = false, onConfirm = null) {
  // Log messages to console instead of showing a modal
  if (isConfirm && onConfirm) {
    console.log('Confirmation message (action will be logged):', message);
    // For confirmation, we'll assume 'confirm' action for now as there's no UI
    // In a real scenario, you'd need a UI for user interaction.
    onConfirm();
  } else {
    console.log('Info message:', message);
  }
}

// Cookie Consent Constants
export const CONSENT_KEY = 'cookieConsent'; // 'granted', 'denied_non_essential', or null
// Separated preferences: analytics for stats, ui for dark mode/other UI settings
export const PREFERENCES_KEY = 'cookiePreferences'; // { essential: true, analytics: false, ui: false }

/**
 * Retrieves current consent preferences from local storage.
 * @returns {object} An object containing consent preferences (essential, analytics, ui).
 */
export function getConsentPreferences() {
  const preferences = localStorage.getItem(PREFERENCES_KEY);
  return preferences ? JSON.parse(preferences) : { essential: false, analytics: false, ui: false };
}

/**
 * Checks if consent has been granted for a specific category.
 * @param {string} category - The category to check ('essential', 'analytics', 'ui').
 * @returns {boolean} True if consent is granted for the category, false otherwise.
 */
export function hasConsentFor(category) {
  const preferences = getConsentPreferences();
  return preferences[category];
}

/**
 * Shows the cookie consent banner.
 */
export function showConsentBanner() {
  const cookieConsentBanner = document.getElementById('cookie-consent-banner');
  if (cookieConsentBanner) {
    cookieConsentBanner.classList.add('show');
  }
}

/**
 * Hides the cookie consent banner.
 */
export function hideConsentBanner() {
  const cookieConsentBanner = document.getElementById('cookie-consent-banner');
  if (cookieConsentBanner) {
    cookieConsentBanner.classList.remove('show');
  }
}

/**
 * Shows the cookie preferences modal.
 */
export function showPreferencesModal() {
  const cookiePreferencesModal = document.getElementById('cookie-preferences-modal');
  const analyticsStorageCheckbox = document.getElementById('analytics-storage');
  const uiStorageCheckbox = document.getElementById('ui-storage'); // New checkbox for UI preferences

  if (cookiePreferencesModal) {
    cookiePreferencesModal.classList.add('show');
    document.body.classList.add('cookie-modal-open'); // Prevent scrolling
    // Set initial checkbox states based on current preferences
    const preferences = getConsentPreferences();
    analyticsStorageCheckbox.checked = preferences.analytics;
    if (uiStorageCheckbox) uiStorageCheckbox.checked = preferences.ui; // Set state for new UI checkbox
  }
}

/**
 * Hides the cookie preferences modal.
 */
export function hidePreferencesModal() {
  const cookiePreferencesModal = document.getElementById('cookie-preferences-modal');
  if (cookiePreferencesModal) {
    cookiePreferencesModal.classList.remove('show');
    document.body.classList.remove('cookie-modal-open'); // Allow scrolling
  }
}

/**
 * Handles accepting all cookies.
 * @param {Function} initFeaturesCallback - Callback to initialize features based on consent.
 */
export function handleAcceptAllCookies(initFeaturesCallback) {
  localStorage.setItem(CONSENT_KEY, 'granted');
  localStorage.setItem(PREFERENCES_KEY, JSON.stringify({ essential: true, analytics: true, ui: true }));
  hideConsentBanner();
  initFeaturesCallback();
}

/**
 * Handles managing cookie preferences.
 */
export function handleManagePreferences() {
  hideConsentBanner();
  showPreferencesModal();
}

/**
 * Handles saving cookie preferences.
 * @param {Function} initFeaturesCallback - Callback to initialize features based on consent.
 */
export function handleSavePreferences(initFeaturesCallback) {
  const analyticsStorageCheckbox = document.getElementById('analytics-storage');
  const uiStorageCheckbox = document.getElementById('ui-storage'); // New checkbox for UI preferences

  const newPreferences = {
    essential: true, // Essential is always true
    analytics: analyticsStorageCheckbox.checked,
    ui: uiStorageCheckbox ? uiStorageCheckbox.checked : false // Use state of new UI checkbox
  };
  localStorage.setItem(PREFERENCES_KEY, JSON.stringify(newPreferences));

  // Determine overall consent status
  if (newPreferences.analytics || newPreferences.ui) {
    localStorage.setItem(CONSENT_KEY, 'granted');
  } else {
    localStorage.setItem(CONSENT_KEY, 'denied_non_essential'); // Denied for non-essential
  }

  hidePreferencesModal();
  initFeaturesCallback();
}

/**
 * Handles canceling cookie preferences.
 */
export function handleCancelPreferences() {
  hidePreferencesModal();
  if (!localStorage.getItem(CONSENT_KEY)) {
    showConsentBanner();
  }
}

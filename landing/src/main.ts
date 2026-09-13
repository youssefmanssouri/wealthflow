import { WEALTHFLOW_CONFIG } from './config';

/**
 * Initialize Landing Page Logic
 */
function initLandingPage(): void {
  // 1. Bind Centralized Download and External Links
  const downloadLinks = document.querySelectorAll<HTMLAnchorElement>('.apk-download-link');
  downloadLinks.forEach((link) => {
    link.href = WEALTHFLOW_CONFIG.apkDownloadUrl;
    link.setAttribute('download', 'WealthFlow-v1.0.0.apk');
  });

  const portfolioLink = document.getElementById('portfolioLink') as HTMLAnchorElement | null;
  if (portfolioLink) {
    portfolioLink.href = WEALTHFLOW_CONFIG.portfolioUrl;
  }

  const githubLink = document.getElementById('githubLink') as HTMLAnchorElement | null;
  if (githubLink) {
    githubLink.href = WEALTHFLOW_CONFIG.githubUrl;
  }

  const footerGithubLink = document.getElementById('footerGithubLink') as HTMLAnchorElement | null;
  if (footerGithubLink) {
    footerGithubLink.href = WEALTHFLOW_CONFIG.githubUrl;
  }

  // 2. Interactive Product Showcase Tab Switching
  const tabs = document.querySelectorAll<HTMLButtonElement>('.showcase-tab');
  const screenViews = document.querySelectorAll<HTMLElement>('.screen-view');
  const detailCards = document.querySelectorAll<HTMLElement>('.showcase-detail-card');
  const showcaseSlot = document.getElementById('showcaseScreenSlot');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const targetScreen = tab.getAttribute('data-screen');
      if (!targetScreen) return;

      // Update Tab active state
      tabs.forEach((t) => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      // Update Screen View
      screenViews.forEach((view) => {
        view.classList.remove('active');
      });
      const activeView = document.getElementById(`view-${targetScreen}`);
      if (activeView) {
        activeView.classList.add('active');
      }

      // Update Detail Card
      detailCards.forEach((card) => {
        card.classList.remove('active');
      });
      const activeDetail = document.getElementById(`detail-${targetScreen}`);
      if (activeDetail) {
        activeDetail.classList.add('active');
      }

      // Update slot attribute for easy tracking or screenshot injection
      if (showcaseSlot) {
        showcaseSlot.setAttribute('data-screen-slot', targetScreen);
      }
    });
  });

  // 3. Mobile Navigation Menu Toggle
  const menuToggle = document.getElementById('menuToggle');
  const mainNav = document.getElementById('mainNav');

  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', () => {
      mainNav.classList.toggle('open');
      const isOpen = mainNav.classList.contains('open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Close menu when clicking any nav link
    const navLinks = mainNav.querySelectorAll('a');
    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // 4. Smooth Anchor Scrolling
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;

      const targetElement = document.querySelector(href);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    });
  });
}

// Execute on DOM content loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLandingPage);
} else {
  initLandingPage();
}

(() => {
  'use strict';

  const tabs = document.querySelectorAll('.tab');
  const sections = document.querySelectorAll('.category');
  const tabsContainer = document.querySelector('.tabs-inner');
  const tabsNav = document.querySelector('.tabs');
  let isScrollingFromClick = false;

  // --- Helper: get sticky bar height ---
  function getStickyOffset() {
    return tabsNav ? tabsNav.offsetHeight : 0;
  }

  // --- Tab click → smooth scroll to section ---
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.dataset.target;
      const target = document.getElementById(targetId);
      if (!target) return;

      // Pause the scroll-spy so it doesn't fight the animation
      isScrollingFromClick = true;

      // Manually set active immediately
      setActiveTab(targetId);

      // Calculate position accounting for sticky tab bar
      const offset = getStickyOffset() + 8;
      const top = target.getBoundingClientRect().top + window.pageYOffset - offset;

      window.scrollTo({ top, behavior: 'smooth' });

      // Re-enable scroll-spy after animation settles
      setTimeout(() => { isScrollingFromClick = false; }, 600);
    });
  });

  // --- Scroll spy: highlight active tab based on visible section ---
  function setActiveTab(id) {
    tabs.forEach(tab => {
      if (tab.dataset.target === id) {
        tab.classList.add('active');
        // Auto-scroll the tab bar horizontally (without affecting page scroll)
        const container = tabsContainer;
        const scrollLeft = tab.offsetLeft - container.offsetWidth / 2 + tab.offsetWidth / 2;
        container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
      } else {
        tab.classList.remove('active');
      }
    });
  }

  // --- Determine active section on scroll ---
  function updateActiveOnScroll() {
    if (isScrollingFromClick) return;

    const offset = getStickyOffset() + 24;
    let currentId = null;

    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= offset && rect.bottom > offset) {
        currentId = section.id;
      }
    });

    // If no section overlaps the offset line, pick the one closest above
    if (!currentId) {
      let closest = null;
      let closestDist = Infinity;
      sections.forEach(section => {
        const top = section.getBoundingClientRect().top;
        if (top <= offset && (offset - top) < closestDist) {
          closestDist = offset - top;
          closest = section.id;
        }
      });
      currentId = closest;
    }

    if (currentId) {
      setActiveTab(currentId);
    }
  }

  // Throttled scroll listener
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateActiveOnScroll();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
})();

/**
 * main.js - SPA-friendly version for FolioOne-based site
 * - Hash-based routing: loads pages/<page>.html into #app
 * - Re-initializes Typed.js, AOS, Swiper, GLightbox, PureCounter, skills animation
 * - Smooth scrolling for anchors
 * - Mobile nav toggle + hide on navigation
 * - Scroll top / preloader handling
 *
 * Place this file at: assets/js/main.js
 */

(() => {
  "use strict";

  /* ========== Configuration ========== */
  const DEFAULT_PAGE = "home";
  const PAGES_PATH = "pages/";       // pages/<name>.html
  const APP_SELECTOR = "#app";
  const NAV_SELECTOR = "#navmenu";
  const MOBILE_TOGGLE_SELECTOR = ".mobile-nav-toggle";
  const PRELOADER_SELECTOR = "#preloader";
  const SCROLL_TOP_SELECTOR = ".scroll-top";

  /* ========== Utilities ========== */
  const qs = (sel, ctx = document) => ctx.querySelector(sel);
  const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const exists = (sel) => Boolean(qs(sel));
  const isExternalLink = (url) => {
    try {
      const u = new URL(url, location.href);
      return u.origin !== location.origin;
    } catch {
      return false;
    }
  };

  /* ========== Core: Router & Page Loader ========== */
  const app = qs(APP_SELECTOR);
  if (!app) throw new Error(`Cannot find ${APP_SELECTOR} element in DOM.`);

  // Load HTML fragment and inject into #app
  async function loadPageFragment(pageName) {
    const url = `${PAGES_PATH}${pageName}.html`;
    try {
      const resp = await fetch(url, { cache: "no-cache" });
      if (!resp.ok) throw new Error(`Failed to fetch ${url} (status ${resp.status})`);
      const html = await resp.text();
      app.innerHTML = html;
      window.scrollTo({ top: 0, behavior: "instant" });
      updateActiveNav(pageName);
      await initPageModules(); // Reinitialize interactive modules
    } catch (err) {
      console.error(err);
      app.innerHTML = `<section class="container py-5"><h2>Page not found</h2><p>Could not load "${pageName}".</p></section>`;
    }
  }

  // Router: read hash and load appropriate page
  function router() {
    let hash = window.location.hash.replace(/^#/, "");
    if (!hash) hash = DEFAULT_PAGE;
    // If the hash points to an element on current page (anchor) -> smooth scroll
    // But our SPA uses separate fragments; ensure we load fragment first.
    loadPageFragment(hash);
  }

  // Update the active nav link (adds 'active' class)
  function updateActiveNav(pageName) {
    const nav = qs(NAV_SELECTOR);
    if (!nav) return;
    qsa(`${NAV_SELECTOR} a`).forEach(a => {
      const href = a.getAttribute("href") || "";
      // match '#page' or 'page' links
      const linkName = href.startsWith("#") ? href.slice(1) : href;
      if (linkName === pageName) {
        a.classList.add("active");
      } else {
        a.classList.remove("active");
      }
    });
  }

  /* ========== UI Helpers ========== */

  // Mobile nav toggle (same as template)
  const mobileToggleBtn = qs(MOBILE_TOGGLE_SELECTOR);
  function toggleMobileNav() {
    document.body.classList.toggle("mobile-nav-active");
    if (mobileToggleBtn) mobileToggleBtn.classList.toggle("bi-list"), mobileToggleBtn.classList.toggle("bi-x");
  }
  if (mobileToggleBtn) mobileToggleBtn.addEventListener("click", toggleMobileNav);

  // Hide mobile nav whenever a nav link is clicked
  function closeMobileNavIfOpen() {
    if (document.body.classList.contains("mobile-nav-active")) toggleMobileNav();
  }

  // Smooth scroll to an element (used for in-page anchors)
  function smoothScrollTo(selectorOrEl) {
    const el = typeof selectorOrEl === "string" ? qs(selectorOrEl) : selectorOrEl;
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /* ========== Page-related module initializers ========== */

  // Initialize Typed.js if present (searches for .typed)
  function initTyped() {
    const el = qs(".typed");
    if (!el || typeof Typed === "undefined") return;
    const items = (el.getAttribute("data-typed-items") || "").split(",").map(s => s.trim()).filter(Boolean);
    if (items.length === 0) return;
    // Clean any existing instance by replacing element (defensive)
    new Typed(".typed", {
      strings: items,
      loop: true,
      typeSpeed: 100,
      backSpeed: 50,
      backDelay: 2000
    });
  }

  // Initialize AOS if present
  function initAOS() {
    if (typeof AOS === "undefined") return;
    AOS.refreshHard ? AOS.refreshHard() : AOS.refresh(); // prefer refreshHard if available
    AOS.init({
      duration: 600,
      easing: "ease-in-out",
      once: true,
      mirror: false
    });
  }

  // Initialize GLightbox (defensive)
  function initGLightbox() {
    if (typeof GLightbox === "undefined") return;
    // destroy existing global instance if desired? GLightbox uses a variableless init
    GLightbox({ selector: ".glightbox" });
  }

  // Initialize Swiper sliders on the loaded fragment
  function initSwipers() {
    if (typeof Swiper === "undefined") return;
    qsa(".init-swiper").forEach(swiperElement => {
      try {
        const cfgScript = swiperElement.querySelector(".swiper-config");
        let config = {};
        if (cfgScript) {
          config = JSON.parse(cfgScript.textContent.trim());
        }
        // If already initialized, skip (detects .swiper-initialized)
        if (swiperElement.classList.contains("swiper-initialized")) return;
        new Swiper(swiperElement, config);
      } catch (e) {
        console.warn("Swiper init failed:", e);
      }
    });
  }

  // Initialize PureCounter (defensive)
  function initPureCounter() {
    if (typeof PureCounter === "undefined" && typeof PureCounter === "function") return;
    try {
      // If PureCounter is available globally as constructor, ensure it runs
      // Many templates just call new PureCounter() once, but we'll try to run again safely:
      if (window.pureCounterInstance === undefined && typeof PureCounter === "function") {
        window.pureCounterInstance = new PureCounter();
      } else if (typeof PureCounter === "function") {
        // creating another won't break
        new PureCounter();
      }
    } catch (e) {
      // Ignore
    }
  }

  // Skills animation via Waypoints (if used)
  function initSkillsAnimation() {
    const skillsItems = qsa(".skills-animation");
    if (!skillsItems.length || typeof Waypoint === "undefined") return;
    skillsItems.forEach(item => {
      // To avoid duplicate Waypoints on re-init, remove any inline widths and re-create
      const progress = item.querySelectorAll(".progress .progress-bar");
      progress.forEach(el => el.style.width = "0%");
      new Waypoint({
        element: item,
        offset: "80%",
        handler: function(direction) {
          let progress = item.querySelectorAll('.progress .progress-bar');
          progress.forEach(el => {
            el.style.width = el.getAttribute('aria-valuenow') + '%';
          });
        }
      });
    });
  }

  // Any other component initializers (isotope, imagesLoaded) — safe attempt
  function initIsotope() {
    if (typeof Isotope === "undefined" || typeof imagesLoaded === "undefined") return;
    qsa(".isotope-layout").forEach(isotopeItem => {
      try {
        const layout = isotopeItem.getAttribute('data-layout') ?? 'masonry';
        const filter = isotopeItem.getAttribute('data-default-filter') ?? '*';
        const sort = isotopeItem.getAttribute('data-sort') ?? 'original-order';
        const container = isotopeItem.querySelector('.isotope-container');
        if (!container) return;
        imagesLoaded(container, () => {
          const iso = new Isotope(container, {
            itemSelector: '.isotope-item',
            layoutMode: layout,
            filter: filter,
            sortBy: sort
          });
          isotopeItem.querySelectorAll('.isotope-filters li').forEach(filterBtn => {
            filterBtn.addEventListener('click', () => {
              const active = isotopeItem.querySelector('.isotope-filters .filter-active');
              if (active) active.classList.remove('filter-active');
              filterBtn.classList.add('filter-active');
              iso.arrange({ filter: filterBtn.getAttribute('data-filter') });
              if (typeof AOS !== "undefined") AOS.refresh();
            });
          });
        });
      } catch (e) {
        console.warn("Isotope init error", e);
      }
    });
  }

  // Generic initializer that runs after each page fragment is injected
  async function initPageModules() {
    // Slight delay ensures DOM sub-resources exist
    await Promise.resolve();
    // Re-run initializers
    initTyped();
    initAOS();
    initGLightbox();
    initSwipers();
    initPureCounter();
    initSkillsAnimation();
    initIsotope();
    // Re-bind anchor click handlers inside the app
    bindInPageAnchors();
    // Ensure mobile nav hides on internal navigation
    bindNavLinksToCloseMobile();
  }

  /* ========== Event bindings & global behavior ========== */

  // Bind all anchor links with hashes to either navigate (route) or smooth scroll
  function bindInPageAnchors() {
    // We only want to capture anchors in our nav and content that reference hashes
    qsa('a[href^="#"]').forEach(a => {
      a.removeEventListener("click", handleAnchorClick); // idempotent
      a.addEventListener("click", handleAnchorClick);
    });
  }

  function handleAnchorClick(e) {
    const a = e.currentTarget;
    const href = a.getAttribute("href") || "";
    const hash = href.replace(/^#/, "");
    // If external or empty, do nothing special
    if (!href || href === "#") {
      e.preventDefault();
      return;
    }
    if (isExternalLink(href)) return; // let browser handle external URLs
    e.preventDefault();

    // Update location hash -> router will load page fragment
    // But if we're already on that fragment and element exists in DOM, smooth-scroll to it
    const currentHash = window.location.hash.replace(/^#/, "") || DEFAULT_PAGE;
    if (hash === currentHash) {
      // Already on same fragment. Try to scroll to element inside the fragment.
      const target = qs(`#${hash}`) || qs(`[name="${hash}"]`) || qs(href);
      if (target) {
        smoothScrollTo(target);
        closeMobileNavIfOpen();
        return;
      }
      // If the element is not present, treat as route to same-named page
      window.location.hash = hash; // triggers router
      return;
    } else {
      // Navigate to a new fragment page (this triggers router)
      window.location.hash = hash;
      // close mobile nav (router -> loadPageFragment will call initPageModules)
      closeMobileNavIfOpen();
      return;
    }
  }

  // Bind nav links to close mobile nav when clicked (top-level nav)
  function bindNavLinksToCloseMobile() {
    const nav = qs(NAV_SELECTOR);
    if (!nav) return;
    qsa(`${NAV_SELECTOR} a`).forEach(a => {
      a.removeEventListener("click", navLinkMobileCloseHandler);
      a.addEventListener("click", navLinkMobileCloseHandler);
    });
  }
  function navLinkMobileCloseHandler() {
    closeMobileNavIfOpen();
  }

  /* ========== Preloader & scroll-top behavior ========== */

  // Preloader removal when page initially loads
  function initPreloader() {
    const pre = qs(PRELOADER_SELECTOR);
    if (!pre) return;
    window.addEventListener("load", () => {
      pre.remove();
    });
  }

  // Scroll-to-top button
  function initScrollTop() {
    const scrollTop = qs(SCROLL_TOP_SELECTOR);
    if (!scrollTop) return;
    function toggle() {
      window.scrollY > 100 ? scrollTop.classList.add("active") : scrollTop.classList.remove("active");
    }
    window.addEventListener("load", toggle);
    document.addEventListener("scroll", toggle);
    scrollTop.addEventListener("click", (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ========== Header scroll class behavior (scrolled) ========== */
  function initHeaderScrolledBehavior() {
    const header = qs("#header");
    if (!header) return;
    function toggleBodyScrolled() {
      const body = document.body;
      if (!header.classList.contains('scroll-up-sticky') && !header.classList.contains('sticky-top') && !header.classList.contains('fixed-top')) return;
      window.scrollY > 100 ? body.classList.add('scrolled') : body.classList.remove('scrolled');
    }
    document.addEventListener("scroll", toggleBodyScrolled);
    window.addEventListener("load", toggleBodyScrolled);
  }

  /* ========== Bootstrap-ish mobile dropdown toggle for nav (deep dropdowns) ========== */
  function initNavDropdownToggles() {
    qsa('.navmenu .toggle-dropdown').forEach(toggle => {
      // ensure duplicate listeners are not added:
      toggle.removeEventListener('click', navDropdownHandler);
      toggle.addEventListener('click', navDropdownHandler);
    });
  }
  function navDropdownHandler(e) {
    e.preventDefault();
    this.parentNode.classList.toggle('active');
    this.parentNode.nextElementSibling && this.parentNode.nextElementSibling.classList.toggle('dropdown-active');
    e.stopImmediatePropagation();
  }

  /* ========== Initialization on first load ========== */
  function initialBinders() {
    bindInPageAnchors();
    bindNavLinksToCloseMobile();
    initPreloader();
    initScrollTop();
    initHeaderScrolledBehavior();
    initNavDropdownToggles();
  }

  /* ========== Kick-off: set up router and initial load ========== */
  window.addEventListener("hashchange", router);
  window.addEventListener("load", () => {
    initialBinders();
    router(); // loads DEFAULT_PAGE or hash page
  });

})();

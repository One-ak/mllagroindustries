/**
 * ============================================================
 *  main.js — Vansh Feeds | Primary JavaScript Controller
 * ============================================================
 *
 * This file runs after the HTML document has been fully parsed
 * (DOMContentLoaded event). It controls every interactive feature
 * on the site:
 *
 *   1. Language (i18n) initialisation
 *   2. Mobile navigation menu toggle
 *   3. Navbar background on scroll (respects dark mode)
 *   4. Active nav-link highlighting
 *   5. Dark / Light mode toggle
 *   6. Scroll-reveal animations (elements fade/slide in as you scroll)
 *   7. Premium text animations (word-by-word, letter-spacing)
 *   8. Animated number counters
 *   9. Page-transition overlay (logo shown between pages)
 *
 * NOTE: The page-transition overlay element is NOT created here.
 * It is created by theme-init.js (a blocking <head> script) so it
 * appears on-screen before any page content is painted, preventing
 * any flash of content between page loads.
 * ============================================================
 */

document.addEventListener('DOMContentLoaded', () => {

  // ─────────────────────────────────────────────────────────────
  // 1. LANGUAGE (i18n) INITIALISATION
  //
  //    window.i18n is defined in js/i18n.js. Calling .init()
  //    reads the saved language from localStorage and applies
  //    all translated strings to [data-i18n] elements in the DOM.
  // ─────────────────────────────────────────────────────────────
  if (window.i18n) {
    window.i18n.init();
  }


  // ─────────────────────────────────────────────────────────────
  // 2. MOBILE NAVIGATION MENU TOGGLE
  //
  //    On small screens the full nav-links are hidden. The
  //    hamburger button (.mobile-menu-btn) toggles a class on the
  //    navbar that shows/hides them. The icon also switches between
  //    ☰ (bars) and ✕ (times) to signal the state.
  // ─────────────────────────────────────────────────────────────
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const navbar = document.querySelector('.navbar');

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      // Toggle the active class to show or hide the mobile menu
      navbar.classList.toggle('mobile-menu-active');

      const icon = mobileMenuBtn.querySelector('i');

      if (navbar.classList.contains('mobile-menu-active')) {
        // Menu is now OPEN → show the ✕ (close) icon
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
      } else {
        // Menu is now CLOSED → show the ☰ (hamburger) icon
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
      }
    });
  }


  // ─────────────────────────────────────────────────────────────
  // 3. NAVBAR BACKGROUND ON SCROLL  (dark-mode-aware)
  //
  //    When the user scrolls down > 50px the navbar gets a more
  //    opaque background + a shadow so it stands out from content.
  //    The colour used changes depending on the active theme so
  //    the navbar always feels native to the current mode.
  //
  //    This function is called both on scroll AND whenever the
  //    data-theme attribute changes (via MutationObserver below).
  // ─────────────────────────────────────────────────────────────
  function updateNavbarBg() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    if (window.scrollY > 50) {
      // User has scrolled — make the navbar more solid
      navbar.style.boxShadow  = 'var(--shadow-md)';
      navbar.style.background = isDark
        ? 'rgba(15, 23, 42, 0.97)'    // dark mode: near-opaque dark-slate
        : 'rgba(255, 255, 255, 0.98)'; // light mode: near-opaque white
    } else {
      // User is at the top — keep the navbar translucent
      navbar.style.boxShadow  = 'var(--shadow-sm)';
      navbar.style.background = isDark
        ? 'rgba(15, 23, 42, 0.85)'    // dark mode: semi-transparent dark-slate
        : 'rgba(255, 255, 255, 0.85)'; // light mode: semi-transparent white
    }
  }

  // Run on every scroll event
  window.addEventListener('scroll', updateNavbarBg);

  // Also run whenever the theme attribute changes on <html>
  // (e.g. user clicks the dark-mode toggle) so the navbar
  // immediately switches its colour without needing a scroll.
  const themeObserver = new MutationObserver(updateNavbarBg);
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'] // only watch for theme changes
  });


  // ─────────────────────────────────────────────────────────────
  // 4. ACTIVE NAV-LINK HIGHLIGHTING
  //
  //    Compares the current page filename (e.g. "products.html")
  //    against each nav link's href. The matching link gets the
  //    CSS class "active" which applies the underline / colour
  //    indicator defined in styles.css.
  // ─────────────────────────────────────────────────────────────
  // Extract just the filename from the URL (e.g. "/project/about.html" → "about.html")
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-links a');

  navLinks.forEach(link => {
    if (link.getAttribute('href') === currentPath) {
      link.classList.add('active');
    }
  });


  // ─────────────────────────────────────────────────────────────
  // 5. DARK / LIGHT MODE TOGGLE
  //
  //    The toggle button (#theme-toggle) switches the data-theme
  //    attribute on <html> between "dark" and "light". CSS variables
  //    in styles.css respond to this attribute to restyle the whole
  //    page. The chosen theme is saved to localStorage so it
  //    persists across page reloads and navigations.
  //
  //    NOTE: The initial theme is applied BEFORE this script runs
  //    by theme-init.js in the <head>, so there is never a flash
  //    of the wrong theme.
  // ─────────────────────────────────────────────────────────────
  const themeToggle = document.getElementById('theme-toggle');

  // Apply the saved theme (in case theme-init.js ran before
  // the toggle button existed in the DOM)
  const savedTheme = localStorage.getItem('vansh_theme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
    // Update the toggle icon to match the loaded theme
    if (themeToggle && savedTheme === 'dark') {
      themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      // Read the current theme and flip it
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const targetTheme  = currentTheme === 'dark' ? 'light' : 'dark';

      // Apply and save the new theme
      document.documentElement.setAttribute('data-theme', targetTheme);
      localStorage.setItem('vansh_theme', targetTheme);

      // Update the button icon:
      //   dark mode active → show ☀ (sun) so clicking switches to light
      //   light mode active → show 🌙 (moon) so clicking switches to dark
      if (targetTheme === 'dark') {
        themeToggle.innerHTML = '<i class="fas fa-sun theme-icon-spin"></i>';
      } else {
        themeToggle.innerHTML = '<i class="fas fa-moon theme-icon-spin"></i>';
      }

      // Remove the spin class after the CSS animation completes (500ms)
      // so the spin only plays once per click, not on every re-render
      const newIcon = themeToggle.querySelector('i');
      setTimeout(() => newIcon.classList.remove('theme-icon-spin'), 500);
    });
  }


  // ─────────────────────────────────────────────────────────────
  // 6. SCROLL-REVEAL ANIMATIONS
  //
  //    Elements with classes like .reveal, .reveal-left,
  //    .reveal-right, or .reveal-scale start invisible and slightly
  //    offset (set in CSS). When they enter the viewport an
  //    IntersectionObserver adds the class "active", which triggers
  //    the CSS transition that makes them slide/fade into place.
  //
  //    rootMargin "-50px" means the animation fires only when the
  //    element is at least 50px inside the viewport, giving a
  //    slightly delayed, more natural feel.
  // ─────────────────────────────────────────────────────────────
  const revealElements = document.querySelectorAll(
    '.reveal, .reveal-left, .reveal-right, .reveal-scale'
  );

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Add "active" → CSS transition plays → element slides in
        entry.target.classList.add('active');
        // We do NOT unobserve so the element can re-animate if the user
        // scrolls back up (optional behaviour)
      }
    });
  }, {
    threshold: 0.1,             // trigger when 10% of element is visible
    rootMargin: '0px 0px -50px 0px' // offset so reveal fires 50px into viewport
  });

  revealElements.forEach(el => revealObserver.observe(el));


  // ─────────────────────────────────────────────────────────────
  // 7. PREMIUM TEXT ANIMATIONS
  //
  //    Three different text effects to make headings and key text
  //    feel more dynamic and high-end:
  //
  //    7a. Word-by-word fade-up (.text-words)
  //        Each word is wrapped in a <span class="word"> so it can
  //        be animated individually with a staggered delay.
  //
  //    7b. Letter-spacing expand (.reveal-text)
  //        Text starts compressed and expands to normal letter-
  //        spacing when it enters the viewport.
  //
  //    7c. Section-title pulse (.section-title)
  //        Letter-spacing briefly expands then settles back — a
  //        subtle "breathe" effect when a section title scrolls in.
  // ─────────────────────────────────────────────────────────────

  // --- 7a. Word-by-word fade-up ---
  const wordsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        // Adding "words-visible" triggers the CSS animation on each .word span
        el.classList.add('words-visible');
        // Apply a staggered delay: word 0 animates immediately, word 1 after 60ms, etc.
        el.querySelectorAll('.word').forEach((word, i) => {
          word.style.transitionDelay = `${i * 0.06}s`;
        });
        // Stop observing — the animation should only play once
        wordsObserver.unobserve(el);
      }
    });
  }, { threshold: 0.2 }); // fire when 20% of the element is visible

  document.querySelectorAll('.text-words').forEach(el => {
    // Wrap each word in a <span> only if not already done
    if (!el.querySelector('.word')) {
      const words = el.textContent.trim().split(' ');
      el.innerHTML = words.map(w => `<span class="word">${w}</span>`).join(' ');
    }

    // If the element is already visible on load (e.g. hero headline),
    // animate it immediately with a short delay instead of waiting for scroll
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      setTimeout(() => {
        el.classList.add('words-visible');
        el.querySelectorAll('.word').forEach((word, i) => {
          word.style.transitionDelay = `${i * 0.06}s`;
        });
      }, 300); // 300ms so it doesn't fire the very instant the page loads
    } else {
      // Element is below the fold — use the observer
      wordsObserver.observe(el);
    }
  });

  // --- 7b. Letter-spacing expand on scroll (.reveal-text) ---
  const textRevealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active'); // triggers CSS letter-spacing transition
        textRevealObserver.unobserve(entry.target); // play once only
      }
    });
  }, {
    threshold: 0.2,
    rootMargin: '0px 0px -40px 0px'
  });
  document.querySelectorAll('.reveal-text').forEach(el => textRevealObserver.observe(el));

  // --- 7c. Section-title pulse on scroll (.section-title) ---
  const titleObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('title-animate');
        // Remove the class after 800ms so the animation can replay
        // if the user scrolls back to this section
        setTimeout(() => entry.target.classList.remove('title-animate'), 800);
        titleObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('.section-title').forEach(el => titleObserver.observe(el));


  // ─────────────────────────────────────────────────────────────
  // 8. ANIMATED COUNTERS
  //
  //    Elements with class .counter and a data-target attribute
  //    (e.g. <span class="counter" data-target="5000">)
  //    count up from 0 to their target number when they scroll
  //    into view. The animation runs at ~60fps using
  //    requestAnimationFrame for a smooth, buttery feel.
  // ─────────────────────────────────────────────────────────────
  const counters = document.querySelectorAll('.counter');

  const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counter  = entry.target;
        const target   = +counter.getAttribute('data-target'); // final number
        const duration = 2000;                                 // 2 seconds total
        const step     = target / (duration / 16);            // increment per frame (at 60fps)

        let current = 0;

        // Called every animation frame until we reach the target
        const updateCounter = () => {
          current += step;
          if (current < target) {
            counter.innerText = Math.ceil(current); // show rounded-up current value
            requestAnimationFrame(updateCounter);   // schedule next frame
          } else {
            counter.innerText = target; // snap to exact final value
          }
        };

        updateCounter(); // kick off the animation
        observer.unobserve(counter); // run once — don't restart on re-scroll
      }
    });
  }, {
    threshold: 0.5,    // trigger when 50% of the element is visible
    rootMargin: '0px'
  });

  counters.forEach(counter => counterObserver.observe(counter));


  // ─────────────────────────────────────────────────────────────
  // 9. PAGE TRANSITION OVERLAY
  //
  //    How the full animation system works:
  //
  //    ┌─────────────────────────────────────────────────────┐
  //    │  theme-init.js (runs in <head>, BEFORE any paint)   │
  //    │  → Creates the overlay div with id="page-overlay"   │
  //    │  → Sets class="page-transition-overlay initial-load"│
  //    │  → Overlay is SOLID (opacity:1) from frame zero     │
  //    └────────────────────────┬────────────────────────────┘
  //                             │
  //    ┌────────────────────────▼────────────────────────────┐
  //    │  Page content loads underneath the overlay          │
  //    │  User never sees a half-loaded page                 │
  //    └────────────────────────┬────────────────────────────┘
  //                             │
  //    ┌────────────────────────▼────────────────────────────┐
  //    │  window "load" fires (all images etc. ready)        │
  //    │  → class switches: initial-load → fade-out          │
  //    │  → @keyframes overlayFadeOut plays (0.45s)          │
  //    │  → Logo pops out with logoPopOut (0.35s)            │
  //    │  → After animation ends → overlay is hidden         │
  //    └────────────────────────┬────────────────────────────┘
  //                             │  User browses the page…
  //    ┌────────────────────────▼────────────────────────────┐
  //    │  User clicks an internal link                       │
  //    │  → e.preventDefault() stops normal navigation       │
  //    │  → class set to: fade-in                            │
  //    │  → @keyframes overlayFadeIn + logoPopIn play        │
  //    │  → After 430ms, window.location.href navigates      │
  //    │  → New page loads → back to step 1 (initial-load)   │
  //    └─────────────────────────────────────────────────────┘
  //
  //    WHY @keyframes instead of CSS transitions?
  //    theme-init.js temporarily disables ALL CSS transitions
  //    (via .no-theme-transition) to prevent a dark-mode colour
  //    flash on page load. CSS transitions would be killed by this,
  //    but @keyframes animations are NEVER affected by
  //    "transition-property: none", so the overlay always animates.
  // ─────────────────────────────────────────────────────────────

  // Grab the overlay that was already written to the DOM by theme-init.js
  const overlay = document.getElementById('page-overlay');

  // Safety guard: if for some reason the overlay doesn't exist, stop here
  // (this can happen on pages that don't include theme-init.js)
  if (!overlay) return;

  // Swap the logo image to the Hindi version if the site is currently in Hindi
  if (window.i18n && window.i18n.currentLanguage === 'hi') {
    const logo = document.getElementById('transition-logo');
    if (logo) logo.src = 'assets/logo_hi.png';
  }

  // ── STEP 1: When the page has fully loaded, fade the overlay OUT ──
  // "load" fires after ALL resources (images, fonts, etc.) are downloaded,
  // which is safer than DOMContentLoaded for hiding the overlay.
  window.addEventListener('load', () => {
    // Swap class: initial-load (static, no animation) → fade-out (plays the keyframe)
    overlay.classList.remove('initial-load');
    overlay.classList.add('fade-out');

    // After the fade-out keyframe finishes, fully hide the overlay so it
    // doesn't sit invisibly on top of clickable elements
    overlay.addEventListener('animationend', () => {
      overlay.classList.remove('fade-out');
      overlay.style.visibility   = 'hidden';
      overlay.style.opacity      = '0';
      overlay.style.pointerEvents = 'none'; // prevent the hidden overlay from blocking clicks
    }, { once: true }); // { once: true } automatically removes this listener after it fires
  });

  // ── STEP 2: When the user clicks an internal link, fade the overlay IN ──
  document.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');

      // Only intercept links that navigate within the site:
      //   - Must have an href value
      //   - Must NOT be an external URL (http/https)
      //   - Must NOT be an anchor (#) link on the same page
      //   - Must NOT open in a new tab
      const isInternal = href &&
        !href.startsWith('http') &&
        !href.startsWith('#') &&
        href !== '#' &&
        link.target !== '_blank';

      if (isInternal) {
        e.preventDefault(); // stop the browser from navigating immediately

        // Reset any inline styles left over from the previous fade-out
        overlay.removeAttribute('style');

        // Set class to fade-in — this plays overlayFadeIn + logoPopIn keyframes
        overlay.className = 'page-transition-overlay fade-in';

        // Wait for the fade-in animation to finish (350ms) plus a small
        // 80ms buffer, then navigate to the new page.
        // The new page will start with initial-load, continuing the cycle.
        setTimeout(() => { window.location.href = href; }, 430);
      }
    });
  });

}); // end DOMContentLoaded

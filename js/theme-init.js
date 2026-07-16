/**
 * ============================================================
 *  theme-init.js — Vansh Feeds | Blocking Theme & Overlay Init
 * ============================================================
 *
 * ⚠️  IMPORTANT: This script must be included in <head> WITHOUT
 *     the "defer" or "async" attribute. It must run SYNCHRONOUSLY
 *     before the browser renders even a single pixel.
 *
 * WHY does this need to be blocking?
 * -----------------------------------
 * If we applied the theme or created the overlay in main.js
 * (which runs after the page is painted), the user would briefly
 * see the wrong theme colour (light flash in dark mode) or the
 * raw page content before the overlay appears. By running here in
 * <head> synchronously we ensure:
 *
 *   ① The correct theme is set BEFORE the first CSS paint.
 *   ② The overlay DIV is in the DOM BEFORE any page content renders.
 *
 * What this script does (in order):
 * -----------------------------------
 *   1. Reads the saved theme from localStorage.
 *   2. Immediately applies dark mode to <html> if needed.
 *   3. Adds .no-theme-transition to suppress colour-change transitions
 *      during load (prevents animated flash from light → dark colours).
 *   4. Removes .no-theme-transition 50ms after the page fully loads.
 *   5. Uses document.write() to synchronously inject the page-transition
 *      overlay into the HTML stream before <body> content is parsed.
 *
 * The overlay is then managed (animated) by main.js after DOMContentLoaded.
 * ============================================================
 */

(function () {

  // ─────────────────────────────────────────────────────────────
  // STEP 1: Apply saved theme before any paint
  //
  //    We read from localStorage — if the user previously selected
  //    dark mode, we immediately set the data-theme attribute on
  //    the <html> element. Because CSS variables react to this
  //    attribute, the very first paint of the page will already
  //    use dark-mode colours instead of briefly flashing light.
  // ─────────────────────────────────────────────────────────────
  var saved = localStorage.getItem('vansh_theme');
  if (saved === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  }


  // ─────────────────────────────────────────────────────────────
  // STEP 2: Suppress colour/background CSS transitions during load
  //
  //    Without this, when a user in dark mode loads a page, the
  //    browser would briefly show the light-mode colours and then
  //    CSS transitions would animate them to dark. This looks like
  //    a "flash" or "glitter" effect.
  //
  //    Adding .no-theme-transition to <html> applies a CSS rule
  //    (defined in styles.css) that disables transition-property
  //    on all elements — so colours snap to the correct value
  //    instantly with no animation.
  //
  //    IMPORTANT: Only CSS *transitions* are disabled.
  //    CSS *@keyframe animations* (like our overlay fade) are
  //    NOT affected by transition-property:none, so the page
  //    transition logo animation still works perfectly.
  // ─────────────────────────────────────────────────────────────
  document.documentElement.classList.add('no-theme-transition');

  // Remove the suppression class once the page has fully loaded.
  // We add a 50ms buffer to make sure all styles have settled
  // before re-enabling transitions for user interactions.
  window.addEventListener('load', function () {
    setTimeout(function () {
      document.documentElement.classList.remove('no-theme-transition');
    }, 50);
  });


  // ─────────────────────────────────────────────────────────────
  // STEP 3: Synchronously inject the page-transition overlay
  //
  //    We use document.write() here — normally this is bad practice
  //    because it blocks the parser, BUT that is exactly what we
  //    want. By blocking here, the overlay is written into the HTML
  //    stream BEFORE the browser parses and renders any <body>
  //    content. This means the overlay is literally the FIRST thing
  //    on screen, completely hiding the page until it is ready.
  //
  //    The overlay starts with class "initial-load" which in CSS
  //    means: opacity:1, visibility:visible, no animation.
  //    It stays solid until main.js swaps it to "fade-out" after
  //    the window "load" event fires.
  //
  //    id="page-overlay"  → used by main.js to find this element
  //    id="transition-logo" → used by main.js to swap Hindi logo
  // ─────────────────────────────────────────────────────────────
  var savedLanguage = localStorage.getItem('vansh_lang');
  var loaderLogo = savedLanguage === 'hi' ? 'assets/logo_hi.png' : 'assets/logo_en.png';

  // Critical loader styles are injected with the overlay so it is correctly
  // positioned even before the main stylesheet has finished loading.
  document.write(
    '<style id="page-loader-critical">' +
      '.page-transition-overlay.initial-load{' +
        'position:fixed;inset:0;z-index:99999;display:flex;' +
        'align-items:center;justify-content:center;background:#fff;' +
        'opacity:1;visibility:visible;pointer-events:all;isolation:isolate;' +
      '}' +
      'html[data-theme="dark"] .page-transition-overlay.initial-load{background:#0f172a;}' +
      '.page-transition-overlay.initial-load img{' +
        'display:block;width:min(180px,36vw);height:auto;opacity:1;' +
        'transform:translateY(0) scale(1);backface-visibility:hidden;' +
      '}' +
    '</style>' +
    '<div class="page-transition-overlay initial-load" id="page-overlay">' +
      '<img src="' + loaderLogo + '" alt="Vansh Feeds" id="transition-logo" ' +
        'width="256" height="256" fetchpriority="high" decoding="sync">' +
    '</div>'
  );

})(); // IIFE — runs immediately, no global variables leaked

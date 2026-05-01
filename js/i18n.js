/**
 * ============================================================
 *  i18n.js — Vansh Feeds | Bilingual Translation System
 * ============================================================
 *
 * This file powers the English ↔ Hindi language toggle.
 *
 * HOW IT WORKS:
 * ─────────────
 * 1. A "translations" object stores every piece of UI text in
 *    both English ("en") and Hindi ("hi") as key-value pairs.
 *
 * 2. The window.i18n object is exposed globally so any other
 *    script can call window.i18n.setLanguage('hi') to switch.
 *
 * 3. Elements in the HTML that need translation have a
 *    data-i18n="key" attribute, e.g.:
 *      <span data-i18n="nav.home">Home</span>
 *    When the language is changed, translatePage() finds all
 *    such elements and replaces their innerHTML with the
 *    matching translation.
 *
 * 4. The chosen language is saved to localStorage under the
 *    key "vansh_lang" so it persists across page reloads.
 *
 * 5. Logo images also swap: assets/logo_en.png ↔ logo_hi.png
 *    because the logo contains the brand name in the active language.
 *
 * USAGE FROM HTML:
 * ─────────────────
 *   <button class="lang-btn" data-lang="en">EN</button>
 *   <button class="lang-btn" data-lang="hi">हिंदी</button>
 *
 * The .lang-btn elements automatically get an "active" class
 * on the currently selected language.
 * ============================================================
 */


// ─────────────────────────────────────────────────────────────
// TRANSLATION DICTIONARY
//
// Keys are dot-separated namespaces for clarity:
//   "nav.*"      → navigation links
//   "hero.*"     → homepage hero section
//   "feat.*"     → homepage feature cards
//   "md.*"       → Managing Director message section
//   "idx.prod.*" → homepage products section
//   "footer.*"   → site-wide footer
//   "page.*"     → inner page headings
//
// To add a new translatable string:
//   1. Add the key to BOTH "en" and "hi" sections
//   2. Add data-i18n="your.key" to the HTML element
// ─────────────────────────────────────────────────────────────
const translations = {

  // ── ENGLISH ──────────────────────────────────────────────
  en: {
    // Navigation links (used across all pages in the <nav>)
    'nav.home': 'Home',
    'nav.about': 'About Us',
    'nav.products': 'Our Products',
    'nav.infrastructure': 'Infrastructure',
    'nav.quality': 'Quality',
    'nav.contact': 'Contact',
    'nav.cta': 'Business Inquiry',

    // Homepage — Hero Section
    'hero.title': 'High-Quality <span style="color:var(--secondary)">Animal Nutrition</span> & Agro Solutions',
    'hero.subtitle': 'Improving farmer productivity and profitability through scientifically formulated feed and fertilizers.',
    'hero.btn.explore': 'Explore Products',
    'hero.btn.distributor': 'Become a Distributor',

    // Homepage — Feature Cards (the 3 icons below the hero)
    'feat.cattle.title': 'Cattle Feed',
    'feat.cattle.desc': 'Boost milk yield and health with our Super, 3000, 5000, and 8000 series formulations.',
    'feat.aqua.title': 'Aqua Feed',
    'feat.aqua.desc': 'Premium floating fish feeds crafted by Fish Gold Industries for rapid growth.',
    'feat.bio.title': 'Bio Fertilizers',
    'feat.bio.desc': 'Enhance soil fertility with our PROM and specialized crop growth promoters.',

    // Homepage — Managing Director Message
    'md.title': 'Message from our MD',
    'md.p1': '"At Vansh Group of Companies, our journey has always been driven by a clear purpose—to support farmers and strengthen the agricultural ecosystem with reliable, high-quality solutions."',
    'md.p2': 'From agro inputs to animal nutrition, we continuously strive to deliver products that enhance productivity, improve farm profitability, and promote sustainable practices. Our focus remains on innovation, quality, and building long-term relationships with our farmers and distribution partners.',
    'md.p3': 'As we grow, our commitment stays the same—to create value for every stakeholder and contribute meaningfully to the progress of Indian agriculture.',
    'md.name': 'Mr. Hem Karan Mathur',
    'md.role': 'Managing Director',

    // Homepage — Products Section
    'idx.prod.title': 'Our Premium Products',
    'idx.prod.subtitle': 'Designed to deliver consistent performance and better results across every stage of farming. Trusted by over a million farmers.',

    // Footer (common across all pages)
    'footer.about': 'Vansh Group of Companies includes New Vanshika Bio Agro, Fish Gold Industries, and MLL Agro Industries. Delivering consistent performance for farmers.',
    'footer.links': 'Quick Links',
    'footer.contact': 'Contact Info',
    'footer.address': 'Barabanki, Uttar Pradesh, India',
    'footer.phone': '05248 296699<br>+91 9670252525',
    'footer.email': 'vanshgroup@gmail.com',
    'footer.rights': '© 2026 Vansh Group. All rights reserved.',

    // Products Page
    'page.products.title': 'Our <span>Products</span>',
    'page.products.subtitle': 'Comprehensive agro and animal nutrition solutions.',
  },

  // ── HINDI ─────────────────────────────────────────────────
  hi: {
    // Navigation links
    'nav.home': 'होम',
    'nav.about': 'हमारे बारे में',
    'nav.products': 'हमारे उत्पाद',
    'nav.infrastructure': 'बुनियादी ढांचा',
    'nav.quality': 'गुणवत्ता',
    'nav.contact': 'संपर्क करें',
    'nav.cta': 'व्यावसायिक पूछताछ',

    // Homepage — Hero Section
    'hero.title': 'उच्च गुणवत्ता वाले <span style="color:var(--secondary)">पशु पोषण</span> और कृषि समाधान',
    'hero.subtitle': 'वैज्ञानिक रूप से तैयार चारा और उर्वरकों के माध्यम से किसानों की उत्पादकता और लाभप्रदता में सुधार।',
    'hero.btn.explore': 'उत्पाद देखें',
    'hero.btn.distributor': 'वितरक बनें',

    // Homepage — Feature Cards
    'feat.cattle.title': 'पशु आहार',
    'feat.cattle.desc': 'हमारे सुपर, 3000, 5000 और 8000 सीरीज़ के फॉर्मूलेशन के साथ दूध की उपज और स्वास्थ्य को बढ़ावा दें।',
    'feat.aqua.title': 'एक्वा फ़ीड',
    'feat.aqua.desc': 'फिश गोल्ड इंडस्ट्रीज द्वारा तेजी से विकास के लिए तैयार किया गया प्रीमियम फ्लोटिंग फिश फीड।',
    'feat.bio.title': 'जैव उर्वरक',
    'feat.bio.desc': 'हमारे प्रोम और विशेष फसल विकास प्रमोटरों के साथ मिट्टी की उर्वरता बढ़ाएं।',

    // Homepage — Managing Director Message
    'md.title': 'हमारे एमडी का संदेश',
    'md.p1': '"वंश ग्रुप ऑफ कंपनीज में, हमारी यात्रा हमेशा एक स्पष्ट उद्देश्य से प्रेरित रही है - किसानों का समर्थन करना और विश्वसनीय, उच्च गुणवत्ता वाले समाधानों के साथ कृषि पारिस्थितिकी तंट को मजबूत करना।"',
    'md.p2': 'कृषि इनपुट से लेकर पशु पोषण तक, हम निरंतर ऐसे उत्पाद प्रदान करने का प्रयास करते हैं जो उत्पादकता बढ़ाते हैं, कृषि लाभप्रदता में सुधार करते हैं और टिकाऊ प्रथाओं को बढ़ावा देते हैं।',
    'md.p3': 'जैसे-जैसे हम बढ़ते हैं, हमारी प्रतिबद्धता वही रहती है - प्रत्येक हितधारक के लिए मूल्य बनाना और भारतीय कृषि की प्रगति में सार्थक योगदान देना।',
    'md.name': 'श्री हेम करण माथुर',
    'md.role': 'प्रबंध निदेशक',

    // Homepage — Products Section
    'idx.prod.title': 'हमारे प्रीमियम उत्पाद',
    'idx.prod.subtitle': 'खेती के हर चरण में लगातार प्रदर्शन और बेहतर परिणाम देने के लिए डिज़ाइन किया गया।',

    // Footer
    'footer.about': 'वंश ग्रुप ऑफ कंपनीज में न्यू वंशिका बायो एग्रो, फिश गोल्ड इंडस्ट्रीज और एमएलएल एग्रो इंडस्ट्रीज शामिल हैं।',
    'footer.links': 'त्वरित लिंक',
    'footer.contact': 'संपर्क जानकारी',
    'footer.address': 'बाराबंकी, उत्तर प्रदेश, भारत',
    'footer.phone': '05248 296699<br>+91 9670252525',
    'footer.email': 'vanshgroup@gmail.com',
    'footer.rights': '© 2026 वंश ग्रुप। सर्वाधिकार सुरक्षित।',

    // Products Page
    'page.products.title': 'हमारे <span>उत्पाद</span>',
    'page.products.subtitle': 'व्यापक कृषि और पशु पोषण समाधान।',
  }
};


// ─────────────────────────────────────────────────────────────
// window.i18n — GLOBAL LANGUAGE CONTROLLER OBJECT
//
// Exposed on window so any script on any page can call:
//   window.i18n.setLanguage('hi')   — switch to Hindi
//   window.i18n.init()              — set up translations on load
//   window.i18n.currentLanguage     — read the active language
// ─────────────────────────────────────────────────────────────
window.i18n = {

  // Read the last-saved language from localStorage, default to English
  currentLanguage: localStorage.getItem('vansh_lang') || 'en',

  // ── setLanguage(lang) ──────────────────────────────────────
  // Public method: switches the entire site to the given language.
  // Called when a .lang-btn is clicked.
  //   @param lang {string} — 'en' or 'hi'
  // ──────────────────────────────────────────────────────────
  setLanguage: function(lang) {
    // Only proceed if the requested language exists in the dictionary
    if (translations[lang]) {
      this.currentLanguage = lang;

      // Persist the choice so the next page loads in the same language
      localStorage.setItem('vansh_lang', lang);

      // Re-translate all data-i18n elements on the current page
      this.translatePage();

      // Update which .lang-btn shows as "active"
      this.updateToggles();

      // Swap logo images — they contain the brand name in the active language
      const siteLogo   = document.getElementById('site-logo');
      const footerLogo = document.getElementById('footer-logo');
      const logoSrc    = lang === 'hi' ? 'assets/logo_hi.png' : 'assets/logo_en.png';

      if (siteLogo)   siteLogo.src   = logoSrc;
      if (footerLogo) footerLogo.src = logoSrc;
    }
  },

  // ── translatePage() ────────────────────────────────────────
  // Finds every element that has a data-i18n attribute and
  // sets its innerHTML to the matching translation string.
  //
  // For <input> elements with type="placeholder" the
  // placeholder attribute is set instead of innerHTML.
  //
  // Also updates the <html lang=""> attribute for screen readers
  // and SEO (helps search engines identify the page language).
  // ──────────────────────────────────────────────────────────
  translatePage: function() {
    const elements = document.querySelectorAll('[data-i18n]');

    elements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      const text = translations[this.currentLanguage][key];

      if (text) {
        // Special case: input placeholders need a different property
        if (el.tagName === 'INPUT' && el.type === 'placeholder') {
          el.placeholder = text;
        } else {
          // innerHTML supports the <span> tags used in the hero title
          el.innerHTML = text;
        }
      }
    });

    // Update the lang attribute on <html> for accessibility / SEO
    document.documentElement.lang = this.currentLanguage;
  },

  // ── updateToggles() ────────────────────────────────────────
  // Adds the CSS class "active" to the language button that
  // matches the current language, and removes it from others.
  // The "active" style (defined in styles.css) highlights the
  // selected language button.
  // ──────────────────────────────────────────────────────────
  updateToggles: function() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
      if (btn.dataset.lang === this.currentLanguage) {
        btn.classList.add('active');    // highlight the active button
      } else {
        btn.classList.remove('active'); // un-highlight all others
      }
    });
  },

  // ── init() ────────────────────────────────────────────────
  // Called once by main.js after DOMContentLoaded.
  // Sets up the initial state of the page:
  //   1. Sets the correct logo for the saved language
  //   2. Runs translatePage() so text is correct on first paint
  //   3. Runs updateToggles() so the right button is highlighted
  //   4. Attaches click listeners to all .lang-btn elements
  // ──────────────────────────────────────────────────────────
  init: function() {
    // Set the correct logo image on page load
    const siteLogo   = document.getElementById('site-logo');
    const footerLogo = document.getElementById('footer-logo');
    const logoSrc    = this.currentLanguage === 'hi' ? 'assets/logo_hi.png' : 'assets/logo_en.png';
    if (siteLogo)   siteLogo.src   = logoSrc;
    if (footerLogo) footerLogo.src = logoSrc;

    // Apply translations immediately
    this.translatePage();

    // Highlight the correct language button
    this.updateToggles();

    // Wire up the language toggle buttons
    // Each .lang-btn must have data-lang="en" or data-lang="hi"
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.setLanguage(e.target.dataset.lang);
      });
    });
  }
};

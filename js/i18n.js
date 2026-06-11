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
const productNames = {
  vansh_multigrain_fortified_cokar: 'वंश मल्टीग्रेन फोर्टिफाइड चोकर',
  vansh_heera: 'वंश हीरा',
  vansh_gajab: 'वंश गजब',
  prom: 'प्रोम',
  vansh_potash: 'वंश पोटाश',
  green_phos: 'ग्रीन फॉस',
  vansh_sugarcane_special: 'वंश गन्ना स्पेशल',
  vansh_grow_vita: 'वंश ग्रो वीटा',
  vansh_sanjivini_gold: 'वंश संजीवनी गोल्ड',
  vansh_npk: 'वंश एनपीके',
  vansh_balwan: 'वंश बलवान',
  vansh_sanjeevni_gold: 'वंश संजीवनी गोल्ड',
  vansh_takat_plus: 'वंश ताकत प्लस',
  vansh_bahubali: 'वंश बाहुबली',
  vansh_boom_flower: 'वंश बूम फ्लावर',
  vansh_poshak_boron: 'वंश पोषक बोरोन',
  fasal_balwan: 'फसल बलवान',
  vansh_black_gold: 'वंश ब्लैक गोल्ड',
  king_mentha_special: 'किंग मेंथा स्पेशल',
  sadabahar_mentha_special: 'सदाबहार मेंथा स्पेशल',
  kishan_mentha_special: 'किशान मेंथा स्पेशल',
  vansh_badshah_mentha_special: 'वंश बादशाह मेंथा स्पेशल',
  vansh_cargodan: 'वंश कार्गोडान',
  vansh_pardhan: 'वंश परधान',
  vansh_resent: 'वंश रीसेंट',
  vansh_futerra: 'वंश फ्यूटेरा',
  vansh_furotox: 'वंश फ्यूरोटॉक्स',
  vansh_dabang: 'वंश दबंग',
  vansh_dhan_gehu_makka_king: 'वंश धान गेहूं मक्का किंग',
  vansh_speed_gold: 'वंश स्पीड गोल्ड',
  vansh_fasal_aahar: 'वंश फसल आहार',
  vansh_mono_zinc: 'वंश मोनो जिंक',
  vansh_proteimax_kuroiler: 'वंश प्रोटीमैक्स कुरोइलर',
  vansh_proteimax_finisher: 'वंश प्रोटीमैक्स फिनिशर',
  vansh_proteimax_starter: 'वंश प्रोटीमैक्स स्टार्टर',
  vansh_proteimax_pre_starter: 'वंश प्रोटीमैक्स प्री स्टार्टर',
  vansh_floating_fish_feed: 'वंश फ्लोटिंग फिश फीड',
  vansh_pro_8000: 'Pro 8000 Compounded Pellet Feed',
  vansh_grow_5000: 'वंश ग्रो 5000',
  vansh_pashu_aahar: 'Vansh Pashu Aahar',
  vansh_starter_3000: 'Starter 300 High Protein Compounded Cattle Feed',
  vansh_supreme: 'Supreme High Protein Pellet Feed',
  super_compounded_cattle_feed: 'Super Compounded Cattle Feed',
  vanshika_kahar_agro_fertilizer: 'Vanshika Kahar Agro Fertilizer',
  ferrous_sulphate_agro_fertilizer: 'Ferrous Sulphate Agro Fertilizer',
  hariyali_gold_ferrous_sulphate_agro_fertilizer: 'Hariyali Gold Ferrous Sulphate Agro Fertilizer',
  vansh_mono_king_fertilizer: 'Vansh Mono King Fertilizer',
  vansh_excel_gold_fertilizer: 'Vansh Excel Gold Fertilizer',
  b_20_boron_fertilizer: 'B-20% Boron Fertilizer',
  paddy_special_micronutrients_fertilizer: 'Paddy Special Micronutrients Fertilizer',
  magnesium_sulphate_micronutrients_fertilizer: 'Magnesium Sulphate Micronutrients Fertilizer',
  micro_ferrous_micronutrient_fertilizer: 'Micro Ferrous Micronutrient Fertilizer',
  hariyali_gold_organic_fertilizers_and_manure: 'Hariyali Gold Organic Fertilizers and Manure',
  toofan_zinc_fertilizer: 'Toofan Zinc Fertilizer',
  zinc_sulphate_monohydrate: 'Zinc Sulphate Monohydrate',
  '90_dp_sulphur_fertilizer': '90% DP Sulphur Fertilizer',
  '90_wdg_excel_plus_sulphur_fertilizer': '90% WDG Excel Plus Sulphur Fertilizer'
};

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
    'hero.title': 'Organic Agro Inputs, <span style="color:var(--secondary)">Soil Health</span> & Feed Manufacturing',
    'hero.subtitle': 'Led by MLL Agro Industries Pvt. Ltd. in Barabanki, the group manufactures fertilizers, organic inputs, bio-agro solutions, aqua feed and animal nutrition for India and Nepal-facing markets.',
    'hero.btn.explore': 'Explore Products',
    'hero.btn.distributor': 'Become a Distributor',

    // Homepage — Feature Cards (the 3 icons below the hero)
    'feat.organic.title': 'Organic Inputs & Soil Health',
    'feat.organic.desc': 'MLL Agro Industries anchors the group’s fertilizer, organic input and crop nutrition focus for responsible field productivity.',
    'feat.aqua.title': 'Aqua Feed',
    'feat.aqua.desc': 'Floating aqua feed ranges for pond operations, practical feeding routines and commercial fish culture.',
    'feat.animal.title': 'Animal Nutrition',
    'feat.animal.desc': 'Cattle and poultry feed lines remain part of the group’s practical farm supply portfolio.',

    // Homepage — Managing Director Message
    'md.title': 'Message from our MD',
    'md.p1': '"At Vansh Group, our focus is disciplined agro-input manufacturing, practical field products and long-term relationships with farmers, dealers and business partners."',
    'md.p2': 'MLL Agro Industries leads our organic input and soil-health work, while Fish Gold Industries and New Vanshika Bio Agro support feed, aqua and bio-agro categories with the same supply discipline.',
    'md.p3': 'As the group grows from Barabanki into wider Indian and Nepal-facing markets, we remain focused on responsible manufacturing and dependable business conduct.',
    'md.name': 'Dr. Hem Karan Mathur',
    'md.role': 'Managing Director',

    // Homepage — Products Section
    'idx.prod.title': 'Our Premium Products',
    'idx.prod.subtitle': 'A balanced view of MLL agro-input products alongside established feed and aqua lines for dealer and farm supply.',

    // Footer (common across all pages)
    'footer.brand': 'MLL Agro Industries Pvt. Ltd. led agro-industrial group',
    'footer.about': 'Vansh Group operates from Barabanki through MLL Agro Industries, Fish Gold Industries, and New Vanshika Bio Agro Industries.',
    'footer.links': 'Quick Links',
    'footer.contact': 'Contact Info',
    'footer.address': 'Barabanki, Uttar Pradesh, India',
    'footer.phone': '05248 296699<br>+91 9670252525',
	    'footer.email': 'vanshgroupofficial@gmail.com',
    'footer.rights': '© 2026 Vansh Group. All rights reserved.',

    // Products Page
    'page.products.title': 'Our <span>Products</span>',
    'page.products.subtitle': 'Organic inputs, fertilizers, soil health products, aqua feed and animal nutrition ranges for farm and dealer supply.',
    'products.filter.all': 'All Products',
    'products.filter.feed': 'Animal & Aqua Feed',
    'products.filter.fertilizer': 'Organic Inputs & Fertilizers',
    'products.filter.agro': 'Agro Chemicals',
    'products.search.placeholder': 'Search products',
    'products.no_results.title': 'No matching products',
    'products.no_results.desc': 'Try another product name, category, feed form, packing size or nutrient.',
    'products.cat.feed': 'Animal & Aqua Feed',
    'products.cat.fertilizer': 'Organic Inputs & Fertilizers',
    'products.cat.agro': 'Agro Chemicals & Specialties',
	    'products.count.feed': '14 Products',
	    'products.count.fertilizer': '23 Products',
	    'products.count.agro': '20 Products',
	    'products.view': 'View Details',
	    'products.inquiry': 'Send Inquiry',

    // Homepage additions
    'idx.companies.kicker': 'Operating Companies',
    'idx.companies.title': 'MLL-led agro inputs with wider group manufacturing support',
    'idx.companies.subtitle': 'The group’s primary focus is organic agriculture, fertilizers and soil health through MLL Agro Industries, supported by feed, aqua and bio-agro manufacturing divisions from Barabanki.',
    'idx.company.fish.title': 'Fish Gold Industries Pvt. Ltd.',
    'idx.company.fish.desc': 'Manufactures aqua feed, cattle feed, poultry feed and animal nutrition products for practical farm and dealer supply.',
    'idx.company.fish.field': 'Feed & Animal Nutrition',
    'idx.company.mll.title': 'MLL Agro Industries Pvt. Ltd.',
    'idx.company.mll.desc': 'Produces organic inputs, fertilizers and soil health solutions for crop nutrition and responsible field productivity.',
    'idx.company.mll.field': 'Organic Inputs & Fertilizers',
    'idx.company.bio.title': 'New Vanshika Bio Agro Industries Pvt. Ltd.',
    'idx.company.bio.desc': 'Develops bio solutions and crop nutrition inputs aligned with sustainable agriculture and field-level usability.',
    'idx.company.bio.field': 'Bio Solutions & Crop Nutrition',
    'idx.company.bulk.title': 'Bulk Supply & Third-Party Manufacturing',
    'idx.company.bulk.desc': 'The group supports B2B requirements including bulk manufacturing, dealer/distributor supply, private labeling and contract manufacturing discussions.',
    'idx.company.bulk.field': 'B2B Manufacturing',
    'idx.prod.kicker': 'Premium Range',
    'idx.prod.all': 'View All 50+ Products',
    'idx.showcase.cat.fertilizer': 'Agro Input',
    'idx.showcase.cat.cattle': 'Cattle Feed',
    'idx.showcase.cat.aqua': 'Aqua Feed',
    'idx.showcase.prom.name': 'Prom',
    'idx.showcase.prom.desc': 'Phosphate-rich organic manure for soil nutrition programs, dealer supply and field application.',
    'idx.showcase.green.name': 'Green Phos',
    'idx.showcase.green.desc': 'Crop nutrition input positioned for phosphorus support and practical soil-health use.',
    'idx.showcase.npk.name': 'Vansh NPK',
    'idx.showcase.npk.desc': 'Balanced nutrient support for crop programs that need regular availability and clean packing.',
    'idx.showcase.potash.name': 'Vansh Potash',
    'idx.showcase.potash.desc': 'Potash-focused input for crop strength, field programs and dependable distributor movement.',
    'idx.showcase.super.name': 'Vansh Super',
    'idx.showcase.super.desc': 'Daily cattle nutrition manufactured for steady intake, milk support and dependable dealer movement.',
    'idx.showcase.v3000.name': 'Vansh 3000',
    'idx.showcase.v3000.desc': 'A starter-grade feed line prepared for early-stage nutrition, palatability and consistent batch quality.',
    'idx.showcase.v5000.name': 'Vansh 5000',
    'idx.showcase.v5000.desc': 'Growth-focused cattle feed designed for working farms that need balanced nutrition and reliable supply.',
    'idx.showcase.v8000.name': 'Vansh 8000',
    'idx.showcase.v8000.desc': 'A higher-spec nutrition range built for yield-focused feeding programs and repeatable farm performance.',
    'idx.showcase.aqua20.name': 'Aqua Feed 20kg',
    'idx.showcase.aqua20.desc': 'Floating aqua feed packed for controlled pond feeding, feed visibility and practical farm handling.',
    'idx.showcase.aqua35.name': 'Aqua Feed 35kg',
    'idx.showcase.aqua35.desc': 'Commercial aqua feed packing suited for regular pond operations, dealer stocking and bulk dispatch.',
    'idx.showcase.view': 'View Product',
    'idx.network.kicker': 'Operating Footprint',
    'idx.network.title': 'Our Growing Footprint',
    'idx.network.subtitle': 'A measured network built through manufacturing discipline, dealer availability and growing supply into India and Nepal.',
    'idx.stat.farmers': 'Farmers Reached',
    'idx.stat.dealers': 'Dealer Touchpoints',
    'idx.stat.products': 'Product SKUs',
    'idx.stat.export': 'Nepal Export Market',
    'idx.stat.subsidiaries': 'Operating Companies',
    'idx.trust.kicker': 'Operational Trust',
    'idx.trust.title': 'Why farmers, dealers and partners trust the Vansh Group',
    'idx.trust.subtitle': 'Trust is built through repeat supply, practical products, clear communication and manufacturing discipline that partners can rely on.',
    'idx.trust.science.title': 'Scientific formulation',
    'idx.trust.science.desc': 'Feed and crop-input ranges are developed around nutrition needs, application context and field usability.',
    'idx.trust.manufacturing.title': 'Manufacturing consistency',
    'idx.trust.manufacturing.desc': 'Batch preparation, packing discipline and dispatch checks support repeatable product quality.',
    'idx.trust.distribution.title': 'Distribution reliability',
    'idx.trust.distribution.desc': 'Dealer and distributor relationships are supported with practical availability and regular supply planning.',
    'idx.trust.support.title': 'Responsive support',
    'idx.trust.support.desc': 'Business, product and service concerns are routed through phone, WhatsApp and email channels.',
    'idx.trust.transparency.title': 'Operational transparency',
    'idx.trust.transparency.desc': 'Clear product categories, business inquiry paths and documented communication help partners plan confidently.',
    'idx.trust.field.title': 'Field understanding',
    'idx.trust.field.desc': 'Products are represented for real farm routines, dealer stocking needs and regional agricultural conditions.',
    'idx.distributor.kicker': 'Dealer & Distributor Enquiries',
    'idx.distributor.title': 'Work with a manufacturing group built for repeat agricultural supply',
    'idx.distributor.subtitle': 'We welcome structured business discussions for feed, fertilizer, soil-health and bio-agro product distribution across active farming markets.',
    'idx.distributor.whatsapp': '<i class="fab fa-whatsapp"></i> WhatsApp Us',
    'idx.distributor.call': '<i class="fas fa-phone"></i> Call Sales Team',
    'idx.distributor.inquiry': '<i class="fas fa-paper-plane"></i> Send Inquiry',
    'idx.distributor.proof.products': 'catalogued product variants',
    'idx.distributor.proof.network': 'dealer and distribution touchpoints',
    'idx.distributor.proof.supply': 'bulk supply coordination',
    'idx.support.kicker': 'Support & Redressal',
    'idx.support.title': 'Customer Support & Grievance Redressal',
    'idx.support.subtitle': 'For product enquiries, dealer coordination or service concerns, the team provides clear contact routes and practical follow-up.',
    'idx.support.email.title': 'Written Enquiries',
    'idx.support.phone.title': 'Phone Coordination',
    'idx.support.whatsapp.title': 'WhatsApp Contact',
    'idx.support.whatsapp.link': 'Message the support team',
    'idx.support.response.title': 'Responsible Follow-Up',
    'idx.support.response.desc': 'Concerns are reviewed with the relevant product or business team before response.',

    // About Page
    'about.hero.title': 'MLL-led agro-industrial manufacturing from <span class="text-gradient">Barabanki</span>',
    'about.hero.subtitle': 'Organic inputs, fertilizers and soil health solutions supported by feed, aqua and bio-agro manufacturing divisions.',
    'about.story.title': 'A practical MLL-led manufacturing group',
    'about.story.p1': 'Vansh Group is anchored by <strong>MLL Agro Industries Pvt. Ltd.</strong>, with <strong>Fish Gold Industries Pvt. Ltd.</strong> and <strong>New Vanshika Bio Agro Industries Pvt. Ltd.</strong>',
    'about.story.p2': 'From Barabanki, Uttar Pradesh, the group manufactures and supplies organic inputs, fertilizers, soil health solutions, animal nutrition, aqua feed and bio-agro products for farming markets, dealer networks and Nepal-facing export opportunities.',
    'about.mission.short': 'Mission',
    'about.mission.short.desc': 'Manufacture dependable agricultural inputs with consistent quality and practical field usability.',
    'about.vision.short': 'Vision',
    'about.vision.short.desc': 'Build long-term trust with farmers, dealers and partners through responsible supply.',
    'about.companies.kicker': 'Operating Companies',
    'about.companies.title': 'Focused entities with MLL Agro at the center',
    'about.companies.subtitle': 'Each company has a defined operating role, with MLL Agro Industries carrying the primary agro-input and soil-health identity of the group.',
    'about.company.fish.title': 'Fish Gold Industries Pvt. Ltd.',
    'about.company.fish.desc': 'Feed and animal nutrition manufacturing across aqua feed, cattle feed and poultry feed categories.',
    'about.company.fish.field': 'Aqua & Animal Nutrition',
    'about.company.mll.title': 'MLL Agro Industries Pvt. Ltd.',
    'about.company.mll.desc': 'Organic inputs, fertilizers and soil health solutions for crop nutrition and regular agricultural use.',
    'about.company.mll.field': 'Fertilizers & Soil Health',
    'about.company.bio.title': 'New Vanshika Bio Agro Industries Pvt. Ltd.',
    'about.company.bio.desc': 'Bio solutions and crop nutrition inputs aligned with sustainable agriculture and field application.',
    'about.company.bio.field': 'Bio Solutions',
    'about.company.bulk.title': 'Bulk Supply & Third-Party Manufacturing',
    'about.company.bulk.desc': 'Manufacturing discussions may include bulk supply, private labeling, contract manufacturing and dealer/distributor supply programs, subject to product fit and commercial terms.',
    'about.company.bulk.field': 'B2B Capability',
    'about.values.kicker': 'Operating Principles',
    'about.values.title': 'Core Values',
    'about.values.subtitle': 'Short principles that guide manufacturing, trade relationships and customer response.',
    'about.value.integrity.title': 'Clear Commitments',
    'about.value.integrity.desc': 'Transparent terms, accountable communication and disciplined follow-through.',
    'about.value.quality.title': 'Quality Discipline',
    'about.value.quality.desc': 'Controlled production, practical checks and steady product presentation.',
    'about.value.innovation.title': 'Practical Improvement',
    'about.value.innovation.desc': 'Better formulations and packs where they improve real farm use.',
    'about.value.trust.title': 'Farmer & Dealer Respect',
    'about.value.trust.desc': 'Business decisions shaped by field realities and dealer confidence.',
    'about.value.sustainability.title': 'Responsible Growth',
    'about.value.sustainability.desc': 'Growth with attention to soil health, product responsibility and stable supply.',
    'about.mission.title': 'Our Mission',
    'about.mission.desc': 'Manufacture dependable organic inputs, fertilizers, feed and bio-agro products that help farmers and dealers plan with confidence.',
    'about.vision.title': 'Our Vision',
    'about.vision.desc': 'Build a trusted Indian agro-industrial group with reliable supply, responsible products and durable market relationships.',
    'about.numbers.kicker': 'Operating Scale',
    'about.numbers.title': 'Group Strength in Numbers',
    'about.numbers.subtitle': 'A concise view of the group’s manufacturing categories, distribution reach and Nepal export presence.',
    'about.number.companies': 'Operating Companies',
    'about.number.dealers': 'Dealer Touchpoints',
    'about.number.categories': 'Product Lines',
    'about.number.states': 'States Served',
    'about.number.export': 'Nepal Export',

    // Contact Page
    'contact.hero.title': 'Contact <span class="text-gradient">Vansh Group</span>',
    'contact.hero.subtitle': 'Reach the Barabanki team for MLL Agro Industries products, dealer coordination, bulk supply, export discussions and customer support.',
    'contact.quick.whatsapp.title': 'WhatsApp Coordination',
    'contact.quick.whatsapp.link': 'Message the team',
    'contact.quick.call.title': 'Sales & Support Call',
    'contact.quick.email.title': 'Written Communication',
    'contact.quick.export.title': 'Nepal / Export Inquiry',
    'contact.quick.export.desc': 'For structured bulk and cross-border supply discussions.',
    'contact.info.title': 'Business Contact',
    'contact.info.office': 'Head Office / Manufacturing Base',
    'contact.info.address': 'Vansh Group of Companies,<br>Barabanki, Uttar Pradesh, India',
    'contact.info.phone': 'Phone Number',
    'contact.info.email': 'Email Address',
    'contact.action.whatsapp': '<i class="fab fa-whatsapp"></i> WhatsApp',
    'contact.action.email': '<i class="fas fa-envelope"></i> Email Us',
    'contact.form.title': 'Share your requirement',
    'contact.form.subtitle': 'Send a clear note about your agro-input, feed, dealership, bulk supply or support requirement. The relevant team will review it and respond.',
    'contact.form.name': 'Full Name',
    'contact.form.name.ph': 'Your name',
    'contact.form.phone': 'Phone Number',
    'contact.form.phone.ph': '+91 0000000000',
    'contact.form.type': 'Inquiry Type',
    'contact.form.type.distributor': 'Distributorship Inquiry',
    'contact.form.type.product': 'Product Information',
    'contact.form.type.grievance': 'Grievance Redressal',
    'contact.form.type.export': 'Export Inquiry',
    'contact.form.type.vendor': 'Vendor Registration',
    'contact.form.message': 'Your Message',
    'contact.form.message.ph': 'How can we help you?',
    'contact.form.submit': 'Send Message',
    'contact.form.sending': 'Sending...',
    'contact.form.success': 'Thank you! Your message has been received. We will contact you within 24 hours.',
    'contact.map.kicker': 'Factory Location',
    'contact.map.title': 'Coordinate with the Barabanki office before visiting',
    'contact.map.desc': 'For MLL Agro product meetings, dealer discussions, bulk supply planning or Nepal export enquiries, please call or WhatsApp first so the correct team can be available.',

    // Business Utility Pages
    'business.kicker': 'Business Desk',
    'business.hero.title': 'Structured business inquiries for agro-input and feed supply',
    'business.hero.subtitle': 'Connect with the Barabanki team for MLL Agro Industries products, bulk supply, dealer distribution, third-party manufacturing and Nepal export discussions.',
    'business.action.whatsapp': '<i class="fab fa-whatsapp"></i> WhatsApp Business Desk',
    'business.action.call': '<i class="fas fa-phone"></i> Call Business Team',
    'business.primary.title': 'MLL Agro Industries priority categories',
    'business.primary.desc': 'The primary business focus is organic inputs, fertilizers, soil health products and crop nutrition solutions supported by steady manufacturing and dealer-friendly supply planning.',
    'business.tag.organic': 'Organic Inputs',
    'business.tag.fertilizer': 'Fertilizers',
    'business.tag.soil': 'Soil Health',
    'business.tag.bulk': 'Bulk Supply',
    'business.card.bulk.title': 'Bulk & institutional supply',
    'business.card.bulk.desc': 'Discuss planned supply for agro-input, fertilizer, feed and aqua categories with clear quantity and dispatch requirements.',
    'business.card.dealer.title': 'Dealer distribution',
    'business.card.dealer.desc': 'For market expansion, dealer onboarding and territory-level product availability discussions.',
    'business.card.contract.title': 'Third-party manufacturing',
    'business.card.contract.desc': 'Private label and contract manufacturing enquiries are reviewed according to product fit and commercial scope.',
    'business.card.export.title': 'Nepal export discussions',
    'business.card.export.desc': 'For cross-border supply, share product category, quantity, destination and documentation expectations.',
    'business.prepare.kicker': 'Before You Contact',
    'business.prepare.title': 'Details that help us respond clearly',
    'business.prepare.subtitle': 'A concise requirement note allows the relevant product, commercial or dispatch team to review your inquiry without delay.',
    'business.step.category.title': 'Product category',
    'business.step.category.desc': 'Mention organic input, fertilizer, animal nutrition, aqua feed or bio-agro requirement.',
    'business.step.market.title': 'Market and quantity',
    'business.step.market.desc': 'Share location, estimated quantity, dealer territory or dispatch frequency.',
    'business.step.contact.title': 'Contact route',
    'business.step.contact.desc': 'Include name, phone number, firm details and preferred response mode.',
    'vendor.kicker': 'Partner Registration',
    'vendor.hero.title': 'Vendor and distributor registration',
    'vendor.hero.subtitle': 'For distribution, supply collaboration and vendor discussions across MLL Agro Industries agro-input categories and group feed divisions.',
    'vendor.action.whatsapp': '<i class="fab fa-whatsapp"></i> Start on WhatsApp',
    'vendor.action.business': '<i class="fas fa-paper-plane"></i> Send Business Inquiry',
    'vendor.fit.kicker': 'Partner Fit',
    'vendor.fit.title': 'Who should connect',
    'vendor.fit.subtitle': 'The group reviews practical business partnerships where product focus, market reach and supply discipline are clear.',
    'vendor.card.dealer.title': 'Agro dealers',
    'vendor.card.dealer.desc': 'Retail and wholesale dealers working in fertilizer, organic input and crop nutrition markets.',
    'vendor.card.distributor.title': 'Distributors',
    'vendor.card.distributor.desc': 'Market-level distribution partners with territory knowledge and regular supply capability.',
    'vendor.card.supplier.title': 'Input suppliers',
    'vendor.card.supplier.desc': 'Suppliers with relevant materials, packaging or support services for agro manufacturing.',
    'vendor.card.feed.title': 'Feed trade partners',
    'vendor.card.feed.desc': 'Partners handling aqua feed, cattle feed and animal nutrition supply channels.',
    'vendor.docs.title': 'Information to keep ready',
    'vendor.docs.desc': 'Share company name, GST details where applicable, operating market, product interest, monthly requirement estimate and current distribution coverage.',
    'vendor.review.title': 'Review approach',
    'vendor.review.desc': 'Registrations are reviewed for business fit, market readiness, supply practicality and product-category alignment before commercial discussions move forward.',
    'grievance.kicker': 'Customer Support',
    'grievance.hero.title': 'Customer support and grievance redressal',
    'grievance.hero.subtitle': 'A clear route for product concerns, dealer coordination issues, supply communication and service follow-up.',
    'grievance.action.email': '<i class="fas fa-envelope"></i> Email Support',
    'grievance.action.whatsapp': '<i class="fab fa-whatsapp"></i> WhatsApp Support',
    'grievance.card.email.title': 'Written record',
    'grievance.card.email.desc': 'Email the concern with product name, batch details if available, location and contact number.',
    'grievance.card.call.title': 'Phone coordination',
    'grievance.card.call.desc': 'Call for urgent communication, dealer coordination or product availability concerns.',
    'grievance.card.whatsapp.title': 'WhatsApp support',
    'grievance.card.whatsapp.desc': 'Use WhatsApp for quick routing with product photos, bill details or supply context.',
    'grievance.card.follow.title': 'Responsible follow-up',
    'grievance.card.follow.desc': 'Concerns are reviewed by the relevant product, quality or business team before response.',
    'grievance.process.kicker': 'Response Process',
    'grievance.process.title': 'How concerns are handled',
    'grievance.process.subtitle': 'The objective is clear communication, correct routing and practical resolution based on available details.',
    'grievance.step.receive.title': 'Receive',
    'grievance.step.receive.desc': 'The concern is recorded with product, location and contact details.',
    'grievance.step.review.title': 'Review',
    'grievance.step.review.desc': 'The relevant business, dispatch or quality team checks the matter.',
    'grievance.step.respond.title': 'Respond',
    'grievance.step.respond.desc': 'A practical response is shared through phone, WhatsApp or email.',
    'career.kicker': 'Careers',
    'career.hero.title': 'Work with a practical agro-industrial manufacturing group',
    'career.hero.subtitle': 'We welcome profiles connected to agro-inputs, manufacturing, quality, sales coordination, dealer support and field operations.',
    'career.action.email': '<i class="fas fa-envelope"></i> Email Profile',
    'career.action.contact': '<i class="fas fa-phone"></i> Contact Office',
    'career.areas.kicker': 'Work Areas',
    'career.areas.title': 'Teams that support the group',
    'career.areas.subtitle': 'Career discussions are handled according to current requirements, role fit and operating needs.',
    'career.card.agro.title': 'Agro-input sales',
    'career.card.agro.desc': 'Market development and dealer coordination for fertilizers, organic inputs and crop nutrition.',
    'career.card.production.title': 'Manufacturing operations',
    'career.card.production.desc': 'Production, packing, dispatch and process coordination across product categories.',
    'career.card.quality.title': 'Quality support',
    'career.card.quality.desc': 'Raw material, formulation and finished product quality support for steady supply.',
    'career.card.office.title': 'Office coordination',
    'career.card.office.desc': 'Business communication, inquiry routing, documentation and support coordination.',
    'career.profile.title': 'How to share your profile',
    'career.profile.desc': 'Email your resume with role interest, current location, experience summary and contact details. Shortlisted profiles are contacted when suitable openings are available.',
    'career.profile.cta': '<i class="fas fa-envelope"></i> Send Resume',

    // Product Detail
    'product.back': '<i class="fas fa-arrow-left"></i> Back to Catalog',
    'product.overview': 'Product Overview',
	    'product.spec.packing': 'Packing Size',
	    'product.spec.dosage': 'Dosage',
	    'product.spec.suitable': 'Suitable For',
	    'product.full_specs': 'Full Specifications',
	    'product.table.specification': 'Specification',
	    'product.table.details': 'Details',
	    'product.tab.use': 'How to Use',
	    'product.tab.benefits': 'Key Benefits',
	    'product.tab.supply': 'Bulk Supply',
	    'product.bulk.strip': 'Bulk Supply Available Across India',
	    'product.badge.quality': 'Premium Quality',
	    'product.badge.iso': 'ISO 9001 Certified',
	    'product.badge.yield': 'High Yield',
	    'product.badge.science': 'Scientifically Formulated',
	    'product.inquire': '<i class="fas fa-shopping-cart"></i> Inquire About This Product',
	    'product.get_quote': '<i class="fab fa-whatsapp"></i> Get Quote',
	    'product.send_inquiry': '<i class="fas fa-envelope"></i> Send Inquiry',

    // Infrastructure and Quality
    'infra.hero.title': 'Our <span class="text-gradient">Infrastructure</span>',
    'infra.hero.subtitle': 'Agro-input, fertilizer, feed and bio-solution manufacturing support from Barabanki.',
    'infra.kicker': 'Barabanki Facility',
    'infra.title': 'Advanced Manufacturing Unit',
    'infra.subtitle': 'Our infrastructure supports MLL Agro Industries led organic inputs, fertilizers, soil health products and the group’s feed and bio-agro categories.',
    'infra.stage1.label': 'Stage 1',
    'infra.stage1.title': 'Raw Material / Ingredient Handling',
    'infra.stage1.desc': 'Incoming ingredients are weighed, inspected, and handled with disciplined storage practices before they move into production.',
    'infra.stage2.label': 'Stage 2',
    'infra.stage2.title': 'Processing / Manufacturing Unit',
    'infra.stage2.desc': 'Practical processing systems support controlled blending, batch consistency, and reliable output across agro-input and feed categories.',
    'infra.stage3.label': 'Stage 3',
    'infra.stage3.title': 'Packing / Quality Dispatch',
    'infra.stage3.desc': 'Finished packs are checked, sealed, organized, and readied for dependable dispatch to distributors, dealers, and farming markets.',
    'infra.footnote': 'A practical manufacturing flow designed for dependable quality, traceable handling, and timely delivery.',
    'quality.hero.title': 'Quality <span class="text-gradient">Standards</span>',
    'quality.hero.subtitle': 'Quality discipline for agro inputs, fertilizers, feed and bio-agro products.',
    'quality.lab.title': 'Our R&D Laboratory',
    'quality.lab.desc': 'Quality control supports raw material selection, formulation discipline and finished product checks across MLL Agro input categories and group feed lines.',
    'quality.card.raw.title': 'Raw Material Testing',
    'quality.card.raw.desc': 'Incoming materials are checked for suitability, handling condition and product-category requirements before they move into production.',
    'quality.card.formula.title': 'Formulation Accuracy',
    'quality.card.formula.desc': 'Batch preparation follows defined formulations and controlled weighing practices to support repeatable manufacturing output.',
    'quality.card.qa.title': 'Finished Product QA',
    'quality.card.qa.desc': 'Finished packs are reviewed for presentation, sealing, category fit and dispatch readiness before they move to dealers and markets.',
    'quality.cert.title': 'Certifications',
    'quality.cert.iso': 'Quality Management',
    'quality.cert.fssai': 'Food Safety & Standards',

    // Footer additions
    'footer.business': 'Business',
    'footer.business.inquiry': 'Business Inquiry',
    'footer.business.distributor': 'Vendor / Distributor Registration',
    'footer.business.grievance': 'Grievance Redressal',
    'footer.business.career': 'Careers',
    'footer.business.export': 'Export Inquiry',
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
    'hero.title': 'ऑर्गेनिक एग्रो इनपुट, <span style="color:var(--secondary)">मृदा स्वास्थ्य</span> और फीड निर्माण',
    'hero.subtitle': 'बाराबंकी में MLL Agro Industries Pvt. Ltd. के नेतृत्व में ग्रुप भारत और नेपाल-facing markets के लिए fertilizers, organic inputs, bio-agro solutions, aqua feed और animal nutrition बनाता है।',
    'hero.btn.explore': 'उत्पाद देखें',
    'hero.btn.distributor': 'वितरक बनें',

    // Homepage — Feature Cards
    'feat.organic.title': 'ऑर्गेनिक इनपुट और मृदा स्वास्थ्य',
    'feat.organic.desc': 'MLL Agro Industries group के fertilizer, organic input और crop nutrition focus को responsible field productivity के लिए lead करता है।',
    'feat.aqua.title': 'एक्वा फ़ीड',
    'feat.aqua.desc': 'तालाब संचालन, व्यावहारिक feeding routines और commercial fish culture के लिए floating aqua feed ranges।',
    'feat.animal.title': 'पशु पोषण',
    'feat.animal.desc': 'Cattle और poultry feed lines group के practical farm supply portfolio का हिस्सा बने हुए हैं।',

    // Homepage — Managing Director Message
    'md.title': 'हमारे एमडी का संदेश',
    'md.p1': '"वंश ग्रुप में हमारा ध्यान disciplined agro-input manufacturing, practical field products और farmers, dealers व business partners के साथ long-term relationships पर है।"',
    'md.p2': 'MLL Agro Industries organic input और soil-health work को lead करता है, जबकि Fish Gold Industries और New Vanshika Bio Agro feed, aqua और bio-agro categories को समान supply discipline के साथ support करते हैं।',
    'md.p3': 'बाराबंकी से भारत और नेपाल-facing markets तक बढ़ते हुए, हमारा focus responsible manufacturing और dependable business conduct पर रहता है।',
    'md.name': 'डॉ. हेम करण माथुर',
    'md.role': 'प्रबंध निदेशक',

    // Homepage — Products Section
    'idx.prod.title': 'हमारे प्रीमियम उत्पाद',
    'idx.prod.subtitle': 'Dealer और farm supply के लिए MLL agro-input products के साथ established feed और aqua lines की balanced range।',

    // Footer
    'footer.brand': 'MLL Agro Industries Pvt. Ltd. led agro-industrial group',
    'footer.about': 'वंश ग्रुप बाराबंकी से MLL Agro Industries, Fish Gold Industries और New Vanshika Bio Agro Industries के माध्यम से operates करता है।',
    'footer.links': 'त्वरित लिंक',
    'footer.contact': 'संपर्क जानकारी',
    'footer.address': 'बाराबंकी, उत्तर प्रदेश, भारत',
    'footer.phone': '05248 296699<br>+91 9670252525',
	    'footer.email': 'vanshgroupofficial@gmail.com',
    'footer.rights': '© 2026 वंश ग्रुप। सर्वाधिकार सुरक्षित।',

    // Products Page
    'page.products.title': 'हमारे <span>उत्पाद</span>',
    'page.products.subtitle': 'Farm और dealer supply के लिए organic inputs, fertilizers, soil health products, aqua feed और animal nutrition ranges।',
    'products.filter.all': 'सभी उत्पाद',
    'products.filter.feed': 'पशु और एक्वा फीड',
    'products.filter.fertilizer': 'ऑर्गेनिक इनपुट और उर्वरक',
    'products.filter.agro': 'एग्रो केमिकल्स',
    'products.search.placeholder': 'उत्पाद खोजें',
    'products.no_results.title': 'कोई मिलान उत्पाद नहीं',
    'products.no_results.desc': 'दूसरा product name, category, feed form, packing size या nutrient खोजें।',
    'products.cat.feed': 'पशु और एक्वा फीड',
    'products.cat.fertilizer': 'ऑर्गेनिक इनपुट और उर्वरक',
    'products.cat.agro': 'एग्रो केमिकल्स और स्पेशल्टी',
	    'products.count.feed': '14 उत्पाद',
	    'products.count.fertilizer': '23 उत्पाद',
	    'products.count.agro': '20 उत्पाद',
	    'products.view': 'विवरण देखें',
	    'products.inquiry': 'पूछताछ भेजें',

    // Homepage additions
    'idx.companies.kicker': 'Operating Companies',
    'idx.companies.title': 'MLL-led agro inputs और wider group manufacturing support',
    'idx.companies.subtitle': 'Group का primary focus MLL Agro Industries के माध्यम से organic agriculture, fertilizers और soil health है, जिसे feed, aqua और bio-agro manufacturing divisions support करते हैं।',
    'idx.company.fish.title': 'Fish Gold Industries Pvt. Ltd.',
    'idx.company.fish.desc': 'Practical farm और dealer supply के लिए aqua feed, cattle feed, poultry feed और animal nutrition products का निर्माण।',
    'idx.company.fish.field': 'Feed & Animal Nutrition',
    'idx.company.mll.title': 'MLL Agro Industries Pvt. Ltd.',
    'idx.company.mll.desc': 'Crop nutrition और responsible field productivity के लिए organic inputs, fertilizers और soil health solutions।',
    'idx.company.mll.field': 'Organic Inputs & Fertilizers',
    'idx.company.bio.title': 'New Vanshika Bio Agro Industries Pvt. Ltd.',
    'idx.company.bio.desc': 'Sustainable agriculture और field-level usability के अनुरूप bio solutions और crop nutrition inputs।',
    'idx.company.bio.field': 'Bio Solutions & Crop Nutrition',
    'idx.company.bulk.title': 'Bulk Supply & Third-Party Manufacturing',
    'idx.company.bulk.desc': 'Group bulk manufacturing, dealer/distributor supply, private labeling और contract manufacturing discussions जैसे B2B requirements support करता है।',
    'idx.company.bulk.field': 'B2B Manufacturing',
    'idx.prod.kicker': 'प्रीमियम रेंज',
    'idx.prod.all': 'सभी 50+ उत्पाद देखें',
    'idx.showcase.cat.fertilizer': 'एग्रो इनपुट',
    'idx.showcase.cat.cattle': 'पशु आहार',
    'idx.showcase.cat.aqua': 'एक्वा फीड',
    'idx.showcase.prom.name': 'प्रोम',
    'idx.showcase.prom.desc': 'Soil nutrition programs, dealer supply और field application के लिए phosphate-rich organic manure।',
    'idx.showcase.green.name': 'ग्रीन फॉस',
    'idx.showcase.green.desc': 'Phosphorus support और practical soil-health use के लिए crop nutrition input।',
    'idx.showcase.npk.name': 'वंश एनपीके',
    'idx.showcase.npk.desc': 'Regular availability और clean packing के साथ crop programs के लिए balanced nutrient support।',
    'idx.showcase.potash.name': 'वंश पोटाश',
    'idx.showcase.potash.desc': 'Crop strength, field programs और dependable distributor movement के लिए potash-focused input।',
    'idx.showcase.super.name': 'वंश सुपर',
    'idx.showcase.super.desc': 'Stable intake, milk support और dependable dealer movement के लिए manufactured daily cattle nutrition।',
    'idx.showcase.v3000.name': 'वंश 3000',
    'idx.showcase.v3000.desc': 'Early-stage nutrition, palatability और consistent batch quality के लिए prepared starter-grade feed line।',
    'idx.showcase.v5000.name': 'वंश 5000',
    'idx.showcase.v5000.desc': 'Balanced nutrition और reliable supply की जरूरत वाले working farms के लिए growth-focused cattle feed।',
    'idx.showcase.v8000.name': 'वंश 8000',
    'idx.showcase.v8000.desc': 'Yield-focused feeding programs और repeatable farm performance के लिए higher-spec nutrition range।',
    'idx.showcase.aqua20.name': 'एक्वा फीड 20kg',
    'idx.showcase.aqua20.desc': 'Controlled pond feeding, feed visibility और practical farm handling के लिए packed floating aqua feed।',
    'idx.showcase.aqua35.name': 'एक्वा फीड 35kg',
    'idx.showcase.aqua35.desc': 'Regular pond operations, dealer stocking और bulk dispatch के लिए suitable commercial aqua feed packing।',
    'idx.showcase.view': 'उत्पाद देखें',
    'idx.network.kicker': 'Operating Footprint',
    'idx.network.title': 'हमारी बढ़ती पहुंच',
    'idx.network.subtitle': 'Manufacturing discipline, dealer availability और India-Nepal supply growth से बना measured network।',
    'idx.stat.farmers': 'Farmers Reached',
    'idx.stat.dealers': 'Dealer Touchpoints',
    'idx.stat.products': 'Product SKUs',
    'idx.stat.export': 'Nepal Export Market',
    'idx.stat.subsidiaries': 'Operating Companies',
    'idx.trust.kicker': 'Operational Trust',
    'idx.trust.title': 'किसान, डीलर और पार्टनर वंश ग्रुप पर क्यों भरोसा करते हैं',
    'idx.trust.subtitle': 'Repeat supply, practical products, clear communication और manufacturing discipline से trust बनता है।',
    'idx.trust.science.title': 'Scientific formulation',
    'idx.trust.science.desc': 'Feed और crop-input ranges nutrition needs, application context और field usability के आधार पर developed हैं।',
    'idx.trust.manufacturing.title': 'Manufacturing consistency',
    'idx.trust.manufacturing.desc': 'Batch preparation, packing discipline और dispatch checks repeatable product quality support करते हैं।',
    'idx.trust.distribution.title': 'Distribution reliability',
    'idx.trust.distribution.desc': 'Dealer और distributor relationships practical availability और regular supply planning से support होते हैं।',
    'idx.trust.support.title': 'Responsive support',
    'idx.trust.support.desc': 'Business, product और service concerns phone, WhatsApp और email channels से route होते हैं।',
    'idx.trust.transparency.title': 'Operational transparency',
    'idx.trust.transparency.desc': 'Clear product categories, business inquiry paths और documented communication partners को confidently plan करने में मदद करते हैं।',
    'idx.trust.field.title': 'Field understanding',
    'idx.trust.field.desc': 'Products real farm routines, dealer stocking needs और regional agricultural conditions के लिए represented हैं।',
    'idx.distributor.kicker': 'Dealer & Distributor Enquiries',
    'idx.distributor.title': 'Repeat agricultural supply के लिए built manufacturing group के साथ काम करें',
    'idx.distributor.subtitle': 'Feed, fertilizer, soil-health और bio-agro product distribution के लिए structured business discussions welcome हैं।',
    'idx.distributor.whatsapp': '<i class="fab fa-whatsapp"></i> WhatsApp करें',
    'idx.distributor.call': '<i class="fas fa-phone"></i> सेल्स टीम को कॉल करें',
    'idx.distributor.inquiry': '<i class="fas fa-paper-plane"></i> पूछताछ भेजें',
    'idx.distributor.proof.products': 'catalogued product variants',
    'idx.distributor.proof.network': 'डीलर और वितरण टचपॉइंट',
    'idx.distributor.proof.supply': 'bulk supply coordination',
    'idx.support.kicker': 'Support & Redressal',
    'idx.support.title': 'ग्राहक सहायता और शिकायत निवारण',
    'idx.support.subtitle': 'Product enquiries, dealer coordination या service concerns के लिए team clear contact routes और practical follow-up देती है।',
    'idx.support.email.title': 'Written Enquiries',
    'idx.support.phone.title': 'Phone Coordination',
    'idx.support.whatsapp.title': 'WhatsApp Contact',
    'idx.support.whatsapp.link': 'Support team को message करें',
    'idx.support.response.title': 'Responsible Follow-Up',
    'idx.support.response.desc': 'Concerns को relevant product या business team के साथ review करके response दिया जाता है।',

    // About Page
    'about.hero.title': '<span class="text-gradient">बाराबंकी</span> से MLL-led agro-industrial manufacturing',
    'about.hero.subtitle': 'Organic inputs, fertilizers और soil health solutions जिन्हें feed, aqua और bio-agro manufacturing divisions support करते हैं।',
    'about.story.title': 'एक practical MLL-led manufacturing group',
    'about.story.p1': 'वंश ग्रुप <strong>MLL Agro Industries Pvt. Ltd.</strong> से anchored है, जिसके साथ <strong>Fish Gold Industries Pvt. Ltd.</strong> और <strong>New Vanshika Bio Agro Industries Pvt. Ltd.</strong> operate करते हैं।',
    'about.story.p2': 'बाराबंकी, उत्तर प्रदेश से group organic inputs, fertilizers, soil health solutions, animal nutrition, aqua feed और bio-agro products farming markets, dealer networks और Nepal-facing export opportunities के लिए manufacture और supply करता है।',
    'about.mission.short': 'मिशन',
    'about.mission.short.desc': 'Consistent quality और practical field usability के साथ dependable agricultural inputs manufacture करना।',
    'about.vision.short': 'विजन',
    'about.vision.short.desc': 'Responsible supply के माध्यम से farmers, dealers और partners के साथ long-term trust बनाना।',
    'about.companies.kicker': 'Operating Companies',
    'about.companies.title': 'MLL Agro को center में रखती focused entities',
    'about.companies.subtitle': 'हर company का operating role स्पष्ट है, और MLL Agro Industries group की primary agro-input और soil-health identity संभालता है।',
    'about.company.fish.title': 'Fish Gold Industries Pvt. Ltd.',
    'about.company.fish.desc': 'Aqua feed, cattle feed और poultry feed categories में feed और animal nutrition manufacturing।',
    'about.company.fish.field': 'Aqua & Animal Nutrition',
    'about.company.mll.title': 'MLL Agro Industries Pvt. Ltd.',
    'about.company.mll.desc': 'Crop nutrition और regular agricultural use के लिए organic inputs, fertilizers और soil health solutions।',
    'about.company.mll.field': 'Fertilizers & Soil Health',
    'about.company.bio.title': 'New Vanshika Bio Agro Industries Pvt. Ltd.',
    'about.company.bio.desc': 'Sustainable agriculture और field application के अनुरूप bio solutions और crop nutrition inputs।',
    'about.company.bio.field': 'Bio Solutions',
    'about.company.bulk.title': 'Bulk Supply & Third-Party Manufacturing',
    'about.company.bulk.desc': 'Manufacturing discussions में product fit और commercial terms के अनुसार bulk supply, private labeling, contract manufacturing और dealer/distributor supply programs शामिल हो सकते हैं।',
    'about.company.bulk.field': 'B2B Capability',
    'about.values.kicker': 'Operating Principles',
    'about.values.title': 'मुख्य मूल्य',
    'about.values.subtitle': 'Manufacturing, trade relationships और customer response को guide करने वाले short principles।',
    'about.value.integrity.title': 'Clear Commitments',
    'about.value.integrity.desc': 'Transparent terms, accountable communication और disciplined follow-through।',
    'about.value.quality.title': 'Quality Discipline',
    'about.value.quality.desc': 'Controlled production, practical checks और steady product presentation।',
    'about.value.innovation.title': 'Practical Improvement',
    'about.value.innovation.desc': 'जहां farm use बेहतर हो, वहां formulations और packs में improvement।',
    'about.value.trust.title': 'Farmer & Dealer Respect',
    'about.value.trust.desc': 'Field realities और dealer confidence के आधार पर business decisions।',
    'about.value.sustainability.title': 'Responsible Growth',
    'about.value.sustainability.desc': 'Soil health, product responsibility और stable supply पर ध्यान रखते हुए growth।',
    'about.mission.title': 'हमारा मिशन',
    'about.mission.desc': 'Dependable organic inputs, fertilizers, feed और bio-agro products manufacture करना, जिससे farmers और dealers confidence के साथ plan कर सकें।',
    'about.vision.title': 'हमारा विजन',
    'about.vision.desc': 'Reliable supply, responsible products और durable market relationships वाला trusted Indian agro-industrial group बनाना।',
    'about.numbers.kicker': 'Operating Scale',
    'about.numbers.title': 'समूह की संख्या आधारित शक्ति',
    'about.numbers.subtitle': 'Group की manufacturing categories, distribution reach और Nepal export presence की concise view।',
    'about.number.companies': 'Operating Companies',
    'about.number.dealers': 'Dealer Touchpoints',
    'about.number.categories': 'Product Lines',
    'about.number.states': 'राज्य सेवा में',
    'about.number.export': 'Nepal Export',

    // Contact Page
    'contact.hero.title': '<span class="text-gradient">Vansh Group</span> से संपर्क',
    'contact.hero.subtitle': 'MLL Agro Industries products, dealer coordination, bulk supply, export discussions और customer support के लिए Barabanki team से संपर्क करें।',
    'contact.quick.whatsapp.title': 'WhatsApp Coordination',
    'contact.quick.whatsapp.link': 'Team को message करें',
    'contact.quick.call.title': 'Sales & Support Call',
    'contact.quick.email.title': 'Written Communication',
    'contact.quick.export.title': 'Nepal / Export Inquiry',
    'contact.quick.export.desc': 'Structured bulk और cross-border supply discussions के लिए।',
    'contact.info.title': 'Business Contact',
    'contact.info.office': 'Head Office / Manufacturing Base',
    'contact.info.address': 'Vansh Group of Companies,<br>बाराबंकी, उत्तर प्रदेश, भारत',
    'contact.info.phone': 'फोन नंबर',
    'contact.info.email': 'ईमेल पता',
    'contact.action.whatsapp': '<i class="fab fa-whatsapp"></i> WhatsApp',
    'contact.action.email': '<i class="fas fa-envelope"></i> ईमेल करें',
    'contact.form.title': 'अपनी requirement share करें',
    'contact.form.subtitle': 'Agro-input, feed, dealership, bulk supply या support requirement के बारे में clear note भेजें। Relevant team review करके respond करेगी।',
    'contact.form.name': 'पूरा नाम',
    'contact.form.name.ph': 'आपका नाम',
    'contact.form.phone': 'फोन नंबर',
    'contact.form.phone.ph': '+91 0000000000',
    'contact.form.type': 'पूछताछ प्रकार',
    'contact.form.type.distributor': 'वितरक पूछताछ',
    'contact.form.type.product': 'उत्पाद जानकारी',
    'contact.form.type.grievance': 'शिकायत निवारण',
    'contact.form.type.export': 'निर्यात पूछताछ',
    'contact.form.type.vendor': 'वेंडर रजिस्ट्रेशन',
    'contact.form.message': 'आपका संदेश',
    'contact.form.message.ph': 'हम आपकी कैसे मदद कर सकते हैं?',
    'contact.form.submit': 'संदेश भेजें',
    'contact.form.sending': 'भेजा जा रहा है...',
    'contact.form.success': 'धन्यवाद! आपका संदेश प्राप्त हो गया है। हम 24 घंटों के भीतर संपर्क करेंगे।',
    'contact.map.kicker': 'फैक्टरी स्थान',
    'contact.map.title': 'Visit से पहले Barabanki office से coordinate करें',
    'contact.map.desc': 'MLL Agro product meetings, dealer discussions, bulk supply planning या Nepal export enquiries के लिए पहले call या WhatsApp करें ताकि सही team available हो सके।',

    // Business Utility Pages
    'business.kicker': 'Business Desk',
    'business.hero.title': 'Agro-input और feed supply के लिए structured business inquiries',
    'business.hero.subtitle': 'MLL Agro Industries products, bulk supply, dealer distribution, third-party manufacturing और Nepal export discussions के लिए Barabanki team से connect करें।',
    'business.action.whatsapp': '<i class="fab fa-whatsapp"></i> Business Desk को WhatsApp करें',
    'business.action.call': '<i class="fas fa-phone"></i> Business Team को Call करें',
    'business.primary.title': 'MLL Agro Industries की priority categories',
    'business.primary.desc': 'Primary business focus organic inputs, fertilizers, soil health products और crop nutrition solutions है, जिसे steady manufacturing और dealer-friendly supply planning support करते हैं।',
    'business.tag.organic': 'Organic Inputs',
    'business.tag.fertilizer': 'Fertilizers',
    'business.tag.soil': 'Soil Health',
    'business.tag.bulk': 'Bulk Supply',
    'business.card.bulk.title': 'Bulk और institutional supply',
    'business.card.bulk.desc': 'Agro-input, fertilizer, feed और aqua categories की planned supply के लिए quantity और dispatch requirements स्पष्ट रखें।',
    'business.card.dealer.title': 'Dealer distribution',
    'business.card.dealer.desc': 'Market expansion, dealer onboarding और territory-level product availability discussions के लिए।',
    'business.card.contract.title': 'Third-party manufacturing',
    'business.card.contract.desc': 'Private label और contract manufacturing enquiries product fit और commercial scope के अनुसार review होती हैं।',
    'business.card.export.title': 'Nepal export discussions',
    'business.card.export.desc': 'Cross-border supply के लिए product category, quantity, destination और documentation expectations share करें।',
    'business.prepare.kicker': 'Contact से पहले',
    'business.prepare.title': 'Details जो clear response में मदद करती हैं',
    'business.prepare.subtitle': 'Concise requirement note से relevant product, commercial या dispatch team inquiry को बिना delay review कर पाती है।',
    'business.step.category.title': 'Product category',
    'business.step.category.desc': 'Organic input, fertilizer, animal nutrition, aqua feed या bio-agro requirement mention करें।',
    'business.step.market.title': 'Market और quantity',
    'business.step.market.desc': 'Location, estimated quantity, dealer territory या dispatch frequency share करें।',
    'business.step.contact.title': 'Contact route',
    'business.step.contact.desc': 'Name, phone number, firm details और preferred response mode शामिल करें।',
    'vendor.kicker': 'Partner Registration',
    'vendor.hero.title': 'Vendor और distributor registration',
    'vendor.hero.subtitle': 'MLL Agro Industries agro-input categories और group feed divisions में distribution, supply collaboration और vendor discussions के लिए।',
    'vendor.action.whatsapp': '<i class="fab fa-whatsapp"></i> WhatsApp पर शुरू करें',
    'vendor.action.business': '<i class="fas fa-paper-plane"></i> Business Inquiry भेजें',
    'vendor.fit.kicker': 'Partner Fit',
    'vendor.fit.title': 'कौन connect करे',
    'vendor.fit.subtitle': 'Group practical business partnerships review करता है जहां product focus, market reach और supply discipline स्पष्ट हों।',
    'vendor.card.dealer.title': 'Agro dealers',
    'vendor.card.dealer.desc': 'Fertilizer, organic input और crop nutrition markets में काम करने वाले retail और wholesale dealers।',
    'vendor.card.distributor.title': 'Distributors',
    'vendor.card.distributor.desc': 'Territory knowledge और regular supply capability वाले market-level distribution partners।',
    'vendor.card.supplier.title': 'Input suppliers',
    'vendor.card.supplier.desc': 'Agro manufacturing के लिए relevant materials, packaging या support services वाले suppliers।',
    'vendor.card.feed.title': 'Feed trade partners',
    'vendor.card.feed.desc': 'Aqua feed, cattle feed और animal nutrition supply channels संभालने वाले partners।',
    'vendor.docs.title': 'तैयार रखने वाली जानकारी',
    'vendor.docs.desc': 'Company name, GST details जहां लागू हों, operating market, product interest, monthly requirement estimate और current distribution coverage share करें।',
    'vendor.review.title': 'Review approach',
    'vendor.review.desc': 'Commercial discussions से पहले registrations को business fit, market readiness, supply practicality और product-category alignment पर review किया जाता है।',
    'grievance.kicker': 'Customer Support',
    'grievance.hero.title': 'Customer support और grievance redressal',
    'grievance.hero.subtitle': 'Product concerns, dealer coordination issues, supply communication और service follow-up के लिए clear route।',
    'grievance.action.email': '<i class="fas fa-envelope"></i> Email Support',
    'grievance.action.whatsapp': '<i class="fab fa-whatsapp"></i> WhatsApp Support',
    'grievance.card.email.title': 'Written record',
    'grievance.card.email.desc': 'Product name, batch details यदि available हों, location और contact number के साथ concern email करें।',
    'grievance.card.call.title': 'Phone coordination',
    'grievance.card.call.desc': 'Urgent communication, dealer coordination या product availability concerns के लिए call करें।',
    'grievance.card.whatsapp.title': 'WhatsApp support',
    'grievance.card.whatsapp.desc': 'Product photos, bill details या supply context के साथ quick routing के लिए WhatsApp use करें।',
    'grievance.card.follow.title': 'Responsible follow-up',
    'grievance.card.follow.desc': 'Concerns response से पहले relevant product, quality या business team द्वारा review होते हैं।',
    'grievance.process.kicker': 'Response Process',
    'grievance.process.title': 'Concerns कैसे handle होते हैं',
    'grievance.process.subtitle': 'Objective clear communication, correct routing और available details के आधार पर practical resolution है।',
    'grievance.step.receive.title': 'Receive',
    'grievance.step.receive.desc': 'Concern product, location और contact details के साथ record होता है।',
    'grievance.step.review.title': 'Review',
    'grievance.step.review.desc': 'Relevant business, dispatch या quality team matter check करती है।',
    'grievance.step.respond.title': 'Respond',
    'grievance.step.respond.desc': 'Practical response phone, WhatsApp या email से share किया जाता है।',
    'career.kicker': 'Careers',
    'career.hero.title': 'Practical agro-industrial manufacturing group के साथ काम करें',
    'career.hero.subtitle': 'Agro-inputs, manufacturing, quality, sales coordination, dealer support और field operations से जुड़े profiles welcome हैं।',
    'career.action.email': '<i class="fas fa-envelope"></i> Profile Email करें',
    'career.action.contact': '<i class="fas fa-phone"></i> Office से संपर्क करें',
    'career.areas.kicker': 'Work Areas',
    'career.areas.title': 'Group को support करने वाली teams',
    'career.areas.subtitle': 'Career discussions current requirements, role fit और operating needs के अनुसार handle होती हैं।',
    'career.card.agro.title': 'Agro-input sales',
    'career.card.agro.desc': 'Fertilizers, organic inputs और crop nutrition के लिए market development और dealer coordination।',
    'career.card.production.title': 'Manufacturing operations',
    'career.card.production.desc': 'Product categories में production, packing, dispatch और process coordination।',
    'career.card.quality.title': 'Quality support',
    'career.card.quality.desc': 'Steady supply के लिए raw material, formulation और finished product quality support।',
    'career.card.office.title': 'Office coordination',
    'career.card.office.desc': 'Business communication, inquiry routing, documentation और support coordination।',
    'career.profile.title': 'अपना profile कैसे share करें',
    'career.profile.desc': 'Role interest, current location, experience summary और contact details के साथ resume email करें। Suitable openings होने पर shortlisted profiles से contact किया जाता है।',
    'career.profile.cta': '<i class="fas fa-envelope"></i> Resume भेजें',

    // Product Detail
    'product.back': '<i class="fas fa-arrow-left"></i> कैटलॉग पर वापस',
    'product.overview': 'उत्पाद विवरण',
	    'product.spec.packing': 'पैकिंग साइज',
	    'product.spec.dosage': 'उपयोग निर्देश',
	    'product.spec.suitable': 'उपयुक्त',
	    'product.full_specs': 'पूर्ण स्पेसिफिकेशन',
	    'product.table.specification': 'स्पेसिफिकेशन',
	    'product.table.details': 'विवरण',
	    'product.tab.use': 'कैसे उपयोग करें',
	    'product.tab.benefits': 'मुख्य लाभ',
	    'product.tab.supply': 'बल्क सप्लाई',
	    'product.bulk.strip': 'पूरे भारत में बल्क सप्लाई उपलब्ध',
	    'product.badge.quality': 'प्रीमियम गुणवत्ता',
	    'product.badge.iso': 'ISO 9001 Certified',
	    'product.badge.yield': 'बेहतर उत्पादन',
	    'product.badge.science': 'वैज्ञानिक फॉर्मूलेशन',
	    'product.inquire': '<i class="fas fa-shopping-cart"></i> इस उत्पाद के बारे में पूछें',
	    'product.get_quote': '<i class="fab fa-whatsapp"></i> कोटेशन प्राप्त करें',
	    'product.send_inquiry': '<i class="fas fa-envelope"></i> पूछताछ भेजें',

    // Infrastructure and Quality
    'infra.hero.title': 'हमारा <span class="text-gradient">बुनियादी ढांचा</span>',
    'infra.hero.subtitle': 'बाराबंकी से agro-input, fertilizer, feed और bio-solution manufacturing support।',
    'infra.kicker': 'बाराबंकी सुविधा',
    'infra.title': 'उन्नत निर्माण इकाई',
    'infra.subtitle': 'हमारा infrastructure MLL Agro Industries led organic inputs, fertilizers, soil health products और group की feed तथा bio-agro categories को support करता है।',
    'infra.stage1.label': 'Stage 1',
    'infra.stage1.title': 'कच्चे माल / सामग्री हैंडलिंग',
    'infra.stage1.desc': 'उत्पादन से पहले आने वाली सामग्री को तौला, जांचा और अनुशासित स्टोरेज प्रक्रिया के साथ संभाला जाता है।',
    'infra.stage2.label': 'Stage 2',
    'infra.stage2.title': 'प्रोसेसिंग / निर्माण इकाई',
    'infra.stage2.desc': 'व्यावहारिक प्रोसेसिंग सिस्टम नियंत्रित blending, batch consistency और agro-input/feed categories में reliable output को समर्थन देते हैं।',
    'infra.stage3.label': 'Stage 3',
    'infra.stage3.title': 'पैकिंग / गुणवत्ता डिस्पैच',
    'infra.stage3.desc': 'Finished packs को जांचकर, सील करके, व्यवस्थित कर distributors, dealers और farming markets के लिए dispatch-ready किया जाता है।',
    'infra.footnote': 'भरोसेमंद गुणवत्ता, traceable handling और समय पर delivery के लिए बनाया गया practical manufacturing flow।',
    'quality.hero.title': 'गुणवत्ता <span class="text-gradient">मानक</span>',
    'quality.hero.subtitle': 'Agro inputs, fertilizers, feed और bio-agro products के लिए quality discipline।',
    'quality.lab.title': 'हमारी R&D प्रयोगशाला',
    'quality.lab.desc': 'Quality control MLL Agro input categories और group feed lines में raw material selection, formulation discipline और finished product checks को support करता है।',
    'quality.card.raw.title': 'कच्चे माल की जांच',
    'quality.card.raw.desc': 'Incoming materials को production से पहले suitability, handling condition और product-category requirements के आधार पर check किया जाता है।',
    'quality.card.formula.title': 'फॉर्मूलेशन सटीकता',
    'quality.card.formula.desc': 'Batch preparation defined formulations और controlled weighing practices follow करता है ताकि repeatable manufacturing output support हो।',
    'quality.card.qa.title': 'तैयार उत्पाद QA',
    'quality.card.qa.desc': 'Dealers और markets में dispatch से पहले finished packs की presentation, sealing, category fit और readiness review होती है।',
    'quality.cert.title': 'प्रमाणन',
    'quality.cert.iso': 'गुणवत्ता प्रबंधन',
    'quality.cert.fssai': 'Food Safety & Standards',

    // Footer additions
    'footer.business': 'व्यवसाय',
    'footer.business.inquiry': 'व्यावसायिक पूछताछ',
    'footer.business.distributor': 'वेंडर / डिस्ट्रीब्यूटर रजिस्ट्रेशन',
    'footer.business.grievance': 'शिकायत निवारण',
    'footer.business.career': 'करियर',
    'footer.business.export': 'निर्यात पूछताछ',
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
    if (translations[lang]) {
      this.currentLanguage = lang;
      localStorage.setItem('vansh_lang', lang);

      this.translatePage();
      this.translateProductNames();
      this.updateToggles();

      // Toggle Hindi CSS class on body for Devanagari typography
      document.body.classList.toggle('is-hindi', lang === 'hi');

      const siteLogo   = document.getElementById('site-logo');
      const footerLogo = document.getElementById('footer-logo');
      const logoSrc    = lang === 'hi' ? 'assets/logo_hi.png' : 'assets/logo_en.png';

      if (siteLogo)   siteLogo.src   = logoSrc;
      if (footerLogo) footerLogo.src = logoSrc;

      document.dispatchEvent(new CustomEvent('vansh:languagechange', { detail: { lang } }));
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
      const text = this.t(key);

      if (text) {
        // innerHTML supports the <span> tags used in titles and icon buttons
        el.innerHTML = text;
      }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const text = this.t(key);
      if (text) el.setAttribute('placeholder', text);
    });

    // Update the lang attribute on <html> for accessibility / SEO
    document.documentElement.lang = this.currentLanguage;
  },

  t: function(key) {
    return translations[this.currentLanguage][key] || translations.en[key] || '';
  },

  productName: function(slug, fallback) {
    const normalized = String(slug || '').replace(/-/g, '_');
    if (this.currentLanguage === 'hi' && productNames[normalized]) {
      return productNames[normalized];
    }
    return fallback || normalized.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  },

  translateProductNames: function() {
    document.querySelectorAll('[data-product-name]').forEach(el => {
      const slug = el.getAttribute('data-product-name');
      const original = el.getAttribute('data-product-fallback') || el.textContent.trim();
      if (!el.getAttribute('data-product-fallback')) {
        el.setAttribute('data-product-fallback', original);
      }
      el.textContent = this.productName(slug, original);
    });
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
    const siteLogo   = document.getElementById('site-logo');
    const footerLogo = document.getElementById('footer-logo');
    const logoSrc    = this.currentLanguage === 'hi' ? 'assets/logo_hi.png' : 'assets/logo_en.png';
    if (siteLogo)   siteLogo.src   = logoSrc;
    if (footerLogo) footerLogo.src = logoSrc;

    // Apply Hindi body class immediately on load if language is Hindi
    document.body.classList.toggle('is-hindi', this.currentLanguage === 'hi');

    this.translatePage();
    this.translateProductNames();
    this.updateToggles();

    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.setLanguage(e.target.dataset.lang);
      });
    });
  }
};

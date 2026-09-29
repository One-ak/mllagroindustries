'use strict';
const fs = require('node:fs');
const path = require('node:path');
const seo = require('../js/product-seo');
const { escapeHtml: esc } = require('../lib/product-page');
const root = path.join(__dirname, '..');
const products = JSON.parse(fs.readFileSync(path.join(root, 'assets/products.json'), 'utf8'));
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const write = (file, value) => fs.writeFileSync(path.join(root, file), value);
const productLink = p => 'product-detail.html?id=' + encodeURIComponent(seo.slug(p));

function replaceBlock(html, name, value) {
  const start = `<!-- ${name}:start -->`;
  const end = `<!-- ${name}:end -->`;
  const a = html.indexOf(start);
  const b = html.indexOf(end, a);
  if (a < 0 || b < 0) throw new Error('Missing generated block: ' + name);
  return html.slice(0, a + start.length) + '\n' + value + '\n' + html.slice(b);
}

function card(product) {
  const name = product.displayName || product.name;
  return `<article class="product-card">
  <div class="product-img-wrapper"><img src="${esc(product.image)}" alt="${esc(name)}" loading="lazy" decoding="async" width="320" height="320"></div>
  <div class="product-content"><span class="product-category">${esc(product.category || seo.categories[product.catalogGroup][0])}</span>
    <h3 class="product-title"><a href="${productLink(product)}">${esc(name)}</a></h3>
    ${product.price ? `<div class="product-price">${esc(product.price)}</div>` : ''}
    ${product.shortDescription ? `<p class="product-desc">${esc(product.shortDescription)}</p>` : ''}
    <div class="product-actions"><a class="btn-view" href="${productLink(product)}">View Details <i class="fas fa-arrow-right" aria-hidden="true"></i></a><a class="btn-inquiry" href="business.html">Send Inquiry</a></div>
  </div>
</article>`.replace(/[ \t]+$/gm, '');
}

let catalog = read('products.html');
for (const group of Object.keys(seo.categories)) {
  catalog = replaceBlock(catalog, 'catalog-' + group, products.filter(p => p.catalogGroup === group).slice(0, 8).map(card).join('\n'));
}
const directory = `<details class="catalog-directory"><summary>All ${products.length} products</summary>${Object.entries(seo.categories).map(([group, [name]]) => `<h3>${esc(name)}</h3><ul>${products.filter(p => p.catalogGroup === group).map(p => `<li><a href="${productLink(p)}">${esc(p.displayName || p.name)}</a></li>`).join('\n')}</ul>`).join('\n')}</details>`;
catalog = replaceBlock(catalog, 'catalog-directory', directory);
catalog = catalog.replace(/(<script type="application\/ld\+json">)[\s\S]*?(<\/script>)/, (_, a, b) => a + JSON.stringify({
  '@context': 'https://schema.org', '@graph': [
    { '@type': 'CollectionPage', '@id': seo.origin + '/products.html', name: 'MLL Agro Industries Product Catalog', url: seo.origin + '/products.html', mainEntity: { '@id': seo.origin + '/products.html#products' } },
    { '@type': 'ItemList', '@id': seo.origin + '/products.html#products', numberOfItems: products.length, itemListElement: products.map((p, i) => ({ '@type': 'ListItem', position: i + 1, name: p.displayName || p.name, url: seo.origin + '/' + productLink(p) })) },
    { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'MLL Agro Industries', item: seo.origin + '/' }, { '@type': 'ListItem', position: 2, name: 'Products', item: seo.origin + '/products.html' }] }
  ]
}, null, 2) + b);
write('products.html', catalog);

const categories = [
  {
    file: 'organic-fertilizers.html', name: 'Organic Fertilizers & Manure',
    title: 'Organic Fertilizers & Manure | MLL Agro Industries, Barabanki',
    description: 'Compare organic manure products, packing and application details from MLL Agro Industries in Barabanki. Contact the team for dealer and bulk supply inquiries.',
    intro: 'Browse the organic manure range in the MLL Agro Industries catalog. Product pages list available forms, packing sizes and application details so dealers and farm-input buyers can compare the range before requesting a quotation.',
    heading: 'Compare the product and packing before ordering',
    body: 'Green Phosh and Hariyali Gold have separate catalog entries. Open each product for its listed specifications; a category name alone does not establish composition or suitability for a particular crop. For a bulk order, share the product name, quantity, delivery location and required pack size with the Barabanki team.',
    filter: p => p.category === 'Organic Manure',
    related: ['fertilizer-manufacturer-uttar-pradesh.html', 'bio-fertilizer-manufacturer-india.html', 'micronutrient-fertilizers.html']
  },
  {
    file: 'micronutrient-fertilizers.html', name: 'Micronutrient Fertilizers',
    title: 'Micronutrient Fertilizers: Zinc & Boron | MLL Agro Industries',
    description: 'Explore zinc, boron and micronutrient fertilizer products from MLL Agro Industries, Barabanki. Compare listed specifications and request bulk supply details.',
    intro: 'Compare the zinc, boron and micronutrient products listed in the MLL Agro Industries catalog. These are different formulations, so choose by the product label and crop requirements rather than treating them as interchangeable.',
    heading: 'Details to include in a micronutrient inquiry',
    body: 'Share the nutrient or product name, required grade, packing size, quantity and delivery district. The catalog includes Zinc Sulphate Monohydrate, B-20% Boron and crop-specific micronutrient entries. Ask the team for the current product label and availability before placing an order; application guidance should follow that label and a qualified agronomist.',
    filter: p => /Micronutrients|Micronutrient|Zinc|Boron/.test(p.category || ''),
    related: ['fertilizer-manufacturer-uttar-pradesh.html', 'organic-fertilizers.html', 'agricultural-inputs-manufacturer.html']
  }
];
const base = read('fertilizer-manufacturer-uttar-pradesh.html');
const nav = base.slice(base.indexOf('<nav '), base.indexOf('</nav>') + 6);
const footer = base.slice(base.indexOf('<footer '), base.indexOf('</footer>') + 9);
for (const category of categories) {
  const items = products.filter(category.filter);
  const canonical = seo.origin + '/' + category.file;
  const schema = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'CollectionPage', '@id': canonical, url: canonical, name: category.name, description: category.description,
      mainEntity: { '@type': 'ItemList', numberOfItems: items.length, itemListElement: items.map((p, i) => ({ '@type': 'ListItem', position: i + 1, name: p.displayName || p.name, url: seo.origin + '/' + productLink(p) })) } },
    { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'MLL Agro Industries', item: seo.origin + '/' }, { '@type': 'ListItem', position: 2, name: 'Products', item: seo.origin + '/products.html' }, { '@type': 'ListItem', position: 3, name: category.name, item: canonical }] }
  ] };
  write(category.file, `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(category.title)}</title><meta name="description" content="${esc(category.description)}">
<meta name="robots" content="index, follow, max-image-preview:large"><link rel="canonical" href="${canonical}">
<link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png"><link rel="icon" href="/favicon.ico">
<meta property="og:type" content="website"><meta property="og:site_name" content="MLL Agro Industries">
<meta property="og:title" content="${esc(category.title)}"><meta property="og:description" content="${esc(category.description)}"><meta property="og:url" content="${canonical}">
<meta property="og:image" content="${seo.origin}/${items[0].image}"><meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(category.title)}"><meta name="twitter:description" content="${esc(category.description)}"><meta name="twitter:image" content="${seo.origin}/${items[0].image}">
<script type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>
<script src="js/theme-init.js?v=20260715-historyfix"></script>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&amp;family=Outfit:wght@500;700;900&amp;display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<link rel="stylesheet" href="css/styles.css?v=20260929-seo"><link rel="stylesheet" href="css/seo.css?v=20260929">
<noscript><style>.reveal,.reveal-left,.reveal-right,.reveal-scale{opacity:1;transform:none}</style></noscript>
</head><body>${nav}
<header class="landing-hero"><div class="container"><nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><a href="products.html">Products</a><span>/</span><span>${esc(category.name)}</span></nav>
<h1>${esc(category.name)}</h1><p>${esc(category.intro)}</p></div></header>
<main><section class="landing-section"><div class="container seo-products">${items.map(card).join('\n')}</div></section>
<section class="landing-section alt"><div class="container landing-copy"><h2>${esc(category.heading)}</h2><p>${esc(category.body)}</p>
<p>Factory and head office: 140/158, Village Palia Masudpur, Tehsil Nawabganj, Barabanki, Uttar Pradesh 225305.</p>
<p><a href="contact.html">Contact MLL Agro Industries</a> or call <a href="tel:+919670252525">+91 9670252525</a> for product and distributor inquiries.</p>
<nav class="seo-related" aria-label="Related categories">${category.related.map(file => `<a href="${file}">${esc(file.replace('.html', '').replace(/-/g, ' '))}</a>`).join('\n')}</nav>
</div></section></main>${footer}
<script src="js/i18n.js?v=20260929-seo"></script><script src="js/main.js?v=20260715-historyfix"></script>
</body></html>\n`);
}

const pages = fs.readdirSync(root).filter(file => file.endsWith('.html') && !['admin.html', 'product-detail.html'].includes(file) && !file.startsWith('google'));
const urls = pages.map(file => seo.origin + '/' + (file === 'index.html' ? '' : file));
urls.push(seo.origin + '/social/', ...products.map(p => seo.origin + '/' + productLink(p)));
// lastmod is deliberately omitted: generation time is not a content modification date.
write('sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + [...new Set(urls)].sort().map(url => `  <url><loc>${esc(url)}</loc></url>`).join('\n') + '\n</urlset>\n');
console.log(`SEO build: ${products.length} catalog products, ${categories.length} category pages, ${urls.length} sitemap URLs.`);

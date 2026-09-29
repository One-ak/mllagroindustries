'use strict';
const seo = require('../js/product-seo');

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

function json(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

function renderProductPage(template, product) {
  const meta = seo.metadata(product);
  let html = template.replace(/<title>[^<]*<\/title>/, () => `<title>${escapeHtml(meta.title)}</title>`);
  const attributes = {
    'product-meta-description': ['content', meta.description],
    'product-canonical': ['href', meta.canonical],
    'product-og-title': ['content', meta.title],
    'product-og-description': ['content', meta.description],
    'product-og-url': ['content', meta.canonical],
    'product-og-image': ['content', meta.image],
    'product-twitter-title': ['content', meta.title],
    'product-twitter-description': ['content', meta.description],
    'product-twitter-image': ['content', meta.image]
  };
  for (const [id, [attr, value]] of Object.entries(attributes)) {
    html = html.replace(new RegExp(`(<(?:meta|link) id="${id}"[^>]*${attr}=")[^"]*(")`), (_, before, after) => before + escapeHtml(value) + after);
  }
  html = html.replace(/(<script id="product-jsonld" type="application\/ld\+json">)[\s\S]*?(<\/script>)/, (_, before, after) => before + json(meta.schema) + after);
  const contents = {
    'header-product-name': meta.name,
    'detail-title': meta.name,
    'detail-desc': product.description || meta.description,
    'detail-packing': product.specs?.['Packaging Size'] || 'Contact us for packing options',
    'detail-dosage': 'Follow the product label and agronomist guidance',
    'detail-suitable': product.category || meta.category[0]
  };
  for (const [id, content] of Object.entries(contents)) {
    html = html.replace(new RegExp(`(<(?:h1|h2|p|strong)\\b[^>]*id="${id}"[^>]*>)[\\s\\S]*?(</(?:h1|h2|p|strong)>)`), (_, before, after) => before + escapeHtml(content) + after);
  }
  html = html.replace(/(<img id="detail-image" )src="" alt="Product Image"/, (_, before) => before + `src="${escapeHtml(product.image || 'assets/logo_en.png')}" alt="${escapeHtml(meta.name)}" fetchpriority="high" decoding="async"`);
  html = html.replace('<div class="product-detail-meta" id="detail-meta" hidden></div>', () => `<div class="product-detail-meta" id="detail-meta">${[product.category, product.price].filter(Boolean).map(value => `<span>${escapeHtml(value)}</span>`).join('')}</div>`);
  if (product.specs && Object.keys(product.specs).length) {
    html = html.replace('id="detail-spec-table-wrap" hidden', 'id="detail-spec-table-wrap"');
    html = html.replace(/(<tbody id="detail-spec-rows">)[\s\S]*?(<\/tbody>)/, (_, before, after) => before + Object.entries(product.specs).map(([key, value]) => `<tr><th scope="row">${escapeHtml(key)}</th><td>${escapeHtml(value)}</td></tr>`).join('') + after);
  }
  for (const [id, items] of Object.entries({ 'detail-use-list': product.use, 'detail-benefits-list': product.benefits })) {
    if (items?.length) html = html.replace(`<ul id="${id}"></ul>`, () => `<ul id="${id}">${items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`);
  }
  // Embed the one product already read by the server, avoiding a second catalog download.
  return html.replace('</head>', () => `<script id="product-data" type="application/json">${json(product)}</script>\n</head>`);
}

module.exports = { renderProductPage, escapeHtml };

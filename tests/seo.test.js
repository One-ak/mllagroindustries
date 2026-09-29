'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { spawn } = require('node:child_process');
const { createServer, get } = require('node:http');
const { once } = require('node:events');
const { gunzipSync } = require('node:zlib');
const os = require('node:os');
const { parseHTML } = require('linkedom');
const seo = require('../js/product-seo');
const { renderProductPage, escapeHtml } = require('../lib/product-page');
const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const products = JSON.parse(read('assets/products.json'));
const template = read('product-detail.html');
const htmlFiles = fs.readdirSync(root).filter(file => file.endsWith('.html'));

function jsonScripts(html) {
  const { document } = parseHTML(html);
  return [...document.querySelectorAll('script[type="application/ld+json"],script[type="application/json"]')].map(script => JSON.parse(script.textContent));
}

test('every product has a unique canonical slug and server-rendered content', () => {
  const slugs = products.map(seo.slug);
  assert.equal(new Set(slugs).size, products.length);
  for (const product of products) {
    const meta = seo.metadata(product);
    assert.ok(seo.matches(product, seo.slug(product).toUpperCase()));
    const html = renderProductPage(template, product);
    assert.ok(html.includes(`<title>${escapeHtml(meta.title)}</title>`));
    assert.match(html, new RegExp('id="header-product-name"[^>]*>' + escapeHtml(meta.name).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '<'));
    assert.ok(html.includes('href="' + meta.canonical + '"'));
    assert.ok(html.includes('src="' + escapeHtml(product.image) + '"'));
    assert.ok(!html.includes('>Loading...</'));
    assert.ok(jsonScripts(html).length >= 2);
    if (!product.image.startsWith('https://')) assert.ok(fs.existsSync(path.join(root, product.image)), product.image);
    const node = meta.schema['@graph'].find(item => item['@type'] === 'Product');
    if (seo.offer(product, meta.canonical)) {
      assert.equal(node.offers.priceCurrency, 'INR');
      assert.ok(Number(node.offers.price) > 0);
      assert.equal(node.offers.availability, undefined);
      assert.equal(node.aggregateRating, undefined);
      assert.equal(node.manufacturer, undefined);
    } else assert.equal(node, undefined);
  }
});

test('offers require an explicit positive INR unit price', () => {
  for (const price of ['', 'Call for price', '0', 'INR 0 / Kg', 'Rs. unknown', '$20 / Kg', 'INR 20-30 / Kg']) {
    assert.equal(seo.offer({ price }, seo.origin), null);
  }
  assert.equal(seo.offer({ price: 'INR 1,250.50 / Bag' }, seo.origin).price, '1250.50');
});

test('server rendering escapes HTML and embedded JSON without replacement-string expansion', () => {
  const product = { ...products[0], name: '<script>alert(1)</script> $& "x"', displayName: '<script>alert(1)</script> $& "x"', description: '</script><script>alert(2)</script>', specs: { '<b>': '" onerror="bad' } };
  const html = renderProductPage(template, product);
  assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt; $&amp; &quot;x&quot;'));
  assert.ok(!html.includes('<script>alert(2)</script>'));
  const embedded = html.match(/<script id="product-data" type="application\/json">([\s\S]*?)<\/script>/)[1];
  assert.deepEqual(JSON.parse(embedded), product);
});

test('static pages contain parseable JSON-LD and syntactically valid inline JavaScript', () => {
  for (const file of htmlFiles) {
    const html = read(file);
    jsonScripts(html);
    const { document } = parseHTML(html);
    for (const script of document.querySelectorAll('script')) {
      if (script.hasAttribute('src') || /application\/(?:ld\+json|json)/.test(script.type)) continue;
      new vm.Script(script.textContent, { filename: file });
    }
  }
});

test('catalog exposes every canonical product link without JavaScript', () => {
  const catalog = read('products.html');
  for (const product of products) assert.ok(catalog.includes('href="product-detail.html?id=' + seo.slug(product) + '"'));
  for (const file of ['organic-fertilizers.html', 'micronutrient-fertilizers.html']) {
    const html = read(file);
    assert.equal((html.match(/<h1\b/g) || []).length, 1);
    assert.match(html, /class="product-card"/);
    assert.match(html, /CollectionPage/);
    assert.doesNotMatch(html, /"@type":"Product"/);
  }
});

test('FAQ schema matches visible page questions and answers', () => {
  for (const file of htmlFiles) {
    const html = read(file);
    const { document } = parseHTML(html);
    if (!document.documentElement) continue;
    for (const script of document.querySelectorAll('script')) script.remove();
    const visibleText = document.body.textContent.replace(/\s+/g, ' ');
    const walk = node => {
      if (!node || typeof node !== 'object') return;
      if (node['@type'] === 'FAQPage') {
        for (const question of node.mainEntity) {
          assert.ok(visibleText.includes(question.name), file + ': ' + question.name);
          assert.ok(visibleText.includes(question.acceptedAnswer.text), file + ': missing visible answer');
        }
      }
      Object.values(node).forEach(walk);
    };
    jsonScripts(html).forEach(walk);
  }
});

test('public SEO routes serve valid content, canonical redirects and gzip', { timeout: 45000 }, async t => {
  const reserved = createServer();
  reserved.listen(0, '127.0.0.1');
  await once(reserved, 'listening');
  const port = reserved.address().port;
  await new Promise(resolve => reserved.close(resolve));
  const uploads = fs.mkdtempSync(path.join(os.tmpdir(), 'mll-seo-test-'));
  const child = spawn(process.execPath, ['server.js'], { cwd: root, env: { ...process.env, PORT: String(port), DB_PATH: ':memory:', CAREER_UPLOADS_PATH: uploads, ADMIN_PASSWORD: '', NODE_ENV: 'test' }, stdio: ['ignore', 'pipe', 'pipe'] });
  let output = '';
  child.stdout.on('data', chunk => { output += chunk; });
  child.stderr.on('data', chunk => { output += chunk; });
  t.after(async () => {
    if (child.exitCode === null) { child.kill('SIGTERM'); await once(child, 'exit'); }
    fs.rmSync(uploads, { recursive: true, force: true });
  });
  const origin = 'http://127.0.0.1:' + port;
  for (let i = 0; i < 100 && !output.includes('server listening'); i++) {
    if (child.exitCode !== null) assert.fail(output);
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  assert.match(output, /server listening/);
  const sitemap = await fetch(origin + '/sitemap.xml');
  assert.equal(sitemap.status, 200);
  assert.match(sitemap.headers.get('content-type'), /^application\/xml/);
  const xml = await sitemap.text();
  assert.ok(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>'));
  assert.match(xml, /xmlns="http:\/\/www.sitemaps.org\/schemas\/sitemap\/0.9"/);
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].replace(/&amp;/g, '&'));
  assert.equal(new Set(urls).size, urls.length);
  assert.ok(urls.includes(seo.origin + '/'));
  assert.equal(urls.filter(url => url.includes('product-detail')).length, products.length);
  const internalLinks = new Set();
  for (const url of urls) {
    const pathname = url.slice(seo.origin.length);
    const res = await fetch(origin + pathname, { redirect: 'manual' });
    assert.equal(res.status, 200, pathname);
    const html = await res.text();
    assert.doesNotMatch(html, /name="robots" content="noindex/, pathname);
    assert.ok(html.includes('rel="canonical"'), pathname);
    jsonScripts(html);
    const { document } = parseHTML(html);
    assert.equal(document.querySelector('link[rel="canonical"]').getAttribute('href'), url, pathname);
    for (const link of document.querySelectorAll('a[href]')) {
      const href = new URL(link.getAttribute('href'), url);
      if (href.origin === seo.origin && /\/(?:[^/]+\.html)?$/.test(href.pathname)) internalLinks.add(href.pathname + href.search);
    }
  }
  for (const pathname of internalLinks) {
    const res = await fetch(origin + pathname);
    assert.equal(res.status, 200, 'Internal link: ' + pathname);
  }
  for (const [url, location] of [['/index.html?source=test', '/?source=test'], ['/social/index.html', '/social/'], ['/product-detail.html', '/products.html'], ['/product-detail.html?id=' + seo.slug(products[0]).toUpperCase(), '/product-detail.html?id=' + seo.slug(products[0])]]) {
    const res = await fetch(origin + url, { redirect: 'manual' });
    assert.equal(res.status, 301, url);
    assert.equal(res.headers.get('location'), location);
  }
  assert.equal((await fetch(origin + '/product-detail.html?id=not-a-product')).status, 404);
  for (const url of ['/server.js', '/lib/product-page.js', '/scripts/build-seo.js', '/tests/seo.test.js', '/package.json', '/.env']) {
    assert.equal((await fetch(origin + url)).status, 404, url);
  }
  const compressed = await new Promise((resolve, reject) => {
    get(origin + '/products.html', { headers: { 'Accept-Encoding': 'gzip' } }, res => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve({ headers: res.headers, body: Buffer.concat(chunks) }));
    }).on('error', reject);
  });
  assert.equal(compressed.headers['content-encoding'], 'gzip');
  const decoded = gunzipSync(compressed.body);
  assert.ok(decoded.length > compressed.body.length * 2);
  console.log(`Catalog transfer: ${decoded.length} bytes HTML -> ${compressed.body.length} bytes gzip`);
});

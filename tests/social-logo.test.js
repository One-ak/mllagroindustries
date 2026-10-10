const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const { parseHTML } = require('linkedom');

const socialDir = path.join(__dirname, '..', 'social');

test('Fish Gold uses the shared Vansh logo without changing social destinations', () => {
  const data = JSON.parse(fs.readFileSync(path.join(socialDir, 'data.json'), 'utf8'));
  const company = data.companies.find(item => item.id === 'fish-gold');
  const post = data.posts.find(item => item.id === 'fish-gold');

  assert.equal(company.icon, 'VanshLogo');
  assert.equal(post.icon, 'VanshLogo');
  assert.equal(post.links[0].icon, 'VanshLogo');
  assert.equal(post.links[0].url, 'https://www.fishgoldindustries.com/');
  assert.equal(post.links[1].icon, 'FaInstagram');
  assert.equal(post.links[1].url, 'https://www.instagram.com/fishgoldindustries_official/reels/?hl=en');
  assert.equal(data.companies.length, 5);
  assert.equal(data.posts.length, 6);
  assert.equal(data.posts.reduce((count, item) => count + item.links.length, 0), 10);

  const logo = fs.readFileSync(path.join(socialDir, 'vansh-group-logo.png'));
  assert.equal(logo.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
});

test('Shared logos update on initial and dynamic rendering, leaving MLL unchanged', () => {
  const { document, window } = parseHTML(`<!doctype html><html><body>
    <img class="avatar-img" src="./logo.png" alt="Vansh Group Logo">
    <a class="company-card"><div class="company-icon"><img src="./logo.png" alt="Vansh Logo"></div><h4>Fish Gold Industries</h4></a>
    <article class="post-card"><h3>Fish Gold Industries</h3><div class="post-avatar"><img src="./logo.png" alt="Vansh Logo"></div></article>
    <div class="post-avatar"><img src="./mll-logo.png" alt="MLL Agro Logo"></div>
  </body></html>`);
  let onMutation;
  const context = {
    document,
    navigator: {},
    window: { addEventListener() {} },
    MutationObserver: class {
      constructor(callback) { onMutation = callback; }
      observe() {}
    }
  };

  vm.runInNewContext(fs.readFileSync(path.join(socialDir, 'social-hub-enhancements.js'), 'utf8'), context);
  document.dispatchEvent(new window.Event('DOMContentLoaded'));

  const avatar = document.querySelector('.avatar-img');
  assert.equal(avatar.getAttribute('src'), './vansh-group-logo.png');
  assert.equal(avatar.alt, 'Vansh Group logo');
  for (const logo of document.querySelectorAll('.company-card img, .post-card img')) {
    assert.equal(logo.getAttribute('src'), './vansh-group-logo.png');
    assert.equal(logo.alt, 'Fish Gold Industries logo');
    assert.ok(logo.parentElement.classList.contains('social-brand-logo-holder'));
  }
  const mllLogo = document.querySelector('img[alt="MLL Agro Logo"]');
  assert.equal(mllLogo.getAttribute('src'), './mll-logo.png');
  assert.ok(!mllLogo.parentElement.classList.contains('social-brand-logo-holder'));

  const card = document.createElement('article');
  card.className = 'post-card';
  card.innerHTML = '<h3>Fish Gold Industries</h3><div class="post-avatar"><img src="./logo.png" alt="Vansh Logo"></div>';
  document.body.append(card);
  onMutation([{ addedNodes: [card] }]);
  const logo = card.querySelector('img');
  assert.equal(logo.getAttribute('src'), './vansh-group-logo.png');
  assert.equal(logo.alt, 'Fish Gold Industries logo');
  assert.ok(logo.parentElement.classList.contains('social-brand-logo-holder'));
  onMutation([{ addedNodes: [logo] }]);
  assert.equal(logo.className, 'social-brand-logo');
});

test('Gaon Dehat and MLL heading logos work with cached icons and leave MLL website icons untouched', () => {
  const data = JSON.parse(fs.readFileSync(path.join(socialDir, 'data.json'), 'utf8'));
  assert.equal(data.companies.find(item => item.id === 'mll-agro').icon, 'MllLogo');
  assert.equal(data.posts.find(item => item.id === 'mll-agro').icon, 'MllLogo');
  const gaonLogo = fs.readFileSync(path.join(socialDir, 'gaon-dehat-logo.jpg'));
  assert.equal(gaonLogo.subarray(0, 2).toString('hex'), 'ffd8');

  const { document, window } = parseHTML(`<!doctype html><html><body>
    <a class="company-card mll"><div class="company-icon"><svg></svg></div><h4>MLL Agro Industries</h4></a>
    <article class="post-card mll"><h3>MLL Agro Industries</h3>
      <div class="post-avatar"><img src="./mll-logo.png" alt="MLL Agro Logo"></div>
      <div class="link-icon-wrapper"><img src="./mll-logo.png" alt="MLL Agro Logo"></div>
    </article>
    <a class="company-card gaon"><div class="company-icon"><svg></svg></div><h4>Gaon Dehat</h4></a>
    <article class="post-card gaon"><h3>Gaon Dehat</h3>
      <div class="post-avatar"><svg></svg></div><div class="link-icon-wrapper"><svg></svg></div>
    </article>
    <a class="company-card nvba"><div class="company-icon"><svg></svg></div><h4>New Vanshika Bio Agro</h4></a>
  </body></html>`);
  let onMutation;
  vm.runInNewContext(fs.readFileSync(path.join(socialDir, 'social-hub-enhancements.js'), 'utf8'), {
    document,
    navigator: {},
    window: { addEventListener() {} },
    MutationObserver: class {
      constructor(callback) { onMutation = callback; }
      observe() {}
    }
  });
  document.dispatchEvent(new window.Event('DOMContentLoaded'));

  const mllWebsiteLogo = document.querySelector('.mll .link-icon-wrapper img');
  assert.equal(mllWebsiteLogo.getAttribute('src'), './mll-logo.png');
  assert.equal(mllWebsiteLogo.className, '');
  assert.equal(document.querySelectorAll('.mll .social-brand-logo').length, 2);
  assert.equal(document.querySelectorAll('.gaon .social-brand-logo').length, 3);
  for (const logo of document.querySelectorAll('.gaon img')) {
    assert.equal(logo.getAttribute('src'), './gaon-dehat-logo.jpg');
    assert.equal(logo.alt, 'Gaon Dehat logo');
    const holder = logo.parentElement;
    onMutation([{ addedNodes: [holder] }]);
    assert.equal(holder.querySelector('img'), logo);
  }
  assert.equal(document.querySelectorAll('.gaon svg').length, 0);
  assert.ok(document.querySelector('.nvba svg'));
});

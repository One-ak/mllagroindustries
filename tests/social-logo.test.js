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
    <img src="./mll-logo.png" alt="MLL Agro Logo">
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
  }
  assert.equal(document.querySelector('img[alt="MLL Agro Logo"]').getAttribute('src'), './mll-logo.png');

  const card = document.createElement('article');
  card.className = 'post-card';
  card.innerHTML = '<h3>Fish Gold Industries</h3><img src="./logo.png" alt="Vansh Logo">';
  document.body.append(card);
  onMutation([{ addedNodes: [card] }]);
  const logo = card.querySelector('img');
  assert.equal(logo.getAttribute('src'), './vansh-group-logo.png');
  assert.equal(logo.alt, 'Fish Gold Industries logo');
  onMutation([{ addedNodes: [logo] }]);
  assert.equal(logo.className, 'social-brand-logo');
});

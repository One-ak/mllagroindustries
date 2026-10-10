const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { parseHTML } = require('linkedom');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'social', 'data.json'), 'utf8'));

test('Facebook pages and accounts are distinct and grouped with the right company', () => {
  const expected = [
    ['fish-gold', 'https://www.facebook.com/FishGoldIndustries/', 'Facebook Page | @FishGoldIndustries'],
    ['fish-gold', 'https://www.facebook.com/profile.php?id=61580322426164', 'Facebook Account | Fish Gold Industries'],
    ['nvba', 'https://www.facebook.com/nvbaipl', 'Facebook Page | @nvbaipl'],
    ['nvba', 'https://www.facebook.com/newvanshika.bioagro.5/', 'Facebook Account | @newvanshika.bioagro.5']
  ];

  for (const [companyId, url, label] of expected) {
    const group = data.posts.find(post => post.id === companyId);
    const link = group.links.find(item => item.url === url);
    assert.ok(link, `${url} belongs in ${companyId}`);
    assert.equal(link.label, label);
    assert.equal(link.icon, 'FaFacebook');
    assert.ok(!data.posts.find(post => post.id === 'leadership').links.some(item => item.url === url));
  }
});

test('Profile totals reflect all websites and social destinations with no duplicate URLs', () => {
  const links = data.posts.flatMap(post => post.links);
  const socialHosts = new Set(['www.facebook.com', 'www.instagram.com', 'x.com']);
  const socialCount = links.filter(link => socialHosts.has(new URL(link.url).hostname)).length;
  assert.equal(new Set(links.map(link => link.url)).size, links.length);
  assert.equal(links.length, 13);
  assert.equal(socialCount, 9);
  assert.equal(data.profile.stats.find(stat => stat.label === 'Social Profiles').value, String(socialCount));
  assert.equal(data.profile.stats.find(stat => stat.label === 'Official Websites').value, String(links.length - socialCount));
});

test('The existing app only changes its data URL so cached lists cannot hide new Facebook links', () => {
  const socialDir = path.join(__dirname, '..', 'social');
  const { document } = parseHTML(fs.readFileSync(path.join(socialDir, 'index.html'), 'utf8'));
  const scriptPath = document.querySelector('script[type="module"]').getAttribute('src');
  const activeBuild = fs.readFileSync(path.join(socialDir, scriptPath), 'utf8');
  const originalBuild = fs.readFileSync(path.join(socialDir, 'assets', 'index-B-bGaZVP.js'), 'utf8');
  assert.ok(activeBuild.includes('fetch(`./data.json?v=facebook-20261010`)'));
  assert.equal(activeBuild.replace('fetch(`./data.json?v=facebook-20261010`)', 'fetch(`./data.json`)'), originalBuild);
});

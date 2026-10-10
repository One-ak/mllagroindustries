'use strict';

const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const bundledRuntime = path.join(os.homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node');
const sharp = require(require.resolve('sharp', { paths: [__dirname, bundledRuntime] }));
const social = path.join(__dirname, '..', 'social');
const gaonLogo = process.argv[2] || path.join(os.homedir(), 'Desktop/vansh group documents/gao-dehat-logo.jpg');

const images = [
  { source: 'bg-leaf.png', output: 'bg-leaf.webp', size: 600, quality: 82 },
  { source: 'bg-seed.png', output: 'bg-seed.webp', size: 600, quality: 82 },
  { source: 'cover.png', output: 'cover.webp', size: 1400, quality: 85 },
  { source: 'logo.png', output: 'logo.webp', size: 256, lossless: true },
  { source: 'mll-logo.png', output: 'mll-logo.webp', size: 256, lossless: true },
  { source: 'black-gold.jpg', output: 'black-gold.webp', size: 400, quality: 88 },
  { source: 'vansh-pro-8000.jpg', output: 'vansh-pro-8000.webp', size: 400, quality: 88 },
  { source: 'cattle-feed.jpg', output: 'cattle-feed.webp', size: 400, quality: 88 },
  { source: 'hero-product-supreme.jpg', output: 'hero-product-supreme.webp', size: 700, quality: 88 },
  { source: gaonLogo, output: 'gaon-dehat-logo.webp', size: 256, quality: 90 }
];

async function main() {
  let originalBytes = 0;
  let optimizedBytes = 0;

  console.log('Output\tDimensions\tOriginal bytes\tOptimized bytes');

  for (const image of images) {
    const source = path.resolve(social, image.source);
    const original = await fs.stat(source);
    // Bound both dimensions without cropping, upscaling, or flattening alpha.
    const { data, info } = await sharp(source)
      .autoOrient()
      .resize({ width: image.size, height: image.size, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: image.quality, lossless: image.lossless, alphaQuality: 100, effort: 6 })
      .toBuffer({ resolveWithObject: true });

    if (data.length >= original.size) {
      throw new Error(`${image.output} is not smaller than its source; no copy was written.`);
    }

    await fs.writeFile(path.join(social, image.output), data);
    originalBytes += original.size;
    optimizedBytes += data.length;
    console.log(`social/${image.output}\t${info.width}x${info.height}\t${original.size}\t${data.length}`);
  }

  const saved = originalBytes - optimizedBytes;
  console.log(`Total: ${originalBytes} -> ${optimizedBytes} bytes; saved ${saved} bytes (${(saved / originalBytes * 100).toFixed(2)}%).`);
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});

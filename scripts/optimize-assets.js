// scripts/optimize-assets.js
const imagemin = require('imagemin');
const imageminPngquant = require('imagemin-pngquant');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminWebp = require('imagemin-webp');
const fs = require('fs');
const path = require('path');

const inputDir = path.join(__dirname, '../public/media');
const outputDir = path.join(__dirname, '../public/media/optimized');

// Clean output directory
if (fs.existsSync(outputDir)) {
  fs.rmSync(outputDir, { recursive: true, force: true });
}
fs.mkdirSync(outputDir, { recursive: true });

(async () => {
  // Optimize PNG and JPEG
  await imagemin([`${inputDir}/*.{png,jpg,jpeg}`], {
    destination: outputDir,
    plugins: [
      imageminPngquant({ quality: [0.6, 0.8] }),
      imageminMozjpeg({ quality: 75 })
    ]
  });

  // Generate WebP versions
  await imagemin([`${inputDir}/*.{png,jpg,jpeg}`], {
    destination: outputDir,
    plugins: [
      imageminWebp({ quality: 75 })
    ]
  });

  console.log('Assets optimized and WebP versions generated in', outputDir);
})();
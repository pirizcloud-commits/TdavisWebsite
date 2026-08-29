import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceDir = path.join(__dirname, 'source-images', 'events');
const targetDir = path.join(__dirname, 'public', 'images', 'events');

// Single width set for BOTH orientations. The rendered width (640/960/1440)
// is meaningful for portrait and landscape alike, and keeping one convention
// guarantees the generated filenames stay consistent with the <picture> markup
// in Events.jsx / Home.jsx (which reference 640/960/1440w for every photo).
// Orientation is still detected — accurately, EXIF-aware — but it drives only
// reporting and the no-upscale guard, not the width set.
const responsiveWidths = [640, 960, 1440];
const formats = ['avif', 'webp', 'jpeg'];

async function optimizeImages() {
  if (!fs.existsSync(sourceDir)) {
    console.error(`Error: Source directory missing: ${sourceDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(sourceDir).filter(f => f.endsWith('.jpeg') || f.endsWith('.jpg') || f.endsWith('.png'));

  if (files.length === 0) {
    console.error(`Error: No images found in ${sourceDir}`);
    process.exit(1);
  }

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  let totalOriginalSize = 0;
  let totalOptimizedSize = 0;

  console.log('Starting image optimization...\n');

  for (const file of files) {
    const filePath = path.join(sourceDir, file);
    const parsed = path.parse(file);
    const name = parsed.name;

    const stat = fs.statSync(filePath);
    const originalSize = stat.size;
    totalOriginalSize += originalSize;

    const image = sharp(filePath);
    const metadata = await image.metadata();

    // EXIF orientation values 5–8 indicate a 90° rotation, so the *displayed*
    // (post-.rotate()) dimensions are swapped relative to the stored buffer.
    // Classify orientation and compute the no-upscale limit from those
    // effective dimensions so both are correct even for rotated photos.
    const orientation = metadata.orientation || 1;
    const rotated = orientation >= 5;
    const displayWidth = rotated ? metadata.height : metadata.width;
    const displayHeight = rotated ? metadata.width : metadata.height;
    const isPortrait = displayHeight > displayWidth;
    const widths = responsiveWidths;

    console.log(`Processing ${file} (${isPortrait ? 'Portrait' : 'Landscape'}, orientation=${orientation}) - Original Size: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);

    for (const width of widths) {
      if (width > displayWidth) {
        console.log(`  Skipping ${width}w (original is smaller)`);
        continue;
      }

      for (const format of formats) {
        const outName = `${name}-${width}w.${format}`;
        const outPath = path.join(targetDir, outName);

        const pipeline = sharp(filePath).rotate().resize({ width, withoutEnlargement: true });

        if (format === 'avif') pipeline.avif({ quality: 75 });
        if (format === 'webp') pipeline.webp({ quality: 80 });
        if (format === 'jpeg') pipeline.jpeg({ quality: 80, progressive: true });

        let outSize = 0;
        if (fs.existsSync(outPath)) {
            outSize = fs.statSync(outPath).size;
            totalOptimizedSize += outSize;
            console.log(`  [Exists] ${outName} - ${(outSize / 1024).toFixed(1)} KB`);
        } else {
            const buffer = await pipeline.toBuffer();
            fs.writeFileSync(outPath, buffer);
            outSize = buffer.length;
            totalOptimizedSize += outSize;
            console.log(`  [Generated] ${outName} - ${(outSize / 1024).toFixed(1)} KB`);
            
            if (outSize > 500 * 1024) {
               console.warn(`  WARNING: ${outName} exceeds 500KB!`);
            }
        }
      }
    }
    console.log('');
  }

  console.log('--- Optimization Report ---');
  console.log(`Total Original Size: ${(totalOriginalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Total Optimized Size: ${(totalOptimizedSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Size Reduction: ${((1 - totalOptimizedSize / totalOriginalSize) * 100).toFixed(1)}%`);
}

optimizeImages().catch(err => {
  console.error("Optimization failed:", err);
  process.exit(1);
});

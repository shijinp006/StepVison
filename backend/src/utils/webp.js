import sharp from 'sharp';

const WEBP_QUALITY = 80;

// sharp's cache keeps source files open, which stops them being deleted on
// Windows after conversion. Each image is only processed once anyway.
sharp.cache(false);

// Converts an image (file path or buffer) to WebP and writes it to outputPath.
// Animated GIFs stay animated; photos are turned upright using their EXIF data.
export async function convertToWebp(input, outputPath) {
    await sharp(input, { animated: true })
        .rotate()
        .webp({ quality: WEBP_QUALITY })
        .toFile(outputPath);
}

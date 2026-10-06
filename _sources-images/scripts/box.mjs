import sharp from 'sharp'
// Loading screen: the box of the game (Naishi-box-left.png) at 640 px, in PNG and WebP.
// The game shows the picture in a square: the box is centered in a transparent 640 × 640 square so that it is not stretched.
const src = '_sources-images/Naishi-box-left.png'
const info = await sharp(src).metadata()
console.log('source', info.width, info.height, info.hasAlpha)
const base = sharp(src)
  .trim()
  .resize({ width: 640, height: 640, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
await base.clone().png({ compressionLevel: 9 }).toFile('app/public/box-640.png')
await base.clone().webp({ quality: 88 }).toFile('app/public/box-640.webp')
const out = await sharp('app/public/box-640.png').metadata()
console.log('box-640', out.width, out.height)

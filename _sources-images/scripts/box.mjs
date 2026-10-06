import sharp from 'sharp'
// Loading screen: the box of the game (Naishi-box-left.png, trimmed of its transparent margin) at 640 px, in PNG and WebP
const src = '_sources-images/Naishi-box-left.png'
const info = await sharp(src).metadata()
console.log('source', info.width, info.height, info.hasAlpha)
const base = sharp(src).trim().resize({ width: 640 })
await base.clone().png({ compressionLevel: 9 }).toFile('app/public/box-640.png')
await base.clone().webp({ quality: 88 }).toFile('app/public/box-640.webp')
const out = await sharp('app/public/box-640.png').metadata()
console.log('box-640', out.width, out.height)

import sharp from 'sharp'
import fs from 'fs'
// Game Park images of the game, given in _sources-images: the cover (1920 × 1080), the avatar (320 × 320) and the favicon (320 × 320, transparent)
const src = '_sources-images'
const out = 'app/public'
const png = (size) => sharp(`${src}/avatar.jpg`).resize(size, size).png({ compressionLevel: 9 })

await sharp(`${src}/cover.jpg`).resize(1920, 1080).jpeg({ quality: 90, mozjpeg: true }).toFile(`${out}/cover-1920.jpg`)
await sharp(`${src}/cover.jpg`).resize(1920, 1080).webp({ quality: 85 }).toFile(`${out}/cover-1920.webp`)
for (const size of [320, 96, 64]) await png(size).toFile(`${out}/avatar-${size}.png`)

// Favicon: favicon.png (320 × 320, transparent), as PNG (96 px), SVG (the picture embedded) and ICO (16, 32 and 48 px, PNG inside)
const favicon = (size) => sharp(`${src}/favicon.png`).resize(size, size).png({ compressionLevel: 9 })
await favicon(96).toFile(`${out}/favicon-96x96.png`)
const embedded = (await favicon(256).toBuffer()).toString('base64')
fs.writeFileSync(
  `${out}/favicon.svg`,
  `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="256" height="256" viewBox="0 0 256 256"><image width="256" height="256" xlink:href="data:image/png;base64,${embedded}"/></svg>
`
)
const sizes = [16, 32, 48]
const images = await Promise.all(sizes.map((size) => favicon(size).toBuffer()))
const header = Buffer.alloc(6)
header.writeUInt16LE(0, 0)
header.writeUInt16LE(1, 2)
header.writeUInt16LE(sizes.length, 4)
let offset = 6 + 16 * sizes.length
const entries = images.map((image, i) => {
  const entry = Buffer.alloc(16)
  entry.writeUInt8(sizes[i], 0)
  entry.writeUInt8(sizes[i], 1)
  entry.writeUInt16LE(1, 4)
  entry.writeUInt16LE(32, 6)
  entry.writeUInt32LE(image.length, 8)
  entry.writeUInt32LE(offset, 12)
  offset += image.length
  return entry
})
fs.writeFileSync(`${out}/favicon.ico`, Buffer.concat([header, ...entries, ...images]))
console.log('done')

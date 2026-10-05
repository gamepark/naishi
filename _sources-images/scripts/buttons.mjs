import fs from 'fs'
import sharp from 'sharp'
// Buttons with the symbol of a player and an arrow: the sources have the arrow down, the arrow up versions are made by turning the image
// upside down and putting the symbol back upright in the ring.
// Usage: node buttons.mjs <sources folder> <images folder>
const [S, OUT] = process.argv.slice(2)
const sources = { flower: `${S}/fleur-noire-fléchée.png`, tomoe: `${S}/tomoe-blanc-fléché.png` }
const size = 355
const ringCenter = Math.floor(size / 2)
const inner = 150 // radius of what is inside the ring
fs.mkdirSync(`${OUT}/buttons`, { recursive: true })
for (const [name, file] of Object.entries(sources)) {
  const source = fs.readFileSync(file)
  const { height } = await sharp(source).metadata()
  fs.writeFileSync(`${OUT}/buttons/${name}-down.png`, source)
  const mask = Buffer.from(`<svg width="${2 * inner}" height="${2 * inner}"><circle cx="${inner}" cy="${inner}" r="${inner}" fill="white"/></svg>`)
  const upright = await sharp(source)
    .extract({ left: ringCenter - inner, top: ringCenter - inner, width: 2 * inner, height: 2 * inner })
    .composite([{ input: mask, blend: 'dest-in' }])
    .png()
    .toBuffer()
  const up = await sharp(source)
    .rotate(180)
    .composite([{ input: upright, left: ringCenter - inner, top: height - ringCenter - inner }])
    .png()
    .toBuffer()
  fs.writeFileSync(`${OUT}/buttons/${name}-up.png`, up)
}

import fs from 'fs'
import sharp from 'sharp'
const [S, OUT] = process.argv.slice(2)
const L = 75, T = 75, W = 629, H = 879
const base = 'full/55-cards-63x88-Naishi-recto-R5-FRONT', ext = 'full/14-cards-63x88-Naishi-EXT-LV-recto-R1'
const pad = n => String(n).padStart(2, '0')
async function card(src, dst, { erase = true } = {}) {
  let img = sharp(src).extract({ left: L, top: T, width: W, height: H })
  const buf = await img.png().toBuffer()
  const { data, info } = await sharp(buf).raw().toBuffer({ resolveWithObject: true })
  if (erase) {
    // cream colour sampled just right of the annotation
    let r = 0, g = 0, b = 0, n = 0
    for (let y = 822; y < 870; y++) for (let x = 118; x < 133; x++) { const i = (y * W + x) * 3; r += data[i]; g += data[i + 1]; b += data[i + 2]; n++ }
    const c = [r / n, g / n, b / n].map(Math.round)
    for (let y = 822; y < 870; y++) for (let x = 8; x < 110; x++) {
      const i = (y * W + x) * 3
      if (data[i] + data[i + 1] + data[i + 2] < 690) { data[i] = c[0]; data[i + 1] = c[1]; data[i + 2] = c[2] }
    }
  }
  fs.mkdirSync(dst.replace(/\/[^/]*$/, ''), { recursive: true })
  await sharp(data, { raw: { width: W, height: H, channels: 3 } }).jpeg({ quality: 85, mozjpeg: true }).toFile(dst)
}
const baseMap = { mountain: 1, naishi: 17, advisor: 19, fortress: 23, sentinel: 27, torii: 31, monk: 35, rice: 38, banner: 42, horseman: 43, ronin: 47, ninja: 49 }
for (const [k, p] of Object.entries(baseMap)) await card(`${S}/${base}/p${pad(p)}.png`, `${OUT}/cards/base/${k}.jpg`)
const legends = { naishi: 1, sentinel: 2, advisor: 3, horseman: 4, monk: 5, ronin: 6, ninja: 7 }
for (const [k, p] of Object.entries(legends)) await card(`${S}/${ext}/p${pad(p)}.png`, `${OUT}/cards/legends/${k}.jpg`)
for (let i = 1; i <= 6; i++) await card(`${S}/${ext}/p${pad(i + 7)}.png`, `${OUT}/cards/travellers/traveller-${i}.jpg`)
await card(`${S}/${ext}/p14.png`, `${OUT}/cards/ryokan-4.jpg`, { erase: false })
await card(`${S}/full/14-cards-63x88-Naishi-EXT-LV-verso-R1/p15.png`, `${OUT}/cards/ryokan-7.jpg`, { erase: false })
await card(`${S}/full/back/p01.png`, `${OUT}/cards/back.jpg`, { erase: false })
// back check: base back 1,2,50 and ext back 1 identical?
const h = async f => (await sharp(f).extract({ left: L, top: T, width: W, height: H }).raw().toBuffer()).toString('base64').length + ':' + (await sharp(f).extract({ left: L, top: T, width: W, height: H }).raw().toBuffer()).subarray(200000, 200040).toString('hex')
console.log(await h(`${S}/full/back/p01.png`), await h(`${S}/full/back/p02.png`), await h(`${S}/full/back/p50.png`), await h(`${S}/full/14-cards-63x88-Naishi-EXT-LV-verso-R1/p01.png`))

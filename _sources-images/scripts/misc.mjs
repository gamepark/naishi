import fs from 'fs'
import sharp from 'sharp'
import { withShadow } from './shadow.mjs'
const [S, OUT] = process.argv.slice(2)
fs.mkdirSync(`${OUT}/tokens`, { recursive: true }); fs.mkdirSync(`${OUT}/scorepad`, { recursive: true })

// ---- first player marker: cut out the inset, rounded artwork
async function marker(src, dst) {
  const { data, info } = await sharp(src).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  const { width: w, height: h } = info
  const barrier = i => (data[i * 3] + data[i * 3 + 1] + data[i * 3 + 2]) / 3 < 150
  const outside = new Uint8Array(w * h); const q = [0]; outside[0] = 1
  for (let k = 0; k < q.length; k++) { const p = q[k], x = p % w, y = (p / w) | 0
    for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) { if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue; const n = ny * w + nx; if (!outside[n] && !barrier(n)) { outside[n] = 1; q.push(n) } } }
  const alpha = Buffer.alloc(w * h); let x0 = w, y0 = h, x1 = 0, y1 = 0
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const on = !outside[y * w + x]; alpha[y * w + x] = on ? 255 : 0; if (on) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y) } }
  const soft = await sharp(alpha, { raw: { width: w, height: h, channels: 1 } }).blur(0.8).extractChannel(0).raw().toBuffer()
  const full = await sharp(await sharp(src).removeAlpha().toBuffer()).joinChannel(soft, { raw: { width: w, height: h, channels: 1 } }).png().toBuffer()
  const cut = await sharp(full).extract({ left: x0, top: y0, width: x1 - x0 + 1, height: y1 - y0 + 1 }).png().toBuffer()
  const r = await withShadow(cut, 'cardboard')
  fs.writeFileSync(dst, r.out)
  console.log(dst.split('/').pop(), 'art', x1 - x0 + 1, y1 - y0 + 1, 'canvas', r.width, r.height, 'margin', r.margin)
}
await marker(`${S}/fp-black.png`, `${OUT}/cards/first-player-black.png`)
await marker(`${S}/fp-white.png`, `${OUT}/cards/first-player-white.png`)

// ---- score pad: keep the top-left block only
{
  const f = `${S}/full/bloc-score-Naishi/p01.png`
  const { data, info } = await sharp(f).greyscale().raw().toBuffer({ resolveWithObject: true })
  const { width: w, height: h } = info
  let x0 = w, y0 = h, x1 = 0, y1 = 0
  for (let y = 80; y < h / 2; y++) for (let x = 80; x < w / 2; x++) if (data[y * w + x] < 235) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y) }
  console.log('scorepad bbox', x0, y0, x1, y1, x1 - x0 + 1, y1 - y0 + 1)
  await sharp(f).extract({ left: x0, top: y0, width: x1 - x0 + 1, height: y1 - y0 + 1 }).jpeg({ quality: 85, mozjpeg: true }).toFile(`${OUT}/scorepad/scorepad.jpg`)
}

// ---- emissary tokens (20 mm, 200 px), disk + art
async function token(src, dst, invert) {
  const D = 200
  const art = await sharp(src).greyscale().resize(D, D).raw().toBuffer() // dark = art on white
  const rgba = Buffer.alloc(D * D * 4)
  const cx = (D - 1) / 2, R = D / 2 - 0.5
  for (let y = 0; y < D; y++) for (let x = 0; x < D; x++) {
    const i = y * D + x, v = invert ? Math.round(35 + Math.max(0, Math.min(1, (255 - art[i]) / 220)) * 220) : art[i]
    const d = Math.hypot(x - cx, y - cx)
    const a = Math.max(0, Math.min(1, R - d + 0.5))
    rgba[i * 4] = rgba[i * 4 + 1] = rgba[i * 4 + 2] = v; rgba[i * 4 + 3] = Math.round(a * 255)
  }
  const png = await sharp(rgba, { raw: { width: D, height: D, channels: 4 } }).png().toBuffer()
  const r = await withShadow(png, 'cardboard')
  fs.writeFileSync(dst, r.out)
  console.log(dst.split('/').pop(), r.width, r.height, 'margin', r.margin)
}
await token(`${S}/full/tomoe/p01.png`, `${OUT}/tokens/white.png`, false)
await token(`${S}/full/flower/p01.png`, `${OUT}/tokens/black.png`, true)

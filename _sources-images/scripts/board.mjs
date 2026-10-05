import fs from 'fs'
import sharp from 'sharp'
const [S, OUT] = process.argv.slice(2)
const dc = await sharp(`${S}/full/plateau-Naishi-with-diecut/p01.png`).removeAlpha().raw().toBuffer({ resolveWithObject: true })
const { width: w, height: h } = dc.info
const d = dc.data
const line = new Uint8Array(w * h)
let cnt = 0
for (let i = 0; i < w * h; i++) { const r = d[i * 3], g = d[i * 3 + 1], b = d[i * 3 + 2]; if (r > 170 && g < 110 && b < 110 && r - g > 90) { line[i] = 1; cnt++ } }
// thicken barrier by 2px so flood cannot leak through anti-aliased gaps
const bar = new Uint8Array(line)
for (let y = 2; y < h - 2; y++) for (let x = 2; x < w - 2; x++) if (line[y * w + x]) for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) bar[(y + dy) * w + x + dx] = 1
const outside = new Uint8Array(w * h)
const q = [0]; outside[0] = 1
for (let k = 0; k < q.length; k++) { const p = q[k], x = p % w, y = (p / w) | 0
  for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) { if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue; const n = ny * w + nx; if (!outside[n] && !bar[n]) { outside[n] = 1; q.push(n) } } }
// keep red art inside the board: only drop barrier pixels within 5 px of the outside
const near = new Uint8Array(w * h)
for (let y = 5; y < h - 5; y++) for (let x = 5; x < w - 5; x++) if (outside[y * w + x]) for (let dy = -5; dy <= 5; dy++) for (let dx = -5; dx <= 5; dx++) near[(y + dy) * w + x + dx] = 1
const alpha = Buffer.alloc(w * h)
let ins = 0
for (let i = 0; i < w * h; i++) { alpha[i] = outside[i] || (bar[i] && near[i]) ? 0 : 255; if (alpha[i]) ins++ }
console.log('size', w, h, 'redpx', cnt, 'inside', ins, (ins / (w * h)).toFixed(3))
// bbox
let x0 = w, y0 = h, x1 = 0, y1 = 0
for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (alpha[y * w + x]) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y) }
console.log('bbox', x0, y0, x1, y1, 'px', x1 - x0 + 1, y1 - y0 + 1, 'mm', ((x1 - x0 + 1) / 10).toFixed(1), ((y1 - y0 + 1) / 10).toFixed(1))
// soften mask edge by 1px blur, keep interior
const mask0 = 0
const mask = await sharp(alpha, { raw: { width: w, height: h, channels: 1 } }).blur(0.8).extractChannel(0).raw().toBuffer()
const rgb = await sharp(`${S}/full/plateau-Naishi/p01.png`).removeAlpha().toBuffer()
console.log('mask bytes', mask.length, w*h)
const full = await sharp(rgb).joinChannel(mask, { raw: { width: w, height: h, channels: 1 } }).png().toBuffer()
const out = await sharp(full).extract({ left: x0, top: y0, width: x1 - x0 + 1, height: y1 - y0 + 1 }).png().toBuffer()
fs.mkdirSync(`${OUT}/boards`, { recursive: true })
fs.writeFileSync(`${S}/board-noshadow.png`, out)

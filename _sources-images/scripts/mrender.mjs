import fs from 'fs'
import path from 'path'
import * as mupdf from 'mupdf'
const [,, file, outDir, dpiArg, pagesArg] = process.argv
const dpi = Number(dpiArg || 150)
fs.mkdirSync(outDir, { recursive: true })
const doc = mupdf.Document.openDocument(fs.readFileSync(file), 'application/pdf')
const n = doc.countPages()
const pages = pagesArg ? pagesArg.split(',').map(Number) : Array.from({ length: n }, (_, i) => i + 1)
console.log(path.basename(file), 'pages', n)
for (const p of pages) {
  const page = doc.loadPage(p - 1)
  const pix = page.toPixmap(mupdf.Matrix.scale(dpi / 72, dpi / 72), mupdf.ColorSpace.DeviceRGB, false, true)
  fs.writeFileSync(path.join(outDir, `p${String(p).padStart(2, '0')}.png`), pix.asPNG())
  pix.destroy?.()
}

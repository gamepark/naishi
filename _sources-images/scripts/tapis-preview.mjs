import sharp from 'sharp'
// Crops of the game mat to measure it: node tapis-preview.mjs <outDir> (writes crop-*.png)
const src = '_sources-images/Tapis-de-jeu-535x340mm.jpg'
const out = process.argv[2]
const crops = { A: [0, 0, 1100, 1100], B: [0, 1300, 1300, 1500], C: [0, 2800, 1100, 1269] }
for (const [name, [left, top, width, height]] of Object.entries(crops)) {
  await sharp(src, { limitInputPixels: false }).extract({ left, top, width, height }).resize({ width: Math.round(width / 2) }).png().toFile(`${out}/crop-${name}.png`)
}

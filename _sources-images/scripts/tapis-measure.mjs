import sharp from 'sharp'
// Finds the dark lines of the River frames of the game mat (px of the 6403 × 4069 print file)
const src = '_sources-images/Tapis-de-jeu-535x340mm.jpg'
const { data, info } = await sharp(src, { limitInputPixels: false }).greyscale().raw().toBuffer({ resolveWithObject: true })
const W = info.width
const at = (x, y) => data[y * W + x]
const runs = (values, threshold, offset) => {
  const found = []
  let start = -1
  values.forEach((v, i) => {
    if (v < threshold && start < 0) start = i
    if ((v >= threshold || i === values.length - 1) && start >= 0) {
      found.push([start + offset, i - 1 + offset])
      start = -1
    }
  })
  return found
}
// horizontal scan, average of rows 2000..2060: vertical lines
const row = []
for (let x = 1400; x < 6200; x++) {
  let s = 0
  for (let y = 2000; y < 2060; y++) s += at(x, y)
  row.push(s / 60)
}
console.log('vertical lines', JSON.stringify(runs(row, 150, 1400)))
// vertical scan through the 4th (empty) frame: x 4700..4950
const col = []
for (let y = 1300; y < 2800; y++) {
  let s = 0
  for (let x = 4700; x < 4950; x++) s += at(x, y)
  col.push(s / 250)
}
console.log('horizontal lines', JSON.stringify(runs(col, 150, 1300)))

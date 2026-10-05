import sharp from 'sharp'
// The game mat (535 × 340 mm, 6403 × 4069 px) for the screen: 3200 px wide (6 px/mm)
await sharp('_sources-images/Tapis-de-jeu-535x340mm.jpg', { limitInputPixels: false })
  .resize({ width: 3200 })
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile('app/src/images/boards/playmat.jpg')

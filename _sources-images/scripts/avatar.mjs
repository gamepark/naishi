import sharp from 'sharp'
// Avatar of the opponent of the tutorial, « Koshikibu no Naishi »: the face of the Naishi card, in a square
await sharp('app/src/images/cards/base/naishi.jpg')
  .extract({ left: 150, top: 55, width: 230, height: 230 })
  .resize(320, 320)
  .png()
  .toFile('app/src/images/avatars/koshikibu-no-naishi.png')

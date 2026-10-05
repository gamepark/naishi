import sharp from 'sharp'
// Port of .claude/skills/game-park/scripts/shadow.py (cardboard: dilate 2 px, sigma 7, opacity 0.36; wood: dilate 6, sigma 7, opacity 0.46)
const KINDS = { cardboard: { dilate: 2, sigma: 7, opacity: 0.36 }, wood: { dilate: 6, sigma: 7, opacity: 0.46 } }
export async function withShadow(pngBuffer, kind = 'cardboard') {
  const { dilate, sigma, opacity } = KINDS[kind]
  const margin = Math.ceil(sigma * 3) + dilate
  const img = sharp(pngBuffer).ensureAlpha()
  const { width: w, height: h } = await img.metadata()
  const W = w + 2 * margin, H = h + 2 * margin
  const alpha = await img.clone().extractChannel(3).extend({ top: margin, bottom: margin, left: margin, right: margin, background: '#000000' }).toBuffer()
  // dilation ~ blur + low threshold
  let mask = sharp(alpha)
  if (dilate) mask = sharp(await mask.blur(dilate * 0.7 + 0.3).threshold(20).toBuffer())
  const a = await mask.blur(sigma).linear(opacity, 0).raw().toBuffer()
  const shadow = await sharp({ create: { width: W, height: H, channels: 3, background: '#1A1107' } }).joinChannel(a, { raw: { width: W, height: H, channels: 1 } }).png().toBuffer()
  const out = await sharp(shadow).composite([{ input: await img.png().toBuffer(), left: margin, top: margin }]).png({ compressionLevel: 9 }).toBuffer()
  return { out, margin, width: W, height: H }
}

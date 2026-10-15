import { LocationType } from '@gamepark/naishi/material/LocationType'
import { MaterialType } from '@gamepark/naishi/material/MaterialType'
import { ItemContext, Locator, mirrorTransforms } from '@gamepark/react-game'
import { MaterialItem } from '@gamepark/rules-api'
import { playerPanelZ, tableLayout } from './TableLayout'

/**
 * A card is 6.3 × 8.8 cm on a table about 50 cm high: its name and its scoring rule are hard to read, on a phone above all.
 * So the pointer resting on a card blows it up where it lies, without having to open its help.
 */

/** Twice its size: 17.6 cm high, a third of the table, enough to read the scoring rule and leave in sight what is around it */
const HOVER_SCALE = 2

/** How much table is kept between a hovered card and the edge of the table */
const HOVER_MARGIN = 0.5

/** The card grows over its neighbours, so it has to be in front of everything, including the panels of the players */
const HOVER_LIFT = playerPanelZ + 5

/**
 * The card, grown in place and brought back inside the table if that took it out of it.
 *
 * In the order a transform list applies them: the card is lifted above the table, put back straight (the discard pile is crooked),
 * moved by what it takes to stay on the table, and finally grown. The move is computed and applied in the frame of the table,
 * before the scale, so that its distances are centimetres of table.
 */
export const zoomOnHover = (
  locator: Locator<number, MaterialType, LocationType>,
  item: MaterialItem<number, LocationType>,
  context: ItemContext<number, MaterialType, LocationType>
): string[] => {
  const description = context.material[context.type]
  if (!description) return []
  const { width, height } = description.getSize(item.id)
  const { x = 0, y = 0 } = locator.getItemCoordinates(item, context)
  const { xMin, xMax, yMin, yMax } = tableLayout().tableBounds
  const dx = keepInside(x, (width * HOVER_SCALE) / 2, xMin + HOVER_MARGIN, xMax - HOVER_MARGIN)
  const dy = keepInside(y, (height * HOVER_SCALE) / 2, yMin + HOVER_MARGIN, yMax - HOVER_MARGIN)
  const rotation = locator.getItemRotateZ(item, context)
  return [
    `translateZ(${HOVER_LIFT}em)`,
    ...(rotation ? [`rotateZ(${-rotation}${locator.rotationUnit})`] : []),
    ...(dx || dy ? [`translate(${round(dx)}em, ${round(dy)}em)`] : []),
    `scale(${HOVER_SCALE})`
  ]
}

/** How far a card of half-size `half` centred on `centre` has to travel for both its edges to fall between `min` and `max` */
const keepInside = (centre: number, half: number, min: number, max: number): number => {
  if (max - min < half * 2) return (min + max) / 2 - centre
  return Math.min(Math.max(centre, min + half), max - half) - centre
}

const round = (value: number): number => Math.round(value * 100) / 100

/**
 * The hover of a card that shows its back on purpose: the Ryokan on its face 7, a Ninja turned over to show the card it copies.
 * The framework does not grow a card turned face down, so these ask their locator themselves, in the frame of the turned card.
 */
export const flippedHoverTransform = (item: MaterialItem<number, LocationType>, context: ItemContext<number, MaterialType, LocationType>): string[] => {
  const transform = context.locators[item.location.type]?.getHoverTransform(item, context) ?? []
  if (!transform.length) return transform
  return mirrorTransforms(transform) ?? ['rotateY(-180deg)', ...transform, 'rotateY(180deg)']
}

import { MaterialContext } from '@gamepark/react-game'
import { CourtAction } from '@gamepark/naishi/material/CourtAction'

/**
 * Anchor points of the table, in cm. Every locator derives its positions from here.
 *
 * The table is made of 5 columns (position 1 to 5, left to right) shared by the two players and the River:
 *
 *    opponent Hand
 *    opponent Line
 *    River
 *    my Line
 *    my Hand
 *
 * The Imperial Court board and the First player card are on the left, the discard pile and the Ryokan on the right.
 */
export const cardWidth = 6.3
export const cardHeight = 8.8
const columnGap = 0.5
const rowGap = 0.5

export const columnPitch = cardWidth + columnGap
export const rowPitch = cardHeight + rowGap

/** x of the center of the first column (position 1) */
export const firstColumnX = -2 * columnPitch
const territoryLeftEdge = firstColumnX - cardWidth / 2
const territoryRightEdge = -firstColumnX + cardWidth / 2

export const riverY = 0
/** Extra space between the River and the Lines, so that the thickness of the River piles shows (up to 6 cards under the revealed one) */
const riverPilesSpace = 1
export const lineY = rowPitch + riverPilesSpace
export const handY = lineY + rowPitch

/** Court board: the image is the 139.6 × 94.6 mm board, without shadow */
export const courtBoardSize = { width: 13.96, height: 9.46 }
/** The board is turned 90° counterclockwise: it is as high as its image is wide */
export const courtBoardRotation = -90
export const courtBoardFootprint = { width: courtBoardSize.height, height: courtBoardSize.width }
export const courtBoardCenter = { x: territoryLeftEdge - 1.2 - courtBoardFootprint.width / 2, y: riverY }

/**
 * Center of each printed circle of the Imperial Court board, relative to the center of the board,
 * measured on the print file (circles of 18.9 mm), before the board is turned.
 */
export const courtSpotOffsets: Record<CourtAction, { x: number; y: number }[]> = {
  // The scroll with the padlock
  [CourtAction.Decree]: [{ x: 0.02, y: -0.8 }],
  // The circles under the two cards with a red cross and the water
  [CourtAction.DiscardRiver]: [
    { x: 3.27, y: 1.92 },
    { x: 5.47, y: 1.92 }
  ],
  // The circles under the two arrows between two cards
  [CourtAction.Swap]: [
    { x: -4.17, y: 0.87 },
    { x: -5.55, y: 2.55 },
    { x: -2.8, y: 2.55 }
  ]
}

/** The offset of a circle once the board is turned 90° counterclockwise */
export function turnedCourtSpotOffset({ x, y }: { x: number; y: number }) {
  return { x: y, y: -x }
}

/** Emissary token: 20 mm disc, the image (246 px) includes a 2.3 mm shadow margin all around */
export const emissaryDiameter = 2.46

/** Emissaries of a player are beside their territory, between their Line and their Hand */
export const emissaryReserveX = territoryLeftEdge - 1.5
export const emissaryReserveGap = 2.6

/** First player card: 57.5 × 82.4 mm plus the shadow margin, beside the Hand of the player who has it, on the side of the Imperial Court board (further than the Emissaries) */
export const firstPlayerCardX = territoryLeftEdge - 2.9 - 3.1

/** Right of the territory: the discard pile beside the River, the card given at the beginning beside the Line, and the owned Ryokan */
export const rightSideX = territoryRightEdge + 1 + 3.1

/** Ryokan: off-play spot, beside the discard pile */
export const ryokanX = rightSideX + columnPitch

/** Score block: 42.5 × 65.3 mm printed, shown 2.55 times bigger (70%, then 50% more) so that the scores can be read, bottom right of the table */
const scorePadScale = 1.7 * 1.5
export const scorePadSize = { width: 4.25 * scorePadScale, height: 6.53 * scorePadScale }
/** A line under the block is left for the points of the Ryokan */
export const scorePadCenter = { x: rightSideX + cardWidth / 2 + 0.5 + scorePadSize.width / 2, y: handY + cardHeight / 2 - scorePadSize.height / 2 - 1 }

/** The table is centered on the middle of the River: the bounds are symmetrical */
const halfWidth = Math.max(
  -(Math.min(courtBoardCenter.x - courtBoardFootprint.width / 2, firstPlayerCardX - cardWidth / 2) - 0.5),
  Math.max(ryokanX + cardWidth / 2, scorePadCenter.x + scorePadSize.width / 2) + 0.5
)
const halfHeight = handY + cardHeight / 2 + 0.4
export const tableBounds = { xMin: -halfWidth, xMax: halfWidth, yMin: -halfHeight, yMax: halfHeight }

/** The player shown at the bottom of the table: the player looking at the game, or the first player for a spectator */
export function isBottomPlayer(player: number | undefined, context: MaterialContext): boolean {
  return player === (context.player ?? context.rules.players[0])
}

/** Vertical position of a row of a player: bottom player below the River, the other one above it */
export function rowY(row: number, player: number | undefined, context: MaterialContext): number {
  return isBottomPlayer(player, context) ? row : -row
}

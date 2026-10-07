import { MaterialContext } from '@gamepark/react-game'
import { CourtAction } from '@gamepark/naishi/material/CourtAction'
import { isPlaymatDisplayed } from './PlaymatDisplay'

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
 * The Imperial Court board is on the left, with the panel of each player on its edge of the table, left of its Hand, and the First player card above it.
 * The discard pile and the Ryokan are on the right.
 *
 * With the game mat (a display choice of the subscribers, see `PlaymatDisplay`), the mat replaces the Imperial Court board and is under the River and the Lines:
 * the columns are the ones printed on the mat, and the Hands are outside of it. The sides of the table stay the same:
 * the court and the Emissaries on the left, the discard pile, the Ryokan and the score block on the right.
 */
export const cardWidth = 6.3
export const cardHeight = 8.8
const columnGap = 0.5
const rowGap = 0.5

export const rowPitch = cardHeight + rowGap

export const riverY = 0
/** Extra space between the River and the Lines, so that the thickness of the River piles shows (up to 6 cards under the revealed one) */
const riverPilesSpace = 1
export const lineY = rowPitch + riverPilesSpace

/** Court board: the image is the 139.6 × 94.6 mm board, without shadow */
export const courtBoardSize = { width: 13.96, height: 9.46 }
/** The board is turned 90° counterclockwise: it is as high as its image is wide */
export const courtBoardRotation = -90
export const courtBoardFootprint = { width: courtBoardSize.height, height: courtBoardSize.width }

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

/** Game mat: the 535 × 340 mm print file */
export const playmatSize = { width: 53.5, height: 34 }
/** On the mat, the printed frames of the River are 8 cm apart, and the middle one is 5.53 cm to the right of the center of the mat */
const playmatColumnPitch = 8
const playmatRiverOffsetX = 5.53

/** Center of each printed circle of the game mat, relative to the center of the mat (cm, measured on the print file) */
export const playmatSpotOffsets: Record<CourtAction, { x: number; y: number }[]> = {
  [CourtAction.Decree]: [{ x: -19.14, y: -0.37 }],
  [CourtAction.DiscardRiver]: [
    { x: -20.46, y: -12.6 },
    { x: -20.51, y: -10.48 }
  ],
  [CourtAction.Swap]: [
    { x: -19.79, y: 9.82 },
    { x: -21.46, y: 11.16 },
    { x: -19.79, y: 12.49 }
  ]
}

/** Emissary token: 20 mm disc, the image (246 px) includes a 2.3 mm shadow margin all around */
export const emissaryDiameter = 2.46

/** Score block: 42.5 × 65.3 mm printed, shown 2.55 times bigger (70%, then 50% more) so that the scores can be read, bottom right of the table */
const scorePadScale = 1.7 * 1.5
export const scorePadSize = { width: 4.25 * scorePadScale, height: 6.53 * scorePadScale }

export const emissaryReserveGap = 2.6
/** The base cards that the Legends replace: a column above the Ryokan, each card shifted down so that the 3 can be told apart */
export const setAsideGap = 1.8

/** StyledPlayerPanel draws itself 28 em wide: giving it a width in cm sets the size of everything in it */
export const playerPanelEmWidth = 28
/** Its height (em), measured: the avatar, the name and the timer */
const playerPanelEmHeight = 8.1
/** The panel is laid over every piece of material, including the items animated in flight across the table */
export const playerPanelZ = 20

export type TableLayout = ReturnType<typeof getTableLayout>

/** @param playmat the game mat replaces the Imperial Court board */
export function getTableLayout(playmat: boolean) {
  const columnPitch = playmat ? playmatColumnPitch : cardWidth + columnGap
  /** x of the center of the first column (position 1) */
  const firstColumnX = -2 * columnPitch
  const territoryLeftEdge = firstColumnX - cardWidth / 2
  const territoryRightEdge = -firstColumnX + cardWidth / 2

  // The Hands are under the Lines, and outside of the mat
  const handY = playmat ? playmatSize.height / 2 + 0.5 + cardHeight / 2 : lineY + rowPitch

  const courtBoardCenter = { x: territoryLeftEdge - 1.2 - courtBoardFootprint.width / 2, y: riverY }
  const playmatCenter = { x: -playmatRiverOffsetX, y: riverY }

  /** The center of the circle of an action of the Imperial Court */
  const courtSpot = (action: CourtAction, x = 0) => {
    if (playmat) {
      const offset = playmatSpotOffsets[action][x]
      return { x: playmatCenter.x + offset.x, y: riverY + offset.y }
    }
    const offset = turnedCourtSpotOffset(courtSpotOffsets[action][x])
    return { x: courtBoardCenter.x + offset.x, y: courtBoardCenter.y + offset.y }
  }

  /**
   * Emissaries of a player are beside their territory: in a column between their Line and their Hand, or with the mat in a row beside the top
   * of the Hand, under the mat (outside of it). x of the first one, the closest to the territory: the second one is on its left.
   */
  const emissaryReserveX = territoryLeftEdge - 1.5
  const emissaryReserveInRow = playmat
  /** Distance from the River of the middle of the 2 Emissaries */
  const emissaryReserveY = playmat ? playmatSize.height / 2 + 0.5 + emissaryDiameter / 2 : (lineY + handY) / 2
  /** On the right of the territory: the discard pile beside the River, the card given at the beginning beside the Line, and the owned Ryokan */
  const rightSideBaseX = territoryRightEdge + 1 + 3.1
  // With the mat, they are moved to the right of its edge, so that they are not on the image
  const rightSideX = playmat ? Math.max(rightSideBaseX, playmatCenter.x + playmatSize.width / 2 + 0.5 + cardWidth / 2) : rightSideBaseX
  /** Ryokan: off-play spot, beside the discard pile */
  const ryokanX = rightSideX + cardWidth + columnGap
  /** A line under the block is left for the points of the Ryokan */
  const scorePadCenter = {
    x: rightSideX + cardWidth / 2 + 0.5 + scorePadSize.width / 2,
    y: handY + cardHeight / 2 - scorePadSize.height / 2 - 1
  }
  const setAsideY = riverY - rowPitch - 2 * setAsideGap

  /** The table is centered on the middle of the River: the bounds are symmetrical */
  const courtExtent = playmat
    ? [playmatCenter.x - playmatSize.width / 2, playmatCenter.x + playmatSize.width / 2]
    : [courtBoardCenter.x - courtBoardFootprint.width / 2, courtBoardCenter.x + courtBoardFootprint.width / 2]
  const extents = [
    ...courtExtent,
    ryokanX - cardWidth / 2,
    ryokanX + cardWidth / 2,
    scorePadCenter.x - scorePadSize.width / 2,
    scorePadCenter.x + scorePadSize.width / 2
  ]
  const halfWidth = Math.max(...extents.map(Math.abs)) + 0.5
  const halfHeight = handY + cardHeight / 2 + 0.4

  /**
   * The panel of a player is on its edge of the table, in the left corner, as low as its Hand and up to it.
   * With the mat, the Emissaries are beside the Hand (under the mat): the panel stops before them.
   */
  const playerPanelLeft = -halfWidth + 0.3
  const playerPanelRight = playmat ? emissaryReserveX - emissaryDiameter / 2 - 0.3 : territoryLeftEdge - 0.4
  const playerPanelWidth = playerPanelRight - playerPanelLeft
  /** Distance from the River of the outer edge of the panel, and of its inner edge */
  const playerPanelBottom = handY + cardHeight / 2
  const playerPanelTop = playerPanelBottom - (playerPanelWidth * playerPanelEmHeight) / playerPanelEmWidth
  /**
   * First player card: 57.5 × 82.4 mm plus the shadow margin, above the panel of the player who has it, on its left edge
   * (with the mat, it stays left of the printed circles of the swap)
   */
  const firstPlayerCardX = playerPanelLeft + cardWidth / 2
  const firstPlayerCardY = playerPanelTop - 0.4 - cardHeight / 2

  return {
    columnPitch,
    firstColumnX,
    handY,
    courtBoardCenter,
    playmatCenter,
    courtSpot,
    emissaryReserveX,
    emissaryReserveY,
    emissaryReserveInRow,
    playerPanel: { left: playerPanelLeft, width: playerPanelWidth, bottom: playerPanelBottom },
    firstPlayerCardX,
    firstPlayerCardY,
    rightSideX,
    ryokanX,
    scorePadCenter,
    setAsideY,
    tableBounds: { xMin: -halfWidth, xMax: halfWidth, yMin: -halfHeight, yMax: halfHeight }
  }
}

/** The layout of the table, with the mat if the viewer displays it */
export function tableLayout(): TableLayout {
  return getTableLayout(isPlaymatDisplayed())
}

/** The player shown at the bottom of the table: the player looking at the game, or the first player for a spectator */
export function isBottomPlayer(player: number | undefined, context: MaterialContext): boolean {
  return player === (context.player ?? context.rules.players[0])
}

/** Vertical position of a row of a player: bottom player below the River, the other one above it */
export function rowY(row: number, player: number | undefined, context: MaterialContext): number {
  return isBottomPlayer(player, context) ? row : -row
}

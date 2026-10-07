import { NaishiOptions } from '@gamepark/naishi/NaishiOptions'
import { NaishiTutorialSetup } from '@gamepark/naishi/NaishiTutorialSetup'
import { CardId } from '@gamepark/naishi/material/CardId'
import { CourtAction } from '@gamepark/naishi/material/CourtAction'
import { LocationType } from '@gamepark/naishi/material/LocationType'
import { MaterialType } from '@gamepark/naishi/material/MaterialType'
import { CustomMoveType, SwapCardsData } from '@gamepark/naishi/rules/CustomMoveType'
import { MaterialTutorial, TutorialStep } from '@gamepark/react-game'
import { isCustomMoveType, isMoveItemType, isMoveItemTypeAtOnce, MaterialGame, MaterialItem, MaterialMove } from '@gamepark/rules-api'
import { ReactNode } from 'react'
import { Trans } from 'react-i18next'
import { cardHeight, cardWidth, courtBoardFootprint, emissaryDiameter, emissaryReserveGap, getTableLayout, lineY, riverY } from '../locators/TableLayout'
import { cardImages } from '../material/cardImages'
import { PopupAnchor, PopupAnchorPosition, popupWidth } from './PopupAnchor'

type Game = MaterialGame<number, MaterialType, LocationType>
type Step = TutorialStep<number, MaterialType, LocationType>

const me = 1
const opponent = 2

/** The pile of the Fortress, in the middle of the River */
const centerPile = 2

/** The scoring of a card is in the bottom quarter of the card: only this part is shown, big enough to read the icons */
const CardScoring = ({ id }: { id: CardId }) => (
  <div
    style={{
      float: 'right',
      width: '13em',
      height: '4.6em',
      marginLeft: '0.8em',
      borderRadius: '0.3em',
      backgroundImage: `url(${cardImages[id]})`,
      backgroundSize: '100% auto',
      backgroundPosition: 'bottom',
      backgroundRepeat: 'no-repeat'
    }}
  />
)

/** A focus that highlights the elements without zooming: a margin that is too big for any zoom leaves the whole table on the screen */
const highlighted =
  (focus: NonNullable<Step['focus']>): Step['focus'] =>
  (game, context) => ({ ...focus(game, context), margin: { top: 200, right: 200, bottom: 200, left: 200 } })

/** `anchor`: the popup is at the right of this element, or in the middle of the screen when the step has no focus. `image`: shown at the right of the text */
const popup = (key: string, anchor: PopupAnchorPosition | 'center', image?: ReactNode): Step['popup'] => ({
  size: { width: popupWidth },
  text: () => (
    <>
      <PopupAnchor anchor={anchor} />
      {image}
      <Trans i18nKey={key} components={{ b: <strong />, i: <em /> }} />
    </>
  )
})

/** The steps where the table is shown whole again when the player closes the popup, before they play */
const unzoomedWhenClosed = new WeakSet<object>()
export const isUnzoomedWhenClosed = (step: Step | undefined) => step !== undefined && unzoomedWhenClosed.has(step)
const thenUnzoomed = (step: Step): Step => {
  unzoomedWhenClosed.add(step)
  return step
}

/** Anchors of the popups and parts of the table that the steps show: the table of the tutorial has no game mat */
const layout = getTableLayout(false)
const halfCard = cardWidth / 2
const columnX = (column: number) => layout.firstColumnX + column * layout.columnPitch

/** A part of the table, in cm */
type Area = { left: number; right: number; top: number; bottom: number }
/** The cards of the columns `from` to `to`, in the rows from y `top` to y `bottom` (the River: 0, my Line, my Hand) */
const cardsArea = (from: number, to: number, top: number, bottom = top): Area => ({
  left: columnX(from) - halfCard,
  right: columnX(to) + halfCard,
  top: top - cardHeight / 2,
  bottom: bottom + cardHeight / 2
})
/** The circles of an action of the Imperial Court (1.9 cm wide) */
const spotsArea = (action: CourtAction, count: number): Area => {
  const spots = Array.from({ length: count }, (_, x) => layout.courtSpot(action, x))
  return {
    left: Math.min(...spots.map((spot) => spot.x)) - 1,
    right: Math.max(...spots.map((spot) => spot.x)) + 1,
    top: Math.min(...spots.map((spot) => spot.y)) - 1,
    bottom: Math.max(...spots.map((spot) => spot.y)) + 1
  }
}
/** The smallest area that holds both areas */
const union = (a: Area, b: Area): Area => ({
  left: Math.min(a.left, b.left),
  right: Math.max(a.right, b.right),
  top: Math.min(a.top, b.top),
  bottom: Math.max(a.bottom, b.bottom)
})
/** The popup at the right of an area, in its middle */
const rightOf = (area: Area): PopupAnchorPosition => ({ x: area.right, y: (area.top + area.bottom) / 2 })

/** Room (em, 1 % of the height of the screen) that the popup takes at the right of its anchor: the gap, the popup and the edge of the screen */
const popupRoom = popupWidth + 4
/** Room (cm) around the area that is shown, except on the right (the popup) */
const areaPadding = 1

/**
 * The popup is at the right of an element of the table, see PopupAnchor. Instead of a margin of the table, each step that zooms
 * gives its focus the margin that leaves room for the popup at the right of what it shows.
 * `elements`: the area of the elements of the focus. `area`: the part of the table to show (by default the elements), the popup is at its right.
 * The margin (cm) and the zoom depend on each other and on the screen: they are computed when the step starts.
 */
const shown = (elements: Area | ((game: Game) => Area), step: Step, area?: Area): Step => {
  const { focus } = step
  if (!focus) return step
  return {
    ...step,
    focus: (game, context) => {
      const elementsArea = typeof elements === 'function' ? elements(game) : elements
      return { ...focus(game, context), margin: marginForPopup(elementsArea, area ?? elementsArea) }
    }
  }
}

const marginForPopup = (elements: Area, area: Area) => {
  const em = parseFloat(getComputedStyle(document.body).fontSize)
  // The table on the screen, under the header
  const wrapper = document.querySelector<HTMLElement>('.react-transform-wrapper')
  const screenWidth = (wrapper?.offsetWidth ?? window.innerWidth) / em
  const screenHeight = (wrapper?.offsetHeight ?? window.innerHeight * 0.93) / em
  const { xMin, xMax, yMin, yMax } = layout.tableBounds
  // em per cm: from the whole table to the biggest zoom of the framework (5 em per cm)
  const minScale = screenHeight / (yMax - yMin)
  const maxScale = Math.max(minScale, 5)
  const width = area.right - area.left + areaPadding
  const height = area.bottom - area.top + 2 * areaPadding
  /** The left of the screen (cm): the area and the popup are in the middle of the screen */
  const screenLeft = (scale: number) => area.left - areaPadding - Math.max(0, screenWidth / scale - width - popupRoom / scale) / 2
  /** The room (em) at the right of the area. The framework centers the table when it is narrower than the screen, and never shows beyond its right side. */
  const room = (scale: number) => {
    const visibleWidth = screenWidth / scale
    const screenRight = visibleWidth >= xMax - xMin ? visibleWidth / 2 : Math.min(screenLeft(scale) + visibleWidth, xMax)
    return (screenRight - area.right) * scale
  }
  // The area and the popup fill the width of the screen, or the area fills its height. Less zoom when the table does not leave the room.
  let scale = Math.min(Math.max(Math.min((screenWidth - popupRoom) / width, screenHeight / height), minScale), maxScale)
  while (scale > minScale && room(scale) < popupRoom) scale = Math.max(scale * 0.98, minScale)
  // The margins give this zoom: the elements and their margins fill the width of the screen
  const left = elements.left - screenLeft(scale)
  return {
    left,
    top: elements.top - area.top + areaPadding,
    bottom: area.bottom - elements.bottom + areaPadding,
    right: screenWidth / scale - (elements.right - elements.left) - left
  }
}

const river = cardsArea(0, 4, riverY)
const territory = cardsArea(0, 4, lineY, layout.handY)
const hand = cardsArea(0, 4, layout.handY)
const fortress = cardsArea(2, 2, riverY)
/** The pile 2, the Line and the Hand at the position 2 */
const secondColumn = cardsArea(1, 1, riverY, layout.handY)
const swapSpots = spotsArea(CourtAction.Swap, 3)
const discardSpots = spotsArea(CourtAction.DiscardRiver, 2)
const decreeSpot = spotsArea(CourtAction.Decree, 1)
const courtRight = layout.courtBoardCenter.x + courtBoardFootprint.width / 2
/** The circle of the Decree, up to the right side of the Imperial Court board */
const decreeCourt = { ...decreeSpot, right: courtRight }
/** The Emissary at the position x of my reserve, beside my territory */
const myEmissary = (x: number): Area => {
  const y = layout.emissaryReserveY - emissaryReserveGap / 2 + x * emissaryReserveGap
  const radius = emissaryDiameter / 2
  return { left: layout.emissaryReserveX - radius, right: layout.emissaryReserveX + radius, top: y - radius, bottom: y + radius }
}
const myEmissaries = union(myEmissary(0), myEmissary(1))
/** The middle cards of the 2 Lines */
const middleOfLines = cardsArea(2, 2, -lineY, lineY)

const cardItems = (game: Game) => (game.items[MaterialType.Card] ?? []) as MaterialItem<number, LocationType>[]
const cardIndex = (game: Game, predicate: (item: MaterialItem<number, LocationType>) => boolean) => cardItems(game).findIndex(predicate)
const riverIndex = (game: Game, pile: number) => cardIndex(game, (item) => item.location.type === LocationType.River && item.location.x === pile)
const lineIndex = (game: Game, player: number, x: number) =>
  cardIndex(game, (item) => item.location.type === LocationType.Line && item.location.player === player && item.location.x === x)

const isSwap = (move: MaterialMove, a: number, b: number) => {
  if (!isCustomMoveType(CustomMoveType.SwapCards)(move)) return false
  const data = move.data as SwapCardsData
  return (data.a === a && data.b === b) || (data.a === b && data.b === a)
}
const isEmissaryOn = (action: CourtAction) => (move: MaterialMove) =>
  isMoveItemType(MaterialType.Emissary)(move) && move.location.type === LocationType.CourtSpot && move.location.id === action
/** Develops the card at the index in the position x of the Line (or of the Hand, if `orHand`) of the player */
const isDevelop = (index: number, player: number, x: number, orHand = false) => (move: MaterialMove) =>
  isMoveItemType(MaterialType.Card)(move) &&
  move.itemIndex === index &&
  (move.location.type === LocationType.Line || (orHand && move.location.type === LocationType.Hand)) &&
  move.location.player === player &&
  move.location.x === x
/** Any development, but not of the card of the middle of the River: the player takes it later */
const isDevelopExceptCenter = (move: MaterialMove, game: Game) => {
  if (!isMoveItemType(MaterialType.Card)(move)) return false
  if (move.location.type !== LocationType.Line && move.location.type !== LocationType.Hand) return false
  const item = cardItems(game)[move.itemIndex]
  return item.location.type === LocationType.River && item.location.x !== centerPile
}
const isAnyDevelop = (move: MaterialMove) =>
  isMoveItemType(MaterialType.Card)(move) && (move.location.type === LocationType.Line || move.location.type === LocationType.Hand)
const isGiftOf = (player: number, id?: CardId) => (move: MaterialMove, game: Game) => {
  if (!isMoveItemType(MaterialType.Card)(move) || move.location.type !== LocationType.Gift) return false
  const item = cardItems(game)[move.itemIndex]
  return item.location.player === player && (id === undefined || item.id === id)
}
const isEndTurn = (move: MaterialMove) => isCustomMoveType(CustomMoveType.EndTurn)(move)

/** The scenario of the tutorial is in TUTORIEL.md. After the last step, the game goes on freely (see TutorialFreePlay). */
export class NaishiTutorial extends MaterialTutorial<number, MaterialType, LocationType> {
  options: NaishiOptions = { players: 2 }
  setup = new NaishiTutorialSetup()
  players = [{ id: me }, { id: opponent, name: 'Koshikibu no Naishi' }]

  cards(game: Game) {
    return this.material(game, MaterialType.Card)
  }

  /** My Emissaries that are still in my reserve: highlighted with the circle where they go */
  myReserve(game: Game) {
    return this.material(game, MaterialType.Emissary).location(LocationType.EmissaryReserve).player(me)
  }

  /** The area of a spot of the Imperial Court and of my Emissaries that are still in my reserve */
  myReserveArea(game: Game, spot: Area) {
    return this.myReserve(game)
      .getItems()
      .reduce((area, item) => union(area, myEmissary(item.location.x!)), spot)
  }

  steps: Step[] = [
    // 1
    { popup: popup('tutorial.1', 'center') },
    // 2: the popup is at the right of the territory
    shown(territory, {
      popup: popup('tutorial.2', rightOf(territory)),
      focus: (game) => ({
        materials: [
          this.cards(game)
            .player(me)
            .location((l) => l.type === LocationType.Line || l.type === LocationType.Hand)
        ]
      })
    }),
    // 3: the River, and the territory under it where its cards go, the popup is at the right of the River
    shown(
      river,
      {
        popup: popup('tutorial.3', rightOf(river)),
        focus: (game) => ({ materials: [this.cards(game).location((l) => l.type === LocationType.River || l.type === LocationType.RiverDeck)] })
      },
      { ...river }
    ),
    // 4: give a card of the Hand: it goes beside the Line of the opponent
    {
      popup: popup('tutorial.4', 'center'),
      move: { player: me, filter: isGiftOf(me) }
    },
    // The opponent gives a card too
    { move: { player: opponent, filter: isGiftOf(opponent, CardId.Sentinel) } },
    // 5: the popup is at the right of the Hand
    shown(hand, {
      popup: popup('tutorial.5', rightOf(hand)),
      focus: (game) => ({ materials: [this.cards(game).location(LocationType.Hand).player(me)] })
    }),
    // 6: a first normal move: the Sentinel of the pile 2 goes to the position 2. The zoom shows the 3 cards that can be played (the Sentinel, the Line and the Hand
    // at the position 2), the popup is at the right of them, the table is shown whole when the popup is closed
    thenUnzoomed(
      shown(secondColumn, {
        popup: popup('tutorial.6', rightOf(secondColumn)),
        focus: (game) => ({
          materials: [
            this.cards(game)
              .location(LocationType.River)
              .filter((item) => item.location.x === 1),
            this.cards(game)
              .player(me)
              .location((l) => l.type === LocationType.Line || l.type === LocationType.Hand)
              .filter((item) => item.location.x === 1)
          ]
        }),
        move: { player: me, filter: (move, game) => isDevelop(riverIndex(game, 1), me, 1, true)(move) }
      })
    ),
    // 7: end the turn
    {
      popup: popup('tutorial.7', 'center'),
      move: { player: me, filter: isEndTurn }
    },
    // The opponent develops a card, at random, but not the one of the middle
    { move: { player: opponent, filter: isDevelopExceptCenter } },
    { move: { player: opponent, filter: isEndTurn } },
    // 8: a pause to see what the opponent did
    { popup: popup('tutorial.8', 'center') },
    // 9: the popup is at the right of the Fortress
    shown(fortress, {
      popup: popup('tutorial.9', rightOf(fortress), <CardScoring id={CardId.Fortress} />),
      focus: (game) => ({ materials: [this.cards(game).location(LocationType.River).id(CardId.Fortress)] })
    }),
    // 10: the Fortress goes to the middle of the Line, the table is shown whole
    {
      popup: popup('tutorial.10', rightOf(fortress)),
      focus: highlighted((game) => ({
        materials: [
          this.cards(game).location(LocationType.River).id(CardId.Fortress),
          this.cards(game)
            .location(LocationType.Line)
            .player(me)
            .filter((item) => item.location.x === 2)
        ]
      })),
      move: { player: me, filter: (move, game) => isDevelop(riverIndex(game, centerPile), me, 2)(move) }
    },
    // 11: zoom on the circles of the Swap action and on my Emissaries. The table is shown whole again when the popup is closed
    thenUnzoomed(
      shown(
        (game) => this.myReserveArea(game, swapSpots),
        {
          popup: popup('tutorial.11', rightOf(union(swapSpots, myEmissaries))),
          focus: (game) => ({
            materials: [this.myReserve(game)],
            locations: [0, 1, 2].map((x) => ({ type: LocationType.CourtSpot, id: CourtAction.Swap, x }))
          }),
          move: { player: me, filter: isEmissaryOn(CourtAction.Swap) }
        },
        union(swapSpots, myEmissaries)
      )
    ),
    // 12: swap the Fortress of the middle with the card of the left edge, the popup is at the right of the Fortress
    shown(cardsArea(0, 2, lineY), {
      popup: popup('tutorial.12', rightOf(cardsArea(0, 2, lineY))),
      focus: (game) => ({
        materials: [
          this.cards(game)
            .location(LocationType.Line)
            .player(me)
            .filter((item) => item.location.x === 2 || item.location.x === 0)
        ]
      }),
      move: { player: me, filter: (move, game) => isSwap(move, lineIndex(game, me, 2), lineIndex(game, me, 0)) }
    }),
    // 13: the other action of the Imperial Court, and the limit of one Emissary per turn
    shown(discardSpots, {
      popup: popup('tutorial.13', rightOf(discardSpots)),
      focus: () => ({ locations: [0, 1].map((x) => ({ type: LocationType.CourtSpot, id: CourtAction.DiscardRiver, x })) })
    }),
    // 14: the Fortress is on an edge: nothing is highlighted, the table is shown whole
    { popup: popup('tutorial.14', 'center') },
    // 15: the Naishi is revealed, the popup is at the right of it
    shown(fortress, {
      popup: popup('tutorial.15', rightOf(fortress)),
      focus: (game) => ({
        materials: [
          this.cards(game)
            .location(LocationType.River)
            .filter((item) => item.location.x === centerPile)
        ]
      })
    }),
    // The opponent takes the Naishi: no text, the pause after it shows what happened
    {
      move: { player: opponent, filter: (move, game) => isDevelop(riverIndex(game, centerPile), opponent, 2)(move) }
    },
    { move: { player: opponent, filter: isEndTurn } },
    // 17: a pause to see what the opponent did
    { popup: popup('tutorial.17', 'center') },
    // 18: zoom on the circle of the Decree and on my Emissary. The table is shown whole again when the popup is closed
    thenUnzoomed(
      shown(
        (game) => this.myReserveArea(game, decreeSpot),
        {
          popup: popup('tutorial.18', rightOf(union(decreeCourt, myEmissaries))),
          focus: (game) => ({ materials: [this.myReserve(game)], locations: [{ type: LocationType.CourtSpot, id: CourtAction.Decree, x: 0 }] }),
          move: { player: me, filter: isEmissaryOn(CourtAction.Decree) }
        },
        union(decreeCourt, myEmissaries)
      )
    ),
    // 19: the popup is at the right of the middle cards of the 2 Lines, the table is shown whole again when the popup is closed
    thenUnzoomed(
      shown(middleOfLines, {
        popup: popup('tutorial.19', rightOf(middleOfLines)),
        focus: (game) => ({
          materials: [
            this.cards(game)
              .location(LocationType.Line)
              .filter((item) => item.location.x === 2)
          ]
        }),
        move: { player: me, filter: (move, game) => isSwap(move, lineIndex(game, me, 2), lineIndex(game, opponent, 2)) }
      })
    ),
    // 20: the popup is at the right of the Imperial Court
    shown(
      decreeSpot,
      {
        popup: popup('tutorial.20', rightOf(decreeCourt)),
        focus: (game) => ({ materials: [this.material(game, MaterialType.Emissary).location(LocationType.CourtSpot).locationId(CourtAction.Decree)] })
      },
      decreeCourt
    ),
    // 21: the opponent develops a card, at random
    {
      popup: popup('tutorial.21', 'center'),
      move: { player: opponent, filter: isAnyDevelop }
    },
    { move: { player: opponent, filter: isEndTurn } },
    // 22: recall the Emissaries with the button under the Imperial Court
    {
      popup: popup('tutorial.22', 'center'),
      move: { player: me, filter: isMoveItemTypeAtOnce(MaterialType.Emissary) }
    },
    // 23: the end of the scenario, the game goes on freely
    { popup: popup('tutorial.23', 'center') }
  ]
}

export const naishiTutorial = new NaishiTutorial()

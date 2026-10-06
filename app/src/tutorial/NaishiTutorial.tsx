import { NaishiOptions } from '@gamepark/naishi/NaishiOptions'
import { NaishiTutorialSetup } from '@gamepark/naishi/NaishiTutorialSetup'
import { CardId } from '@gamepark/naishi/material/CardId'
import { CourtAction } from '@gamepark/naishi/material/CourtAction'
import { LocationType } from '@gamepark/naishi/material/LocationType'
import { MaterialType } from '@gamepark/naishi/material/MaterialType'
import { CustomMoveType, SwapCardsData } from '@gamepark/naishi/rules/CustomMoveType'
import { MaterialTutorial, TutorialStep } from '@gamepark/react-game'
import { isCustomMoveType, isMoveItemType, MaterialGame, MaterialItem, MaterialMove } from '@gamepark/rules-api'
import { ReactNode } from 'react'
import { Trans } from 'react-i18next'
import { getTableLayout, cardWidth, courtBoardFootprint, lineY, riverY } from '../locators/TableLayout'
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

/**
 * The popup is at the right of an element of the table, see PopupAnchor.
 * When the step zooms on elements, `shown` leaves room around them: at the right for the popup, and at the left for the panels of the players
 * when the elements are tall enough to reach them (the panels are at the top left and the bottom left of the screen).
 * `width` and `height` are the size (cm) of the elements that are shown, `panels` tells that they are at the bottom or at the top of the table, where the panels are.
 * The room is computed in vh (1 % of the height of the screen), for a screen of 16/9: the table is 156 vh wide and 93 vh high.
 */
const shown = (width: number, height: number, step: Step, panels = false): Step => {
  const { focus } = step
  if (!focus) return step
  const tableWidthVh = 156
  const tableHeightVh = 93
  const panelsVh = 43
  let right = 0
  let left = 0
  // The zoom depends on the room, which depends on the zoom: a few iterations are enough
  for (let i = 0; i < 8; i++) {
    const scale = Math.min(tableWidthVh / (width + right + left), tableHeightVh / height)
    right = popupWidth / scale + 1.5
    left = panels || height * scale > 55 ? panelsVh / scale : 0
  }
  const margin = { top: 1, bottom: 1, right: Math.ceil(right), left: Math.ceil(left) }
  return { ...step, focus: (game, context) => ({ ...focus(game, context), margin }) }
}

/** A focus that highlights the elements without zooming: a margin that is too big for any zoom leaves the whole table on the screen */
const highlighted =
  (focus: NonNullable<Step['focus']>): Step['focus'] =>
  (game, context) => ({ ...focus(game, context), margin: { top: 200, right: 200, bottom: 200, left: 200 } })

/** `anchor`: the popup is at the right of this element. `image`: shown at the right of the text */
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

/** Anchors of the popups: the table of the tutorial has no game mat */
const layout = getTableLayout(false)
const halfCard = cardWidth / 2
/** At the right of the card on the left of the River */
const leftOfRiver: PopupAnchorPosition = { x: layout.firstColumnX + halfCard, y: riverY }
/** At the right of the whole River */
const rightOfRiver: PopupAnchorPosition = { x: -layout.firstColumnX + halfCard, y: riverY }
/** At the right of the middle card of a row (the Fortress, the Naishi) */
const rightOfMiddleCard = (y: number): PopupAnchorPosition => ({ x: halfCard, y })
/** At the right of the territory of the player: the Line and the Hand, or the Hand only */
const rightOfTerritory: PopupAnchorPosition = { x: -layout.firstColumnX + halfCard, y: (lineY + layout.handY) / 2 }
const rightOfHand: PopupAnchorPosition = { x: -layout.firstColumnX + halfCard, y: layout.handY }
/** At the right of the circles of an action of the Imperial Court */
const rightOfSpots = (action: CourtAction, count: number): PopupAnchorPosition => {
  const spots = Array.from({ length: count }, (_, x) => layout.courtSpot(action, x))
  return { x: Math.max(...spots.map((spot) => spot.x)) + 1, y: spots.reduce((sum, spot) => sum + spot.y, 0) / count }
}
const rightOfCourt: PopupAnchorPosition = { x: layout.courtBoardCenter.x + courtBoardFootprint.width / 2, y: layout.courtBoardCenter.y }
/** The button to recall the Emissaries is under the Imperial Court board: its text is about 10 cm wide */
const rightOfRecallButton: PopupAnchorPosition = { x: layout.courtBoardCenter.x + 5, y: layout.courtBoardCenter.y + courtBoardFootprint.height / 2 + 2.8 }

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

  steps: Step[] = [
    // 1
    { popup: popup('tutorial.1', leftOfRiver) },
    // 2: the popup is at the right of the territory
    shown(33.5, 18.1, {
      popup: popup('tutorial.2', rightOfTerritory),
      focus: (game) => ({ materials: [this.cards(game).player(me).location((l) => l.type === LocationType.Line || l.type === LocationType.Hand)] })
    }, true),
    // 3
    {
      popup: popup('tutorial.3', rightOfRiver),
      focus: highlighted((game) => ({ materials: [this.cards(game).location((l) => l.type === LocationType.River || l.type === LocationType.RiverDeck)] }))
    },
    // 4: give a card
    {
      popup: popup('tutorial.4', rightOfRiver),
      move: { player: me, filter: isGiftOf(me) }
    },
    // The opponent gives a card too
    { move: { player: opponent, filter: isGiftOf(opponent, CardId.Sentinel) } },
    // 5: the popup is at the right of the Hand
    shown(33.5, 8.8, {
      popup: popup('tutorial.5', rightOfHand),
      focus: (game) => ({ materials: [this.cards(game).location(LocationType.Hand).player(me)] })
    }, true),
    // 6: a first normal move: the Sentinel of the pile 2 goes to the position 2. The zoom shows the 3 cards that can be played (the Sentinel, the Line and the Hand
    // at the position 2), the popup is at the right of them, the table is shown whole when the popup is closed
    thenUnzoomed(
      shown(
        6.3,
        28.4,
        {
          popup: popup('tutorial.6', { x: layout.firstColumnX + layout.columnPitch + halfCard, y: (riverY + layout.handY) / 2 }),
          focus: (game) => ({
            materials: [
              this.cards(game).location(LocationType.River).filter((item) => item.location.x === 1),
              this.cards(game).player(me).location((l) => l.type === LocationType.Line || l.type === LocationType.Hand).filter((item) => item.location.x === 1)
            ]
          }),
          move: { player: me, filter: (move, game) => isDevelop(riverIndex(game, 1), me, 1, true)(move) }
        },
        true
      )
    ),
    // 7: end the turn
    {
      popup: popup('tutorial.7', leftOfRiver),
      move: { player: me, filter: isEndTurn }
    },
    // The opponent develops a card, at random, but not the one of the middle
    { move: { player: opponent, filter: isDevelopExceptCenter } },
    { move: { player: opponent, filter: isEndTurn } },
    // 8: a pause to see what the opponent did
    { popup: popup('tutorial.8', leftOfRiver) },
    // 9: the popup is at the right of the Fortress
    shown(6.3, 8.8, {
      popup: popup('tutorial.9', rightOfMiddleCard(riverY), <CardScoring id={CardId.Fortress} />),
      focus: (game) => ({ materials: [this.cards(game).location(LocationType.River).id(CardId.Fortress)] })
    }),
    // 10: the Fortress goes to the middle of the Line, the table is shown whole
    {
      popup: popup('tutorial.10', rightOfMiddleCard(riverY)),
      focus: highlighted((game) => ({
        materials: [this.cards(game).location(LocationType.River).id(CardId.Fortress), this.cards(game).location(LocationType.Line).player(me).filter((item) => item.location.x === 2)]
      })),
      move: { player: me, filter: (move, game) => isDevelop(riverIndex(game, centerPile), me, 2)(move) }
    },
    // 11: zoom on the circles of the Swap action only, shown whole again when the popup is closed
    thenUnzoomed(
      shown(5, 6, {
        popup: popup('tutorial.11', rightOfSpots(CourtAction.Swap, 3)),
        focus: () => ({ locations: [0, 1, 2].map((x) => ({ type: LocationType.CourtSpot, id: CourtAction.Swap, x })) }),
        move: { player: me, filter: isEmissaryOn(CourtAction.Swap) }
      })
    ),
    // 12: swap the Fortress of the middle with the card of the left edge, the popup is at the right of the Fortress
    shown(19.9, 8.8, {
      popup: popup('tutorial.12', rightOfMiddleCard(lineY)),
      focus: (game) => ({ materials: [this.cards(game).location(LocationType.Line).player(me).filter((item) => item.location.x === 2 || item.location.x === 0)] }),
      move: { player: me, filter: (move, game) => isSwap(move, lineIndex(game, me, 2), lineIndex(game, me, 0)) }
    }),
    // 13: the other action of the Imperial Court, and the limit of one Emissary per turn
    shown(6, 3, {
      popup: popup('tutorial.13', rightOfSpots(CourtAction.DiscardRiver, 2)),
      focus: () => ({ locations: [0, 1].map((x) => ({ type: LocationType.CourtSpot, id: CourtAction.DiscardRiver, x })) })
    }),
    // 14: the Fortress is on an edge: nothing is highlighted, the table is shown whole
    { popup: popup('tutorial.14', leftOfRiver) },
    // 15: the Naishi is revealed, the popup is at the right of it
    shown(6.3, 8.8, {
      popup: popup('tutorial.15', rightOfMiddleCard(riverY)),
      focus: (game) => ({ materials: [this.cards(game).location(LocationType.River).filter((item) => item.location.x === centerPile)] })
    }),
    // The opponent takes the Naishi: no text, the pause after it shows what happened
    {
      move: { player: opponent, filter: (move, game) => isDevelop(riverIndex(game, centerPile), opponent, 2)(move) }
    },
    { move: { player: opponent, filter: isEndTurn } },
    // 17: a pause to see what the opponent did
    { popup: popup('tutorial.17', leftOfRiver) },
    // 18: zoom on the circle of the Decree only, shown whole again when the popup is closed
    thenUnzoomed(
      shown(3, 3, {
        popup: popup('tutorial.18', rightOfCourt),
        focus: () => ({ locations: [{ type: LocationType.CourtSpot, id: CourtAction.Decree, x: 0 }] }),
        move: { player: me, filter: isEmissaryOn(CourtAction.Decree) }
      })
    ),
    // 19: the popup is at the right of the middle cards of the 2 Lines, the table is shown whole again when the popup is closed
    thenUnzoomed(
      shown(6.3, 29.4, {
        popup: popup('tutorial.19', rightOfMiddleCard(0)),
        focus: (game) => ({ materials: [this.cards(game).location(LocationType.Line).filter((item) => item.location.x === 2)] }),
        move: { player: me, filter: (move, game) => isSwap(move, lineIndex(game, me, 2), lineIndex(game, opponent, 2)) }
      }, true)
    ),
    // 20: the popup is at the right of the Imperial Court
    shown(3, 3, {
      popup: popup('tutorial.20', rightOfCourt),
      focus: (game) => ({ materials: [this.material(game, MaterialType.Emissary).location(LocationType.CourtSpot).locationId(CourtAction.Decree)] })
    }),
    // 21: the opponent develops a card, at random
    {
      popup: popup('tutorial.21', leftOfRiver),
      move: { player: opponent, filter: isAnyDevelop }
    },
    { move: { player: opponent, filter: isEndTurn } },
    // 22: the popup is at the right of the button to recall the Emissaries
    {
      popup: popup('tutorial.22', rightOfRecallButton),
      move: { player: me, filter: (move) => isCustomMoveType(CustomMoveType.RecallEmissaries)(move) }
    },
    // 23: the end of the scenario, the game goes on freely
    { popup: popup('tutorial.23', 'center') }
  ]
}

export const naishiTutorial = new NaishiTutorial()

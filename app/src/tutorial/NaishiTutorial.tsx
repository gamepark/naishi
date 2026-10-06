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
import { cardImages } from '../material/cardImages'

type Game = MaterialGame<number, MaterialType, LocationType>
type Step = TutorialStep<number, MaterialType, LocationType>

const me = 1
const opponent = 2

/** The pile of the Fortress, in the middle of the River */
const centerPile = 2

/** In development, the key of the text is shown before it (« [tutorial.12] »), to point at the exact screen when asking for a change */
export const TutorialKey = ({ name }: { name: string }) =>
  process.env.NODE_ENV === 'development' ? <small style={{ opacity: 0.6, fontSize: '0.6em' }}>[{name}] </small> : null

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

/** `image`: shown at the right of the text */
const popup = (key: string, image?: ReactNode): Step['popup'] => ({
  text: () => (
    <>
      {image}
      <TutorialKey name={key} />
      <Trans i18nKey={key} components={{ b: <strong />, i: <em /> }} />
    </>
  )
})

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
  players = [{ id: me }, { id: opponent, name: 'Madladif' }]

  cards(game: Game) {
    return this.material(game, MaterialType.Card)
  }

  steps: Step[] = [
    // 1
    { popup: popup('tutorial.1') },
    // 2
    {
      popup: popup('tutorial.2'),
      focus: (game) => ({ materials: [this.cards(game).player(me).location((l) => l.type === LocationType.Line || l.type === LocationType.Hand)] })
    },
    // 3
    {
      popup: popup('tutorial.3'),
      focus: (game) => ({ materials: [this.cards(game).location((l) => l.type === LocationType.River || l.type === LocationType.RiverDeck)] })
    },
    // 4: give a card
    {
      popup: popup('tutorial.4'),
      move: { player: me, filter: isGiftOf(me) }
    },
    // The opponent gives a card too
    { move: { player: opponent, filter: isGiftOf(opponent, CardId.Sentinel) } },
    // 5
    {
      popup: popup('tutorial.5'),
      focus: (game) => ({ materials: [this.cards(game).location(LocationType.Hand).player(me)] })
    },
    // 6: a first normal move: the Sentinel of the pile 2 goes to the position 2
    {
      popup: popup('tutorial.6'),
      focus: (game) => ({
        materials: [
          this.cards(game).location(LocationType.River).filter((item) => item.location.x === 1),
          this.cards(game).player(me).location((l) => l.type === LocationType.Line || l.type === LocationType.Hand).filter((item) => item.location.x === 1)
        ]
      }),
      move: { player: me, filter: (move, game) => isDevelop(riverIndex(game, 1), me, 1, true)(move) }
    },
    // 7: end the turn
    {
      popup: popup('tutorial.7'),
      move: { player: me, filter: isEndTurn }
    },
    // The opponent develops a card, at random, but not the one of the middle
    { move: { player: opponent, filter: isDevelopExceptCenter } },
    { move: { player: opponent, filter: isEndTurn } },
    // 8: a pause to see what the opponent did
    { popup: popup('tutorial.8') },
    // 9
    {
      popup: popup('tutorial.9', <CardScoring id={CardId.Fortress} />),
      focus: (game) => ({ materials: [this.cards(game).location(LocationType.River).id(CardId.Fortress)] })
    },
    // 10: the Fortress goes to the middle of the Line
    {
      popup: popup('tutorial.10'),
      focus: (game) => ({
        materials: [this.cards(game).location(LocationType.River).id(CardId.Fortress), this.cards(game).location(LocationType.Line).player(me).filter((item) => item.location.x === 2)]
      }),
      move: { player: me, filter: (move, game) => isDevelop(riverIndex(game, centerPile), me, 2)(move) }
    },
    // 11
    {
      popup: popup('tutorial.11'),
      focus: (game) => ({
        materials: [this.material(game, MaterialType.Emissary).location(LocationType.EmissaryReserve).player(me)],
        locations: [0, 1, 2].map((x) => ({ type: LocationType.CourtSpot, id: CourtAction.Swap, x }))
      }),
      move: { player: me, filter: isEmissaryOn(CourtAction.Swap) }
    },
    // 12: swap the Fortress of the middle with the card of the left edge
    {
      popup: popup('tutorial.12'),
      focus: (game) => ({ materials: [this.cards(game).location(LocationType.Line).player(me).filter((item) => item.location.x === 2 || item.location.x === 0)] }),
      move: { player: me, filter: (move, game) => isSwap(move, lineIndex(game, me, 2), lineIndex(game, me, 0)) }
    },
    // 13: the other action of the Imperial Court, and the limit of one Emissary per turn
    {
      popup: popup('tutorial.13'),
      focus: () => ({ locations: [0, 1].map((x) => ({ type: LocationType.CourtSpot, id: CourtAction.DiscardRiver, x })) })
    },
    // 14: the Fortress is on an edge
    {
      popup: popup('tutorial.14'),
      focus: (game) => ({ materials: [this.cards(game).location(LocationType.Line).player(me).filter((item) => item.location.x === 0)] })
    },
    // 15: the Naishi is revealed
    {
      popup: popup('tutorial.15'),
      focus: (game) => ({ materials: [this.cards(game).location(LocationType.River).filter((item) => item.location.x === centerPile)] })
    },
    // The opponent takes the Naishi: no text, the pause after it shows what happened
    {
      move: { player: opponent, filter: (move, game) => isDevelop(riverIndex(game, centerPile), opponent, 2)(move) }
    },
    { move: { player: opponent, filter: isEndTurn } },
    // 17: a pause to see what the opponent did
    {
      popup: popup('tutorial.17')
    },
    // 15
    {
      popup: popup('tutorial.18'),
      // The Decree spot is highlighted, without zooming (scale 1 = the whole table)
      focus: () => ({ locations: [{ type: LocationType.CourtSpot, id: CourtAction.Decree, x: 0 }], scale: 1 }),
      move: { player: me, filter: isEmissaryOn(CourtAction.Decree) }
    },
    // 16
    {
      popup: popup('tutorial.19'),
      focus: (game) => ({ materials: [this.cards(game).location(LocationType.Line).filter((item) => item.location.x === 2)] }),
      move: { player: me, filter: (move, game) => isSwap(move, lineIndex(game, me, 2), lineIndex(game, opponent, 2)) }
    },
    // 17
    {
      popup: popup('tutorial.20'),
      focus: (game) => ({ materials: [this.material(game, MaterialType.Emissary).location(LocationType.CourtSpot).locationId(CourtAction.Decree)] })
    },
    // 18: the opponent develops a card, at random
    {
      popup: popup('tutorial.21'),
      move: { player: opponent, filter: isAnyDevelop }
    },
    { move: { player: opponent, filter: isEndTurn } },
    // 19
    {
      popup: popup('tutorial.22'),
      move: { player: me, filter: (move) => isCustomMoveType(CustomMoveType.RecallEmissaries)(move) }
    },
    // 20: the end of the scenario, the game goes on freely
    { popup: popup('tutorial.23') }
  ]
}

export const naishiTutorial = new NaishiTutorial()

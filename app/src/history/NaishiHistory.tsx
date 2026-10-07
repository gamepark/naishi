import { CardId } from '@gamepark/naishi/material/CardId'
import { CourtAction } from '@gamepark/naishi/material/CourtAction'
import { LocationType } from '@gamepark/naishi/material/LocationType'
import { MaterialType } from '@gamepark/naishi/material/MaterialType'
import { ChooseNinjaCopyData, CustomMoveType, SwapCardsData } from '@gamepark/naishi/rules/CustomMoveType'
import { RuleId } from '@gamepark/naishi/rules/RuleId'
import { LogDescription, MoveComponentContext, MoveComponentProps, usePlayerName } from '@gamepark/react-game'
import { CustomMove, isCustomMoveType, isMoveItemType, isMoveItemTypeAtOnce, ItemMove, MaterialGame, MaterialItem, MaterialMove } from '@gamepark/rules-api'
import { Trans, useTranslation } from 'react-i18next'

type Props = MoveComponentProps<MaterialMove, number>

const cardsOf = (game: MaterialGame) => (game.items[MaterialType.Card] ?? []) as MaterialItem[]

/** The player whose turn it is, when the move was played */
const turnPlayer = (context: MoveComponentContext) => (context.game.rule as { player?: number } | undefined)?.player

/**
 * A line of the history: a text of the translation, with the name of the player and the names of the cards.
 * A card that the player who reads the log cannot see (in the Hand of the opponent) has no id: the text « .unknown » of the key is used, without the card.
 */
const Line = ({ text, player, cards = {}, values = {} }: { text: string; player?: number; cards?: Record<string, CardId | undefined>; values?: Record<string, string | number> }) => {
  const { t } = useTranslation()
  const name = usePlayerName(player)
  const known = Object.values(cards).every((id) => id !== undefined)
  const names = Object.fromEntries(Object.entries(cards).map(([key, id]) => [key, id === undefined ? '' : t(`help.name.${id}`)]))
  return <Trans i18nKey={known ? text : `${text}.unknown`} values={{ player: name, ...names, ...values }} components={{ b: <strong /> }} />
}

/** The card of the River that goes to the territory, and the card of the territory that it replaces */
const Develop = ({ move, context }: Props) => {
  const { itemIndex, location } = move as ItemMove & { itemIndex: number }
  const items = cardsOf(context.game)
  const replaced = items.find((item) => item.location.type === location.type && item.location.player === location.player && item.location.x === location.x)
  const row = location.type === LocationType.Line ? 'line' : 'hand'
  return <Line text={`history.develop.${row}`} player={location.player} cards={{ card: items[itemIndex]?.id, replaced: replaced?.id }} values={{ x: (location.x ?? 0) + 1 }} />
}

/** An Emissary of the player goes to the Imperial Court */
const Emissary = ({ move, context }: Props) => {
  const { itemIndex, location } = move as ItemMove & { itemIndex: number }
  const owner = context.game.items[MaterialType.Emissary]?.[itemIndex]?.id as number | undefined
  return <Line text={`history.emissary.${location.id as CourtAction}`} player={owner} />
}

const Swap = ({ move, context }: Props) => {
  const { a, b } = (move as CustomMove & { data: SwapCardsData }).data
  const items = cardsOf(context.game)
  return <Line text="history.swap" player={turnPlayer(context)} cards={{ first: items[a]?.id, second: items[b]?.id }} />
}

const DiscardRiver = ({ move, context }: Props) => {
  const { itemIndex } = move as ItemMove & { itemIndex: number }
  return <Line text="history.discard" player={turnPlayer(context)} cards={{ card: cardsOf(context.game)[itemIndex]?.id }} />
}

const Ryokan = ({ move }: Props) => {
  const { location } = move as ItemMove
  return <Line text={location.rotation ? 'history.ryokan.7' : 'history.ryokan.4'} player={location.player} />
}

const NinjaCopy = ({ move, context }: Props) => {
  const { ninja, target } = (move as CustomMove & { data: ChooseNinjaCopyData }).data
  const items = cardsOf(context.game)
  return <Line text="history.ninja" player={items[ninja]?.location.player} cards={{ ninja: items[ninja]?.id, card: items[target]?.id }} />
}

const Gift = ({ move, context }: Props) => {
  const { location } = move as ItemMove
  // The card is given to the player of the location: it is given by the other one
  return <Line text="history.give" player={context.game.players.find((player: number) => player !== location.player)} />
}

const Recall = ({ context }: Props) => <Line text="history.recall" player={turnPlayer(context)} />
const DeclareEnd = ({ context }: Props) => <Line text="history.declare-end" player={turnPlayer(context)} />
const UseEffect = ({ context }: Props) => <Line text="history.effect.use" player={turnPlayer(context)} />
const IgnoreEffect = ({ context }: Props) => <Line text="history.effect.ignore" player={turnPlayer(context)} />

/** The history of the game: what the players do, and what it triggers. The ends of the turns and the technical moves are not logged. */
export class NaishiHistory implements LogDescription {
  getMovePlayedLogDescription(move: MaterialMove, context: MoveComponentContext) {
    const player = turnPlayer(context)
    if (isMoveItemType(MaterialType.Card)(move)) {
      const { type } = move.location
      if (type === LocationType.Gift) return { Component: Gift, player: context.game.players.find((p: number) => p !== move.location.player) }
      // The cards given at the beginning of the game go to the Hands, and the Hands are shuffled: that is not a development
      if (type === LocationType.Line || type === LocationType.Hand) {
        return context.game.rule?.id === RuleId.ExchangeCards ? undefined : { Component: Develop, player: move.location.player }
      }
      // The cards discarded by a development are told by it: only the cards discarded from the River are logged
      if (type === LocationType.Discard && context.game.rule?.id === RuleId.DiscardRiverCards) return { Component: DiscardRiver, player, depth: 1 }
      return undefined
    }
    // The Emissaries recalled by a Traveller are told by the use of its effect
    if (isMoveItemTypeAtOnce(MaterialType.Emissary)(move)) return context.game.rule?.id === RuleId.PlayerTurn ? { Component: Recall, player } : undefined
    if (isMoveItemType(MaterialType.Emissary)(move)) {
      if (move.location.type !== LocationType.CourtSpot) return undefined
      return { Component: Emissary, player: context.game.items[MaterialType.Emissary]?.[move.itemIndex]?.id as number | undefined }
    }
    if (isMoveItemType(MaterialType.Ryokan)(move)) {
      if (move.location.type !== LocationType.RyokanSpot || move.location.player === undefined) return undefined
      return { Component: Ryokan, player: move.location.player, depth: 1 }
    }
    if (isCustomMoveType(CustomMoveType.SwapCards)(move)) return { Component: Swap, player }
    if (isCustomMoveType(CustomMoveType.DeclareEndOfGame)(move)) return { Component: DeclareEnd, player }
    if (isCustomMoveType(CustomMoveType.UseTravellerEffect)(move)) return { Component: UseEffect, player }
    if (isCustomMoveType(CustomMoveType.IgnoreTravellerEffect)(move)) return { Component: IgnoreEffect, player }
    if (isCustomMoveType(CustomMoveType.ChooseNinjaCopy)(move)) {
      const ninja = cardsOf(context.game)[(move.data as ChooseNinjaCopyData).ninja]
      return { Component: NinjaCopy, player: ninja?.location.player }
    }
    return undefined
  }
}

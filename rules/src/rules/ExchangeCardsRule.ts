import { isMoveItemType, ItemMove, MaterialMove, SimultaneousRule } from '@gamepark/rules-api'
import { CardId } from '../material/CardId'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { RuleId } from './RuleId'

/**
 * Setup step 6: each player keeps one of their 2 Development cards and gives the other one to their opponent.
 * The cards given are hidden until both players have chosen, then Hands are shuffled (step 7).
 */
export class ExchangeCardsRule extends SimultaneousRule<number, MaterialType, LocationType> {
  getActivePlayerLegalMoves(player: number): MaterialMove[] {
    const opponent = this.game.players.find((other) => other !== player)!
    return this.material(MaterialType.Card)
      .location(LocationType.Hand)
      .player(player)
      .id<CardId>((id) => id !== CardId.Mountain)
      .moveItems((item) => ({ type: LocationType.Gift, player: opponent, x: item.location.x }))
  }

  afterItemMove(move: ItemMove): MaterialMove[] {
    if (isMoveItemType(MaterialType.Card)(move) && move.location.type === LocationType.Gift) {
      const giver = this.game.players.find((player) => player !== move.location.player)!
      return [this.endPlayerTurn(giver)]
    }
    return []
  }

  getMovesAfterPlayersDone(): MaterialMove[] {
    const cards = this.material(MaterialType.Card)
    const gifts = cards.location(LocationType.Gift)
    const moves: MaterialMove[] = []
    for (const player of this.game.players) {
      const giver = this.game.players.find((other) => other !== player)!
      // The received card takes the slot of the card the player gave
      const vacatedSlot = gifts.player(giver).getItem()!.location.x
      moves.push(gifts.player(player).moveItem({ type: LocationType.Hand, player, x: vacatedSlot }))
    }
    // The Hand of each player, with the card they receive
    for (const player of this.game.players) {
      moves.push(cards.location((location) => location.type === LocationType.Hand || location.type === LocationType.Gift).player(player).shuffle())
    }
    moves.push(this.startPlayerTurn(RuleId.PlayerTurn, this.game.players[0]))
    return moves
  }
}

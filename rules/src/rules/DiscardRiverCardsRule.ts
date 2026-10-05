import { isMoveItemType, ItemMove, MaterialMove } from '@gamepark/rules-api'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { Memory } from './Memory'
import { NaishiPlayerRule, revealNextCard } from './NaishiPlayerRule'

/**
 * Additional action: discard 2 cards of the River, from 2 different piles. The next cards are revealed only after both are discarded.
 * Discarding the first card empties its pile, so the second card is necessarily in another pile.
 */
export class DiscardRiverCardsRule extends NaishiPlayerRule {
  getPlayerMoves(): MaterialMove[] {
    // Once the first card is discarded the action cannot be cancelled anymore
    const started = (this.remind<number[] | undefined>(Memory.DiscardedPiles) ?? []).length > 0
    return [...this.river.moveItems({ type: LocationType.Discard }), ...(started ? [] : this.getCancelMoves())]
  }

  beforeItemMove(move: ItemMove): MaterialMove[] {
    if (isMoveItemType(MaterialType.Card)(move) && move.location.type === LocationType.Discard) {
      const pile = this.material(MaterialType.Card).getItem(move.itemIndex).location.x!
      this.memorize<number[]>(Memory.DiscardedPiles, (piles = []) => [...piles, pile])
    }
    return []
  }

  afterItemMove(move: ItemMove): MaterialMove[] {
    if (isMoveItemType(MaterialType.Emissary)(move)) return this.afterCancel(move)
    if (isMoveItemType(MaterialType.Card)(move) && move.location.type === LocationType.Discard) {
      const piles = this.remind<number[]>(Memory.DiscardedPiles)
      if (piles.length === 2) {
        this.forget(Memory.DiscardedPiles)
        this.forget(Memory.PlacedEmissary)
        return [...piles.flatMap((pile) => revealNextCard((type) => this.material(type), pile)), ...this.backToTurn()]
      }
    }
    return []
  }
}

import { isMoveItemType, ItemMove, MaterialMove } from '@gamepark/rules-api'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { Memory } from './Memory'
import { NaishiPlayerRule, revealMissingCards } from './NaishiPlayerRule'

/**
 * Additional action: discard 2 cards of the River, from 2 different piles. The next cards are revealed only after both are discarded.
 * Discarding the first card empties its pile, so the second card is necessarily in another pile.
 */
export class DiscardRiverCardsRule extends NaishiPlayerRule {
  getPlayerMoves(): MaterialMove[] {
    return this.river.moveItems({ type: LocationType.Discard })
  }

  afterItemMove(move: ItemMove): MaterialMove[] {
    if (isMoveItemType(MaterialType.Card)(move) && move.location.type === LocationType.Discard) {
      const count = this.memorize<number>(Memory.DiscardCount, (count = 0) => count + 1)
      if (count === 2) {
        this.forget(Memory.DiscardCount)
        return [...revealMissingCards((type) => this.material(type)), ...this.backToTurn()]
      }
    }
    return []
  }
}

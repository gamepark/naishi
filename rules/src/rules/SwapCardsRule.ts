import { CustomMove, isCustomMoveType, ItemMove, MaterialMove } from '@gamepark/rules-api'
import { MaterialType } from '../material/MaterialType'
import { CustomMoveType, SwapCardsData } from './CustomMoveType'
import { Memory } from './Memory'
import { NaishiPlayerRule, swapCardsMoves } from './NaishiPlayerRule'

/** Additional action: swap 2 cards of the River, 2 cards of your Line, 2 cards of your Hand, or a Hand card with the Line card in the same position */
export class SwapCardsRule extends NaishiPlayerRule {
  getPlayerMoves(): MaterialMove[] {
    const groups = [this.river.getIndexes(), this.line().getIndexes(), this.hand().getIndexes()]
    const pairs = groups.flatMap((indexes) => indexes.flatMap((a, i) => indexes.slice(i + 1).map((b) => ({ a, b }))))
    const cards = this.material(MaterialType.Card)
    const line = this.line()
    for (const a of this.hand().getIndexes()) {
      const b = line.filter((item) => item.location.x === cards.getItem(a).location.x).getIndexes()[0]
      pairs.push({ a, b })
    }
    return [...pairs.map((data) => this.customMove(CustomMoveType.SwapCards, data)), ...this.getCancelMoves()]
  }

  afterItemMove(move: ItemMove): MaterialMove[] {
    return this.afterCancel(move)
  }

  onCustomMove(move: CustomMove): MaterialMove[] {
    if (isCustomMoveType(CustomMoveType.SwapCards)(move)) {
      const { a, b } = move.data as SwapCardsData
      this.forget(Memory.PlacedEmissary)
      return [...swapCardsMoves(this.material(MaterialType.Card), a, b), ...this.backToTurn()]
    }
    return []
  }
}

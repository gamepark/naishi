import { CustomMove, isCustomMoveType, MaterialMove } from '@gamepark/rules-api'
import { MaterialType } from '../material/MaterialType'
import { CustomMoveType, SwapCardsData } from './CustomMoveType'
import { NaishiPlayerRule, swapCardsMoves } from './NaishiPlayerRule'

/** Imperial decree: swap a card of your Hand with the card of the Hand of your opponent in the same position, or the same with the Lines */
export class ImperialDecreeRule extends NaishiPlayerRule {
  getPlayerMoves(): MaterialMove[] {
    const pairs = [
      [this.hand(), this.hand(this.opponent)],
      [this.line(), this.line(this.opponent)]
    ].flatMap(([mine, theirs]) =>
      mine.getItems().map((item, i) => ({ a: mine.getIndexes()[i], b: theirs.filter((other) => other.location.x === item.location.x).getIndexes()[0] }))
    )
    return pairs.map((data) => this.customMove(CustomMoveType.SwapCards, data))
  }

  onCustomMove(move: CustomMove): MaterialMove[] {
    if (isCustomMoveType(CustomMoveType.SwapCards)(move)) {
      const { a, b } = move.data as SwapCardsData
      return [...swapCardsMoves(this.material(MaterialType.Card), a, b), ...this.backToTurn()]
    }
    return []
  }
}

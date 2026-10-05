import { CustomMove, isCustomMoveType, MaterialMove } from '@gamepark/rules-api'
import { MaterialType } from '../material/MaterialType'
import { CustomMoveType, SwapCardsData } from './CustomMoveType'
import { NaishiPlayerRule, swapCardsMoves } from './NaishiPlayerRule'
import { RuleId } from './RuleId'

/** Traveller effect: swap 2 cards anywhere in your territory, in your Line or in your Hand */
export class SwapTerritoryCardsRule extends NaishiPlayerRule {
  getPlayerMoves(): MaterialMove[] {
    const territory = this.line().getIndexes().concat(this.hand().getIndexes())
    return territory.flatMap((a, i) => territory.slice(i + 1).map((b) => this.customMove(CustomMoveType.SwapCards, { a, b } satisfies SwapCardsData)))
  }

  onCustomMove(move: CustomMove): MaterialMove[] {
    if (isCustomMoveType(CustomMoveType.SwapCards)(move)) {
      const { a, b } = move.data as SwapCardsData
      return [...swapCardsMoves(this.material(MaterialType.Card), a, b), this.startRule(RuleId.ResolveTravellerEffects)]
    }
    return []
  }
}

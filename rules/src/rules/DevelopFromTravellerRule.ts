import { isMoveItemType, ItemMove, MaterialMove } from '@gamepark/rules-api'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { NaishiPlayerRule } from './NaishiPlayerRule'
import { RuleId } from './RuleId'

/**
 * Traveller effect: develop the territory again. The card of the pile of the card that was just developed is not revealed yet,
 * so it cannot be taken.
 */
export class DevelopFromTravellerRule extends NaishiPlayerRule {
  getPlayerMoves(): MaterialMove[] {
    return this.getDevelopMoves()
  }

  beforeItemMove(move: ItemMove): MaterialMove[] {
    return this.beforeDevelop(move)
  }

  afterItemMove(move: ItemMove): MaterialMove[] {
    if (isMoveItemType(MaterialType.Card)(move) && (move.location.type === LocationType.Line || move.location.type === LocationType.Hand)) {
      return [...this.afterDevelop(move), this.startRule(RuleId.ResolveTravellerEffects)]
    }
    return []
  }
}

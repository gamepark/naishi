import { MaterialMove, RuleMove } from '@gamepark/rules-api'
import { LocationType } from '../material/LocationType'
import { NaishiPlayerRule } from './NaishiPlayerRule'
import { RuleId } from './RuleId'

/**
 * The end of the game: each player places the 5 cards of their Hand under the 5 cards of their Line, face up, then the Ninjas choose
 * the character they copy. Hands are revealed first, so that the choice of the Ninjas is computed from what every player can see.
 */
export class EndOfGameRule extends NaishiPlayerRule {
  onRuleStart(_move: RuleMove): MaterialMove[] {
    return [
      ...this.game.players.flatMap((player) => this.hand(player).moveItems((item) => ({ type: LocationType.FinalHand, player, x: item.location.x }))),
      this.startSimultaneousRule(RuleId.ChooseNinjaCopy)
    ]
  }
}

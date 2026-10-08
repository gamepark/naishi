import { MaterialMove, MaterialRulesPart, RuleMove } from '@gamepark/rules-api'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { RuleId } from './RuleId'

/**
 * The end of the game: each player reveals the 5 cards of their Hand, under the 5 cards of their Line, then the Ninjas choose the character
 * they copy. Hands are revealed first, so that the choice of the Ninjas is computed from what every player can see.
 */
export class EndOfGameRule extends MaterialRulesPart<number, MaterialType, LocationType> {
  onRuleStart(_move: RuleMove): MaterialMove[] {
    // Without a type, the location is merged with the one of each card: the cards keep their slot
    const hands = this.material(MaterialType.Card).location(LocationType.Hand)
    return [...this.game.players.map((player) => hands.player(player).moveItemsAtOnce({ rotation: true })), this.startSimultaneousRule(RuleId.ChooseNinjaCopy)]
  }
}

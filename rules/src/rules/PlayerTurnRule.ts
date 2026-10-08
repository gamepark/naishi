import { CustomMove, isCustomMoveType, isMoveItemType, isMoveItemTypeAtOnce, ItemMove, MaterialMove } from '@gamepark/rules-api'
import { riverPiles } from '../material/CardId'
import { CourtAction, courtSpotsCount } from '../material/CourtAction'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { CustomMoveType } from './CustomMoveType'
import { Memory } from './Memory'
import { getEmptyPiles, NaishiPlayerRule, revealMissingCards } from './NaishiPlayerRule'
import { RuleId } from './RuleId'

/**
 * The turn of a player: they must do ONE of these actions:
 * - develop their territory, with the possibility of an additional action before or after
 * - impose an imperial decree
 * - recall their Emissaries
 * - declare the end of the game
 * The turn ends when the player confirms it.
 */
export class PlayerTurnRule extends NaishiPlayerRule {
  getPlayerMoves(): MaterialMove[] {
    const mainActionDone = this.remind<boolean | undefined>(Memory.MainActionDone)
    const additionalActionDone = this.remind<boolean | undefined>(Memory.AdditionalActionDone)
    const moves: MaterialMove[] = []
    if (!mainActionDone) {
      const mainActions = [
        ...this.getDevelopMoves(),
        ...(additionalActionDone ? [] : [...this.getDecreeMoves(), ...this.getRecallMoves(), ...this.getDeclareEndMoves()])
      ]
      // No action is possible (the River is empty during the last turn, no Emissary to recall, the decree is taken): the player can only pass
      if (mainActions.length === 0) return [this.customMove(CustomMoveType.EndTurn)]
      moves.push(...mainActions)
    }
    if (!additionalActionDone) {
      moves.push(...this.getAdditionalActionMoves())
    }
    if (mainActionDone) {
      moves.push(this.customMove(CustomMoveType.EndTurn))
    }
    return moves
  }

  /** The main action is done and no additional action is done or possible (all the Emissaries are on the court): nothing else can be played, the turn ends without confirmation */
  isTurnOver(): boolean {
    return (
      !!this.remind<boolean | undefined>(Memory.MainActionDone) &&
      (!!this.remind<boolean | undefined>(Memory.AdditionalActionDone) || this.getAdditionalActionMoves().length === 0)
    )
  }

  /** Back from an action (swap, decree, effect of a Traveller...): the turn may be over */
  onRuleStart(): MaterialMove[] {
    return this.isTurnOver() ? this.endTurn() : []
  }

  getFreeSpots(action: CourtAction): number[] {
    const occupied = this.material(MaterialType.Emissary).location(LocationType.CourtSpot).locationId(action).getItems()
    return Array.from({ length: courtSpotsCount[action] }, (_, x) => x).filter((x) => !occupied.some((item) => item.location.x === x))
  }

  getSpotMoves(action: CourtAction): MaterialMove[] {
    if (this.reserve.length === 0) return []
    return this.getFreeSpots(action).map((x) => this.reserve.moveItem({ type: LocationType.CourtSpot, id: action, x }))
  }

  getDecreeMoves(): MaterialMove[] {
    return this.getSpotMoves(CourtAction.Decree)
  }

  /** Additional actions: swap 2 cards, or discard 2 cards of the River */
  getAdditionalActionMoves(): MaterialMove[] {
    return [...this.getSpotMoves(CourtAction.Swap), ...(this.canDiscardRiverCards() ? this.getSpotMoves(CourtAction.DiscardRiver) : [])]
  }

  /**
   * Discarding 2 cards of the River needs 2 piles that are not empty. Before the development, a card must be left to develop: otherwise
   * the player could do no main action at all, since the additional action is only possible with a development.
   */
  canDiscardRiverCards(): boolean {
    if (riverPiles - getEmptyPiles((type) => this.material(type)).length < 2) return false
    if (this.remind<boolean | undefined>(Memory.MainActionDone)) return true
    return this.material(MaterialType.Card).location((location) => location.type === LocationType.River || location.type === LocationType.RiverDeck).length > 2
  }

  /** Get back all the Emissaries from the Imperial Court board (except the one on the decree), all at once */
  getRecallMoves(): MaterialMove[] {
    const emissaries = this.getRecalledEmissaries()
    return emissaries.length > 0 ? [emissaries.moveItemsAtOnce({ type: LocationType.EmissaryReserve, player: this.player })] : []
  }

  /** The end of the game can be declared when a pile of the River is empty, unless the end of the game was already triggered */
  getDeclareEndMoves(): MaterialMove[] {
    if (this.remind<number | undefined>(Memory.FinalTurn) !== undefined) return []
    // In the tutorial, the opponent never ends the game: the tutorial explains it to the player, who does it
    if (this.game.tutorial && this.player !== this.game.players[0]) return []
    return getEmptyPiles((type) => this.material(type)).length > 0 ? [this.customMove(CustomMoveType.DeclareEndOfGame)] : []
  }

  beforeItemMove(move: ItemMove): MaterialMove[] {
    return this.beforeDevelop(move)
  }

  afterItemMove(move: ItemMove): MaterialMove[] {
    if (isMoveItemTypeAtOnce(MaterialType.Emissary)(move)) {
      this.memorize(Memory.MainActionDone, true)
      this.memorize(Memory.AdditionalActionDone, true)
      return this.endTurn()
    }
    if (isMoveItemType(MaterialType.Emissary)(move) && move.location.type === LocationType.CourtSpot) {
      this.memorize(Memory.AdditionalActionDone, true)
      switch (move.location.id as CourtAction) {
        case CourtAction.Decree:
          this.memorize(Memory.MainActionDone, true)
          return [this.startRule(RuleId.ImperialDecree)]
        case CourtAction.Swap:
          return [this.startRule(RuleId.SwapCards)]
        case CourtAction.DiscardRiver:
          return [this.startRule(RuleId.DiscardRiverCards)]
      }
    }
    if (isMoveItemType(MaterialType.Card)(move)) {
      if (move.location.type === LocationType.Line || move.location.type === LocationType.Hand) {
        this.memorize(Memory.MainActionDone, true)
        const moves = this.afterDevelop(move)
        // The effects of the Travellers come first: the next card is revealed, and the turn may end, once they are resolved
        if (this.hasPendingEffects()) return [...moves, this.startRule(RuleId.ResolveTravellerEffects)]
        moves.push(...revealMissingCards((type) => this.material(type)))
        return this.isTurnOver() ? [...moves, ...this.endTurn()] : moves
      }
    }
    return []
  }

  onCustomMove(move: CustomMove): MaterialMove[] {
    if (isCustomMoveType(CustomMoveType.DeclareEndOfGame)(move)) {
      this.memorize(Memory.FinalTurn, this.nextPlayer)
      return this.endTurn()
    }
    if (isCustomMoveType(CustomMoveType.EndTurn)(move)) {
      return this.endTurn()
    }
    return []
  }
}

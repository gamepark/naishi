import { CustomMove, isCustomMoveType, isMoveItemType, isMoveItemTypeAtOnce, ItemMove, MaterialMove } from '@gamepark/rules-api'
import { CourtAction, courtSpotsCount } from '../material/CourtAction'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { CustomMoveType } from './CustomMoveType'
import { Memory } from './Memory'
import { getEmptyPiles, NaishiPlayerRule } from './NaishiPlayerRule'
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
      moves.push(...this.getDevelopMoves())
      if (!additionalActionDone) {
        moves.push(...this.getDecreeMoves(), ...this.getRecallMoves(), ...this.getDeclareEndMoves())
      }
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

  /** Additional actions: swap 2 cards, or discard 2 cards of the River (2 different piles: it needs at least 2 cards there) */
  getAdditionalActionMoves(): MaterialMove[] {
    return [...this.getSpotMoves(CourtAction.Swap), ...(this.river.length >= 2 ? this.getSpotMoves(CourtAction.DiscardRiver) : [])]
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
      if (move.location.type === LocationType.Discard) return this.afterDiscard(move)
      if (move.location.type === LocationType.Line || move.location.type === LocationType.Hand) {
        this.memorize(Memory.MainActionDone, true)
        const moves = this.afterDevelop(move)
        // With the extension the effects of the Travellers come first: the turn ends when they are resolved
        return !this.extension && this.isTurnOver() ? [...moves, ...this.endTurn()] : moves
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

import { CustomMove, isCustomMoveType, MaterialMove, RuleMove } from '@gamepark/rules-api'
import { CardId } from '../material/CardId'
import { LocationType } from '../material/LocationType'
import { TravellerEffect, travellerEffects } from '../material/Traveller'
import { CustomMoveType, TravellerEffectData } from './CustomMoveType'
import { Memory } from './Memory'
import { NaishiPlayerRule, revealMissingCards } from './NaishiPlayerRule'
import { RuleId } from './RuleId'

const startsRule = (card: CardId) => {
  const effect = travellerEffects[card]?.effect
  return effect === TravellerEffect.SwapCards || effect === TravellerEffect.Develop
}

/**
 * The Travellers that entered or left the territory have an effect that the player can use or ignore, in the order they want.
 * Once all the effects are resolved, the next cards of the piles of the River are revealed and the turn goes on.
 */
export class ResolveTravellerEffectsRule extends NaishiPlayerRule {
  getPendingEffects(): CardId[] {
    return this.remind<CardId[] | undefined>(Memory.PendingEffects) ?? []
  }

  getPlayerMoves(): MaterialMove[] {
    return this.getPendingEffects().flatMap((card, index) => [
      ...(this.canUseEffect(card) ? [this.customMove(CustomMoveType.UseTravellerEffect, { index } satisfies TravellerEffectData)] : []),
      this.customMove(CustomMoveType.IgnoreTravellerEffect, { index } satisfies TravellerEffectData)
    ])
  }

  onRuleStart(_move: RuleMove): MaterialMove[] {
    return this.getPendingEffects().length === 0 ? this.finish() : []
  }

  onCustomMove(move: CustomMove): MaterialMove[] {
    const useEffect = isCustomMoveType(CustomMoveType.UseTravellerEffect)(move)
    if (!useEffect && !isCustomMoveType(CustomMoveType.IgnoreTravellerEffect)(move)) return []
    const { index } = move.data as TravellerEffectData
    const pending = this.getPendingEffects()
    const card = pending[index]
    this.memorize<CardId[]>(Memory.PendingEffects, pending.filter((_, i) => i !== index))
    // Effects that need a choice start another rule, which comes back here
    if (useEffect && startsRule(card)) return this.useEffect(card)
    const moves = useEffect ? this.useEffect(card) : []
    return this.getPendingEffects().length === 0 ? [...moves, ...this.finish()] : moves
  }

  useEffect(card: CardId): MaterialMove[] {
    switch (travellerEffects[card]?.effect) {
      case TravellerEffect.SwapCards:
        return [this.startRule(RuleId.SwapTerritoryCards)]
      case TravellerEffect.Develop:
        return [this.startRule(RuleId.DevelopFromTraveller)]
      case TravellerEffect.RecallEmissaries:
        return [this.getRecalledEmissaries().moveItemsAtOnce({ type: LocationType.EmissaryReserve, player: this.player })]
      default:
        return []
    }
  }

  /** All the effects are resolved: the next cards of the piles are revealed, and the turn goes on */
  finish(): MaterialMove[] {
    this.forget(Memory.PendingEffects)
    return [...revealMissingCards((type) => this.material(type)), ...this.backToTurn()]
  }
}

import { CompetitiveScore, FillGapStrategy, hideItemId, hideItemIdToOthers, MaterialGame, MaterialMove, PositiveSequenceStrategy, SecretMaterialRules, TimeLimit } from '@gamepark/rules-api'
import { LocationType } from './material/LocationType'
import { MaterialType } from './material/MaterialType'
import { ChooseNinjaCopyRule } from './rules/ChooseNinjaCopyRule'
import { DiscardRiverCardsRule } from './rules/DiscardRiverCardsRule'
import { EndOfGameRule } from './rules/EndOfGameRule'
import { ExchangeCardsRule } from './rules/ExchangeCardsRule'
import { DevelopFromTravellerRule } from './rules/DevelopFromTravellerRule'
import { ImperialDecreeRule } from './rules/ImperialDecreeRule'
import { PlayerTurnRule } from './rules/PlayerTurnRule'
import { ResolveTravellerEffectsRule } from './rules/ResolveTravellerEffectsRule'
import { RuleId } from './rules/RuleId'
import { SwapCardsRule } from './rules/SwapCardsRule'
import { SwapTerritoryCardsRule } from './rules/SwapTerritoryCardsRule'
import { getPlayerScore } from './scoring/getPlayerScore'

/**
 * This class implements the rules of the board game.
 * It must follow Game Park "Rules" API so that the Game Park server can enforce the rules.
 * Hands are secret: a player knows their own cards, not the opponent's. The cards under a River pile are hidden.
 */
export class NaishiRules
  extends SecretMaterialRules<number, MaterialType, LocationType>
  implements
    TimeLimit<MaterialGame<number, MaterialType, LocationType>, MaterialMove<number, MaterialType, LocationType>, number>,
    CompetitiveScore<MaterialGame<number, MaterialType, LocationType>, MaterialMove<number, MaterialType, LocationType>, number>
{
  rules = {
    [RuleId.ExchangeCards]: ExchangeCardsRule,
    [RuleId.PlayerTurn]: PlayerTurnRule,
    [RuleId.SwapCards]: SwapCardsRule,
    [RuleId.DiscardRiverCards]: DiscardRiverCardsRule,
    [RuleId.ImperialDecree]: ImperialDecreeRule,
    [RuleId.ResolveTravellerEffects]: ResolveTravellerEffectsRule,
    [RuleId.SwapTerritoryCards]: SwapTerritoryCardsRule,
    [RuleId.DevelopFromTraveller]: DevelopFromTravellerRule,
    [RuleId.EndOfGame]: EndOfGameRule,
    [RuleId.ChooseNinjaCopy]: ChooseNinjaCopyRule
  }

  // The Hand, the Line and the River are fixed slots (x = position) that must never slide: no strategy there.
  locationsStrategies = {
    [MaterialType.Card]: {
      [LocationType.RiverDeck]: new PositiveSequenceStrategy(),
      // The discard pile: the last card discarded is on top (x = order)
      [LocationType.Discard]: new PositiveSequenceStrategy()
    },
    // An Emissary sent to the Imperial Court must not make the others of the reserve slide
    [MaterialType.Emissary]: {
      [LocationType.EmissaryReserve]: new FillGapStrategy()
    }
  }

  hidingStrategies = {
    [MaterialType.Card]: {
      [LocationType.RiverDeck]: hideItemId,
      [LocationType.Gift]: hideItemId,
      [LocationType.Hand]: hideItemIdToOthers
    }
  }

  getScore(player: number): number {
    return getPlayerScore(this, player).total
  }

  /** In case of a tie, the player with the most different colors in their territory wins. If the tie persists, there are no more tie-breakers. */
  getTieBreaker(tieBreaker: number, player: number): number | undefined {
    return tieBreaker === 1 ? getPlayerScore(this, player).colors : undefined
  }

  giveTime(): number {
    return 60
  }
}

import { RuleId } from '@gamepark/naishi/rules/RuleId'
import { ComponentType } from 'react'
import { ChooseNinjaCopyHeader } from './ChooseNinjaCopyHeader'
import { DevelopFromTravellerHeader } from './DevelopFromTravellerHeader'
import { DiscardRiverCardsHeader } from './DiscardRiverCardsHeader'
import { EndOfGameHeader } from './EndOfGameHeader'
import { ExchangeCardsHeader } from './ExchangeCardsHeader'
import { ImperialDecreeHeader } from './ImperialDecreeHeader'
import { PlayerTurnHeader } from './PlayerTurnHeader'
import { ResolveTravellerEffectsHeader } from './ResolveTravellerEffectsHeader'
import { SwapCardsHeader } from './SwapCardsHeader'
import { SwapTerritoryCardsHeader } from './SwapTerritoryCardsHeader'

export const Headers: Partial<Record<RuleId, ComponentType>> = {
  [RuleId.ExchangeCards]: ExchangeCardsHeader,
  [RuleId.PlayerTurn]: PlayerTurnHeader,
  [RuleId.SwapCards]: SwapCardsHeader,
  [RuleId.DiscardRiverCards]: DiscardRiverCardsHeader,
  [RuleId.ImperialDecree]: ImperialDecreeHeader,
  [RuleId.ResolveTravellerEffects]: ResolveTravellerEffectsHeader,
  [RuleId.SwapTerritoryCards]: SwapTerritoryCardsHeader,
  [RuleId.DevelopFromTraveller]: DevelopFromTravellerHeader,
  [RuleId.EndOfGame]: EndOfGameHeader,
  [RuleId.ChooseNinjaCopy]: ChooseNinjaCopyHeader
}

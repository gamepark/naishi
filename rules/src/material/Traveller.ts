import { CardId } from './CardId'

/** When the effect of a Traveller triggers */
export enum TravellerTrigger {
  /** The Traveller enters the territory from the River */
  Enter = 1,
  /** The Traveller leaves the territory: it is discarded because a card of the River replaces it */
  Leave
}

export enum TravellerEffect {
  /** Swap 2 cards anywhere in the territory */
  SwapCards = 1,
  /** Get back the Emissaries (except the one on the decree) */
  RecallEmissaries,
  /** Develop the territory again */
  Develop,
  /** Take the Ryokan, wherever it is, and place it on its 7 points side */
  RyokanSide7
}

export const travellerEffects: Partial<Record<CardId, { trigger: TravellerTrigger; effect: TravellerEffect }>> = {
  [CardId.UmbrellaLady]: { trigger: TravellerTrigger.Leave, effect: TravellerEffect.SwapCards },
  [CardId.OldMan]: { trigger: TravellerTrigger.Leave, effect: TravellerEffect.RecallEmissaries },
  [CardId.CherryLady]: { trigger: TravellerTrigger.Enter, effect: TravellerEffect.SwapCards },
  [CardId.Girl]: { trigger: TravellerTrigger.Leave, effect: TravellerEffect.Develop },
  [CardId.Porter]: { trigger: TravellerTrigger.Enter, effect: TravellerEffect.RecallEmissaries },
  [CardId.Samurai]: { trigger: TravellerTrigger.Enter, effect: TravellerEffect.RyokanSide7 }
}

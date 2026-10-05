export enum CustomMoveType {
  /** Swap 2 cards. data: SwapCardsData */
  SwapCards = 1,
  /** Get back all the Emissaries from the Imperial Court board (except the one on the decree) */
  RecallEmissaries,
  /** Declare the end of the game */
  DeclareEndOfGame,
  /** Confirm the end of the turn */
  EndTurn,
  /** Use the effect of a Traveller. data: TravellerEffectData */
  UseTravellerEffect,
  /** Ignore the effect of a Traveller: the effects of the Travellers are never mandatory. data: TravellerEffectData */
  IgnoreTravellerEffect,
  /** A Ninja chooses the character it copies. data: ChooseNinjaCopyData */
  ChooseNinjaCopy
}

/** Indexes of the 2 cards to swap, in the Card material */
export type SwapCardsData = { a: number; b: number }

/** Index of the effect in the list of the pending effects */
export type TravellerEffectData = { index: number }

/** Indexes of the Ninja and of the card it copies, in the Card material */
export type ChooseNinjaCopyData = { ninja: number; target: number }

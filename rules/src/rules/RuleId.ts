export enum RuleId {
  /** Setup step 6: both players give one of their 2 Development cards to their opponent, then the Hands are shuffled (step 7) */
  ExchangeCards = 1,
  /** The turn of a player: one main action, and possibly one additional action */
  PlayerTurn,
  /** Additional action: swap 2 cards */
  SwapCards,
  /** Additional action: discard 2 cards from 2 different piles of the River */
  DiscardRiverCards,
  /** Imperial decree: swap a card with the card of the opponent at the same position */
  ImperialDecree,
  /** Legends & Travellers: the player chooses which Traveller effects to use, in the order they want */
  ResolveTravellerEffects,
  /** Traveller effect: swap 2 cards anywhere in the territory */
  SwapTerritoryCards,
  /** Traveller effect: develop the territory again */
  DevelopFromTraveller,
  /** The end of the game: Hands are revealed under the Lines */
  EndOfGame,
  /** Each Ninja chooses the character it copies */
  ChooseNinjaCopy
}

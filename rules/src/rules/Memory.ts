export enum Memory {
  /** The main action of the turn (develop, decree or recall) has been done */
  MainActionDone = 1,
  /** The additional action of the turn has been done, or is not possible anymore this turn */
  AdditionalActionDone,
  /** The piles of the River whose revealed card was discarded by the additional action, while the next cards are not revealed yet */
  DiscardedPiles,
  /** The Traveller that has just been discarded by a development, until its effect is known */
  DiscardedTraveller,
  /** The Travellers whose effect can be used (the player may also ignore it), in the order they were triggered */
  PendingEffects,
  /** The piles of the River whose next card is revealed once the effects of the Travellers are resolved */
  PilesToReveal,
  /** The player who plays the last turn of the game, once the end of the game has been triggered */
  FinalTurn,
  /** For each Ninja (item index), the index of the card it copies, or null when there is no character to copy */
  NinjaCopies,
  /** The index of the Emissary that has just been placed on the Imperial Court board, while its action is not done: it can be taken back */
  PlacedEmissary
}

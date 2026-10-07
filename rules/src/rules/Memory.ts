export enum Memory {
  /** The main action of the turn (develop, decree or recall) has been done */
  MainActionDone = 1,
  /** The additional action of the turn has been done, or is not possible anymore this turn */
  AdditionalActionDone,
  /** The number of River cards discarded by the additional action, while the next cards are not revealed yet */
  DiscardCount,
  /** The Travellers whose effect can be used (the player may also ignore it), in the order they were triggered */
  PendingEffects,
  /** The player who plays the last turn of the game, once the end of the game has been triggered */
  FinalTurn,
  /** For each Ninja (item index), the index of the card it copies, or null when there is no character to copy */
  NinjaCopies
}

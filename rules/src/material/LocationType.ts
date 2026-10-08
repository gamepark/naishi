export enum LocationType {
  /** A player's Hand: 5 slots (x = position), hidden to the opponent until it is revealed at the end of the game (rotation = true) */
  Hand = 1,
  /** A player's Line: 5 slots (x = position), face up */
  Line,
  /** The revealed card of each of the 5 River piles (x = pile) */
  River,
  /** The face down cards of a River pile, under the revealed one (id = pile, x = order in the pile, the top has the highest x) */
  RiverDeck,
  /** At the beginning of the game, the Development card a player gives to their opponent (player = who receives it, x = slot it comes from) */
  Gift,
  /** The discard pile, beside the River: the discarded cards are face up, stacked in the order they were discarded */
  Discard,
  /** The Emissary tokens a player still holds */
  EmissaryReserve,
  /** The Imperial Court board itself (static item) */
  CourtBoard,
  /** An Emissary spot on the Imperial Court board (id = CourtAction, x = spot among the ones of that action) */
  CourtSpot,
  /** The side of the table of the player who has the First player card */
  FirstPlayerSpot,
  /** Legends & Travellers: the Ryokan card, out of play while nobody owns it (no player), or beside the territory of its owner */
  RyokanSpot,
  /** Legends & Travellers: the base cards that the Legends replace, out of play (x = order), face up above the Ryokan */
  SetAside,
  /** The game mat (static item) */
  Playmat,
  /** The score block (static item) */
  ScorePad
}

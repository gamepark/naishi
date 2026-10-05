export enum CardId {
  Mountain = 1,
  Naishi,
  Advisor,
  Fortress,
  Sentinel,
  Torii,
  Monk,
  Rice,
  Banner,
  Horseman,
  Ronin,
  Ninja,
  // Legends & Travellers: each Legend replaces one copy of the base character it is named after
  LegendNaishi,
  LegendAdvisor,
  LegendSentinel,
  LegendHorseman,
  LegendMonk,
  LegendRonin,
  LegendNinja,
  // Legends & Travellers: the Travellers (one copy each)
  UmbrellaLady,
  OldMan,
  CherryLady,
  Girl,
  Porter,
  Samurai
}

/** The 34 Development cards of the base game, with their number of copies */
export const developmentCopies: [CardId, number][] = [
  [CardId.Naishi, 2],
  [CardId.Advisor, 4],
  [CardId.Fortress, 4],
  [CardId.Sentinel, 4],
  [CardId.Torii, 4],
  [CardId.Monk, 3],
  [CardId.Rice, 5],
  [CardId.Banner, 2],
  [CardId.Horseman, 2],
  [CardId.Ronin, 2],
  [CardId.Ninja, 2]
]

/** Each Legend and the base character whose copy it replaces at the setup */
export const legendReplaces: Partial<Record<CardId, CardId>> = {
  [CardId.LegendNaishi]: CardId.Naishi,
  [CardId.LegendAdvisor]: CardId.Advisor,
  [CardId.LegendSentinel]: CardId.Sentinel,
  [CardId.LegendHorseman]: CardId.Horseman,
  [CardId.LegendMonk]: CardId.Monk,
  [CardId.LegendRonin]: CardId.Ronin,
  [CardId.LegendNinja]: CardId.Ninja
}

export const legends = Object.keys(legendReplaces).map(Number) as CardId[]

/** The base character a Legend replaces, or the card itself */
export const baseType = (id: CardId): CardId => legendReplaces[id] ?? id
export const isLegend = (id: CardId) => id in legendReplaces

export const characters = [CardId.Naishi, CardId.Advisor, CardId.Sentinel, CardId.Monk, CardId.Horseman, CardId.Ronin, CardId.Ninja]
/** The provinces have a hexagon icon: they are the "buildings" of the Legendary Horseman */
export const provinces = [CardId.Fortress, CardId.Torii, CardId.Rice, CardId.Banner]

export const travellers = [CardId.UmbrellaLady, CardId.OldMan, CardId.CherryLady, CardId.Girl, CardId.Porter, CardId.Samurai]

export const isTraveller = (id: CardId) => travellers.includes(id)

/** Number of piles in the River, which is also the number of cards in a Hand and in a Line */
export const riverPiles = 5
export const territorySize = 5

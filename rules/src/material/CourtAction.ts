/** The 3 kinds of Additional Action printed on the Imperial Court board */
export enum CourtAction {
  /** Swap 2 cards: 3 spots */
  Swap = 1,
  /** Discard 2 cards of the River: 2 spots */
  DiscardRiver,
  /** Imperial decree: 1 spot, the Emissary stays there until the end of the game */
  Decree
}

export const courtSpotsCount: Record<CourtAction, number> = {
  [CourtAction.Swap]: 3,
  [CourtAction.DiscardRiver]: 2,
  [CourtAction.Decree]: 1
}

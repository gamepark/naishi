import { LocationType } from '@gamepark/naishi/material/LocationType'
import { MaterialType } from '@gamepark/naishi/material/MaterialType'
import { DeckLocator, DropAreaDescription, ItemContext, ListLocator, Locator, MaterialContext } from '@gamepark/react-game'
import { Location } from '@gamepark/rules-api'
import { courtBoardRotation, emissaryReserveGap, lineY, riverY, rowY, setAsideGap, tableLayoutOf } from './TableLayout'
import { SwapDropAreaDescription } from './SwapDropAreaDescription'

const riverDeckGap = { x: -0.08, y: -0.2 }

/** A row of 5 cards, one per position: `x` of the location is the position */
class TerritoryRowLocator extends ListLocator {
  generateLocationDescriptionFromDraggedItem(location: Location, context: ItemContext) {
    return new SwapDropAreaDescription(super.generateLocationDescriptionFromDraggedItem(location, context))
  }

  constructor(private row: 'line' | 'hand') {
    super()
  }

  getGap(_location: Location, context: MaterialContext) {
    return { x: tableLayoutOf(context).columnPitch }
  }

  getCoordinates(location: Location, context: MaterialContext) {
    const layout = tableLayoutOf(context)
    return { x: layout.firstColumnX, y: rowY(this.row === 'line' ? lineY : layout.handY, location.player, context) }
  }
}

/**
 * The revealed cards of the 5 River piles, on top of the face down cards of their pile: like each face down card, it is shifted
 * so that the stack stays visible, which makes the thickness of the pile.
 */
class RiverLocator extends Locator {
  getCoordinates(location: Location, context: MaterialContext) {
    const { x: gapX, y: gapY } = riverDeckGap
    const { firstColumnX, columnPitch } = tableLayoutOf(context)
    const below = context.rules.material(MaterialType.Card).location(LocationType.RiverDeck).locationId(location.x).length
    return { x: firstColumnX + location.x! * columnPitch + below * gapX, y: riverY + below * gapY, z: 1 }
  }

  generateLocationDescriptionFromDraggedItem(location: Location, context: ItemContext) {
    return new SwapDropAreaDescription(super.generateLocationDescriptionFromDraggedItem(location, context))
  }
}

/**
 * The face down cards of a River pile: the pile is the location id, and the cards are stacked by their x.
 * Each card shifts the stack by 2 mm up and 0.8 mm left, so the thickness of the pile shows how many cards are left
 * (6 cards at most: 12 mm up, less than the space left between the River and the Lines).
 */
class RiverDeckLocator extends DeckLocator {
  gap = riverDeckGap

  getCoordinates(location: Location, context: MaterialContext) {
    const { firstColumnX, columnPitch } = tableLayoutOf(context)
    return { x: firstColumnX + location.id * columnPitch, y: riverY }
  }
}

/** The 2 Emissaries a player still holds, in a column between the Line and the Hand */
class EmissaryReserveLocator extends ListLocator {
  gap = { y: emissaryReserveGap }

  getCoordinates(location: Location, context: MaterialContext) {
    const { emissaryReserveX, emissaryReserveY } = tableLayoutOf(context)
    return { x: emissaryReserveX, y: rowY(emissaryReserveY, location.player, context) - emissaryReserveGap / 2 }
  }
}

/** Each printed circle of the Imperial Court board or of the game mat: id = CourtAction, x = the spot among the ones of that action */
class CourtSpotLocator extends Locator {
  locationDescription = new DropAreaDescription({ width: 1.9, height: 1.9, borderRadius: 0.95 })

  getCoordinates(location: Location, context: MaterialContext) {
    const { x, y } = tableLayoutOf(context).courtSpot(location.id, location.x ?? 0)
    return { x, y, z: 1 }
  }
}

class ScorePadLocator extends Locator {
  getCoordinates(_location: Location, context: MaterialContext) {
    return tableLayoutOf(context).scorePadCenter
  }
}

class CourtBoardLocator extends Locator {
  rotateZ = courtBoardRotation

  getCoordinates(_location: Location, context: MaterialContext) {
    return tableLayoutOf(context).courtBoardCenter
  }
}

/** The game mat */
class PlaymatLocator extends Locator {
  getCoordinates(_location: Location, context: MaterialContext) {
    return tableLayoutOf(context).playmatCenter
  }
}

/** The card a player gives at the beginning of the game, face down beside the Line of the player who receives it */
class GiftLocator extends Locator {
  locationDescription = new DropAreaDescription({ width: 6.3, height: 8.8, borderRadius: 0.3 })

  getCoordinates(location: Location, context: MaterialContext) {
    return { x: tableLayoutOf(context).rightSideX, y: rowY(lineY, location.player, context) }
  }
}

/** The First player card is beside the Hand of the player who has it */
class FirstPlayerSpotLocator extends Locator {
  getCoordinates(location: Location, context: MaterialContext) {
    const { firstPlayerCardX, handY } = tableLayoutOf(context)
    return { x: firstPlayerCardX, y: rowY(handY, location.player, context) }
  }
}

/** The Ryokan is beside the discard pile while nobody has it, and beside the Line of the player who has it */
class RyokanSpotLocator extends Locator {
  getCoordinates(location: Location, context: MaterialContext) {
    const { ryokanX, rightSideX } = tableLayoutOf(context)
    if (location.player === undefined) return { x: ryokanX, y: riverY }
    return { x: rightSideX, y: rowY(lineY, location.player, context) }
  }
}

/** The base cards replaced by the Legends, out of play, above the Ryokan */
class SetAsideLocator extends ListLocator {
  gap = { y: setAsideGap }

  getCoordinates(_location: Location, context: MaterialContext) {
    const { ryokanX, setAsideY } = tableLayoutOf(context)
    return { x: ryokanX, y: setAsideY }
  }
}

/** The discard pile, face up, beside the River: the discarded cards are stacked on it */
class DiscardLocator extends DeckLocator {
  gap = { x: -0.04, y: -0.08 }

  getCoordinates(_location: Location, context: MaterialContext) {
    return { x: tableLayoutOf(context).rightSideX, y: riverY }
  }
}

export const Locators: Partial<Record<LocationType, Locator<number, MaterialType, LocationType>>> = {
  [LocationType.Hand]: new TerritoryRowLocator('hand'),
  [LocationType.Line]: new TerritoryRowLocator('line'),
  [LocationType.FinalHand]: new TerritoryRowLocator('hand'),
  [LocationType.River]: new RiverLocator(),
  [LocationType.RiverDeck]: new RiverDeckLocator(),
  [LocationType.Gift]: new GiftLocator(),
  [LocationType.Discard]: new DiscardLocator(),
  [LocationType.EmissaryReserve]: new EmissaryReserveLocator(),
  [LocationType.CourtBoard]: new CourtBoardLocator(),
  [LocationType.Playmat]: new PlaymatLocator(),
  [LocationType.ScorePad]: new ScorePadLocator(),
  [LocationType.CourtSpot]: new CourtSpotLocator(),
  [LocationType.FirstPlayerSpot]: new FirstPlayerSpotLocator(),
  [LocationType.RyokanSpot]: new RyokanSpotLocator(),
  [LocationType.SetAside]: new SetAsideLocator()
}

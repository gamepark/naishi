import { MaterialType } from '@gamepark/naishi/material/MaterialType'
import { CustomMoveType, SwapCardsData } from '@gamepark/naishi/rules/CustomMoveType'
import { DropAreaDescription, ItemContext, MaterialContext } from '@gamepark/react-game'
import { isCustomMoveType, Location, MaterialMove } from '@gamepark/rules-api'

const sameLocation = (a: Location, b: Location) => a.type === b.type && a.player === b.player && a.x === b.x

/**
 * The drop area of a card that can be swapped: dropping a card on another one plays the swap of the 2 cards.
 * The swap is a custom move, so the framework does not know where it is dropped.
 */
export class SwapDropAreaDescription extends DropAreaDescription {
  isMoveToLocation(move: MaterialMove, location: Location, context: MaterialContext) {
    if (!isCustomMoveType(CustomMoveType.SwapCards)(move)) return super.isMoveToLocation(move, location, context)
    const cards = context.rules.material(MaterialType.Card)
    const { a, b } = move.data as SwapCardsData
    return [a, b].some((index) => sameLocation(cards.getItem(index).location, location))
  }

  canDrop(move: MaterialMove, location: Location, context: ItemContext) {
    if (!isCustomMoveType(CustomMoveType.SwapCards)(move)) return super.canDrop(move, location, context)
    const { a, b } = move.data as SwapCardsData
    if (context.index !== a && context.index !== b) return false
    const other = context.rules.material(MaterialType.Card).getItem(context.index === a ? b : a)
    return sameLocation(other.location, location)
  }
}

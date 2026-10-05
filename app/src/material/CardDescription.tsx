import { CardId } from '@gamepark/naishi/material/CardId'
import { MaterialType } from '@gamepark/naishi/material/MaterialType'
import { ChooseNinjaCopyData, CustomMoveType, SwapCardsData } from '@gamepark/naishi/rules/CustomMoveType'
import { Memory } from '@gamepark/naishi/rules/Memory'
import { CardDescription, ItemContext } from '@gamepark/react-game'
import { isCustomMoveType, isMoveItemType, MaterialItem, MaterialMove } from '@gamepark/rules-api'
import { LocationType } from '@gamepark/naishi/material/LocationType'
import { Trans } from 'react-i18next'
import { CardHelp } from '../help/CardHelp'
import { ImageButton, symbolButtonRatio } from './ImageButton'
import { symbolImage } from './symbolImages'
import ChooseNinjaButton from '../images/buttons/choose-ninja.jpg'
import Back from '../images/cards/back.jpg'
import { cardImages } from './cardImages'

class NaishiCardDescription extends CardDescription {
  width = 6.3
  height = 8.8
  borderRadius = 0.3
  backImage = Back
  menuAlwaysVisible = true
  help = CardHelp

  images = cardImages

  /** The card each Ninja copies, by item index: the Ninja is turned over to show it */
  private copies: Record<number, CardId> = {}

  /** A Ninja that copies a card turns into that card: its back shows the face of the card it copies */
  isFlipped(item: Partial<MaterialItem>, context: ItemContext) {
    const target = (context.rules.remind<Record<number, number | null> | undefined>(Memory.NinjaCopies) ?? {})[context.index]
    if (target !== undefined && target !== null) {
      this.copies[context.index] = context.rules.material(MaterialType.Card).getItem<CardId>(target).id!
      return true
    }
    delete this.copies[context.index]
    return super.isFlipped(item, context)
  }

  getBackImage(itemId: CardId, itemIndex?: number, displayIndex?: number) {
    const copy = itemIndex === undefined ? undefined : this.copies[itemIndex]
    return copy === undefined ? super.getBackImage(itemId, itemIndex, displayIndex) : this.images[copy]
  }

  /** A swap is played by dragging one of the 2 cards onto the other one */
  canDrag(move: MaterialMove, context: ItemContext) {
    if (isCustomMoveType(CustomMoveType.SwapCards)(move)) {
      const { a, b } = move.data as SwapCardsData
      return context.index === a || context.index === b
    }
    return super.canDrag(move, context)
  }

  getMoveDropLocations(context: ItemContext, move: MaterialMove) {
    if (isCustomMoveType(CustomMoveType.SwapCards)(move)) {
      const { a, b } = move.data as SwapCardsData
      const other = context.index === a ? b : a
      return [context.rules.material(MaterialType.Card).getItem(other).location]
    }
    return super.getMoveDropLocations(context, move)
  }

  /** A button on the card for the choices of the players: the card given at the beginning of the game, the character a Ninja copies */
  getItemMenu(_item: MaterialItem, context: ItemContext, legalMoves: MaterialMove[]) {
    const give = legalMoves.find((move) => isMoveItemType(MaterialType.Card)(move) && move.itemIndex === context.index && move.location.type === LocationType.Gift)
    // The arrow goes up, to the opponent: their symbol is on the button
    if (give) return <ImageButton move={give} image={symbolImage(context.player === 1 ? 2 : 1, 'up')} ratio={symbolButtonRatio} width={2.7} label={<Trans defaults="button.give" />} />
    const copy = legalMoves.find((move) => isCustomMoveType(CustomMoveType.ChooseNinjaCopy)(move) && (move.data as ChooseNinjaCopyData).target === context.index)
    if (!copy) return null
    return <ImageButton move={copy} image={ChooseNinjaButton} label={<Trans defaults="button.copy" />} round padding={14} borderColor="#FFA9C1" />
  }
}

export const cardDescription = new NaishiCardDescription()

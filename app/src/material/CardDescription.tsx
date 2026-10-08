import { CardId } from '@gamepark/naishi/material/CardId'
import { MaterialType } from '@gamepark/naishi/material/MaterialType'
import { ChooseNinjaCopyData, CustomMoveType, SwapCardsData } from '@gamepark/naishi/rules/CustomMoveType'
import { Memory } from '@gamepark/naishi/rules/Memory'
import { RuleId } from '@gamepark/naishi/rules/RuleId'
import { CardDescription, ItemContext, ItemMenuButton, usePlay } from '@gamepark/react-game'
import { CustomMove, isCustomMoveType, isMoveItemType, MaterialItem, MaterialMove } from '@gamepark/rules-api'
import { LocationType } from '@gamepark/naishi/material/LocationType'
import { Trans, useTranslation } from 'react-i18next'
import { CardHelp } from '../help/CardHelp'
import { ImageButton, symbolButtonRatio } from './ImageButton'
import { symbolImage } from './symbolImages'
import ChooseNinjaButton from '../images/buttons/choose-ninja.jpg'
import Back from '../images/cards/back.jpg'
import { cardImages } from './cardImages'
import { selectSwapCard, useSwapSelection } from './swapSelection'

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

  /** In the discard pile, only the card on top can be clicked: the others are under it */
  displayHelp(item: MaterialItem, context: ItemContext) {
    if (item.location.type === LocationType.Discard) {
      const top = Math.max(...context.rules.material(MaterialType.Card).location(LocationType.Discard).getItems().map((discarded) => discarded.location.x ?? 0))
      if ((item.location.x ?? 0) !== top) return undefined
    }
    return super.displayHelp(item, context)
  }

  /** The Ninja whose copy is being chosen is highlighted */
  highlight(item: MaterialItem, context: ItemContext) {
    if (context.rules.game.rule?.id === RuleId.ChooseNinjaCopy && context.player !== undefined) {
      const choosing = context.rules
        .getLegalMoves(context.player)
        .some((move) => isCustomMoveType(CustomMoveType.ChooseNinjaCopy)(move) && (move.data as ChooseNinjaCopyData).ninja === context.index)
      if (choosing) return true
    }
    return super.highlight(item, context)
  }

  /**
   * A button on the card for the choices of the players: the card given at the beginning of the game, the character a Ninja copies,
   * and, on each card of their territory, a discreet button that discards it for the card of the River at the same position (an alternative to the drag and drop).
   */
  getItemMenu(item: MaterialItem, context: ItemContext, legalMoves: MaterialMove[]) {
    const ruleId = context.rules.game.rule?.id
    if (ruleId === RuleId.DiscardRiverCards) {
      const discard = legalMoves.find((move) => isMoveItemType(MaterialType.Card)(move) && move.itemIndex === context.index && move.location.type === LocationType.Discard)
      return discard ? <ArrowButton move={discard} y={0} title="button.discard.title" arrow={arrows.right} /> : null
    }
    const swaps = legalMoves.filter(isCustomMoveType(CustomMoveType.SwapCards)) as CustomMove[]
    if (ruleId === RuleId.ImperialDecree) {
      // The decree swaps with the opponent: the arrow of my cards goes up, the arrow of their cards goes down
      const swap = swaps.find((move) => swapPartner(move, context.index) !== undefined)
      if (!swap) return null
      const mine = item.location.player === context.player
      return <ArrowButton move={swap} y={mine ? -3.6 : 3.6} title="button.decree.title" arrow={mine ? arrows.up : arrows.down} />
    }
    if (ruleId === RuleId.SwapCards || ruleId === RuleId.SwapTerritoryCards) return <SwapButton index={context.index} swaps={swaps} />
    const develop = legalMoves.find(
      (move) =>
        isMoveItemType(MaterialType.Card)(move) &&
        (item.location.type === LocationType.Line || item.location.type === LocationType.Hand) &&
        item.location.player === context.player &&
        move.location.type === item.location.type &&
        move.location.player === item.location.player &&
        move.location.x === item.location.x &&
        cardItems(context).getItem(move.itemIndex)?.location.type === LocationType.River
    )
    if (develop) return <DevelopButton move={develop} />
    const give = legalMoves.find((move) => isMoveItemType(MaterialType.Card)(move) && move.itemIndex === context.index && move.location.type === LocationType.Gift)
    // The arrow goes up, to the opponent: their symbol is on the button
    if (give) return <ImageButton move={give} image={symbolImage(context.player === 1 ? 2 : 1, 'up')} ratio={symbolButtonRatio} width={2.7} label={<Trans defaults="button.give" />} />
    const copy = legalMoves.find((move) => isCustomMoveType(CustomMoveType.ChooseNinjaCopy)(move) && (move.data as ChooseNinjaCopyData).target === context.index)
    if (!copy) return null
    return <ImageButton move={copy} image={ChooseNinjaButton} label={<Trans defaults="button.copy" />} round padding={14} borderColor="#FFA9C1" />
  }
}

const swapPartner = (move: CustomMove, index: number) => {
  const { a, b } = move.data as SwapCardsData
  return index === a ? b : index === b ? a : undefined
}

const arrows = {
  right: 'M5 12h13M13 6l6 6-6 6',
  up: 'M12 19V6M6 11l6-6 6 6',
  down: 'M12 5v13M6 13l6 6 6-6',
  both: 'M3 12h18M7 8l-4 4 4 4M17 8l4 4-4 4'
}

const cardItems = (context: ItemContext) => context.rules.material(MaterialType.Card)

const buttonStyle = { width: '1.7em', height: '1.7em', opacity: 0.7, border: '0.08em solid #555' }

/** A discreet round button with an arrow on a card, at the center of the card unless `x` and `y` say otherwise */
const ArrowButton = ({ move, x = 0, y, title, arrow, onClick, active }: { move?: MaterialMove; x?: number; y: number; title: string; arrow: string; onClick?: () => void; active?: boolean }) => {
  const { t } = useTranslation()
  const label = t(title)
  return (
    <ItemMenuButton move={move} x={x} y={y} title={label} aria-label={label} onClick={onClick} style={{ ...buttonStyle, ...(active && { opacity: 1, backgroundColor: '#FFA9C1' }) }}>
      <svg viewBox="0 0 24 24" width="70%" height="70%" aria-hidden>
        <path d={arrow} fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </ItemMenuButton>
  )
}

/** At the bottom right of a card of the territory: a small arrow to the right, to discard the card and take the card of the River at the same position */
const DevelopButton = ({ move }: { move: MaterialMove }) => <ArrowButton move={move} x={2.3} y={3.6} title="button.develop.title" arrow={arrows.right} />

/**
 * At the bottom center of a card that can be swapped: a click chooses the card, then a click on the button of another card swaps the 2 cards.
 * Only the cards that can be swapped with the chosen one keep their button.
 */
const SwapButton = ({ index, swaps }: { index: number; swaps: CustomMove[] }) => {
  const play = usePlay()
  const chosen = useSwapSelection()
  const choice = chosen !== undefined && swaps.some((move) => swapPartner(move, chosen) !== undefined) ? chosen : undefined
  if (choice === undefined) {
    if (!swaps.some((move) => swapPartner(move, index) !== undefined)) return null
    return <ArrowButton y={3.6} title="button.swap.title" arrow={arrows.both} onClick={() => selectSwapCard(index)} />
  }
  if (choice === index) return <ArrowButton y={3.6} title="button.swap.cancel" arrow={arrows.both} active onClick={() => selectSwapCard(undefined)} />
  const swap = swaps.find((move) => swapPartner(move, choice) === index)
  if (!swap) return null
  const swapCards = () => {
    selectSwapCard(undefined)
    play(swap)
  }
  return <ArrowButton y={3.6} title="button.swap.title" arrow={arrows.both} onClick={swapCards} />
}

export const cardDescription = new NaishiCardDescription()

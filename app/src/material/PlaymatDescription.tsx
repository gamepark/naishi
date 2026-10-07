import { LocationType } from '@gamepark/naishi/material/LocationType'
import { MaterialType } from '@gamepark/naishi/material/MaterialType'
import { BoardDescription, ItemContext, MaterialContext } from '@gamepark/react-game'
import { isMoveItemTypeAtOnce, MaterialItem, MaterialMove } from '@gamepark/rules-api'
import { Trans } from 'react-i18next'
import Playmat from '../images/boards/playmat.jpg'
import { CourtBoardHelp } from '../help/OtherHelps'
import { isPlaymatDisplayed } from '../locators/PlaymatDisplay'
import { emissaryReserveGap, playmatSize, tableLayout } from '../locators/TableLayout'
import { ImageButton, symbolButtonRatio } from './ImageButton'
import { symbolImage } from './symbolImages'

/**
 * The button to recall the Emissaries is on the mat, just above the row of the Emissaries' reserve (under the mat): on the left of the Line, so
 * that its text (3 lines in French) is neither on the Line nor on the Hand. From the center of the mat (cm), and from the middle of the row for x.
 */
const recallButton = { dx: -0.5, y: 10.8 }

/** The game mat (display choice of the subscribers): it replaces the Imperial Court board, and is under the River and the Lines */
class PlaymatDescription extends BoardDescription {
  width = playmatSize.width
  height = playmatSize.height
  borderRadius = 1.5
  image = Playmat
  menuAlwaysVisible = true
  help = CourtBoardHelp

  getStaticItems(_context: MaterialContext) {
    return isPlaymatDisplayed() ? [{ location: { type: LocationType.Playmat } }] : []
  }

  /** A button to recall the Emissaries: the symbol of the player, with the arrow pointing down to their reserve */
  getItemMenu(_item: MaterialItem, context: ItemContext, legalMoves: MaterialMove[]) {
    const recall = legalMoves.find(isMoveItemTypeAtOnce(MaterialType.Emissary))
    if (!recall) return null
    const { emissaryReserveX, playmatCenter } = tableLayout()
    return (
      <ImageButton
        move={recall}
        image={symbolImage(context.player, 'down')}
        ratio={symbolButtonRatio}
        width={3}
        labelWidth={6}
        label={<Trans defaults="button.recall" />}
        x={emissaryReserveX - emissaryReserveGap / 2 - playmatCenter.x + recallButton.dx}
        y={recallButton.y}
      />
    )
  }
}

export const playmatDescription = new PlaymatDescription()

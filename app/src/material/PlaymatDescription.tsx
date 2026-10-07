import { LocationType } from '@gamepark/naishi/material/LocationType'
import { CustomMoveType } from '@gamepark/naishi/rules/CustomMoveType'
import { BoardDescription, ItemContext, MaterialContext } from '@gamepark/react-game'
import { isCustomMoveType, MaterialItem, MaterialMove } from '@gamepark/rules-api'
import { Trans } from 'react-i18next'
import Playmat from '../images/boards/playmat.jpg'
import { CourtBoardHelp } from '../help/OtherHelps'
import { isPlaymatDisplayed } from '../locators/PlaymatDisplay'
import { playmatSize } from '../locators/TableLayout'
import { ImageButton, symbolButtonRatio } from './ImageButton'
import { symbolImage } from './symbolImages'

/** Where the button to recall the Emissaries is, from the center of the mat (cm): at the bottom left, outside of the mat */
const recallButton = { x: -25.5, y: 19.6 }

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
    const recall = legalMoves.find(isCustomMoveType(CustomMoveType.RecallEmissaries))
    if (!recall) return null
    return (
      <ImageButton
        move={recall}
        image={symbolImage(context.player, 'down')}
        ratio={symbolButtonRatio}
        width={3}
        labelWidth={6}
        label={<Trans defaults="button.recall" />}
        x={recallButton.x}
        y={recallButton.y}
      />
    )
  }
}

export const playmatDescription = new PlaymatDescription()

import { LocationType } from '@gamepark/naishi/material/LocationType'
import { CustomMoveType } from '@gamepark/naishi/rules/CustomMoveType'
import { BoardDescription, ItemContext, MaterialContext } from '@gamepark/react-game'
import { isCustomMoveType, MaterialItem, MaterialMove } from '@gamepark/rules-api'
import { Trans } from 'react-i18next'
import Playmat from '../images/boards/playmat.jpg'
import { CourtBoardHelp } from '../help/OtherHelps'
import { playmatSize } from '../locators/TableLayout'
import { ImageButton, symbolButtonRatio } from './ImageButton'
import { symbolImage } from './symbolImages'

/** Where the button to recall the Emissaries is, from the center of the mat: right of the scroll of the Imperial Court */
const recallButton = { x: -15.5, y: 0.5 }

/** The game mat (option `playmat`): it replaces the Imperial Court board, and is under the River and the Lines */
class PlaymatDescription extends BoardDescription {
  width = playmatSize.width
  height = playmatSize.height
  image = Playmat
  menuAlwaysVisible = true
  help = CourtBoardHelp

  getStaticItems(context: MaterialContext) {
    return context.rules.game.options?.playmat === true ? [{ location: { type: LocationType.Playmat } }] : []
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
        label={<Trans defaults="button.recall" />}
        x={recallButton.x}
        y={recallButton.y}
      />
    )
  }
}

export const playmatDescription = new PlaymatDescription()

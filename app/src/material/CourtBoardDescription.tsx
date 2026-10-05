import { LocationType } from '@gamepark/naishi/material/LocationType'
import { CustomMoveType } from '@gamepark/naishi/rules/CustomMoveType'
import { BoardDescription, ItemContext, MaterialContext } from '@gamepark/react-game'
import { isCustomMoveType, MaterialItem, MaterialMove } from '@gamepark/rules-api'
import { Trans } from 'react-i18next'
import CourtBoard from '../images/boards/board.png'
import { courtBoardFootprint, courtBoardSize } from '../locators/TableLayout'
import { CourtBoardHelp } from '../help/OtherHelps'
import { ImageButton, symbolButtonRatio } from './ImageButton'
import { symbolImage } from './symbolImages'

class CourtBoardDescription extends BoardDescription {
  width = courtBoardSize.width
  height = courtBoardSize.height
  image = CourtBoard
  staticItem = { location: { type: LocationType.CourtBoard } }
  menuAlwaysVisible = true
  // The image has its own shape: no rectangular shadow around it
  transparency = true
  help = CourtBoardHelp

  /** With the game mat, the board is not shown */
  getStaticItems(context: MaterialContext) {
    return context.rules.game.options?.playmat === true ? [] : super.getStaticItems(context)
  }

  /** A button under the board to recall the Emissaries: the symbol of the player, with the arrow pointing down to their reserve */
  getItemMenu(_item: MaterialItem, context: ItemContext, legalMoves: MaterialMove[]) {
    const recall = legalMoves.find(isCustomMoveType(CustomMoveType.RecallEmissaries))
    if (!recall) return null
    return <ImageButton move={recall} image={symbolImage(context.player, 'down')} ratio={symbolButtonRatio} width={3.6} label={<Trans defaults="button.recall" />} angle={180} radius={courtBoardFootprint.height / 2 + 2.8} />
  }
}

export const courtBoardDescription = new CourtBoardDescription()

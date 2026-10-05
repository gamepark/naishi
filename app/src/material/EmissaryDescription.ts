import { RoundTokenDescription } from '@gamepark/react-game'
import { EmissaryHelp } from '../help/OtherHelps'
import BlackEmissary from '../images/tokens/black.png'
import WhiteEmissary from '../images/tokens/white.png'
import { emissaryDiameter } from '../locators/TableLayout'

/** The item id is the owner: the first player has the black Emissaries (white flower), the second player the white ones (black tomoe) */
class EmissaryDescription extends RoundTokenDescription {
  diameter = emissaryDiameter
  images = { 1: BlackEmissary, 2: WhiteEmissary }
  help = EmissaryHelp
}

export const emissaryDescription = new EmissaryDescription()

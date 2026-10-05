import { CardDescription } from '@gamepark/react-game'
import { MaterialItem } from '@gamepark/rules-api'
import { RyokanHelp } from '../help/OtherHelps'
import Face4 from '../images/cards/ryokan-4.jpg'
import Face7 from '../images/cards/ryokan-7.jpg'

/** The Ryokan is worth 4 points face up, and 7 points flipped (`location.rotation`) */
class RyokanDescription extends CardDescription {
  width = 6.3
  height = 8.8
  borderRadius = 0.3
  image = Face4
  backImage = Face7
  help = RyokanHelp

  isFlipped(item: Partial<MaterialItem>) {
    return item.location?.rotation === true
  }
}

export const ryokanDescription = new RyokanDescription()

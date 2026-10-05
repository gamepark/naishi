import { CardDescription } from '@gamepark/react-game'
import { FirstPlayerHelp } from '../help/OtherHelps'
import BlackSide from '../images/cards/first-player-black.png'
import WhiteSide from '../images/cards/first-player-white.png'

/** The item id is the player who has the card: it shows the side of that player's Emissaries. The images include a 2.3 mm shadow margin. */
class FirstPlayerCardDescription extends CardDescription {
  width = 6.21
  height = 8.7
  transparency = true
  images = { 1: BlackSide, 2: WhiteSide }
  help = FirstPlayerHelp

  getSize(id: number) {
    return id === 1 ? { width: 6.21, height: 8.7 } : { width: 6.23, height: 8.73 }
  }
}

export const firstPlayerCardDescription = new FirstPlayerCardDescription()

import FlowerDown from '../images/buttons/flower-down.png'
import FlowerUp from '../images/buttons/flower-up.png'
import TomoeDown from '../images/buttons/tomoe-down.png'
import TomoeUp from '../images/buttons/tomoe-up.png'

/** The symbol of a player with an arrow: the first player has the black Emissaries (white flower), the second one the white ones (black tomoe) */
export const symbolImage = (player: number | undefined, arrow: 'up' | 'down') =>
  player === 1 ? (arrow === 'up' ? FlowerUp : FlowerDown) : arrow === 'up' ? TomoeUp : TomoeDown

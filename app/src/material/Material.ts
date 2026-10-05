import { MaterialType } from '@gamepark/naishi/material/MaterialType'
import { MaterialDescription } from '@gamepark/react-game'
import { cardDescription } from './CardDescription'
import { courtBoardDescription } from './CourtBoardDescription'
import { emissaryDescription } from './EmissaryDescription'
import { firstPlayerCardDescription } from './FirstPlayerCardDescription'
import { playmatDescription } from './PlaymatDescription'
import { ryokanDescription } from './RyokanDescription'
import { scorePadDescription } from './ScorePadDescription'

export const Material: Partial<Record<MaterialType, MaterialDescription>> = {
  [MaterialType.Card]: cardDescription,
  [MaterialType.Emissary]: emissaryDescription,
  [MaterialType.FirstPlayerCard]: firstPlayerCardDescription,
  [MaterialType.Ryokan]: ryokanDescription,
  [MaterialType.CourtBoard]: courtBoardDescription,
  [MaterialType.Playmat]: playmatDescription,
  [MaterialType.ScorePad]: scorePadDescription
}

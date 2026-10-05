import { CardId } from '@gamepark/naishi/material/CardId'
import Advisor from '../images/cards/base/advisor.jpg'
import Banner from '../images/cards/base/banner.jpg'
import Fortress from '../images/cards/base/fortress.jpg'
import Horseman from '../images/cards/base/horseman.jpg'
import Monk from '../images/cards/base/monk.jpg'
import Mountain from '../images/cards/base/mountain.jpg'
import Naishi from '../images/cards/base/naishi.jpg'
import Ninja from '../images/cards/base/ninja.jpg'
import Rice from '../images/cards/base/rice.jpg'
import Ronin from '../images/cards/base/ronin.jpg'
import Sentinel from '../images/cards/base/sentinel.jpg'
import Torii from '../images/cards/base/torii.jpg'
import LegendAdvisor from '../images/cards/legends/advisor.jpg'
import LegendHorseman from '../images/cards/legends/horseman.jpg'
import LegendMonk from '../images/cards/legends/monk.jpg'
import LegendNaishi from '../images/cards/legends/naishi.jpg'
import LegendNinja from '../images/cards/legends/ninja.jpg'
import LegendRonin from '../images/cards/legends/ronin.jpg'
import LegendSentinel from '../images/cards/legends/sentinel.jpg'
import CherryLady from '../images/cards/travellers/cherry-lady.jpg'
import Girl from '../images/cards/travellers/girl.jpg'
import OldMan from '../images/cards/travellers/old-man.jpg'
import Porter from '../images/cards/travellers/porter.jpg'
import Samurai from '../images/cards/travellers/samurai.jpg'
import UmbrellaLady from '../images/cards/travellers/umbrella-lady.jpg'

export { default as cardBackImage } from '../images/cards/back.jpg'

/** The face of each card */
export const cardImages: Record<number, string> = {
  [CardId.Mountain]: Mountain,
  [CardId.Naishi]: Naishi,
  [CardId.Advisor]: Advisor,
  [CardId.Fortress]: Fortress,
  [CardId.Sentinel]: Sentinel,
  [CardId.Torii]: Torii,
  [CardId.Monk]: Monk,
  [CardId.Rice]: Rice,
  [CardId.Banner]: Banner,
  [CardId.Horseman]: Horseman,
  [CardId.Ronin]: Ronin,
  [CardId.Ninja]: Ninja,
  [CardId.LegendNaishi]: LegendNaishi,
  [CardId.LegendAdvisor]: LegendAdvisor,
  [CardId.LegendSentinel]: LegendSentinel,
  [CardId.LegendHorseman]: LegendHorseman,
  [CardId.LegendMonk]: LegendMonk,
  [CardId.LegendRonin]: LegendRonin,
  [CardId.LegendNinja]: LegendNinja,
  [CardId.UmbrellaLady]: UmbrellaLady,
  [CardId.OldMan]: OldMan,
  [CardId.CherryLady]: CherryLady,
  [CardId.Girl]: Girl,
  [CardId.Porter]: Porter,
  [CardId.Samurai]: Samurai
}

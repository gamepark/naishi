import { NaishiRules } from '@gamepark/naishi/NaishiRules'
import { CardId } from '@gamepark/naishi/material/CardId'
import { getPlayerScore } from '@gamepark/naishi/scoring/getPlayerScore'
import { ScoringDescription } from '@gamepark/react-game'
import { Trans } from 'react-i18next'

type ScoringKey = CardId | 'ryokan' | 'total' | 'colors'

/** The types of card that can score, in the order of the rulebook. A Ninja gives its points to the type it copies. */
const scoringCards = [
  CardId.Mountain,
  CardId.Naishi,
  CardId.Advisor,
  CardId.Fortress,
  CardId.Sentinel,
  CardId.Torii,
  CardId.Monk,
  CardId.Rice,
  CardId.Banner,
  CardId.Horseman,
  CardId.Ronin
]

export class NaishiScoring implements ScoringDescription<number, NaishiRules, ScoringKey> {
  getScoringKeys(): ScoringKey[] {
    return [...scoringCards, 'ryokan', 'total', 'colors']
  }

  getScoringHeader(key: ScoringKey) {
    return <Trans defaults={typeof key === 'number' ? `scoring.card.${key}` : `scoring.${key}`} />
  }

  getScoringPlayerData(key: ScoringKey, player: number, rules: NaishiRules) {
    const score = getPlayerScore(rules, player)
    switch (key) {
      case 'total':
        return score.total
      case 'colors':
        return score.colors
      case 'ryokan':
        return score.byType.ryokan ?? 0
      default:
        return score.byType[key] ?? 0
    }
  }
}

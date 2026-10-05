import { useResultText } from '@gamepark/react-game'
import { useTranslation } from 'react-i18next'
import { countSteps, useCountdownStep } from '../scoring/scoreCountdown'

/** The winner is announced once the scores are written on the score block */
export const GameOverHeader = () => {
  const { t } = useTranslation()
  const resultText = useResultText()
  const step = useCountdownStep()
  return <>{step >= countSteps ? resultText : t('header.counting')}</>
}

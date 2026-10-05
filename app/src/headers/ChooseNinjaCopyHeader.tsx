import { NaishiRules } from '@gamepark/naishi/NaishiRules'
import { usePlayerId, useRules } from '@gamepark/react-game'
import { useTranslation } from 'react-i18next'

export const ChooseNinjaCopyHeader = () => {
  const { t } = useTranslation()
  const rules = useRules<NaishiRules>()!
  const me = usePlayerId<number>()
  if (me !== undefined && rules.isTurnToPlay(me)) {
    return <>{t('header.ninja.you')}</>
  }
  return <>{t('header.ninja.wait')}</>
}

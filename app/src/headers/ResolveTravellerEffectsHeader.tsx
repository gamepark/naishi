import { useTranslation } from 'react-i18next'
import { useActivePlayerHeader } from './useActivePlayerHeader'

/** The choices are in the panel on the table (see TravellerChoicePanel) */
export const ResolveTravellerEffectsHeader = () => {
  const { t } = useTranslation()
  const { isMe, player } = useActivePlayerHeader()
  return <>{isMe ? t('header.effects.you') : t('header.effects.player', { player })}</>
}

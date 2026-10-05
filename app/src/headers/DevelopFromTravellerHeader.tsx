import { useTranslation } from 'react-i18next'
import { useActivePlayerHeader } from './useActivePlayerHeader'

export const DevelopFromTravellerHeader = () => {
  const { t } = useTranslation()
  const { isMe, player } = useActivePlayerHeader()
  return <>{isMe ? t('header.develop-traveller.you') : t('header.develop-traveller.player', { player })}</>
}

import { useTranslation } from 'react-i18next'
import { useActivePlayerHeader } from './useActivePlayerHeader'

export const DiscardRiverCardsHeader = () => {
  const { t } = useTranslation()
  const { isMe, player } = useActivePlayerHeader()
  return <>{isMe ? t('header.discard.you') : t('header.discard.player', { player })}</>
}

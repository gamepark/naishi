import { useTranslation } from 'react-i18next'
import { useActivePlayerHeader } from './useActivePlayerHeader'

export const SwapTerritoryCardsHeader = () => {
  const { t } = useTranslation()
  const { isMe, player } = useActivePlayerHeader()
  return <>{isMe ? t('header.swap-territory.you') : t('header.swap-territory.player', { player })}</>
}

import { useTranslation } from 'react-i18next'
import { useActivePlayerHeader } from './useActivePlayerHeader'

export const ImperialDecreeHeader = () => {
  const { t } = useTranslation()
  const { isMe, player } = useActivePlayerHeader()
  return <>{isMe ? t('header.decree.you') : t('header.decree.player', { player })}</>
}

import { useTranslation } from 'react-i18next'

export const EndOfGameHeader = () => {
  const { t } = useTranslation()
  return <>{t('header.end-of-game')}</>
}

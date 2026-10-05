import { CustomMoveType } from '@gamepark/naishi/rules/CustomMoveType'
import { Memory } from '@gamepark/naishi/rules/Memory'
import { PlayMoveButton, useLegalMove } from '@gamepark/react-game'
import { isCustomMoveType } from '@gamepark/rules-api'
import { useTranslation } from 'react-i18next'
import { useActivePlayerHeader } from './useActivePlayerHeader'

export const PlayerTurnHeader = () => {
  const { t } = useTranslation()
  const { rules, isMe, player } = useActivePlayerHeader()
  const endTurn = useLegalMove(isCustomMoveType(CustomMoveType.EndTurn))
  const declareEnd = useLegalMove(isCustomMoveType(CustomMoveType.DeclareEndOfGame))
  if (!isMe) {
    return <>{t('header.turn.player', { player })}</>
  }
  const additionalActionDone = rules.remind<boolean | undefined>(Memory.AdditionalActionDone)
  if (!rules.remind<boolean | undefined>(Memory.MainActionDone)) {
    // An Emissary has been sent: only the development is left
    if (additionalActionDone) return <>{t('header.turn.develop')}</>
    return (
      <>
        {t('header.turn.you')}{' '}
        {declareEnd && <PlayMoveButton move={declareEnd}>{t('button.declare-end')}</PlayMoveButton>}
      </>
    )
  }
  return (
    <>
      {t(additionalActionDone ? 'header.turn.you.end' : 'header.turn.you.additional')} {endTurn && <PlayMoveButton move={endTurn}>{t('button.end-turn')}</PlayMoveButton>}
    </>
  )
}

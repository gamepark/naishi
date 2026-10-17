import { CustomMoveType } from '@gamepark/naishi/rules/CustomMoveType'
import { Memory } from '@gamepark/naishi/rules/Memory'
import { PlayMoveButton, useLegalMove } from '@gamepark/react-game'
import { isCustomMoveType } from '@gamepark/rules-api'
import { Trans, useTranslation } from 'react-i18next'
import { useActivePlayerHeader } from './useActivePlayerHeader'

/** The buttons are words of the sentence (<pass>, <end>), so that each language puts them where its grammar wants them */
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
    // No main action is possible (empty River during the last turn, no Emissary to recall, decree taken): the player can only pass
    if (endTurn) return <Trans i18nKey="header.turn.pass" components={{ pass: <PlayMoveButton move={endTurn} /> }} />
    if (declareEnd) return <Trans i18nKey="header.turn.you.declare-end" components={{ end: <PlayMoveButton move={declareEnd} /> }} />
    return <>{t('header.turn.you')}</>
  }
  if (additionalActionDone || !endTurn) return <>{t('header.turn.you.end')}</>
  return <Trans i18nKey="header.turn.you.additional" components={{ pass: <PlayMoveButton move={endTurn} /> }} />
}

import { NaishiRules } from '@gamepark/naishi/NaishiRules'
import { usePlayerId, usePlayerName, useRules } from '@gamepark/react-game'

/**
 * Who has to play in a rule with one active player: the header shows what I have to do, or who the others are waiting for.
 * It depends on the rule state, never on the legal moves.
 */
export function useActivePlayerHeader() {
  const rules = useRules<NaishiRules>()!
  const me = usePlayerId<number>()
  const activePlayer = rules.getActivePlayer()
  const player = usePlayerName(activePlayer)
  return { rules, isMe: activePlayer === me, player }
}

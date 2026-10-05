import { css } from '@emotion/react'
import { NaishiRules } from '@gamepark/naishi/NaishiRules'
import { Memory } from '@gamepark/naishi/rules/Memory'
import { usePlayerName, useRules } from '@gamepark/react-game'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'

/** Once the end of the game is triggered, everybody sees it until the game is over: the player who plays the last turn is named */
export const FinalTurnBanner = () => {
  const { t } = useTranslation()
  const rules = useRules<NaishiRules>()
  const finalPlayer = rules?.remind<number | undefined>(Memory.FinalTurn)
  const name = usePlayerName(finalPlayer)
  const root = document.getElementById('root')
  if (!root || rules === undefined || rules.game.rule === undefined || finalPlayer === undefined) return null
  return createPortal(<div css={bannerCss}>{t('banner.final-turn', { player: name })}</div>, root)
}

const bannerCss = css`
  position: absolute;
  top: 8em;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.3em 1.2em;
  border-radius: 2em;
  background: rgba(150, 30, 30, 0.9);
  border: 0.08em solid white;
  color: white;
  font-size: 2.6em;
  font-weight: bold;
  white-space: nowrap;
  pointer-events: none;
  z-index: 10;
`

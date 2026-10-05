import { css } from '@emotion/react'
import { CardId } from '@gamepark/naishi/material/CardId'
import { travellerEffects } from '@gamepark/naishi/material/Traveller'
import { CustomMoveType } from '@gamepark/naishi/rules/CustomMoveType'
import { Memory } from '@gamepark/naishi/rules/Memory'
import { RuleId } from '@gamepark/naishi/rules/RuleId'
import { PlayMoveButton, useLegalMoves, usePlayerId, useRules } from '@gamepark/react-game'
import { NaishiRules } from '@gamepark/naishi/NaishiRules'
import { CustomMove, isCustomMoveType } from '@gamepark/rules-api'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'

/**
 * The effects of the Travellers that can be triggered: the player chooses which one to resolve first, and can ignore any of them.
 * It is a panel on the table, because the header of the game is too narrow for so many buttons.
 */
export const TravellerChoicePanel = () => {
  const { t } = useTranslation()
  const rules = useRules<NaishiRules>()
  const me = usePlayerId<number>()
  const use = useLegalMoves(isCustomMoveType(CustomMoveType.UseTravellerEffect))
  const ignore = useLegalMoves(isCustomMoveType(CustomMoveType.IgnoreTravellerEffect))
  const root = document.getElementById('root')
  if (!root || rules === undefined || rules.game.rule?.id !== RuleId.ResolveTravellerEffects || rules.getActivePlayer() !== me) return null
  const pending = rules.remind<CardId[] | undefined>(Memory.PendingEffects) ?? []
  if (pending.length === 0) return null
  return createPortal(
    <div css={panelCss}>
      <div css={titleCss}>{t(pending.length > 1 ? 'panel.effects.first' : 'panel.effects.one')}</div>
      {pending.map((card, index) => {
        const useMove = use.find((move) => (move as CustomMove).data.index === index)
        const ignoreMove = ignore.find((move) => (move as CustomMove).data.index === index)
        return (
          <div key={index} css={rowCss}>
            <span css={nameCss}>
              {t(`traveller.${card}`)} : {t(`traveller.effect.${travellerEffects[card]?.effect}`)}
            </span>
            {useMove && (
              <PlayMoveButton move={useMove} css={buttonCss}>
                {t('button.use')}
              </PlayMoveButton>
            )}
            {ignoreMove && (
              <PlayMoveButton move={ignoreMove} css={[buttonCss, ignoreCss]}>
                {t('button.ignore')}
              </PlayMoveButton>
            )}
          </div>
        )
      })}
    </div>,
    root
  )
}

const panelCss = css`
  position: absolute;
  top: 8em;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.6em 1.2em;
  border-radius: 1em;
  background: rgba(0, 0, 0, 0.8);
  border: 0.08em solid #ffa9c1;
  color: white;
  font-size: 2.6em;
  z-index: 10;
`

const titleCss = css`
  font-weight: bold;
  margin-bottom: 0.3em;
  text-align: center;
`

const rowCss = css`
  display: flex;
  align-items: center;
  gap: 0.6em;
  margin: 0.25em 0;
`

const nameCss = css`
  &::first-letter {
    text-transform: uppercase;
  }
  flex: 1;
  white-space: nowrap;
`

const buttonCss = css`
  cursor: pointer;
  padding: 0.1em 0.8em;
  border-radius: 2em;
  border: 0.08em solid #ffa9c1;
  background: #ffa9c1;
  color: #222;
  font-weight: bold;
  font-size: 1em;
`

const ignoreCss = css`
  background: transparent;
  color: white;
`

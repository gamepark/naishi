import { css } from '@emotion/react'
import { NaishiRules } from '@gamepark/naishi/NaishiRules'
import { CardId } from '@gamepark/naishi/material/CardId'
import { LocationType } from '@gamepark/naishi/material/LocationType'
import { MaterialType } from '@gamepark/naishi/material/MaterialType'
import { Memory } from '@gamepark/naishi/rules/Memory'
import { RuleId } from '@gamepark/naishi/rules/RuleId'
import { getEmptyPiles } from '@gamepark/naishi/rules/NaishiPlayerRule'
import { usePlayerId, useRules } from '@gamepark/react-game'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Trans, useTranslation } from 'react-i18next'
import { naishiTutorial } from './NaishiTutorial'

/**
 * After the scripted part of the tutorial, the game goes on freely. These popups come when the situation they explain happens:
 * a Ninja in the River, a pile that is empty (the end of the game), the end triggered, the count, the choice of the copy of a Ninja.
 */
export const TutorialFreePlay = () => {
  const { t } = useTranslation()
  const rules = useRules<NaishiRules>()
  const me = usePlayerId<number>()
  const [seen, setSeen] = useState<string[]>([])
  const root = document.getElementById('root')
  const tutorial = rules?.game.tutorial
  if (!root || !rules || !tutorial || tutorial.step < naishiTutorial.steps.length) return null
  const rule = rules.game.rule
  const myTurn = rule !== undefined && rules.getActivePlayer() === me
  const finalTurn = rules.remind<number | undefined>(Memory.FinalTurn)
  const cards = rules.material(MaterialType.Card)

  const key =
    rule === undefined
      ? 'count'
      : rule.id === RuleId.ChooseNinjaCopy && myTurn
        ? 'copy'
        : finalTurn !== undefined
          ? 'final'
          : rule.id === RuleId.PlayerTurn && myTurn && getEmptyPiles((type) => rules.material(type)).length > 0
            ? 'pile'
            : cards.location(LocationType.River).id(CardId.Ninja).length > 0
              ? 'ninja'
              : undefined
  if (key === undefined || seen.includes(key)) return null

  return createPortal(
    <div css={popupCss}>
      <p css={textCss}>
        <Trans i18nKey={`tutorial.${key}`} components={{ b: <strong />, i: <em /> }} />
      </p>
      <button css={buttonCss} onClick={() => setSeen([...seen, key])}>
        {t('tutorial.ok')}
      </button>
    </div>,
    root
  )
}

const popupCss = css`
  position: absolute;
  top: 8em;
  left: 50%;
  transform: translateX(-50%);
  width: 38em;
  max-width: 90%;
  padding: 0.8em 1.4em;
  border-radius: 1em;
  background: rgba(0, 0, 0, 0.85);
  border: 0.08em solid #ffa9c1;
  color: white;
  font-size: 2.6em;
  text-align: center;
  z-index: 10;
`

const textCss = css`
  margin: 0 0 0.6em;
  line-height: 1.35;
  white-space: break-spaces;
`

const buttonCss = css`
  cursor: pointer;
  padding: 0.1em 1em;
  border-radius: 2em;
  border: 0.08em solid #ffa9c1;
  background: #ffa9c1;
  color: #222;
  font-weight: bold;
  font-size: 1em;
`

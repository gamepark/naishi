import { NaishiRules } from '@gamepark/naishi/NaishiRules'
import { useFocusContext, useRules } from '@gamepark/react-game'
import { useEffect } from 'react'
import { naishiTutorial } from './NaishiTutorial'

/**
 * The framework keeps the zoom of the previous step when a step has no focus and the player has to move.
 * A step with a popup and no focus shows the whole table: the zoom is reset here.
 */
export const TutorialUnzoom = () => {
  const rules = useRules<NaishiRules>()
  const { setFocus } = useFocusContext()
  const step = rules?.game.tutorial?.step
  const stepDefinition = step === undefined ? undefined : naishiTutorial.steps[step]
  const unzoom = stepDefinition !== undefined && stepDefinition.popup !== undefined && stepDefinition.focus === undefined
  useEffect(() => {
    if (unzoom) setFocus(undefined, true)
  }, [step, unzoom])
  return null
}

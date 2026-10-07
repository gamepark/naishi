import { css } from '@emotion/react'
import { NaishiRules } from '@gamepark/naishi/NaishiRules'
import { DevToolsHub, GameTable, useRules } from '@gamepark/react-game'
import { getTableLayout, tableLayoutOf } from './locators/TableLayout'
import { FinalTurnBanner } from './panels/FinalTurnBanner'
import { PlayerPanels } from './panels/PlayerPanels'
import { TravellerChoicePanel } from './panels/TravellerChoicePanel'
import { naishiTutorial } from './tutorial/NaishiTutorial'
import { TutorialFreePlay } from './tutorial/TutorialFreePlay'
import { TutorialUnzoom } from './tutorial/TutorialUnzoom'

export function GameDisplay() {
  const rules = useRules<NaishiRules>()
  // The size of the table depends on the game mat
  const { tableBounds } = rules ? tableLayoutOf({ rules }) : getTableLayout(false)
  // During the tutorial the popup is at the right of the screen: the table has room on the right so that the zoom can leave it free
  const tutorialStep = rules?.game.tutorial?.step
  const inTutorial = tutorialStep !== undefined && tutorialStep < naishiTutorial.steps.length
  const margin = { top: 7, left: 0, right: inTutorial ? tutorialPopupRoom : 0, bottom: 0 }
  return (
    <>
      <GameTable {...tableBounds} margin={margin} css={process.env.NODE_ENV === 'development' && tableBorder}>
        <PlayerPanels />
        <FinalTurnBanner />
        <TravellerChoicePanel />
        <TutorialFreePlay />
        <TutorialUnzoom />
        {process.env.NODE_ENV === 'development' && <DevToolsHub fabBottom="calc(5em)" />}
      </GameTable>
    </>
  )
}

/** Room (cm of the table) at the right of the table for the popup of the tutorial */
const tutorialPopupRoom = 22

const tableBorder = css`
  border: 1px solid white;
`

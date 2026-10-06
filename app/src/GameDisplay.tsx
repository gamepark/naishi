import { css } from '@emotion/react'
import { NaishiRules } from '@gamepark/naishi/NaishiRules'
import { DevToolsHub, GameTable, GameTableNavigation, useRules } from '@gamepark/react-game'
import { getTableLayout, tableLayoutOf } from './locators/TableLayout'
import { FinalTurnBanner } from './panels/FinalTurnBanner'
import { TravellerChoicePanel } from './panels/TravellerChoicePanel'
import { TutorialFreePlay } from './tutorial/TutorialFreePlay'
import { TutorialUnzoom } from './tutorial/TutorialUnzoom'
import { PlayerPanels } from './panels/PlayerPanels'

export function GameDisplay() {
  const rules = useRules<NaishiRules>()
  // The size of the table depends on the game mat
  const { tableBounds } = rules ? tableLayoutOf({ rules }) : getTableLayout(false)
  const margin = { top: 7, left: 0, right: 0, bottom: 0 }
  return (
    <>
      <GameTable {...tableBounds} margin={margin} css={process.env.NODE_ENV === 'development' && tableBorder}>
        <GameTableNavigation />
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

const tableBorder = css`
  border: 1px solid white;
`

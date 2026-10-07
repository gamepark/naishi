import { css } from '@emotion/react'
import { NaishiRules } from '@gamepark/naishi/NaishiRules'
import { DevToolsHub, GameTable, useRules } from '@gamepark/react-game'
import { getTableLayout, tableLayoutOf } from './locators/TableLayout'
import { FinalTurnBanner } from './panels/FinalTurnBanner'
import { PlayerPanels } from './panels/PlayerPanels'
import { TravellerChoicePanel } from './panels/TravellerChoicePanel'
import { TutorialFreePlay } from './tutorial/TutorialFreePlay'
import { TutorialUnzoom } from './tutorial/TutorialUnzoom'

export function GameDisplay() {
  const rules = useRules<NaishiRules>()
  // The size of the table depends on the game mat
  const { tableBounds } = rules ? tableLayoutOf({ rules }) : getTableLayout(false)
  return (
    <>
      <GameTable {...tableBounds} margin={tableMargin} css={process.env.NODE_ENV === 'development' && tableBorder}>
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

/** Margin (em) around the table: the room of the header at the top */
const tableMargin = { top: 7, left: 0, right: 0, bottom: 0 }

const tableBorder = css`
  border: 1px solid white;
`

import { css } from '@emotion/react'
import { DevToolsHub, GameTable } from '@gamepark/react-game'
import { usePlaymatDisplayed } from './locators/PlaymatDisplay'
import { getTableLayout } from './locators/TableLayout'
import { FinalTurnBanner } from './panels/FinalTurnBanner'
import { PlayerPanels } from './panels/PlayerPanels'
import { TravellerChoicePanel } from './panels/TravellerChoicePanel'
import { TutorialFreePlay } from './tutorial/TutorialFreePlay'
import { TutorialUnzoom } from './tutorial/TutorialUnzoom'

export function GameDisplay() {
  // The size of the table depends on the game mat
  const { tableBounds } = getTableLayout(usePlaymatDisplayed())
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

/** Margin (1% of the height of the screen) around the table: the room of the header at the top, and of the history (logs) at the right */
const tableMargin = { top: 7, left: 0, right: 44, bottom: 0 }

const tableBorder = css`
  border: 1px solid white;
`

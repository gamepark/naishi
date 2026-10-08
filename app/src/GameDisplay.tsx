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
      <GameTable {...tableBounds} css={process.env.NODE_ENV === 'development' && tableBorder}>
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

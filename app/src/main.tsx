import { NaishiOptionsSpecV2 } from '@gamepark/naishi/NaishiOptions'
import { NaishiRules } from '@gamepark/naishi/NaishiRules'
import { NaishiSetup } from '@gamepark/naishi/NaishiSetup'
import { css } from '@emotion/react'
import { GameProvider } from '@gamepark/react-game'
import { StrictMode, useMemo } from 'react'
import { createRoot } from 'react-dom/client'
import { gameAnimations } from './animations/GameAnimations'
import { App } from './App'
import { Locators } from './locators/Locators'
import { usePlaymatDisplayed } from './locators/PlaymatDisplay'
import { Material } from './material/Material'
import { NaishiScoring } from './scoring/NaishiScoring'
import { NaishiHistory } from './history/NaishiHistory'
import { naishiTutorial } from './tutorial/NaishiTutorial'

/** The popup of the tutorial is at the right of an element of the table: PopupAnchor gives the position of the popup in 2 CSS variables */
const tutorialPopupCss = css`
  left: calc(var(--tutorial-left, 50vw) - (100vw - 100%) / 2);
  top: calc(var(--tutorial-middle, 50vh) - 50vh);
  max-width: 96vw;
`

/**
 * The descriptions and the locators read whether the viewer displays the game mat: when it changes, new references of them make
 * the table compute every item again.
 */
const NaishiGame = () => {
  const playmat = usePlaymatDisplayed()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const material = useMemo(() => ({ ...Material }), [playmat])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const locators = useMemo(() => ({ ...Locators }), [playmat])
  return (
    <GameProvider
      game="naishi"
      Rules={NaishiRules}
      optionsSpec={NaishiOptionsSpecV2}
      GameSetup={NaishiSetup}
      material={material}
      locators={locators}
      animations={gameAnimations}
      scoring={new NaishiScoring()}
      tutorial={naishiTutorial}
      logs={new NaishiHistory()}
      theme={{ tutorial: { container: tutorialPopupCss } }}
    >
      <App />
    </GameProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <NaishiGame />
  </StrictMode>
)

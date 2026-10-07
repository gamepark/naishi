import { NaishiOptionsSpecV2 } from '@gamepark/naishi/NaishiOptions'
import { NaishiRules } from '@gamepark/naishi/NaishiRules'
import { NaishiSetup } from '@gamepark/naishi/NaishiSetup'
import { css } from '@emotion/react'
import { GameProvider } from '@gamepark/react-game'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { gameAnimations } from './animations/GameAnimations'
import { App } from './App'
import { Locators } from './locators/Locators'
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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GameProvider
      game="naishi"
      Rules={NaishiRules}
      optionsSpec={NaishiOptionsSpecV2}
      GameSetup={NaishiSetup}
      material={Material}
      locators={Locators}
      animations={gameAnimations}
      scoring={new NaishiScoring()}
      tutorial={naishiTutorial}
      logs={new NaishiHistory()}
      theme={{ tutorial: { container: tutorialPopupCss } }}
    >
      <App />
    </GameProvider>
  </StrictMode>
)

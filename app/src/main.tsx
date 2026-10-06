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
import { naishiTutorial } from './tutorial/NaishiTutorial'

/** The popup of the tutorial is at the right of the screen, so that it does not cover what it shows (the zoom of the tutorial leaves room for it) */
const tutorialPopupCss = css`
  left: calc(50vw - 50% - 2vh);
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
      theme={{ tutorial: { container: tutorialPopupCss } }}
    >
      <App />
    </GameProvider>
  </StrictMode>
)

import { NaishiOptionsSpecV2 } from '@gamepark/naishi/NaishiOptions'
import { NaishiRules } from '@gamepark/naishi/NaishiRules'
import { NaishiSetup } from '@gamepark/naishi/NaishiSetup'
import { GameProvider } from '@gamepark/react-game'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { gameAnimations } from './animations/GameAnimations'
import { App } from './App'
import { Locators } from './locators/Locators'
import { Material } from './material/Material'
import { NaishiScoring } from './scoring/NaishiScoring'
import { naishiTutorial } from './tutorial/NaishiTutorial'

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
    >
      <App />
    </GameProvider>
  </StrictMode>
)

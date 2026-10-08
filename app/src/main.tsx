import { NaishiOptionsSpecV2 } from '@gamepark/naishi/NaishiOptions'
import { NaishiRules } from '@gamepark/naishi/NaishiRules'
import { NaishiSetup } from '@gamepark/naishi/NaishiSetup'
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
import { theme } from './theme'
import { naishiTutorial } from './tutorial/NaishiTutorial'

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
      theme={theme}
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

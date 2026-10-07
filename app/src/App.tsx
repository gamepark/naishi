import { css } from '@emotion/react'
import { FailuresDialog, FullscreenDialog, LiveLogContainer, LoadingScreen, MaterialGameSounds, MaterialHeader, MaterialImageLoader, Menu, useGame } from '@gamepark/react-game'
import { MaterialGame } from '@gamepark/rules-api'
import { useEffect, useState } from 'react'
import { GameDisplay } from './GameDisplay'
import { GameOverHeader } from './headers/GameOverHeader'
import { Headers } from './headers/Headers'
import { SubscriberWatcher } from './locators/PlaymatDisplay'

export function App() {
  const game = useGame<MaterialGame>()
  const [isJustDisplayed, setJustDisplayed] = useState(true)
  const [isImagesLoading, setImagesLoading] = useState(true)
  useEffect(() => {
    setTimeout(() => setJustDisplayed(false), process.env.NODE_ENV === 'development' ? 0 : 2000)
  }, [])
  const loading = !game || isJustDisplayed || isImagesLoading
  return (
    <>
      {!!game && <GameDisplay />}
      <LoadingScreen display={loading} />
      <MaterialHeader rulesStepsHeaders={Headers} GameOver={GameOverHeader} loading={loading} />
      <MaterialImageLoader onImagesLoad={() => setImagesLoading(false)} />
      {!loading && <LiveLogContainer css={liveLogCss} />}
      <MaterialGameSounds />
      <Menu />
      <FailuresDialog />
      <FullscreenDialog />
      <SubscriberWatcher />
    </>
  )
}

/** The last lines of the history, on top of the table, at the right under the header */
const liveLogCss = css`
  position: absolute;
  right: 1em;
  top: 8em;
  width: 45em;
  pointer-events: none;
`

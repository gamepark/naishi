import { css } from '@emotion/react'
import { StyledPlayerPanel, usePlayers, useRules } from '@gamepark/react-game'
import { createPortal } from 'react-dom'
import NaishiFace from '../images/avatars/koshikibu-no-naishi.png'
import BlackEmissary from '../images/tokens/black.png'
import WhiteEmissary from '../images/tokens/white.png'

/**
 * The panels of the 2 players are on the left of the table, face to face: the opponent at the top, the player who looks at the game at the bottom.
 * They are inspired by the Emissaries: the first player is the black token (white flower), the second player is the white token (black tomoe).
 */
export const PlayerPanels = () => {
  const players = usePlayers<number>({ sortFromMe: true })
  const tutorial = useRules()?.game.tutorial !== undefined
  const root = document.getElementById('root')
  if (!root) {
    return null
  }

  return createPortal(
    <>
      {players.map((player, index) => (
        <StyledPlayerPanel key={player.id} player={player} css={[panelPosition(index), player.id === 1 ? blackPanel : whitePanel, tutorial && player.id === 2 && naishiAvatar]} activeRing />
      ))}
    </>,
    root
  )
}

/** Index 0 is the player who looks at the game (bottom), the other player is at the top, below the header */
const panelPosition = (index: number) => css`
  position: absolute;
  left: 13em;
  width: 28em;
  /* the name of the player can be long (« Koshikibu no Naishi ») */
  h2 {
    max-width: 14em;
    font-size: 2em;
  }
  ${index === 0 ? 'bottom: 4.5em;' : 'top: 8.5em;'}
`

/** The token of the player: only the disc is shown (the image has a margin for the shadow of the token) */
const token = (image: string) => css`
  &::before {
    content: '';
    position: absolute;
    left: 8em;
    top: 50%;
    width: 6.5em;
    height: 6.5em;
    transform: translateY(-50%);
    background: url(${image}) center / 100% 100% no-repeat;
    clip-path: circle(40%);
  }
`

/** The first player: black like its Emissaries, with the white flower */
const blackPanel = [
  css`
    background-color: #1c1a1d;
    border: 0.2em solid #f3ead7;
    color: white;
  `,
  token(BlackEmissary)
]

/** The second player: white like its Emissaries, with the black tomoe */
const whitePanel = [
  css`
    background-color: #f6f0e2;
    border: 0.2em solid #1c1a1d;
  `,
  token(WhiteEmissary)
]

/** The opponent of the tutorial is « Koshikibu no Naishi »: the face of the Naishi card instead of the drawn avatar */
const naishiAvatar = css`
  > div:first-of-type {
    background: url(${NaishiFace}) center / cover;

    svg {
      visibility: hidden;
    }
  }
`

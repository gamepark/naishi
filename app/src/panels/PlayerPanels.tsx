import { css } from '@emotion/react'
import { NaishiRules } from '@gamepark/naishi/NaishiRules'
import { StyledPlayerPanel, usePlayers, useRules } from '@gamepark/react-game'
import NaishiFace from '../images/avatars/koshikibu-no-naishi.png'
import BlackEmissary from '../images/tokens/black.png'
import WhiteEmissary from '../images/tokens/white.png'
import { getTableLayout, playerPanelEmWidth, playerPanelZ, TableLayout } from '../locators/TableLayout'
import { usePlaymatDisplayed } from '../locators/PlaymatDisplay'

/**
 * The panels of the 2 players are laid on the table, so that they pan and zoom with the material: each one is on the edge of its player, left of its Hand.
 * The opponent is at the top, the player who looks at the game at the bottom.
 * They are inspired by the Emissaries: the first player is the black token (white flower), the second player is the white token (black tomoe).
 */
export const PlayerPanels = () => {
  const players = usePlayers<number>({ sortFromMe: true })
  const rules = useRules<NaishiRules>()
  const layout = getTableLayout(usePlaymatDisplayed())
  if (!rules) return null
  const tutorial = rules.game.tutorial !== undefined

  return (
    <>
      {players.map((player, index) => (
        <div key={player.id} css={panelPlace(layout, index === 0)}>
          <StyledPlayerPanel
            player={player}
            css={[panelSize(layout), player.id === 1 ? blackPanel : whitePanel, tutorial && player.id === 2 && naishiAvatar]}
            activeRing
          />
        </div>
      ))}
    </>
  )
}

/**
 * Index 0 is the player who looks at the game (bottom), the other player is at the top.
 * The panel is anchored by the edge of the table it lies against: the bottom one by its bottom, hence the shift of its own height.
 */
const panelPlace = ({ playerPanel, tableBounds }: TableLayout, bottom: boolean) => css`
  position: absolute;
  left: ${playerPanel.left - tableBounds.xMin}em;
  top: ${(bottom ? playerPanel.bottom : -playerPanel.bottom) - tableBounds.yMin}em;
  transform: translate3d(0, ${bottom ? -100 : 0}%, ${playerPanelZ}em);
  transform-style: preserve-3d;
`

/** The panel is sized in em: this font size turns its 28 em of width into the width of the panel on the table */
const panelSize = ({ playerPanel }: TableLayout) => css`
  font-size: ${playerPanel.width / playerPanelEmWidth}em;
  /* the name of the player can be long (« Koshikibu no Naishi ») */
  h2 {
    max-width: 14em;
    font-size: 2em;
  }
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

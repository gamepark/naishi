import { css } from '@emotion/react'
import { faQuestion } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { LocationDescription } from '@gamepark/react-game'
import { ExtensionHelp } from '../help/ExtensionHelp'

/** The "?" button on the cards set aside by the Legends: it opens the help of the Legends & Travellers extension */
export class ExtensionHelpDescription extends LocationDescription {
  width = 2.6
  height = 2.6
  borderRadius = 1.3
  help = ExtensionHelp
  content = () => <FontAwesomeIcon icon={faQuestion} css={iconCss} />
  extraCss = css`
    display: flex;
    align-items: center;
    justify-content: center;
    /* An ink disc with a thin cream ring, like the black and white art of the cards */
    background-image: radial-gradient(circle at 35% 30%, #4a4a4f, #1c1c1f 70%);
    border: 0.1em solid #f5ecd9;
    outline: 0.05em solid rgba(28, 28, 31, 0.8);
    box-sizing: border-box;
    box-shadow: 0 0.08em 0.3em rgba(0, 0, 0, 0.6);
    transition: box-shadow 0.15s;

    &:hover {
      box-shadow: 0 0 0.25em 0.08em #ffa9c1, 0 0.08em 0.3em rgba(0, 0, 0, 0.6);
    }
  `
}

const iconCss = css`
  color: #f5ecd9;
  font-size: 1.3em;
`

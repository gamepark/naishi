import { css } from '@emotion/react'
import { defaultTheme, GameTheme } from '@gamepark/react-game'
import { colors } from './colors'
import { fontBody, fontDisplay } from './typography'

/**
 * The look of the rulebook: the dialogs and the menu are its white pages with black ink, the titles in brush lettering, the
 * buttons are its magenta discs. The table keeps the default background.
 */

const buttonBase = css`
  background: ${colors.ink} !important;
  color: ${colors.paperWarm} !important;
  border: 0.12em solid ${colors.sakura} !important;
  border-radius: 1em !important;
  padding: 0.35em 1em !important;
  font-family: ${fontBody};
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 0.15em 0.35em rgba(0, 0, 0, 0.4);
  transition:
    background 150ms ease,
    color 150ms ease,
    border-color 150ms ease,
    transform 120ms ease;
  outline: none !important;

  &:hover:not(:disabled),
  &:focus:hover:not(:disabled) {
    background: ${colors.magentaDeep} !important;
    color: white !important;
    border-color: ${colors.magentaDeep} !important;
  }

  &:focus:not(:hover):not(:disabled) {
    background: ${colors.ink} !important;
    color: ${colors.paperWarm} !important;
    border-color: ${colors.magenta} !important;
  }

  &:active:not(:disabled) {
    background: ${colors.magentaDark} !important;
    color: white !important;
    border-color: ${colors.magentaDark} !important;
    transform: translateY(0.05em);
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`

const pageTitle = css`
  h2 {
    font-family: ${fontDisplay};
    font-weight: 400;
    color: ${colors.ink};
    letter-spacing: 0.02em;
  }
`

const dialogContainer = css`
  border: 0.08em solid ${colors.blossom};
  box-shadow:
    0 0 0 0.15em rgba(236, 0, 140, 0.25),
    0 0.6em 1.5em rgba(0, 0, 0, 0.6);
  ${pageTitle};
`

const headerBar = css`
  background: rgba(35, 31, 32, 0.94);
  border-bottom: 0.12em solid ${colors.magenta};
  color: ${colors.paperWarm};
  box-shadow: 0 0.2em 0.5em rgba(0, 0, 0, 0.6);

  h1 {
    color: ${colors.paperWarm};
    font-weight: 600;
  }

  b,
  strong {
    color: ${colors.blossom};
  }
`

const headerButtons = css`
  background: transparent !important;
  color: ${colors.paperWarm} !important;
  border: 0.08em solid rgba(250, 246, 248, 0.5) !important;
  border-radius: 1em !important;
  font-weight: 700;
  cursor: pointer;
  padding: 0 0.6em !important;
  box-shadow: none !important;
  outline: none !important;
  transition:
    background 150ms ease,
    color 150ms ease,
    border-color 150ms ease;

  &:hover:not(:disabled),
  &:focus:hover:not(:disabled) {
    background: ${colors.magentaDeep} !important;
    color: white !important;
    border-color: ${colors.magentaDeep} !important;
  }

  &:focus:not(:hover):not(:disabled) {
    background: transparent !important;
    color: ${colors.paperWarm} !important;
    border-color: ${colors.magenta} !important;
  }

  &:active:not(:disabled) {
    background: ${colors.magentaDark} !important;
    color: white !important;
    border-color: ${colors.magentaDark} !important;
  }
`

const menuPanel = css`
  background: ${colors.paperWarm};
  color: ${colors.ink};
  border: 0.08em solid ${colors.blossom};
  box-shadow:
    0 0 0 0.15em rgba(236, 0, 140, 0.25),
    0 0.6em 1.5em rgba(0, 0, 0, 0.6);
  ${pageTitle};

  h2 {
    border-bottom: 0.12em solid ${colors.magenta};
    padding-bottom: 0.3em;
  }
`

const menuMainButton = css`
  background: ${colors.magentaDeep} !important;
  color: white !important;
  border: 0.12em solid ${colors.magentaDark} !important;
  outline: none !important;

  &:hover:not(:disabled) {
    background: ${colors.magentaDark} !important;
  }

  &:focus:not(:hover):not(:disabled) {
    background: ${colors.magentaDeep} !important;
  }
`

/** The popup of the tutorial is at the right of an element of the table: PopupAnchor gives the position of the popup in 2 CSS variables */
const tutorialPopupCss = css`
  left: calc(var(--tutorial-left, 50vw) - (100vw - 100%) / 2);
  top: calc(var(--tutorial-middle, 50vh) - 50vh);
  max-width: 96vw;
`

export const theme: GameTheme = {
  ...defaultTheme,
  root: {
    // A single family name: react-game quotes it and adds the sans-serif fallback
    fontFamily: 'Figtree',
    background: defaultTheme.root.background
  },
  palette: {
    primary: colors.magentaDeep,
    primaryHover: colors.magenta,
    primaryActive: colors.magentaDark,
    primaryLight: colors.blossomLight,
    primaryLighter: colors.blossom,
    surface: colors.paperWarm,
    onSurface: colors.ink,
    onSurfaceFocus: colors.blossomLight,
    onSurfaceActive: colors.blossom,
    danger: colors.vermilion,
    dangerHover: colors.vermilionLight,
    dangerActive: colors.vermilionLighter,
    disabled: colors.inkSoft
  },
  buttons: buttonBase,
  dialog: {
    ...defaultTheme.dialog,
    backgroundColor: colors.paperWarm,
    color: colors.ink,
    container: dialogContainer,
    buttons: buttonBase
  },
  header: {
    bar: headerBar,
    buttons: headerButtons
  },
  menu: {
    panel: menuPanel,
    mainButton: menuMainButton
  },
  playerPanel: {
    activeRingColors: [colors.magenta, colors.sakura]
  },
  tutorial: {
    container: tutorialPopupCss
  }
}

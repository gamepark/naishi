import { css } from '@emotion/react'
import { MaterialHelpProps } from '@gamepark/react-game'
import { useTranslation } from 'react-i18next'
import Board from '../images/boards/board.png'
import Ryokan4 from '../images/cards/ryokan-4.jpg'
import Ryokan7 from '../images/cards/ryokan-7.jpg'
import { Arrow, HelpPage, P, Section } from './parts'

const boardSize = { width: 1396, height: 946 }

/** A pictogram cut out of the board image (in pixels of the image), shown `scale` em per pixel */
const BoardCrop = ({ x, y, width, height, scale = 0.012 }: { x: number; y: number; width: number; height: number; scale?: number }) => (
  <div
    css={cropCss}
    style={{
      width: `${width * scale}em`,
      height: `${height * scale}em`,
      backgroundImage: `url(${Board})`,
      backgroundSize: `${boardSize.width * scale}em ${boardSize.height * scale}em`,
      backgroundPosition: `${-x * scale}em ${-y * scale}em`
    }}
  />
)

/** An action of the Imperial Court: its pictogram, and what it does */
const CourtAction = ({ crop, title, text }: { crop: JSX.Element; title: string; text: string }) => {
  const { t } = useTranslation()
  return (
    <div css={actionCss}>
      {crop}
      <div>
        <strong>{t(title)}</strong>
        <P k={text} />
      </div>
    </div>
  )
}

export const CourtBoardHelp = (_props: MaterialHelpProps) => (
  <HelpPage title="help.court.name">
    <P k="help.court.intro" />
    <Section title="help.court.main">
      <CourtAction crop={<BoardCrop x={570} y={110} width={330} height={120} />} title="help.court.decree.name" text="help.court.decree" />
    </Section>
    <Section title="help.court.additional">
      <CourtAction crop={<BoardCrop x={120} y={280} width={330} height={130} />} title="help.court.swap.name" text="help.court.swap" />
      <CourtAction crop={<BoardCrop x={1030} y={400} width={200} height={190} />} title="help.court.discard.name" text="help.court.discard" />
    </Section>
    <Section title="help.court.recall.name">
      <P k="help.court.recall" />
    </Section>
  </HelpPage>
)

export const EmissaryHelp = (_props: MaterialHelpProps) => (
  <HelpPage title="help.emissary.name">
    <P k="help.emissary.rule" />
    <P k="help.emissary.cancel" />
  </HelpPage>
)

export const FirstPlayerHelp = (_props: MaterialHelpProps) => (
  <HelpPage title="help.first.name">
    <P k="help.first.rule" />
  </HelpPage>
)

export const RyokanHelp = (_props: MaterialHelpProps) => (
  <HelpPage title="help.ryokan.name">
    <P k="help.ryokan.rule" />
    <div css={rowCss}>
      <figure css={figureCss}>
        <img src={Ryokan4} css={ryokanCss} alt="" />
        <figcaption>4 points</figcaption>
      </figure>
      <Arrow />
      <figure css={figureCss}>
        <img src={Ryokan7} css={ryokanCss} alt="" />
        <figcaption>7 points</figcaption>
      </figure>
    </div>
    <Section title="help.ryokan.end">
      <P k="help.ryokan.score" />
    </Section>
  </HelpPage>
)

export const ScorePadHelp = (_props: MaterialHelpProps) => (
  <HelpPage title="help.pad.name">
    <P k="help.pad.rule" />
    <P k="help.pad.tie" />
  </HelpPage>
)

const cropCss = css`
  flex-shrink: 0;
  border-radius: 0.4em;
  background-repeat: no-repeat;
  background-color: white;
  box-shadow: 0 0 0.2em rgba(0, 0, 0, 0.4);
`

const actionCss = css`
  display: flex;
  align-items: center;
  gap: 1em;
  margin: 0.8em 0;

  p {
    margin: 0.2em 0;
  }
`

const rowCss = css`
  display: flex;
  align-items: center;
  gap: 1em;
  margin: 0.6em 0;
`

const ryokanCss = css`
  width: 4.6em;
  border-radius: 0.3em;
  box-shadow: 0 0.05em 0.2em rgba(0, 0, 0, 0.5);
`

const figureCss = css`
  margin: 0;
  text-align: center;
  font-size: 0.85em;
`


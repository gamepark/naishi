import { css } from '@emotion/react'
import { CardId } from '@gamepark/naishi/material/CardId'
import { usePlay } from '@gamepark/react-game'
import { MaterialMove } from '@gamepark/rules-api'
import { ReactElement, ReactNode } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { cardImages } from '../material/cardImages'

type TextProps = {
  k: string
  values?: Record<string, string | number>
  /** More tags of the translation, a link to another help for instance: `{ ext: <HelpLink move={…} /> }` */
  components?: Record<string, ReactElement>
}

/** A text of the help: the translation may use <b>bold</b> */
export const T = ({ k, values, components }: TextProps) => <Trans i18nKey={k} values={values} components={{ b: <strong />, ...components }} />

export const P = (props: TextProps) => (
  <p css={paragraphCss}>
    <T {...props} />
  </p>
)

/** Opens another help dialog: a link in a text, or a card image */
export const HelpLink = ({ move, children, card }: { move: MaterialMove; children?: ReactNode; card?: boolean }) => {
  const play = usePlay()
  return (
    <button type="button" css={card ? cardLinkCss : linkCss} onClick={() => play(move, { transient: true })}>
      {children}
    </button>
  )
}

export const Section = ({ title, children }: { title: string; children: ReactNode }) => {
  const { t } = useTranslation()
  return (
    <section css={sectionCss}>
      <h3 css={sectionTitleCss}>{t(title)}</h3>
      {children}
    </section>
  )
}

export const HelpPage = ({ title, children }: { title: string; children: ReactNode }) => {
  const { t } = useTranslation()
  return (
    <div css={pageCss}>
      <h2 css={pageTitleCss}>{t(title)}</h2>
      {children}
    </div>
  )
}

/** A card of a diagram: the face of a card (or a dashed empty place), with a badge for its points */
export type Cell = { id?: CardId; label?: string | number; dim?: boolean; crossed?: boolean; frame?: 'character' | 'building' }

export const MiniCard = ({ id, label, dim, crossed, frame }: Cell) => (
  <div
    css={[miniCardCss, id === undefined && emptyCss, dim && dimCss]}
    style={id !== undefined ? { backgroundImage: `url(${cardImages[id]})` } : undefined}
  >
    {id === undefined && frame && <FrameIcon kind={frame} />}
    {crossed && <span css={crossCss}>✕</span>}
    {label !== undefined && <span css={badgeCss}>{label}</span>}
  </div>
)

/** The frame of the cards: rectangle for the characters, hexagon for the buildings */
export const FrameIcon = ({ kind }: { kind: 'character' | 'building' }) => (
  <svg viewBox="0 0 20 24" css={frameCss} aria-hidden>
    {kind === 'character' ? <rect x="3" y="2" width="14" height="20" rx="1" /> : <polygon points="10,1 18,6 18,18 10,23 2,18 2,6" />}
  </svg>
)

export const FrameLegend = () => {
  const { t } = useTranslation()
  return (
    <div css={legendCss}>
      <span css={legendItemCss}>
        <FrameIcon kind="character" /> {t('help.frame.character')}
      </span>
      <span css={legendItemCss}>
        <FrameIcon kind="building" /> {t('help.frame.building')}
      </span>
    </div>
  )
}

const positions = [0, 1, 2, 3, 4]

/** The territory: the Line, and the Hand behind it. Each position of a row has its card, or nothing (a dashed place) */
export const TerritoryGrid = ({ line, hand }: { line?: (Cell | undefined)[]; hand?: (Cell | undefined)[] }) => {
  const { t } = useTranslation()
  return (
    <div css={gridCss}>
      <span />
      {positions.map((x) => (
        <span key={x} css={positionCss}>
          {x + 1}
        </span>
      ))}
      <span css={rowNameCss}>{t('help.grid.line')}</span>
      {positions.map((x) => (
        <MiniCard key={x} {...(line?.[x] ?? { dim: true })} />
      ))}
      <span css={rowNameCss}>{t('help.grid.hand')}</span>
      {positions.map((x) => (
        <MiniCard key={x} {...(hand?.[x] ?? { dim: true })} />
      ))}
    </div>
  )
}

/** The same cell in every position of a row */
export const fullRow = (cell: Cell, labels?: (string | number | undefined)[]): (Cell | undefined)[] =>
  positions.map((x) => (labels ? (labels[x] === undefined ? undefined : { ...cell, label: labels[x] }) : cell))

/** Cells with a label only at some positions: `{ 2: 12 }` */
export const rowOf = (id: CardId, labels: Record<number, string | number>): (Cell | undefined)[] =>
  positions.map((x) => (labels[x] === undefined ? undefined : { id, label: labels[x] }))

/** A card with its neighbours: left, right, and the card in front of or behind it */
export const AdjacentCross = ({ center, left, right, vertical }: { center: Cell; left?: Cell; right?: Cell; vertical?: Cell }) => {
  const { t } = useTranslation()
  return (
    <div css={crossCss2}>
      <span />
      <div css={verticalCss}>
        <MiniCard {...(vertical ?? { dim: true })} />
        <small>{t('help.cross.vertical')}</small>
      </div>
      <span />
      <MiniCard {...(left ?? { dim: true })} />
      <MiniCard {...center} />
      <MiniCard {...(right ?? { dim: true })} />
    </div>
  )
}

/** Cards side by side */
export const CardRow = ({ cells }: { cells: Cell[] }) => (
  <div css={rowCss}>
    {cells.map((cell, index) => (
      <MiniCard key={index} {...cell} />
    ))}
  </div>
)

export const Arrow = ({ children = '→' }: { children?: ReactNode }) => <span css={arrowCss}>{children}</span>

/** A line of a table: some cards, and the points they give */
export type CountRow = {
  label: string
  values?: Record<string, string | number>
  cards: Cell[]
  /** Three dots after the cards: there may be more of them */
  more?: boolean
  /** Another way to reach the same points, shown after a « / » */
  alt?: Cell[]
  /** Replaces the row of cards (the shape of a group, for instance) */
  shape?: ReactNode
  points: string | number
}

export const CountTable = ({ rows }: { rows: CountRow[] }) => {
  const { t } = useTranslation()
  return (
    <div css={tableCss}>
      {rows.map((row, index) => (
        <div key={index} css={tableRowCss}>
          <span css={[tableLabelCss, row.cards.length === 0 && !row.shape && oneLineCss]}>{t(row.label, row.values)}</span>
          {row.shape ?? <CardRow cells={row.cards} />}
          {row.more && <span css={arrowCss}>…</span>}
          {row.alt && (
            <>
              <span css={arrowCss}>/</span>
              <CardRow cells={row.alt} />
            </>
          )}
          <span css={pointsCss}>= {typeof row.points === 'number' ? t('help.pts', { n: row.points }) : row.points}</span>
        </div>
      ))}
    </div>
  )
}

/** A group of 4 cards in the shape of an L: 3 in a row, and the fourth one in front of the first (cards are adjacent left-right and front-back) */
export const LShape = ({ id }: { id: CardId }) => (
  <div css={lShapeCss}>
    <MiniCard id={id} />
    <span />
    <span />
    <MiniCard id={id} />
    <MiniCard id={id} />
    <MiniCard id={id} />
  </div>
)

export const times = (n: number, cell: Cell): Cell[] => Array.from({ length: n }, () => cell)

const linkCss = css`
  display: inline;
  padding: 0;
  border: none;
  background: none;
  font: inherit;
  font-weight: bold;
  color: #b0305a;
  text-decoration: underline;
  cursor: pointer;
`

const cardLinkCss = css`
  padding: 0;
  border: none;
  background: none;
  font: inherit;
  color: inherit;
  cursor: pointer;
  transition: transform 0.1s;

  &:hover {
    transform: scale(1.06);
  }
`

const paragraphCss = css`
  margin: 0.4em 0;
  line-height: 1.4;
`

const sectionCss = css`
  margin: 1em 0;
`

const sectionTitleCss = css`
  margin: 0 0 0.4em;
  font-size: 1.05em;
  border-bottom: 0.1em solid #ffa9c1;
  padding-bottom: 0.15em;
`

const pageCss = css`
  min-width: 22em;
  max-width: 34em;
  text-align: left;
`

const pageTitleCss = css`
  margin: 0 0 0.5em;
  text-align: left;
`

const miniCardCss = css`
  position: relative;
  flex-shrink: 0;
  width: 3em;
  height: 4.19em;
  border-radius: 0.2em;
  background-size: cover;
  background-position: center;
  box-shadow: 0 0.05em 0.2em rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
`

const emptyCss = css`
  background: transparent;
  box-shadow: none;
  border: 0.1em dashed #9aa;
`

const dimCss = css`
  opacity: 0.35;
`

const badgeCss = css`
  position: absolute;
  bottom: -0.45em;
  left: 50%;
  transform: translateX(-50%);
  min-width: 1.5em;
  padding: 0 0.3em;
  border-radius: 1em;
  background: #ffa9c1;
  border: 0.08em solid #333;
  color: #222;
  font-size: 0.85em;
  font-weight: bold;
  text-align: center;
  white-space: nowrap;
`

const crossCss = css`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c22;
  font-size: 2.2em;
  font-weight: bold;
`

const frameCss = css`
  width: 70%;
  fill: none;
  stroke: #555;
  stroke-width: 1.6;
`

const legendCss = css`
  display: flex;
  gap: 1.2em;
  margin: 0.4em 0;
`

const legendItemCss = css`
  display: flex;
  align-items: center;
  gap: 0.3em;

  svg {
    width: 1.4em;
    height: 1.7em;
  }
`

const gridCss = css`
  display: grid;
  grid-template-columns: auto repeat(5, 3em);
  width: fit-content;
  gap: 0.6em 0.4em;
  align-items: center;
  margin: 0.6em 0 1em;
`

const positionCss = css`
  text-align: center;
  font-size: 0.8em;
  color: #666;
`

const rowNameCss = css`
  font-size: 0.8em;
  color: #666;
  padding-right: 0.3em;
`

const crossCss2 = css`
  display: grid;
  grid-template-columns: repeat(3, 3em);
  gap: 0.6em 0.5em;
  align-items: center;
  justify-items: center;
  margin: 0.6em 0 1em 1em;
`

const verticalCss = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2em;

  small {
    font-size: 0.65em;
    color: #666;
    white-space: nowrap;
  }
`

const rowCss = css`
  display: flex;
  align-items: center;
  gap: 0.35em;
`

const arrowCss = css`
  font-size: 1.6em;
  font-weight: bold;
  padding: 0 0.15em;
`

const tableCss = css`
  display: flex;
  flex-direction: column;
  gap: 0.9em;
  margin: 0.6em 0 1em;
`

const lShapeCss = css`
  display: grid;
  grid-template-columns: repeat(3, 3em);
  gap: 0.35em;
`

const oneLineCss = css`
  white-space: nowrap;
  width: auto;
`

const tableRowCss = css`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.8em;
`

const tableLabelCss = css`
  width: 8.5em;
  font-size: 0.9em;
  flex-shrink: 0;
`

const pointsCss = css`
  font-weight: bold;
  font-size: 1.1em;
  white-space: nowrap;
`

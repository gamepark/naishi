import { NaishiRules } from '@gamepark/naishi/NaishiRules'
import { CardId } from '@gamepark/naishi/material/CardId'
import { LocationType } from '@gamepark/naishi/material/LocationType'
import { getPlayerScore } from '@gamepark/naishi/scoring/getPlayerScore'
import { BoardDescription, MaterialContentProps, useRules } from '@gamepark/react-game'
import { useEffect, useMemo } from 'react'
import { ScorePadHelp } from '../help/OtherHelps'
import ScorePad from '../images/scorepad/scorepad.jpg'
import { scorePadSize } from '../locators/TableLayout'
import { resetCountdown, startCountdown, useCountdownStep } from '../scoring/scoreCountdown'

/** The rows of the score block, from top to bottom (the image is 425 × 653 px) */
const rows = [CardId.Mountain, CardId.Naishi, CardId.Advisor, CardId.Fortress, CardId.Sentinel, CardId.Torii, CardId.Monk, CardId.Rice, CardId.Banner, CardId.Horseman, CardId.Ronin]
const imageWidth = 425
const imageHeight = 653
const firstRowTop = 50
const rowHeight = 50
const totalRowTop = 600
/** Center of the column of each player: the black Emissaries (flower) of the first player, then the white ones (tomoe) */
const columnCenters = [168, 339]
const percent = (value: number, total: number) => `${(value / total) * 100}%`

/** The points of the 2 players, written on the score block row by row at the end of the game */
function ScoreSheet() {
  const rules = useRules<NaishiRules>()
  const over = rules !== undefined && rules.game.rule === undefined
  const scores = useMemo(() => (over ? rules.game.players.map((player) => getPlayerScore(rules, player)) : []), [over])
  // Steps: 1 to 11 = a row, 12 = the Ryokan, 13 = the total
  const step = useCountdownStep()
  useEffect(() => {
    if (over) startCountdown()
    else resetCountdown()
  }, [over])
  if (!over) return null
  const hasRyokan = scores.some((score) => score.byType.ryokan !== undefined)
  return (
    <>
      {scores.map((score, column) => {
        const x = percent(columnCenters[column], imageWidth)
        return (
          <div key={column}>
            {rows.map((type, row) => (
              <Cell key={type} x={x} y={percent(firstRowTop + rowHeight * (row + 0.5), imageHeight)} visible={step > row}>
                {score.byType[type] ?? 0}
              </Cell>
            ))}
            <Cell x={x} y={percent(totalRowTop + (imageHeight - totalRowTop) / 2, imageHeight)} visible={step > rows.length + 1} big>
              {score.total}
            </Cell>
            {hasRyokan && (
              <Cell x={x} y="104%" visible={step > rows.length} onTable>
                {`+${score.byType.ryokan ?? 0}`}
              </Cell>
            )}
          </div>
        )
      })}
      {hasRyokan && (
        <Cell x={percent(45, imageWidth)} y="104%" visible={step > rows.length} onTable>
          Ryokan
        </Cell>
      )}
    </>
  )
}

/** `onTable`: written under the block, on the table, not on the paper */
const Cell = ({ x, y, visible, big, onTable, children }: { x: string; y: string; visible: boolean; big?: boolean; onTable?: boolean; children: React.ReactNode }) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      transform: `translate(-50%, -50%) scale(${visible ? 1 : 1.6})`,
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.4s, transform 0.4s',
      fontSize: big ? '0.9em' : '0.62em',
      fontWeight: 700,
      color: onTable ? 'white' : '#222',
      pointerEvents: 'none',
      whiteSpace: 'nowrap'
    }}
  >
    {children}
  </div>
)

/** A score block: the scores are written on it at the end of the game */
class ScorePadDescription extends BoardDescription {
  width = scorePadSize.width
  height = scorePadSize.height
  image = ScorePad
  staticItem = { location: { type: LocationType.ScorePad } }
  help = ScorePadHelp

  content = (props: MaterialContentProps) => this.contentWithBackChildren({ ...props, children: <ScoreSheet /> })
}

export const scorePadDescription = new ScorePadDescription()

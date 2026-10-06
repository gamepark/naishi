import { ItemMenuButton } from '@gamepark/react-game'
import { MaterialMove } from '@gamepark/rules-api'
import { ReactNode } from 'react'

type ImageButtonProps = {
  move: MaterialMove
  image: string
  /** The text under the button */
  label: ReactNode
  angle?: number
  radius?: number
  /** The text is on several lines in this width (em), instead of one line */
  labelWidth?: number
  /** Position from the center of the item, in cm (instead of angle and radius) */
  x?: number
  y?: number
  /** Width of the button, in em. The height follows the ratio of the image (width / height) when it is not round. */
  width?: number
  ratio?: number
} & (
  | { round?: false; padding?: never; borderColor?: never }
  | {
      /** The image is in a white round, with a thick border of this color and some space around the image (in % of the button) */
      round: true
      padding?: number
      borderColor?: string
    }
)

/** A button that is an image, or an image in a round, with its text under it */
export const ImageButton = ({ move, image, label, angle = 0, radius = 0, x, y, labelWidth, width = 3, ratio = 1, round, padding = 0, borderColor }: ImageButtonProps) => (
  <ItemMenuButton
    move={move}
    angle={angle}
    radius={radius}
    x={x}
    y={y}
    style={{
      width: `${width}em`,
      height: `${round ? width : width / ratio}em`,
      borderRadius: round ? '50%' : 0,
      padding: 0,
      border: round && borderColor ? `0.25em solid ${borderColor}` : 'none',
      boxSizing: 'border-box',
      background: round ? 'white' : 'transparent'
    }}
  >
    <img
      src={image}
      alt=""
      draggable={false}
      style={{ width: '100%', height: '100%', borderRadius: round ? '50%' : 0, objectFit: 'contain', padding: `${padding}%`, boxSizing: 'border-box' }}
    />
    <span
      style={{
        position: 'absolute',
        top: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        marginTop: '0.2em',
        padding: '0 0.5em',
        whiteSpace: labelWidth === undefined ? 'nowrap' : 'normal',
        width: labelWidth === undefined ? undefined : `${labelWidth}em`,
        boxSizing: 'border-box',
        textAlign: 'center',
        lineHeight: 1.2,
        background: 'rgba(0, 0, 0, 0.6)',
        color: 'white',
        borderRadius: '0.3em'
      }}
    >
      {label}
    </span>
  </ItemMenuButton>
)

/** The buttons with the symbol of a player (flower = the first player, tomoe = the second one) and an arrow */
export const symbolButtonRatio = 355 / 465

import { useLayoutEffect, useRef } from 'react'
import { getTableLayout } from '../locators/TableLayout'

/** Where the popup of a step is: at the right of an element of the table. In cm of the table, `x` is the right side of the element, `y` its middle. */
export type PopupAnchorPosition = { x: number; y: number }

/** Width of the popup, in em (1 em = 1% of the height of the screen) */
export const popupWidth = 60

/**
 * Puts the popup of the tutorial at the right of an element of the table, wherever the table is on the screen (the zoom moves it):
 * the position is read on the table at every frame and given to the theme of the dialog (see main.tsx) with 2 CSS variables.
 * The popup stays inside the screen. It renders nothing: it is part of the text of the popup.
 */
export const PopupAnchor = ({ anchor }: { anchor: PopupAnchorPosition | 'center' }) => {
  const marker = useRef<HTMLSpanElement>(null)
  useLayoutEffect(() => {
    const { tableBounds: bounds } = getTableLayout(false)
    let frame = 0
    const place = () => {
      const table = document.querySelector('.react-transform-component')?.firstElementChild
      if (anchor === 'center') {
        // In the middle of the screen
        const width = popupWidth * parseFloat(getComputedStyle(document.body).fontSize)
        document.documentElement.style.setProperty('--tutorial-left', `${(window.innerWidth - width) / 2}px`)
        document.documentElement.style.setProperty('--tutorial-middle', `${window.innerHeight / 2}px`)
      } else if (table) {
        const rect = table.getBoundingClientRect()
        const pxPerCm = rect.width / (bounds.xMax - bounds.xMin)
        const em = parseFloat(getComputedStyle(document.body).fontSize)
        const width = popupWidth * em
        // The dialog is the 3rd parent of the text: text > paragraph > content > dialog
        const dialog = marker.current?.parentElement?.parentElement?.parentElement
        const height = dialog?.getBoundingClientRect().height ?? 12 * em
        const left = Math.max(8, Math.min(rect.left + (anchor.x - bounds.xMin) * pxPerCm + 2 * em, window.innerWidth - width - 8))
        const middle = Math.max(7 * em + height / 2, Math.min(rect.top + (anchor.y - bounds.yMin) * pxPerCm, window.innerHeight - 8 - height / 2))
        document.documentElement.style.setProperty('--tutorial-left', `${left}px`)
        document.documentElement.style.setProperty('--tutorial-middle', `${middle}px`)
      }
      frame = requestAnimationFrame(place)
    }
    place()
    return () => cancelAnimationFrame(frame)
  }, [anchor === 'center' ? 'center' : anchor.x, anchor === 'center' ? 0 : anchor.y])
  return <span ref={marker} />
}

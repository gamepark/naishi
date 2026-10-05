import { useSyncExternalStore } from 'react'

/** Steps of the count at the end of the game: one for each row of the score block (11), the Ryokan, then the total */
export const countSteps = 13

/** Time between two steps, in ms. The count is over before the platform opens the result dialog (10 s after the end of the game). */
const stepDelay = 650

let step = 0
let timer: ReturnType<typeof setInterval> | undefined
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((listener) => listener())

/** Starts the count, if it is not already running */
export function startCountdown() {
  if (timer !== undefined || step >= countSteps) return
  timer = setInterval(() => {
    step++
    emit()
    if (step >= countSteps) {
      clearInterval(timer)
      timer = undefined
    }
  }, stepDelay)
}

export function resetCountdown() {
  if (timer !== undefined) clearInterval(timer)
  timer = undefined
  if (step !== 0) {
    step = 0
    emit()
  }
}

/** The step of the count: the score block and the announcement of the winner both follow it */
export function useCountdownStep() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    () => step
  )
}

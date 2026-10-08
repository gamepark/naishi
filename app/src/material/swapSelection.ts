import { useSyncExternalStore } from 'react'

/** The card the player chose to swap, waiting for the card to swap it with (item index) */
let selected: number | undefined
const listeners = new Set<() => void>()

export const selectSwapCard = (index: number | undefined) => {
  selected = index
  listeners.forEach((listener) => listener())
}

export const useSwapSelection = () =>
  useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => void listeners.delete(listener)
    },
    () => selected
  )

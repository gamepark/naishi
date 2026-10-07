import { useMe } from '@gamepark/react-client'
import { useEffect, useSyncExternalStore } from 'react'

/**
 * The game mat replaces the Imperial Court board on the table. It is only a display choice of the viewer, not an option of the game:
 * the mat is for the subscribers of Game Park, and shown by default to them. The choice is kept in the local storage.
 *
 * The descriptions and the locators are not React components: they read `isPlaymatDisplayed()`. The game provider is given new
 * references of the material and the locators when it changes (see `main.tsx`), so that the whole table is computed again.
 */
const storageKey = 'naishi.playmat'

let subscriber = false
let preference = readPreference()
const listeners = new Set<() => void>()

function readPreference(): boolean {
  try {
    return localStorage.getItem(storageKey) !== 'false'
  } catch {
    return true
  }
}

function notify() {
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function isPlaymatDisplayed(): boolean {
  return subscriber && preference
}

export function setPlaymatPreference(playmat: boolean) {
  preference = playmat
  try {
    localStorage.setItem(storageKey, String(playmat))
  } catch {
    // The choice is not remembered, but it applies to this page
  }
  notify()
}

function setSubscriber(value: boolean) {
  if (subscriber === value) return
  subscriber = value
  notify()
}

export const usePlaymatDisplayed = () => useSyncExternalStore(subscribe, isPlaymatDisplayed)

/** Whether the viewer is a subscriber of Game Park. In development, the platform is not there: the developer is one. */
export const useSubscriber = () => !!useMe()?.user?.isSubscriber || process.env.NODE_ENV === 'development'

/** Mounted inside the game provider (where the user is known): tells the store whether the viewer is a subscriber */
export const SubscriberWatcher = () => {
  const isSubscriber = useSubscriber()
  useEffect(() => setSubscriber(isSubscriber), [isSubscriber])
  return null
}

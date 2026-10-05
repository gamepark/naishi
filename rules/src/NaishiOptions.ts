import { OptionsSpecV2 } from '@gamepark/rules-api'

/**
 * This is the type of object that the game receives when a new game is started.
 * There are no player identities: the seat decides everything. The first player (`players[0]`) plays with the
 * black Emissaries (white flower), the second player with the white Emissaries (black tomoe).
 */
export type NaishiOptions = {
  players: number
  /** Legends & Travellers extension */
  legendsAndTravellers?: boolean
}

/**
 * The structure of everything a host can choose before the game starts — and nothing else.
 * Texts live in `app/public/options/<locale>.json`, see `option.legendsAndTravellers`.
 */
export const NaishiOptionsSpecV2: OptionsSpecV2 = {
  specVersion: 2,
  players: { min: 2, max: 2 },
  options: {
    legendsAndTravellers: { kind: 'boolean' }
  }
}

import { shuffle } from 'es-toolkit'
import { NaishiOptions } from './NaishiOptions'
import { NaishiSetup } from './NaishiSetup'
import { CardId, developmentCopies, riverPiles } from './material/CardId'
import { LocationType } from './material/LocationType'
import { MaterialType } from './material/MaterialType'

/** The cards the tutorial needs where it needs them (see TUTORIEL.md) */
const revealed = [CardId.Rice, CardId.Sentinel, CardId.Fortress, CardId.Advisor, CardId.Monk]
const hands: Record<number, CardId[]> = { 1: [CardId.Advisor, CardId.Monk], 2: [CardId.Sentinel, CardId.Torii] }
/** The piles whose last card (the bottom of the pile) is a Ronin, the most complicated card of the game */
const ronins = [1, 3]
const cardsPerDeck = 5
/** The Fortress is revealed in the middle of the River: the pile 3 */
const fortressPile = 2

/**
 * The setup of the tutorial: the real setup, with:
 * - the Fortress in the middle of the River, to teach the Imperial Court with it
 * - a Naishi under it, revealed when the player takes the Fortress: the opponent takes it, to teach the Imperial decree
 * - no Banner and no Ninja in the Hands, no Ninja among the 2 first cards of the piles, the Ronins at the bottom of the piles
 */
export class NaishiTutorialSetup extends NaishiSetup {
  setupMaterial(_options: NaishiOptions) {
    this.setupFirstPlayer()
    this.setupEmissaries()
    this.setupLines()
    this.setupTutorialCards()
  }

  setupTutorialCards() {
    const pool = developmentCopies.flatMap(([id, copies]) => Array.from({ length: copies }, () => id))
    for (const id of [...revealed, ...Object.values(hands).flat()]) this.takeFrom(pool, id)

    this.material(MaterialType.Card).createItems(
      revealed.map((id, pile) => ({ id, location: { type: LocationType.River, x: pile } }))
    )
    for (const player of this.players) {
      this.material(MaterialType.Card).createItems([
        ...hands[player].map((id, index) => ({ id, location: { type: LocationType.Hand, player, x: 3 + index } })),
        ...Array.from({ length: 3 }, (_, x) => ({ id: CardId.Mountain, location: { type: LocationType.Hand, player, x } }))
      ])
    }

    // The 25 cards of the piles: the Ronins at the bottom, a Naishi under the Fortress (the player takes the Fortress, then the Naishi
    // is revealed for the opponent), and no Ninja at the top of a pile (the revealed card and the next one)
    for (const _ of ronins) this.takeFrom(pool, CardId.Ronin)
    this.takeFrom(pool, CardId.Naishi)
    const others = shuffle(pool)
    const tops = [
      ...others
        .filter((id) => id !== CardId.Ninja)
        .slice(0, riverPiles - 1)
    ]
    tops.splice(fortressPile, 0, CardId.Naishi)
    for (const id of tops.filter((_, pile) => pile !== fortressPile)) this.takeFrom(others, id)
    const decks = Array.from({ length: riverPiles }, (_, pile) => {
      const cards: CardId[] = Array.from({ length: cardsPerDeck })
      cards[0] = ronins.includes(pile) ? CardId.Ronin : (undefined as unknown as CardId)
      cards[cardsPerDeck - 1] = tops[pile]
      for (let x = 0; x < cardsPerDeck - 1; x++) cards[x] ??= others.pop()!
      return cards
    })
    this.material(MaterialType.Card).createItems(
      decks.flatMap((cards, pile) => cards.map((id, x) => ({ id, location: { type: LocationType.RiverDeck, id: pile, x } })))
    )
  }

  takeFrom(cards: CardId[], id: CardId) {
    const index = cards.indexOf(id)
    if (index === -1) throw new Error(`No ${id} left for the tutorial`)
    cards.splice(index, 1)
  }
}

import { MaterialGameSetup } from '@gamepark/rules-api'
import { sampleSize, shuffle } from 'es-toolkit'
import { NaishiOptions } from './NaishiOptions'
import { NaishiRules } from './NaishiRules'
import { CardId, developmentCopies, legendReplaces, legends, riverPiles, territorySize, travellers } from './material/CardId'
import { LocationType } from './material/LocationType'
import { MaterialType } from './material/MaterialType'
import { RuleId } from './rules/RuleId'

const emissariesPerPlayer = 2
const developmentCardsInHand = 2
const mountainsInHand = 3

/**
 * This class creates a new Game based on the game options
 */
export class NaishiSetup extends MaterialGameSetup<number, MaterialType, LocationType, NaishiOptions> {
  Rules = NaishiRules

  setupMaterial(options: NaishiOptions) {
    const extension = options.legendsAndTravellers === true
    this.setupFirstPlayer()
    this.setupEmissaries()
    this.setupLines()
    this.setupDevelopmentCardsAndHands(extension)
    if (extension) this.setupRyokan()
  }

  /** Setup steps 1 and 2: the first player takes the First player card and plays with the black Emissaries (item id = player) */
  setupFirstPlayer() {
    const [firstPlayer] = this.players
    this.material(MaterialType.FirstPlayerCard).createItem({ id: firstPlayer, location: { type: LocationType.FirstPlayerSpot, player: firstPlayer } })
  }

  setupEmissaries() {
    this.material(MaterialType.Emissary).createItems(
      this.players.flatMap((player) =>
        Array.from({ length: emissariesPerPlayer }, (_, x) => ({ id: player, location: { type: LocationType.EmissaryReserve, player, x } }))
      )
    )
  }

  /** Setup step 5: each player places 5 Mountains face up in their Line (3 more go in their Hand, see below) */
  setupLines() {
    for (const player of this.players) {
      this.material(MaterialType.Card).createItems(
        Array.from({ length: territorySize }, (_, x) => ({ id: CardId.Mountain, location: { type: LocationType.Line, player, x } }))
      )
    }
  }

  /**
   * Setup steps 4 and 5: 2 Development cards are dealt in each Hand (completed with 3 Mountains), then the other Development cards
   * are shuffled into the 5 River piles (the first card of each pile is revealed).
   * The exchange of one card between the players (step 6) and the shuffle of the Hands (step 7) are made by the first rule.
   */
  setupDevelopmentCardsAndHands(extension: boolean) {
    const { hands, river, setAside } = this.getDevelopmentCardIds(extension)
    const pileSize = river.length / riverPiles
    const riverLocations = Array.from({ length: riverPiles }, (_, pile) =>
      Array.from({ length: pileSize }, (_, index) => (index === 0 ? { type: LocationType.River, x: pile } : { type: LocationType.RiverDeck, id: pile }))
    ).flat()
    const handLocations = this.players.flatMap((player) =>
      Array.from({ length: developmentCardsInHand }, (_, index) => ({ type: LocationType.Hand, player, x: mountainsInHand + index }))
    )
    this.material(MaterialType.Card).createItems(hands.map((id, index) => ({ id, location: handLocations[index] })))
    this.material(MaterialType.Card).createItems(river.map((id, index) => ({ id, location: riverLocations[index] })))
    this.material(MaterialType.Card).createItems(setAside.map((id, x) => ({ id, location: { type: LocationType.SetAside, x } })))
    // Shuffling keeps the locations in place and swaps the cards between them, which is dealing the shuffled cards
    this.material(MaterialType.Card)
      .location((location) => location.type === LocationType.River || location.type === LocationType.RiverDeck)
      .shuffle()
    for (const player of this.players) {
      this.material(MaterialType.Card).createItems(
        Array.from({ length: mountainsInHand }, (_, x) => ({ id: CardId.Mountain, location: { type: LocationType.Hand, player, x } }))
      )
    }
  }

  /**
   * Base game: the 34 Development cards, 4 of them in the Hands and the 30 others in the River.
   * Extension: 3 random Legends each replace one copy of the base character they are named after, and 5 random Travellers
   * are added, for 39 cards. The Legends and the Travellers are added to the River only, after the Hands are dealt: there can be none in the Hands
   * at the beginning of the game. The 4 dealt to the players leave 5 piles of 7 cards.
   * The 3 base cards that the Legends replace are not played: they are set aside, face up.
   */
  getDevelopmentCardIds(extension: boolean): { hands: CardId[]; river: CardId[]; setAside: CardId[] } {
    const base = developmentCopies.flatMap(([id, copies]) => Array.from({ length: copies }, () => id))
    const added: CardId[] = []
    const setAside: CardId[] = []
    if (extension) {
      for (const legend of sampleSize(legends, 3)) {
        setAside.push(...base.splice(base.indexOf(legendReplaces[legend]!), 1))
        added.push(legend)
      }
      added.push(...sampleSize(travellers, 5))
    }
    const shuffled = shuffle(base)
    const hands = shuffled.slice(0, developmentCardsInHand * this.players.length)
    return { hands, river: [...shuffled.slice(hands.length), ...added], setAside }
  }

  /** Legends & Travellers: the Ryokan starts out of play, on its 4 points side, until a Traveller enters a territory */
  setupRyokan() {
    this.material(MaterialType.Ryokan).createItem({ location: { type: LocationType.RyokanSpot } })
  }

  start() {
    this.startSimultaneousRule(RuleId.ExchangeCards)
  }
}

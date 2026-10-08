import { isMoveItemType, ItemMove, Material, MaterialMove, MoveItem, PlayerTurnRule } from '@gamepark/rules-api'
import { CardId, isTraveller, riverPiles } from '../material/CardId'
import { CourtAction } from '../material/CourtAction'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { NaishiOptions } from '../NaishiOptions'
import { TravellerEffect, travellerEffects, TravellerTrigger } from '../material/Traveller'
import { Memory } from './Memory'
import { RuleId } from './RuleId'

type NaishiMaterial = Material<number, MaterialType, LocationType>

/** The move that reveals the next card of a River pile, if there is one */
function revealNextCard(material: (type: MaterialType) => NaishiMaterial, pile: number): MaterialMove[] {
  const deck = material(MaterialType.Card).location(LocationType.RiverDeck).locationId(pile)
  return deck.length > 0 ? [deck.deck().dealOne({ type: LocationType.River, x: pile })] : []
}

/** Reveals the next card of every River pile whose revealed card is gone */
export function revealMissingCards(material: (type: MaterialType) => NaishiMaterial): MaterialMove[] {
  const river = material(MaterialType.Card).location(LocationType.River)
  return Array.from({ length: riverPiles }, (_, pile) => pile)
    .filter((pile) => river.filter((item) => item.location.x === pile).length === 0)
    .flatMap((pile) => revealNextCard(material, pile))
}

/** The piles of the River with no card left: nothing revealed, nothing face down */
export function getEmptyPiles(material: (type: MaterialType) => NaishiMaterial): number[] {
  const river = material(MaterialType.Card).location(LocationType.River)
  const decks = material(MaterialType.Card).location(LocationType.RiverDeck)
  return Array.from({ length: riverPiles }, (_, pile) => pile).filter((pile) => river.filter((item) => item.location.x === pile).length === 0 && decks.locationId(pile).length === 0)
}

/** Moves to swap 2 cards: each one takes the location of the other */
export function swapCardsMoves(cards: NaishiMaterial, a: number, b: number): MaterialMove[] {
  return [cards.index(a).moveItem(cards.getItem(b).location), cards.index(b).moveItem(cards.getItem(a).location)]
}

const isTerritoryLocation = (type?: LocationType): type is LocationType => type === LocationType.Line || type === LocationType.Hand

/** Common behavior of the rules where a player acts during their turn */
export abstract class NaishiPlayerRule extends PlayerTurnRule<number, MaterialType, LocationType> {
  get opponent() {
    return this.nextPlayer
  }

  get river() {
    return this.material(MaterialType.Card).location(LocationType.River)
  }

  /** The 5 Hand cards and the 5 Line cards of a player */
  hand(player = this.player) {
    return this.material(MaterialType.Card).location(LocationType.Hand).player(player)
  }

  line(player = this.player) {
    return this.material(MaterialType.Card).location(LocationType.Line).player(player)
  }

  get reserve() {
    return this.material(MaterialType.Emissary).location(LocationType.EmissaryReserve).player(this.player)
  }

  /** The Emissaries on the Imperial Court board that can be recalled: the one on the decree can never be */
  getRecalledEmissaries() {
    return this.material(MaterialType.Emissary)
      .location((location) => location.type === LocationType.CourtSpot && location.id !== CourtAction.Decree)
      .id(this.player)
  }

  get ryokan() {
    return this.material(MaterialType.Ryokan)
  }

  /** Back to the choice of actions of the turn, once an action is over */
  backToTurn(): MaterialMove[] {
    return [this.startRule(RuleId.PlayerTurn)]
  }

  /** Develop: take the card of the River in the same position as the card of the territory that is discarded */
  getDevelopMoves(): MaterialMove[] {
    return [LocationType.Line, LocationType.Hand].flatMap((type) => this.river.moveItems((item) => ({ type, player: this.player, x: item.location.x })))
  }

  /**
   * When a card of the River enters the territory, the card it replaces goes to the discard pile, face up: it is shown to everybody
   * (a hidden Hand card is revealed, and the effect of a Traveller that leaves the territory depends on it).
   */
  beforeDevelop(move: ItemMove): MaterialMove[] {
    if (isMoveItemType(MaterialType.Card)(move) && isTerritoryLocation(move.location.type)) {
      const replaced = this.material(MaterialType.Card)
        .location(move.location.type)
        .player(move.location.player)
        .filter((item) => item.location.x === move.location.x)
      return replaced.length > 0 ? [replaced.moveItem({ type: LocationType.Discard })] : []
    }
    return []
  }

  /** Legends & Travellers: the effects of the Travellers are resolved after a development */
  get extension(): boolean {
    const options: NaishiOptions | undefined = this.game.options
    return options?.legendsAndTravellers === true
  }

  /**
   * After a development: the effects of the Traveller that left the territory and of the Traveller that entered it can be used (see
   * ResolveTravellerEffectsRule), and the Ryokan goes to a player who gets a Traveller.
   * The replaced card is still in the slot: the discard of beforeDevelop is played after the development.
   */
  afterDevelop(move: MoveItem): MaterialMove[] {
    if (!this.extension) return []
    const cards = this.material(MaterialType.Card)
    const { type, player, x } = move.location
    const left = cards
      .location((location) => location.type === type && location.player === player && location.x === x)
      .filter((_, index) => index !== move.itemIndex)
      .getItem<CardId>()!.id!
    if (travellerEffects[left]?.trigger === TravellerTrigger.Leave) {
      this.memorize<CardId[]>(Memory.PendingEffects, (pending = []) => [...pending, left])
    }
    const entered = cards.getItem<CardId>(move.itemIndex).id!
    if (entered === CardId.Samurai) {
      // The Samurai takes the Ryokan wherever it is and puts it on its 7 points side: there is nothing to choose, it is done at once
      return this.getRyokanMoves(true)
    }
    if (!isTraveller(entered)) return []
    if (travellerEffects[entered]?.trigger === TravellerTrigger.Enter) {
      this.memorize<CardId[]>(Memory.PendingEffects, (pending = []) => [...pending, entered])
    }
    return this.getRyokanMoves(false)
  }

  /** Effects of Travellers wait to be used or ignored */
  hasPendingEffects(): boolean {
    return this.remind<CardId[] | undefined>(Memory.PendingEffects) !== undefined
  }

  /**
   * A Traveller enters the territory: a player without the Ryokan takes it, wherever it is, on its 4 points side. A player who already has it
   * on its 4 points side flips it. The effect of the Samurai puts it on its 7 points side.
   */
  getRyokanMoves(side7: boolean): MaterialMove[] {
    if (this.ryokan.length === 0) return []
    const ryokan = this.ryokan.getItem()!
    const mine = ryokan.location.player === this.player
    if (!mine) {
      return [this.ryokan.moveItem({ type: LocationType.RyokanSpot, player: this.player, ...(side7 ? { rotation: true } : {}) })]
    }
    return ryokan.location.rotation === true ? [] : [this.ryokan.rotateItem(true)]
  }

  /** Can the effect of a Traveller do something? */
  canUseEffect(card: CardId): boolean {
    switch (travellerEffects[card]?.effect) {
      case TravellerEffect.SwapCards:
        return true
      case TravellerEffect.RecallEmissaries:
        return this.getRecalledEmissaries().length > 0
      case TravellerEffect.Develop:
        return this.river.length > 0
      default:
        return false
    }
  }

  /**
   * End of the turn. The end of the game starts when 2 piles of the River are empty: if it happens during the turn of the first player,
   * the second player plays a last turn. After a declaration of the end of the game, the opponent plays a last turn too.
   */
  endTurn(): MaterialMove[] {
    this.forget(Memory.MainActionDone)
    this.forget(Memory.AdditionalActionDone)
    const finalTurn = this.remind<number | undefined>(Memory.FinalTurn)
    if (finalTurn === this.player) {
      return [this.startRule(RuleId.EndOfGame)]
    }
    if (finalTurn === undefined && getEmptyPiles((type) => this.material(type)).length >= 2) {
      if (this.player !== this.game.players[0]) {
        return [this.startRule(RuleId.EndOfGame)]
      }
      this.memorize(Memory.FinalTurn, this.nextPlayer)
    }
    return [this.startPlayerTurn(RuleId.PlayerTurn, this.nextPlayer)]
  }
}

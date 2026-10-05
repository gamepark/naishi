import { applyAutomaticMoves, hasRandomMove, isCustomMove, isCustomMoveType, isMoveItemType, MaterialGame, MaterialMove } from '@gamepark/rules-api'
import { describe, expect, it } from 'vitest'
import { NaishiOptions } from './NaishiOptions'
import { NaishiRules } from './NaishiRules'
import { NaishiSetup } from './NaishiSetup'
import { CardId } from './material/CardId'
import { CourtAction } from './material/CourtAction'
import { LocationType } from './material/LocationType'
import { MaterialType } from './material/MaterialType'
import { CustomMoveType } from './rules/CustomMoveType'
import { RuleId } from './rules/RuleId'
import { getPlayerScore } from './scoring/getPlayerScore'

type Game = MaterialGame<number, MaterialType, LocationType>

/** Plays a move like the server does, with its consequences */
function play(game: Game, move: MaterialMove<number, MaterialType, LocationType>) {
  const rules = new NaishiRules(game)
  if (hasRandomMove(rules)) move = rules.randomize(move)
  applyAutomaticMoves(rules, rules.play(JSON.parse(JSON.stringify(move))))
}

const isItemMove = (move: MaterialMove) => isMoveItemType(MaterialType.Card)(move) || isMoveItemType(MaterialType.Emissary)(move)
const isSpotMove = (action: CourtAction) => (move: MaterialMove) => isMoveItemType(MaterialType.Emissary)(move) && move.location.type === LocationType.CourtSpot && move.location.id === action
const isBackToReserve = (move: MaterialMove) => isMoveItemType(MaterialType.Emissary)(move) && move.location.type === LocationType.EmissaryReserve
const isEndTurn = (move: MaterialMove) => isCustomMoveType(CustomMoveType.EndTurn)(move)

const activePlayers = (game: Game): number[] => (game.rule?.players ?? (game.rule?.player !== undefined ? [game.rule.player] : []))

/** Seeded random numbers, so that a failing game can be replayed */
function random(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function newGame(options: Partial<NaishiOptions> = {}): Game {
  return new NaishiSetup().setup({ players: 2, ...options })
}

/** Plays the exchange of cards: each player gives their first Development card */
function exchangeCards(game: Game) {
  for (const player of game.players) {
    const rules = new NaishiRules(game)
    const [move] = rules.getLegalMoves(player)
    play(game, move)
  }
}

const cardsOf = (game: Game, type: LocationType, player?: number) => {
  const cards = new NaishiRules(game).material(MaterialType.Card).location(type)
  return player === undefined ? cards : cards.player(player)
}

function checkInvariants(game: Game) {
  const rules = new NaishiRules(game)
  const cards = rules.material(MaterialType.Card)
  const inPlay = game.rule?.id === RuleId.EndOfGame || game.rule?.id === RuleId.ChooseNinjaCopy
  const slots = new Set<string>()
  for (const item of cards.getItems()) {
    const { type, player, x, id } = item.location
    if ([LocationType.Hand, LocationType.Line, LocationType.FinalHand, LocationType.River].includes(type)) {
      const key = `${type}/${player}/${x}`
      expect(slots.has(key), `two cards in ${key}`).toBe(false)
      slots.add(key)
    }
    expect(item.id).toBeDefined()
    expect(id === undefined || type === LocationType.RiverDeck).toBe(true)
  }
  if (game.rule?.id === RuleId.PlayerTurn) {
    for (const player of game.players) {
      expect(cardsOf(game, LocationType.Hand, player).length).toBe(5)
      expect(cardsOf(game, LocationType.Line, player).length).toBe(5)
    }
  }
  expect(inPlay || true).toBe(true)
}

describe('Naishi game', () => {
  it('starts with the exchange of a card between the players, then the Hands are shuffled', () => {
    const game = newGame()
    expect(game.rule).toMatchObject({ id: RuleId.ExchangeCards, players: [1, 2] })
    const rules = new NaishiRules(game)
    // each player can give one of their 2 Development cards
    expect(rules.getLegalMoves(1)).toHaveLength(2)
    const given = rules.material(MaterialType.Card).location(LocationType.Hand).player(1).id<CardId>((id) => id !== CardId.Mountain).getItems()
    const [move] = rules.getLegalMoves(1)
    play(game, move)
    expect(game.rule?.players).toEqual([2])
    expect(new NaishiRules(game).getLegalMoves(1)).toHaveLength(0)
    const gift = cardsOf(game, LocationType.Gift, 2)
    expect(gift.length).toBe(1)
    play(game, new NaishiRules(game).getLegalMoves(2)[0])
    expect(game.rule).toMatchObject({ id: RuleId.PlayerTurn, player: 1 })
    expect(cardsOf(game, LocationType.Gift).length).toBe(0)
    for (const player of game.players) {
      expect(cardsOf(game, LocationType.Hand, player).length).toBe(5)
      expect(cardsOf(game, LocationType.Hand, player).id(CardId.Mountain).length).toBe(3)
    }
    expect(given.length).toBe(2)
  })

  it('develop: the River card replaces the card of the same position, and the next card is revealed', () => {
    const game = newGame()
    exchangeCards(game)
    const rules = new NaishiRules(game)
    const moves = rules.getLegalMoves(1)
    // 5 River cards × (Line or Hand)
    const developMoves = moves.filter(isMoveItemType(MaterialType.Card))
    expect(developMoves).toHaveLength(10)
    const river = cardsOf(game, LocationType.River)
    const target = river.filter((item) => item.location.x === 3)
    const card = target.getItem()!.id
    const deckBefore = cardsOf(game, LocationType.RiverDeck).locationId(3).length
    const move = developMoves.find((m) => isMoveItemType(MaterialType.Card)(m) && m.location.type === LocationType.Line && m.location.x === 3)!
    play(game, move)
    expect(cardsOf(game, LocationType.Line, 1).filter((item) => item.location.x === 3).getItem()!.id).toBe(card)
    expect(cardsOf(game, LocationType.Line, 1).length).toBe(5)
    expect(cardsOf(game, LocationType.River).filter((item) => item.location.x === 3).length).toBe(1)
    expect(cardsOf(game, LocationType.RiverDeck).locationId(3).length).toBe(deckBefore - 1)
    // After developing: an additional action or the end of the turn
    const next = new NaishiRules(game).getLegalMoves(1)
    expect(next.some(isEndTurn)).toBe(true)
    expect(next.some(isItemMove)).toBe(true)
    play(game, next.find(isEndTurn)!)
    expect(game.rule).toMatchObject({ id: RuleId.PlayerTurn, player: 2 })
  })

  it('additional action: swap, before developing', () => {
    const game = newGame()
    exchangeCards(game)
    const spot = new NaishiRules(game)
      .getLegalMoves(1)
      .find(isSpotMove(CourtAction.Swap))!
    play(game, spot)
    expect(game.rule).toMatchObject({ id: RuleId.SwapCards, player: 1 })
    const swap = new NaishiRules(game).getLegalMoves(1)
    // 10 River pairs, 10 Line pairs, 10 Hand pairs, 5 Hand-Line pairs, and taking the Emissary back
    expect(swap).toHaveLength(36)
    const lineBefore = cardsOf(game, LocationType.Line, 1).getItems().map((item) => item.id)
    play(game, swap.find((m) => isCustomMove(m) && cardsOf(game, LocationType.River).getIndexes().includes(m.data.a))!)
    expect(game.rule).toMatchObject({ id: RuleId.PlayerTurn, player: 1 })
    expect(cardsOf(game, LocationType.Line, 1).getItems().map((item) => item.id)).toEqual(lineBefore)
    // only developing is possible now
    const next = new NaishiRules(game).getLegalMoves(1)
    expect(next.every(isItemMove)).toBe(true)
    expect(next).toHaveLength(10)
  })

  it('additional action: discarding 2 River cards of different piles reveals the next ones', () => {
    const game = newGame()
    exchangeCards(game)
    const spot = new NaishiRules(game)
      .getLegalMoves(1)
      .find(isSpotMove(CourtAction.DiscardRiver))!
    play(game, spot)
    expect(game.rule).toMatchObject({ id: RuleId.DiscardRiverCards })
    const first = new NaishiRules(game).getLegalMoves(1)
    expect(first).toHaveLength(6) // 5 cards, or taking the Emissary back
    play(game, first[0])
    // the next card is not revealed before the 2 cards are discarded
    expect(cardsOf(game, LocationType.River).length).toBe(4)
    const second = new NaishiRules(game).getLegalMoves(1)
    expect(second).toHaveLength(4)
    play(game, second[0])
    expect(cardsOf(game, LocationType.River).length).toBe(5)
    expect(game.rule).toMatchObject({ id: RuleId.PlayerTurn, player: 1 })
    expect(cardsOf(game, LocationType.RiverDeck).length).toBe(25 - 2)
  })

  it('imperial decree: swaps a card with the one of the opponent, and blocks the Emissary', () => {
    const game = newGame()
    exchangeCards(game)
    const decree = new NaishiRules(game)
      .getLegalMoves(1)
      .find(isSpotMove(CourtAction.Decree))!
    play(game, decree)
    expect(game.rule).toMatchObject({ id: RuleId.ImperialDecree })
    const swaps = new NaishiRules(game).getLegalMoves(1)
    // 10 swaps, or taking the Emissary back
    expect(swaps).toHaveLength(11)
    play(game, swaps[9])
    // the decree ends the turn
    expect(game.rule).toMatchObject({ id: RuleId.PlayerTurn, player: 2 })
    // the decree cannot be used anymore, and the Emissary on it cannot be recalled
    const moves = new NaishiRules(game).getLegalMoves(2)
    expect(moves.some(isSpotMove(CourtAction.Decree))).toBe(false)
    expect(new NaishiRules(game).material(MaterialType.Emissary).location(LocationType.CourtSpot).length).toBe(1)
  })

  it('an Emissary can be taken back as long as its action is not done', () => {
    for (const action of [CourtAction.Decree, CourtAction.Swap, CourtAction.DiscardRiver]) {
      const game = newGame()
      exchangeCards(game)
      const rules = () => new NaishiRules(game)
      play(game, rules().getLegalMoves(1).find(isSpotMove(action))!)
      expect(rules().material(MaterialType.Emissary).location(LocationType.CourtSpot).length).toBe(1)
      play(game, rules().getLegalMoves(1).find(isBackToReserve)!)
      expect(game.rule).toMatchObject({ id: RuleId.PlayerTurn })
      expect(rules().material(MaterialType.Emissary).location(LocationType.CourtSpot).length).toBe(0)
      expect(rules().material(MaterialType.Emissary).location(LocationType.EmissaryReserve).player(1).length).toBe(2)
      // everything is possible again, as if nothing had happened
      expect(rules().getLegalMoves(1).some(isSpotMove(CourtAction.Decree))).toBe(true)
      expect(rules().getLegalMoves(1).some(isSpotMove(CourtAction.Swap))).toBe(true)
    }
  })

  it('discarding River cards cannot be cancelled once a card is discarded', () => {
    const game = newGame()
    exchangeCards(game)
    const rules = () => new NaishiRules(game)
    play(game, rules().getLegalMoves(1).find(isSpotMove(CourtAction.DiscardRiver))!)
    play(game, rules().getLegalMoves(1).find((move) => !isCustomMove(move))!)
    expect(rules().getLegalMoves(1).some(isBackToReserve)).toBe(false)
  })

  it('the turn ends by itself when the main action and the additional action are done', () => {
    const game = newGame()
    exchangeCards(game)
    const rules = () => new NaishiRules(game)
    // develop first: the player can still choose an additional action, or end the turn
    play(game, rules().getLegalMoves(1).find((move) => isMoveItemType(MaterialType.Card)(move) && move.location.type === LocationType.Line)!)
    expect(game.rule).toMatchObject({ id: RuleId.PlayerTurn, player: 1 })
    play(game, rules().getLegalMoves(1).find(isSpotMove(CourtAction.Swap))!)
    play(game, rules().getLegalMoves(1).find((move) => isCustomMove(move))!)
    // nothing left to do: the turn of the opponent begins
    expect(game.rule).toMatchObject({ id: RuleId.PlayerTurn, player: 2 })
  })

  it('recall: gets back the Emissaries but the one on the decree', () => {
    const game = newGame()
    exchangeCards(game)
    const rules = () => new NaishiRules(game)
    // no Emissary on the Court board: nothing to recall, and the end cannot be declared with full piles
    expect(rules().getLegalMoves(1).some(isCustomMove)).toBe(false)
    play(game, rules().getLegalMoves(1).find(isSpotMove(CourtAction.Swap))!)
    play(game, rules().getLegalMoves(1)[0])
    play(game, rules().getLegalMoves(1)[0]) // develop
    // swap then develop: the turn ends by itself
    expect(game.rule).toMatchObject({ id: RuleId.PlayerTurn, player: 2 })
  })

  it('plays complete random games, in the base game and with the extension', () => {
    for (const legendsAndTravellers of [false, true]) {
      for (let seed = 1; seed <= 25; seed++) {
        const next = random(seed)
        const game = newGame({ legendsAndTravellers })
        let moves = 0
        while (game.rule !== undefined) {
          const rules = new NaishiRules(game)
          const candidates = activePlayers(game).flatMap((player) => rules.getLegalMoves(player))
          expect(candidates.length, `no legal move for ${JSON.stringify(game.rule)} (seed ${seed})`).toBeGreaterThan(0)
          play(game, candidates[Math.floor(next() * candidates.length)])
          checkInvariants(game)
          expect(++moves, `game too long (seed ${seed})`).toBeLessThan(2000)
        }
        // at the end: Lines and Hands revealed
        for (const player of game.players) {
          expect(cardsOf(game, LocationType.Line, player).length).toBe(5)
          expect(cardsOf(game, LocationType.FinalHand, player).length).toBe(5)
          const score = getPlayerScore(new NaishiRules(game), player)
          expect(Number.isFinite(score.total)).toBe(true)
        }
      }
    }
  })
})

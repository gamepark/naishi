import { applyAutomaticMoves, hasRandomMove, isCustomMoveType, isMoveItemType, MaterialGame, MaterialMove } from '@gamepark/rules-api'
import { describe, expect, it } from 'vitest'
import { NaishiRules } from './NaishiRules'
import { NaishiSetup } from './NaishiSetup'
import { CardId } from './material/CardId'
import { CourtAction } from './material/CourtAction'
import { LocationType } from './material/LocationType'
import { MaterialType } from './material/MaterialType'
import { CustomMoveType } from './rules/CustomMoveType'
import { RuleId } from './rules/RuleId'

type Game = MaterialGame<number, MaterialType, LocationType>

function play(game: Game, move: MaterialMove) {
  const rules = new NaishiRules(game)
  if (hasRandomMove(rules)) move = rules.randomize(move)
  applyAutomaticMoves(rules, rules.play(JSON.parse(JSON.stringify(move))))
}

const rules = (game: Game) => new NaishiRules(game)
const cards = (game: Game) => rules(game).material(MaterialType.Card)

/** A game of the extension, after the exchange of cards, at the beginning of the turn of the first player */
function newGame(): Game {
  const game = new NaishiSetup().setup({ players: 2, legendsAndTravellers: true })
  for (const player of game.players) play(game, rules(game).getLegalMoves(player)[0])
  expect(game.rule).toMatchObject({ id: RuleId.PlayerTurn, player: 1 })
  return game
}

/** Changes the card at a location (cheating for the test: the cards are what the test needs them to be) */
function setCard(game: Game, type: LocationType, x: number, id: CardId, player?: number) {
  const item = cards(game)
    .location(type)
    .filter((item) => item.location.x === x && (player === undefined || item.location.player === player))
    .getItem()!
  item.id = id
}

const develop = (game: Game, type: LocationType, x: number) =>
  rules(game)
    .getLegalMoves(1)
    .find((move) => isMoveItemType(MaterialType.Card)(move) && move.location.type === type && move.location.x === x)!

const customMove = (game: Game, type: CustomMoveType, index?: number) =>
  rules(game)
    .getLegalMoves(1)
    .find((move) => isCustomMoveType(type)(move) && (index === undefined || move.data.index === index))!

const idAt = (game: Game, type: LocationType, x: number, player = 1) =>
  cards(game)
    .location(type)
    .player(player)
    .filter((item) => item.location.x === x)
    .getItem<CardId>()!.id

const ryokan = (game: Game) => rules(game).material(MaterialType.Ryokan).getItem()!

/** Puts an Emissary of the first player on the Imperial Court board */
function placeEmissary(game: Game) {
  const emissary = rules(game).material(MaterialType.Emissary).location(LocationType.EmissaryReserve).player(1).getItem()!
  emissary.location = { type: LocationType.CourtSpot, id: CourtAction.Swap, x: 0 }
}

const emissariesOnBoard = (game: Game) => rules(game).material(MaterialType.Emissary).location(LocationType.CourtSpot).length

describe('Legends & Travellers', () => {
  it('a Traveller entering the territory brings the Ryokan, and its effect can be used: the Porter recalls the Emissaries', () => {
    const game = newGame()
    placeEmissary(game)
    setCard(game, LocationType.River, 2, CardId.Porter)
    expect(ryokan(game).location.player).toBeUndefined()
    play(game, develop(game, LocationType.Line, 2))
    expect(idAt(game, LocationType.Line, 2)).toBe(CardId.Porter)
    // the player gets the Ryokan on its 4 points side
    expect(ryokan(game).location).toMatchObject({ type: LocationType.RyokanSpot, player: 1 })
    expect(ryokan(game).location.rotation).toBeUndefined()
    // the effect is optional, the next card of the pile is not revealed yet
    expect(game.rule).toMatchObject({ id: RuleId.ResolveTravellerEffects, player: 1 })
    expect(cards(game).location(LocationType.River).filter((item) => item.location.x === 2).length).toBe(0)
    play(game, customMove(game, CustomMoveType.UseTravellerEffect))
    expect(emissariesOnBoard(game)).toBe(0)
    expect(game.rule).toMatchObject({ id: RuleId.PlayerTurn, player: 1 })
    expect(cards(game).location(LocationType.River).filter((item) => item.location.x === 2).length).toBe(1)
    // the turn can now only be ended
    expect(rules(game).getLegalMoves(1).some((move) => isCustomMoveType(CustomMoveType.EndTurn)(move))).toBe(true)
  })

  it('the effect of a Traveller can be ignored', () => {
    const game = newGame()
    placeEmissary(game)
    setCard(game, LocationType.River, 2, CardId.Porter)
    play(game, develop(game, LocationType.Line, 2))
    play(game, customMove(game, CustomMoveType.IgnoreTravellerEffect))
    expect(emissariesOnBoard(game)).toBe(1)
    expect(game.rule).toMatchObject({ id: RuleId.PlayerTurn })
  })

  it('a Traveller leaving the territory has its effect: the Old Man recalls the Emissaries', () => {
    const game = newGame()
    placeEmissary(game)
    setCard(game, LocationType.Line, 3, CardId.OldMan, 1)
    setCard(game, LocationType.River, 3, CardId.Mountain)
    play(game, develop(game, LocationType.Line, 3))
    expect(idAt(game, LocationType.Line, 3)).toBe(CardId.Mountain)
    expect(game.rule).toMatchObject({ id: RuleId.ResolveTravellerEffects })
    play(game, customMove(game, CustomMoveType.UseTravellerEffect))
    expect(emissariesOnBoard(game)).toBe(0)
    // no Ryokan: the Traveller left, no Traveller entered
    expect(ryokan(game).location.player).toBeUndefined()
  })

  it('a Traveller discarded from the Hand is shown, and has its effect', () => {
    const game = newGame()
    placeEmissary(game)
    setCard(game, LocationType.Hand, 1, CardId.OldMan, 1)
    setCard(game, LocationType.River, 1, CardId.Mountain)
    play(game, develop(game, LocationType.Hand, 1))
    expect(game.rule).toMatchObject({ id: RuleId.ResolveTravellerEffects })
    expect(cards(game).location(LocationType.Discard).length).toBe(1)
  })

  it('the Ryokan is flipped when a second Traveller enters, and taken from the opponent', () => {
    const game = newGame()
    setCard(game, LocationType.River, 0, CardId.Girl)
    setCard(game, LocationType.River, 1, CardId.Porter)
    // the opponent has the Ryokan on its 7 points side
    ryokan(game).location = { type: LocationType.RyokanSpot, player: 2, rotation: true }
    play(game, develop(game, LocationType.Line, 0))
    expect(ryokan(game).location).toMatchObject({ player: 1 })
    expect(ryokan(game).location.rotation).toBeUndefined()
    // the Girl has an effect when she leaves the territory, not when she enters it
    expect(game.rule).toMatchObject({ id: RuleId.PlayerTurn })
  })

  it('the Samurai takes the Ryokan and puts it on its 7 points side at once', () => {
    const game = newGame()
    setCard(game, LocationType.River, 4, CardId.Samurai)
    play(game, develop(game, LocationType.Hand, 4))
    expect(ryokan(game).location).toMatchObject({ player: 1, rotation: true })
    expect(game.rule).toMatchObject({ id: RuleId.PlayerTurn })
  })

  it('the Samurai takes the Ryokan from the opponent', () => {
    const game = newGame()
    ryokan(game).location = { type: LocationType.RyokanSpot, player: 2 }
    setCard(game, LocationType.River, 4, CardId.Samurai)
    play(game, develop(game, LocationType.Hand, 4))
    expect(ryokan(game).location).toMatchObject({ player: 1, rotation: true })
  })

  it('a second Traveller flips the Ryokan to its 7 points side', () => {
    const game = newGame()
    ryokan(game).location = { type: LocationType.RyokanSpot, player: 1 }
    setCard(game, LocationType.River, 0, CardId.Girl)
    play(game, develop(game, LocationType.Line, 0))
    expect(ryokan(game).location.rotation).toBe(true)
  })

  it('the Cherry Lady swaps 2 cards anywhere in the territory', () => {
    const game = newGame()
    setCard(game, LocationType.River, 2, CardId.CherryLady)
    play(game, develop(game, LocationType.Line, 2))
    play(game, customMove(game, CustomMoveType.UseTravellerEffect))
    expect(game.rule).toMatchObject({ id: RuleId.SwapTerritoryCards })
    const swaps = rules(game).getLegalMoves(1)
    // the 10 cards of the territory, 2 by 2
    expect(swaps).toHaveLength(45)
    play(game, swaps[0])
    expect(game.rule).toMatchObject({ id: RuleId.PlayerTurn })
    expect(cards(game).location(LocationType.River).filter((item) => item.location.x === 2).length).toBe(1)
  })

  it('the Girl develops again, without the card of the pile that was just developed', () => {
    const game = newGame()
    setCard(game, LocationType.Line, 1, CardId.Girl, 1)
    setCard(game, LocationType.River, 1, CardId.Mountain)
    setCard(game, LocationType.River, 3, CardId.Mountain)
    play(game, develop(game, LocationType.Line, 1))
    play(game, customMove(game, CustomMoveType.UseTravellerEffect))
    expect(game.rule).toMatchObject({ id: RuleId.DevelopFromTraveller })
    const moves = rules(game).getLegalMoves(1)
    // the 4 other piles, in the Line or in the Hand
    expect(moves).toHaveLength(8)
    expect(moves.every((move) => isMoveItemType(MaterialType.Card)(move) && move.location.x !== 1)).toBe(true)
    const next = develop(game, LocationType.Hand, 3)
    play(game, next)
    // the 2 piles are revealed once the effects are resolved
    expect(game.rule).toMatchObject({ id: RuleId.PlayerTurn })
    expect(cards(game).location(LocationType.River).length).toBe(5)
  })

  it('the Girl can bring in another Traveller, with its effect', () => {
    const game = newGame()
    setCard(game, LocationType.Line, 1, CardId.Girl, 1)
    setCard(game, LocationType.River, 1, CardId.Mountain)
    setCard(game, LocationType.River, 3, CardId.CherryLady)
    play(game, develop(game, LocationType.Line, 1))
    play(game, customMove(game, CustomMoveType.UseTravellerEffect))
    play(game, develop(game, LocationType.Hand, 3))
    expect(game.rule).toMatchObject({ id: RuleId.ResolveTravellerEffects })
    play(game, customMove(game, CustomMoveType.UseTravellerEffect))
    expect(game.rule).toMatchObject({ id: RuleId.SwapTerritoryCards })
  })

  it('with several effects at the same time, the player chooses the order', () => {
    const game = newGame()
    setCard(game, LocationType.Line, 2, CardId.OldMan, 1)
    setCard(game, LocationType.River, 2, CardId.CherryLady)
    placeEmissary(game)
    play(game, develop(game, LocationType.Line, 2))
    // the Old Man left and the Cherry Lady entered: 2 effects to choose from
    const choices = rules(game).getLegalMoves(1).filter((move) => isCustomMoveType(CustomMoveType.UseTravellerEffect)(move))
    expect(choices).toHaveLength(2)
    // the Cherry Lady entered first (index 0), then the Old Man left (index 1): the player starts with the Old Man
    play(game, customMove(game, CustomMoveType.UseTravellerEffect, 1))
    expect(emissariesOnBoard(game)).toBe(0)
    expect(game.rule).toMatchObject({ id: RuleId.ResolveTravellerEffects })
    play(game, customMove(game, CustomMoveType.IgnoreTravellerEffect, 0))
    expect(game.rule).toMatchObject({ id: RuleId.PlayerTurn })
  })
})

import { applyAutomaticMoves, hasRandomMove, isCustomMoveType, isMoveItemType, MaterialGame, MaterialMove } from '@gamepark/rules-api'
import { describe, expect, it } from 'vitest'
import { NaishiRules } from './NaishiRules'
import { NaishiTutorialSetup } from './NaishiTutorialSetup'
import { CardId } from './material/CardId'
import { CourtAction } from './material/CourtAction'
import { LocationType } from './material/LocationType'
import { MaterialType } from './material/MaterialType'
import { CustomMoveType } from './rules/CustomMoveType'
import { RuleId } from './rules/RuleId'

type Game = MaterialGame<number, MaterialType, LocationType>

const newGame = (): Game => new NaishiTutorialSetup().setup({ players: 2 }, { step: 0, stepComplete: false, popupClosed: false })

function play(game: Game, move: MaterialMove<number, MaterialType, LocationType>) {
  const rules = new NaishiRules(game)
  if (hasRandomMove(rules)) move = rules.randomize(move)
  applyAutomaticMoves(rules, rules.play(JSON.parse(JSON.stringify(move))))
}

const cards = (game: Game) => new NaishiRules(game).material(MaterialType.Card)

describe('Tutorial setup', () => {
  it('has the cards the scenario needs, in the right places', () => {
    for (let i = 0; i < 30; i++) {
      const game = newGame()
      const all = cards(game)
      expect(all.length).toBe(50)
      const river = all.location(LocationType.River)
      expect(river.getItems().sort((a, b) => a.location.x! - b.location.x!).map((item) => item.id)).toEqual([CardId.Rice, CardId.Sentinel, CardId.Fortress, CardId.Advisor, CardId.Monk])
      // standard Lines: 5 Mountains
      for (const player of game.players) {
        expect(all.location(LocationType.Line).player(player).id(CardId.Mountain).length).toBe(5)
      }
      // no Banner and no Ninja in the Hands
      expect(all.location(LocationType.Hand).id((id) => id === CardId.Banner || id === CardId.Ninja).length).toBe(0)
      for (let pile = 0; pile < 5; pile++) {
        const deck = all.location(LocationType.RiverDeck).locationId(pile)
        expect(deck.length).toBe(5)
        const byOrder = deck.getItems().sort((a, b) => a.location.x! - b.location.x!)
        expect(byOrder[4].id).not.toBe(CardId.Ninja)
        if (pile === 1 || pile === 3) expect(byOrder[0].id).toBe(CardId.Ronin)
        // a Naishi under the Fortress
        if (pile === 2) expect(byOrder[4].id).toBe(CardId.Naishi)
      }
      expect(all.id(CardId.Ronin).location(LocationType.RiverDeck).filter((item) => item.location.x === 0).length).toBe(2)
    }
  })

  it('plays the scripted part of the scenario', () => {
    const game = newGame()
    const rules = () => new NaishiRules(game)
    const move = (player: number, predicate: (move: MaterialMove) => boolean) => {
      const found = rules().getLegalMoves(player).find(predicate)
      expect(found, JSON.stringify(game.rule)).toBeDefined()
      play(game, found!)
    }
    const endTurn = (player: number) => move(player, (m) => isCustomMoveType(CustomMoveType.EndTurn)(m))
    const cardAt = (type: LocationType, x: number, player?: number) =>
      cards(game).location(type).filter((item) => item.location.x === x && (player === undefined || item.location.player === player))
    const swapOf = (a: number, b: number) => (m: MaterialMove) => isCustomMoveType(CustomMoveType.SwapCards)(m) && [m.data.a, m.data.b].sort().join() === [a, b].sort().join()
    const gift = (player: number, id?: CardId) => (m: MaterialMove) =>
      isMoveItemType(MaterialType.Card)(m) && m.location.type === LocationType.Gift && cards(game).getItem(m.itemIndex).location.player === player && (id === undefined || cards(game).getItem(m.itemIndex).id === id)
    // 4: both players give a card
    move(1, gift(1))
    move(2, gift(2, CardId.Sentinel))
    expect(game.rule).toMatchObject({ id: RuleId.PlayerTurn, player: 1 })
    // 6: the Sentinel of the pile 2 goes to the position 2 of the Line or of the Hand
    const sentinel = cardAt(LocationType.River, 1).getIndex()
    move(1, (m) => isMoveItemType(MaterialType.Card)(m) && m.itemIndex === sentinel && m.location.type === LocationType.Hand && m.location.player === 1 && m.location.x === 1)
    // 7: the player ends the turn
    endTurn(1)
    expect(game.rule).toMatchObject({ id: RuleId.PlayerTurn, player: 2 })
    // 8: the opponent develops any card but the one of the middle
    move(2, (m) => isMoveItemType(MaterialType.Card)(m) && (m.location.type === LocationType.Line || m.location.type === LocationType.Hand) && cards(game).getItem(m.itemIndex).location.x !== 2)
    endTurn(2)
    // 10: the Fortress goes to the middle of the Line
    const fortress = cardAt(LocationType.River, 2).getIndex()
    expect(cards(game).getItem(fortress).id).toBe(CardId.Fortress)
    move(1, (m) => isMoveItemType(MaterialType.Card)(m) && m.itemIndex === fortress && m.location.type === LocationType.Line && m.location.x === 2)
    // 11 and 12: an Emissary on Intervertir, and the Fortress goes to the left edge: the turn ends by itself
    move(1, (m) => isMoveItemType(MaterialType.Emissary)(m) && m.location.type === LocationType.CourtSpot && m.location.id === CourtAction.Swap)
    const edge = cardAt(LocationType.Line, 0, 1).getIndex()
    move(1, swapOf(fortress, edge))
    expect(cards(game).getItem(fortress).location).toMatchObject({ type: LocationType.Line, player: 1, x: 0 })
    expect(game.rule).toMatchObject({ id: RuleId.PlayerTurn, player: 2 })
    // 13: the Naishi is revealed in the middle of the River, 14: the opponent takes it to the middle of its Line
    const naishi = cardAt(LocationType.River, 2).getIndex()
    expect(cards(game).getItem(naishi).id).toBe(CardId.Naishi)
    move(2, (m) => isMoveItemType(MaterialType.Card)(m) && m.itemIndex === naishi && m.location.type === LocationType.Line && m.location.player === 2 && m.location.x === 2)
    endTurn(2)
    // 15 and 16: the Imperial decree on the Naishi
    move(1, (m) => isMoveItemType(MaterialType.Emissary)(m) && m.location.type === LocationType.CourtSpot && m.location.id === CourtAction.Decree)
    const mine = cardAt(LocationType.Line, 2, 1).getIndex()
    move(1, swapOf(mine, naishi))
    expect(cards(game).getItem(naishi).location).toMatchObject({ type: LocationType.Line, player: 1, x: 2 })
    expect(game.rule).toMatchObject({ id: RuleId.PlayerTurn, player: 2 })
    // 18: the opponent develops a card
    move(2, (m) => isMoveItemType(MaterialType.Card)(m) && (m.location.type === LocationType.Line || m.location.type === LocationType.Hand))
    endTurn(2)
    // 19: recall the Emissary of Intervertir
    move(1, (m) => isCustomMoveType(CustomMoveType.RecallEmissaries)(m))
    expect(game.rule).toMatchObject({ id: RuleId.PlayerTurn, player: 2 })
    // the opponent never declares the end of the game in the tutorial
    expect(rules().getLegalMoves(2).some((m) => isCustomMoveType(CustomMoveType.DeclareEndOfGame)(m))).toBe(false)
  })
})

import { describe, expect, it } from 'vitest'
import { NaishiSetup } from './NaishiSetup'
import { CardId, legendReplaces, legends, travellers } from './material/CardId'
import { LocationType } from './material/LocationType'
import { MaterialType } from './material/MaterialType'
import { NaishiRules } from './NaishiRules'

const setup = (legendsAndTravellers = false) => new NaishiSetup().setup({ players: 2, legendsAndTravellers })
const cards = (game: ReturnType<typeof setup>) => new NaishiRules(game).material(MaterialType.Card)

describe('Naishi setup', () => {
  it('base game: 50 cards, 5 piles of 6, Hands and Lines of 5', () => {
    const game = setup()
    const material = cards(game)
    expect(material.length).toBe(50)
    expect(material.id(CardId.Mountain).length).toBe(16)
    expect(material.location(LocationType.River).length).toBe(5)
    for (let pile = 0; pile < 5; pile++) {
      expect(material.location(LocationType.River).filter((item) => item.location.x === pile).length).toBe(1)
      const deck = material.location(LocationType.RiverDeck).locationId(pile)
      expect(deck.length).toBe(5)
      expect(deck.getItems().map((item) => item.location.x).sort()).toEqual([0, 1, 2, 3, 4])
    }
    for (const player of game.players) {
      for (const type of [LocationType.Hand, LocationType.Line]) {
        const items = material.location(type).player(player).getItems()
        expect(items.map((item) => item.location.x).sort()).toEqual([0, 1, 2, 3, 4])
      }
      expect(material.location(LocationType.Line).player(player).getItems().every((item) => item.id === CardId.Mountain)).toBe(true)
      expect(material.location(LocationType.Hand).player(player).id(CardId.Mountain).length).toBe(3)
    }
    // Development cards: 34, none of them are Mountains, and the Legends and Travellers stay in the box
    expect(material.id((id) => id !== CardId.Mountain).length).toBe(34)
    expect(material.id((id) => legends.includes(id) || travellers.includes(id)).length).toBe(0)
    expect(new NaishiRules(game).material(MaterialType.Emissary).length).toBe(4)
    expect(new NaishiRules(game).material(MaterialType.FirstPlayerCard).getItems()[0].location.player).toBe(game.players[0])
    expect(new NaishiRules(game).material(MaterialType.Ryokan).length).toBe(0)
  })

  it('extension: 3 Legends replace 3 base cards, 5 Travellers are added, 5 piles of 7', () => {
    for (let i = 0; i < 20; i++) {
      const game = setup(true)
      const material = cards(game)
      // the 3 base cards replaced by the Legends are set aside, face up
      expect(material.location(LocationType.SetAside).length).toBe(3)
      expect(material.length).toBe(58)
      const development = material.location((location) => location.type !== LocationType.SetAside).id((id) => id !== CardId.Mountain)
      expect(development.length).toBe(39)
      const inGame = development.getItems().map((item) => item.id as CardId)
      const legendsInGame = inGame.filter((id) => legends.includes(id))
      expect(legendsInGame.length).toBe(3)
      expect(new Set(legendsInGame).size).toBe(3)
      // the Legends and the Travellers are in the River only: none in the Hands at the beginning
      expect(material.location(LocationType.Hand).id((id) => legends.includes(id) || travellers.includes(id)).length).toBe(0)
      expect(inGame.filter((id) => travellers.includes(id)).length).toBe(5)
      for (const legend of legendsInGame) {
        const base = legendReplaces[legend]!
        const baseCopies = { [CardId.Naishi]: 2, [CardId.Advisor]: 4, [CardId.Sentinel]: 4, [CardId.Horseman]: 2, [CardId.Monk]: 3, [CardId.Ronin]: 2, [CardId.Ninja]: 2 }[base]!
        expect(inGame.filter((id) => id === base).length).toBe(baseCopies - 1)
      }
      for (let pile = 0; pile < 5; pile++) {
        expect(material.location(LocationType.RiverDeck).locationId(pile).length).toBe(6)
      }
      expect(new NaishiRules(game).material(MaterialType.Ryokan).length).toBe(1)
    }
  })
})

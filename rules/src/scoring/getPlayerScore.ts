import { MaterialRules } from '@gamepark/rules-api'
import { CardId } from '../material/CardId'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { Memory } from '../rules/Memory'
import { TerritoryCard, TerritoryGrid, TerritoryScore, scoreTerritory } from './TerritoryScore'

/** The 2 × 5 grid of the territory of a player at the end of the game: the Line, and the Hand revealed under it */
export function getTerritoryGrid(rules: MaterialRules<number, MaterialType, LocationType>, player: number): TerritoryGrid {
  const cards = rules.material(MaterialType.Card)
  const copies = rules.remind<Record<number, number | null> | undefined>(Memory.NinjaCopies) ?? {}
  const row = (type: LocationType): TerritoryCard[] =>
    cards
      .location(type)
      .player(player)
      .getIndexes()
      .map((index) => ({ index, item: cards.getItem<CardId>(index) }))
      .sort((a, b) => a.item.location.x! - b.item.location.x!)
      .map(({ index, item }) => {
        const copiedIndex = copies[index]
        return { id: item.id!, copy: copiedIndex === undefined || copiedIndex === null ? copiedIndex : cards.getItem<CardId>(copiedIndex).id }
      })
  return [row(LocationType.Line), row(LocationType.FinalHand)]
}

/** The points of the Ryokan if the player has it: 4 on its face up side, 7 flipped */
export function getRyokanPoints(rules: MaterialRules<number, MaterialType, LocationType>, player: number): 4 | 7 | undefined {
  const ryokan = rules.material(MaterialType.Ryokan).location(LocationType.RyokanSpot).player(player).getItem()
  return ryokan ? (ryokan.location.rotation === true ? 7 : 4) : undefined
}

export function getPlayerScore(rules: MaterialRules<number, MaterialType, LocationType>, player: number): TerritoryScore {
  return scoreTerritory(getTerritoryGrid(rules, player), getRyokanPoints(rules, player))
}

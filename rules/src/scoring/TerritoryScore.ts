import { baseType, CardId, characters, isTraveller, provinces } from '../material/CardId'

/**
 * A card of the 2 × 5 grid of the territory: row 0 is the Line, row 1 is the Hand.
 * A Ninja (base or Legendary) has the type of the character it copies in `copy`, if any.
 */
export type TerritoryCard = { id: CardId; copy?: CardId | null }

/** The 2 × 5 grid of a territory */
export type TerritoryGrid = [TerritoryCard[], TerritoryCard[]]

/** Points are counted by type of card. The Ryokan has its own line. */
export type ScoreKey = CardId | 'ryokan'

export type TerritoryScore = {
  /** Points by type of card. A Ninja gives its points to the type it copies, a Legend to the type it replaces. */
  byType: Partial<Record<ScoreKey, number>>
  total: number
  /** Number of different colors in the territory, to break a tie */
  colors: number
}

const LINE = 0
const HAND = 1
const CENTER = 2

/** One color for each type of card (see the rulebook). A Ninja has the color of the card it copies, a Legend the color of the card it replaces. */
const colors: Partial<Record<CardId, number>> = {
  [CardId.Mountain]: 1,
  [CardId.Naishi]: 2,
  [CardId.Advisor]: 3,
  [CardId.Fortress]: 4,
  [CardId.Sentinel]: 5,
  [CardId.Torii]: 6,
  [CardId.Monk]: 7,
  [CardId.Rice]: 8,
  [CardId.Banner]: 9,
  [CardId.Horseman]: 10,
  [CardId.Ronin]: 11
}

/** The types of card that count for the Ronin: characters and provinces, not the Mountain nor the base Ninja, and the Ryokan, a province */
const RYOKAN_TYPE = -1
const RYOKAN_COLOR = 12
const roninTypes: number[] = [...characters.filter((type) => type !== CardId.Ninja), ...provinces, RYOKAN_TYPE]

/** The characters that a Ninja can copy: no Ninja (a Ninja copying a Ninja would never end), and never a Legend */
export const copiableCharacters = [CardId.Naishi, CardId.Advisor, CardId.Sentinel, CardId.Monk, CardId.Horseman, CardId.Ronin]

const roninPoints = (types: number) => (types >= 10 ? 45 : types === 9 ? 15 : types === 8 ? 8 : 0)
const legendRoninPoints = (series: number) => (series >= 5 ? 25 : series === 4 ? 15 : series === 3 ? 8 : 0)
const advisorPoints = [2, 4, 3, 4, 2]

type Cell = {
  id: CardId
  r: number
  c: number
  /** What the card counts as. A Ninja counts as the character it copies. The Legendary Monk counts as a Monk and as a Torii. */
  types: CardId[]
  /** The card that gives its scoring conditions: a Ninja scores as the character it copies */
  scoringId?: CardId
}

const isNinja = (id: CardId) => id === CardId.Ninja || id === CardId.LegendNinja

function toCell(card: TerritoryCard, r: number, c: number): Cell {
  const { id } = card
  if (isNinja(id)) {
    const copy = card.copy ?? undefined
    return { id, r, c, types: copy === undefined ? [] : [copy], scoringId: copy }
  }
  if (isTraveller(id)) return { id, r, c, types: [] }
  if (id === CardId.LegendMonk) return { id, r, c, types: [CardId.Monk, CardId.Torii], scoringId: id }
  return { id, r, c, types: [baseType(id)], scoringId: id }
}

/** Computes the score of a territory, as described in the rulebooks. `ryokan` is the number of points of the Ryokan, if the player has it. */
export function scoreTerritory(grid: TerritoryGrid, ryokan?: 4 | 7): TerritoryScore {
  const cells = grid.flatMap((row, r) => row.map((card, c) => toCell(card, r, c)))
  const cellAt = (r: number, c: number) => cells.find((cell) => cell.r === r && cell.c === c)
  const neighbours = (cell: Cell) => [cellAt(cell.r, cell.c - 1), cellAt(cell.r, cell.c + 1), cellAt(1 - cell.r, cell.c)].filter((neighbour): neighbour is Cell => !!neighbour)
  const is = (cell: Cell | undefined, type: CardId) => !!cell && cell.types.includes(type)
  const adjacentCount = (cell: Cell, type: CardId) => neighbours(cell).filter((neighbour) => is(neighbour, type)).length
  const count = (type: CardId) => cells.filter((cell) => is(cell, type)).length

  const byType: Partial<Record<ScoreKey, number>> = {}
  const add = (type: ScoreKey, points: number) => {
    if (points !== 0) byType[type] = (byType[type] ?? 0) + points
  }

  // Mountain: alone +5, 2 or more -5
  const mountains = count(CardId.Mountain)
  if (mountains === 1) add(CardId.Mountain, 5)
  else if (mountains >= 2) add(CardId.Mountain, -5)

  // Torii (the Legendary Monk is one): 1 -5, 2 nothing, 3 or more +30
  const torii = count(CardId.Torii)
  if (torii === 1) add(CardId.Torii, -5)
  else if (torii >= 3) add(CardId.Torii, 30)

  // Fortress: 6 points for each one on the left or right limit of the territory
  add(CardId.Fortress, 6 * cells.filter((cell) => is(cell, CardId.Fortress) && (cell.c === 0 || cell.c === grid[LINE].length - 1)).length)

  // Banner: in the Line only, 1 gives 3 points, 2 give 8
  const banners = cells.filter((cell) => is(cell, CardId.Banner) && cell.r === LINE).length
  if (banners === 1) add(CardId.Banner, 3)
  else if (banners >= 2) add(CardId.Banner, 8)

  // Rice: each group of adjacent rice cards
  const visited = new Set<Cell>()
  for (const cell of cells) {
    if (!is(cell, CardId.Rice) || visited.has(cell)) continue
    let size = 0
    const pending = [cell]
    visited.add(cell)
    while (pending.length) {
      const current = pending.pop()!
      size++
      for (const neighbour of neighbours(current)) {
        if (is(neighbour, CardId.Rice) && !visited.has(neighbour)) {
          visited.add(neighbour)
          pending.push(neighbour)
        }
      }
    }
    add(CardId.Rice, size >= 4 ? 30 : size === 3 ? 20 : size === 2 ? 10 : 0)
  }

  // Types of cards for the Ronin: real cards only. A base Ninja is not a different type, a Legendary Ninja is the type it copies.
  const typesPresent = new Set<number>()
  for (const cell of cells) {
    if (cell.id === CardId.Ninja) continue
    for (const type of cell.types) typesPresent.add(type)
  }
  if (ryokan) typesPresent.add(RYOKAN_TYPE)
  const types = roninTypes.filter((type) => typesPresent.has(type)).length

  // Largest series of identical cards for the Legendary Ronin: characters and provinces
  const identical = new Map<CardId, number>()
  for (const cell of cells) {
    if (characters.includes(baseType(cell.id)) || provinces.includes(cell.id)) identical.set(cell.id, (identical.get(cell.id) ?? 0) + 1)
  }
  const largestSeries = Math.max(0, ...identical.values())

  for (const cell of cells) {
    const { r, c } = cell
    const type = cell.scoringId === undefined ? undefined : baseType(cell.scoringId)
    if (type === undefined) continue
    const legend = cell.scoringId !== undefined && cell.scoringId !== type
    switch (type) {
      case CardId.Naishi:
        if (legend) add(type, (r === LINE && c % 2 === 0) || (r === HAND && c === CENTER) ? 10 : 0)
        else if (c === CENTER) add(type, r === LINE ? 12 : 8)
        break
      case CardId.Advisor:
        if (legend) add(type, count(CardId.Naishi) === 0 ? 5 * count(CardId.Advisor) : 0)
        else add(type, advisorPoints[c] + 4 * adjacentCount(cell, CardId.Naishi))
        break
      case CardId.Sentinel:
        if (legend) {
          const sameRow = cells.filter((other) => other.r === r && (is(other, CardId.Rice) || is(other, CardId.Fortress))).length
          add(type, (adjacentCount(cell, CardId.Sentinel) === 0 ? 5 : 0) + 3 * sameRow)
        } else {
          add(type, (adjacentCount(cell, CardId.Sentinel) === 0 ? 3 : 0) + 4 * adjacentCount(cell, CardId.Fortress))
        }
        break
      case CardId.Monk:
        if (legend) add(type, 2 * neighbours(cell).filter((neighbour) => characters.some((character) => is(neighbour, character))).length)
        else add(type, (r === HAND ? 5 : 0) + 2 * adjacentCount(cell, CardId.Torii))
        break
      case CardId.Horseman:
        if (legend) {
          const buildings = neighbours(cell).filter((neighbour) => provinces.some((province) => is(neighbour, province))).length
          add(type, 4 * buildings + 4 * adjacentCount(cell, CardId.Banner))
        } else if (r === HAND) {
          add(type, 3 + (is(cellAt(LINE, c), CardId.Banner) ? 10 : 0))
        }
        break
      case CardId.Ronin:
        add(type, legend ? legendRoninPoints(largestSeries) : roninPoints(types))
        break
    }
  }
  if (ryokan) add('ryokan', ryokan)

  const total = Object.values(byType).reduce((sum, points) => sum + points, 0)
  const colorOf = (cell: Cell) => (isNinja(cell.id) ? (cell.scoringId === undefined ? undefined : colors[baseType(cell.scoringId)]) : isTraveller(cell.id) ? undefined : colors[baseType(cell.id)])
  const distinctColors = new Set(cells.map(colorOf).filter((color) => color !== undefined))
  // The Ryokan is black, a color that no other card has
  if (ryokan) distinctColors.add(RYOKAN_COLOR)
  return { byType, total, colors: distinctColors.size }
}

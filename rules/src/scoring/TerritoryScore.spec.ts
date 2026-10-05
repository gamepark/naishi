import { describe, expect, it } from 'vitest'
import { CardId } from '../material/CardId'
import { scoreTerritory, TerritoryCard, TerritoryGrid } from './TerritoryScore'

const grid = (line: (CardId | TerritoryCard)[], hand: (CardId | TerritoryCard)[]): TerritoryGrid => [line, hand].map((row) => row.map((card) => (typeof card === 'number' ? { id: card } : card))) as TerritoryGrid

const { Mountain: M, Naishi: N, Advisor: A, Fortress: F, Sentinel: S, Torii: T, Monk: K, Rice: R, Banner: B, Horseman: H, Ronin: O, Ninja: X } = CardId

describe('territory score', () => {
  it('scores the example of the rulebook: 62 points', () => {
    const score = scoreTerritory(grid([F, S, A, B, R], [F, M, N, R, R]))
    expect(score.byType).toEqual({ [M]: 5, [F]: 12, [S]: 7, [A]: 7, [B]: 3, [N]: 8, [R]: 20 })
    expect(score.total).toBe(62)
    expect(score.colors).toBe(7)
  })

  it('Mountains: 1 gives 5 points, 2 or more lose 5 points in all', () => {
    expect(scoreTerritory(grid([M, F, F, F, F], [F, F, F, F, F])).byType[M]).toBe(5)
    expect(scoreTerritory(grid([M, M, M, M, F], [M, M, F, F, F])).byType[M]).toBe(-5)
  })

  it('Torii: 1 loses 5 points, 2 nothing, 3 or more give 30 points', () => {
    expect(scoreTerritory(grid([T, M, M, M, M], [M, M, M, M, M])).byType[T]).toBe(-5)
    expect(scoreTerritory(grid([T, T, M, M, M], [M, M, M, M, M])).byType[T]).toBeUndefined()
    expect(scoreTerritory(grid([T, T, T, M, M], [M, M, M, M, M])).byType[T]).toBe(30)
  })

  it('Naishi: only in the 2 central slots', () => {
    expect(scoreTerritory(grid([M, N, N, M, M], [M, M, N, M, N])).byType[N]).toBe(12 + 8)
  })

  it('Advisor: points by position, and 4 points for each adjacent Naishi, diagonals excluded', () => {
    expect(scoreTerritory(grid([A, M, M, M, A], [M, M, M, M, M])).byType[A]).toBe(2 + 2)
    expect(scoreTerritory(grid([M, A, M, A, M], [M, M, M, M, M])).byType[A]).toBe(4 + 4)
    expect(scoreTerritory(grid([M, M, A, M, M], [N, N, N, M, M])).byType[A]).toBe(3 + 4)
    expect(scoreTerritory(grid([M, N, A, N, M], [M, M, N, M, M])).byType[A]).toBe(3 + 12)
  })

  it('Fortress: 6 points for each one on the left and right limits', () => {
    expect(scoreTerritory(grid([F, M, F, M, F], [M, M, F, M, F])).byType[F]).toBe(18)
    expect(scoreTerritory(grid([M, F, F, F, M], [M, F, F, F, M])).byType[F] ?? 0).toBe(0)
  })

  it('Sentinel: 3 points if alone, and 4 points for each adjacent Fortress', () => {
    expect(scoreTerritory(grid([S, S, M, M, M], [M, M, M, M, M])).byType[S] ?? 0).toBe(0)
    expect(scoreTerritory(grid([S, M, M, M, M], [F, M, M, M, M])).byType[S]).toBe(3 + 4)
  })

  it('Monk: 5 points in the Hand, and 2 points for each adjacent Torii', () => {
    expect(scoreTerritory(grid([K, M, M, M, M], [K, M, M, M, M])).byType[K]).toBe(5)
    expect(scoreTerritory(grid([T, K, T, M, M], [M, M, M, M, M])).byType[K]).toBe(4)
  })

  it('Rice: groups of 2, 3 and 4 or more adjacent cards', () => {
    expect(scoreTerritory(grid([R, R, M, M, M], [M, M, M, M, M])).byType[R]).toBe(10)
    expect(scoreTerritory(grid([R, R, R, M, M], [M, M, M, M, M])).byType[R]).toBe(20)
    expect(scoreTerritory(grid([R, R, M, R, M], [M, R, R, R, M])).byType[R]).toBe(30 + 0)
    expect(scoreTerritory(grid([R, M, R, M, R], [M, M, M, M, M])).byType[R]).toBeUndefined()
  })

  it('Banner: in the Line only', () => {
    expect(scoreTerritory(grid([B, M, M, M, M], [M, M, M, M, B])).byType[B]).toBe(3)
    expect(scoreTerritory(grid([B, M, M, M, B], [M, M, M, M, M])).byType[B]).toBe(8)
  })

  it('Horseman: 3 points in the Hand, and 10 more under a Banner', () => {
    expect(scoreTerritory(grid([H, M, B, M, M], [M, M, H, M, H])).byType[H]).toBe(3 + 10 + 3)
  })

  it('Ronin: the number of different types of characters and provinces, without the Ninja', () => {
    expect(scoreTerritory(grid([O, N, A, F, S], [T, K, R, B, M])).byType[O]).toBe(15) // 9 types with the Ronin
    expect(scoreTerritory(grid([O, N, A, F, S], [T, K, R, B, H])).byType[O]).toBe(45) // 10 types
    expect(scoreTerritory(grid([O, O, A, F, S], [T, K, R, B, H])).byType[O]).toBe(15 + 15) // 9 types, each Ronin scores
  })

  it('Ninja: counts as the character it copies, and scores nothing without any', () => {
    // a Ninja copying a Naishi in the center of the Line
    const copied = scoreTerritory(grid([M, M, { id: X, copy: N }, M, M], [M, M, M, M, M]))
    expect(copied.byType[N]).toBe(12)
    // the color of the copied character counts
    expect(copied.colors).toBe(2)
    const nothing = scoreTerritory(grid([M, M, { id: X, copy: null }, M, M], [M, M, M, M, M]))
    expect(nothing.byType).toEqual({ [CardId.Mountain]: -5 })
    expect(nothing.colors).toBe(1)
  })

  it('the Ninja is not a different type for the Ronin', () => {
    const score = scoreTerritory(grid([O, N, A, F, S], [T, K, R, { id: X, copy: H }, M]))
    expect(score.byType[O]).toBe(8) // the 8 real types: the Ninja copying a Horseman does not add one
  })
})

describe('Legends & Travellers', () => {
  const { LegendNaishi: LN, LegendAdvisor: LA, LegendSentinel: LS, LegendHorseman: LH, LegendMonk: LM, LegendRonin: LR, LegendNinja: LX, UmbrellaLady: U } = CardId

  it('Legendary Naishi: 10 points in the center of the territory or at the ends of the Line', () => {
    expect(scoreTerritory(grid([LN, M, M, M, M], [M, M, M, M, M])).byType[N]).toBe(10)
    expect(scoreTerritory(grid([M, LN, M, M, M], [M, M, M, M, M])).byType[N] ?? 0).toBe(0)
    expect(scoreTerritory(grid([M, M, M, M, M], [M, M, LN, M, M])).byType[N]).toBe(10)
    expect(scoreTerritory(grid([M, M, M, M, M], [LN, M, M, M, M])).byType[N] ?? 0).toBe(0)
  })

  it('Legendary Advisor: 5 points for each Advisor if there is no Naishi', () => {
    // the Legendary Advisor does not get the points of the position of the base Advisor
    expect(scoreTerritory(grid([LA, A, M, M, M], [M, M, M, M, M])).byType[A]).toBe(5 * 2 + 4)
    expect(scoreTerritory(grid([LA, A, M, M, M], [M, M, N, M, M])).byType[A]).toBe(0 + 4)
  })

  it('Legendary Sentinel: 5 points if alone, and 3 points for each Rice and Fortress in the same row', () => {
    expect(scoreTerritory(grid([LS, R, F, M, M], [R, M, M, M, M])).byType[S]).toBe(5 + 3 * 2)
    // next to a base Sentinel: 0 + 3 for the Fortress of the row, and the base Sentinel gets 4 for the Fortress next to it
    expect(scoreTerritory(grid([LS, S, F, M, M], [R, M, M, M, M])).byType[S]).toBe(3 + 4)
  })

  it('Legendary Horseman: 4 points for each adjacent building, and 4 more for each adjacent Banner', () => {
    expect(scoreTerritory(grid([M, LH, B, M, M], [M, F, M, M, M])).byType[H]).toBe(4 + 4 + 4)
  })

  it('Legendary Monk: 2 points for each adjacent character, and counts as a Torii', () => {
    const score = scoreTerritory(grid([N, LM, A, M, M], [M, S, M, M, M]))
    expect(score.byType[K]).toBe(2 * 3)
    // alone, the Legendary Monk is the only Torii
    expect(score.byType[T]).toBe(-5)
  })

  it('Legendary Ronin: 8, 15 or 25 points for the largest series of identical cards', () => {
    expect(scoreTerritory(grid([LR, A, A, A, M], [M, M, M, M, M])).byType[O]).toBe(8)
    expect(scoreTerritory(grid([LR, A, A, A, A], [M, M, M, M, M])).byType[O]).toBe(15)
    expect(scoreTerritory(grid([LR, F, F, F, F], [F, M, M, M, M])).byType[O]).toBe(25)
    expect(scoreTerritory(grid([LR, A, A, M, M], [M, M, M, M, M])).byType[O]).toBeUndefined()
  })

  it('Legendary Ninja: copies a character of the opponent, and counts as one more type for the Ronin', () => {
    const score = scoreTerritory(grid([O, N, A, F, S], [T, K, R, { id: LX, copy: H }, M]))
    expect(score.byType[O]).toBe(15) // 8 types + the Horseman copied
    expect(scoreTerritory(grid([M, M, M, { id: LX, copy: null }, M], [M, M, M, M, M])).byType[M]).toBe(-5)
  })

  it('the Ryokan is black: one more color for the tie-break', () => {
    expect(scoreTerritory(grid([M, M, M, M, M], [M, M, M, M, M])).colors).toBe(1)
    expect(scoreTerritory(grid([M, M, M, M, M], [M, M, M, M, M]), 4).colors).toBe(2)
  })

  it('Ryokan: 4 or 7 points and one more type for the Ronin, Travellers score nothing', () => {
    expect(scoreTerritory(grid([U, M, M, M, M], [M, M, M, M, M]), 4).byType.ryokan).toBe(4)
    expect(scoreTerritory(grid([U, M, M, M, M], [M, M, M, M, M]), 7).total).toBe(-5 + 7)
    expect(scoreTerritory(grid([O, N, A, F, S], [T, K, R, M, M]), 4).byType[O]).toBe(15)
  })
})

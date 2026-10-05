import { CustomMove, isCustomMoveType, MaterialMove, RuleMove, SimultaneousRule } from '@gamepark/rules-api'
import { CardId } from '../material/CardId'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { copiableCharacters } from '../scoring/TerritoryScore'
import { ChooseNinjaCopyData, CustomMoveType } from './CustomMoveType'
import { Memory } from './Memory'

type NinjaCopies = Record<number, number | null>

/**
 * At the end of the game, each Ninja copies a character: a base Ninja one of its owner's territory, the Legendary Ninja one of the
 * opponent's territory. Never a Ninja (it would never end), and never a Legend.
 * The choice is made by the player only when there are several characters to copy: with only one, the Ninja copies it.
 * Without any character to copy, the Ninja has no points and no color.
 */
export class ChooseNinjaCopyRule extends SimultaneousRule<number, MaterialType, LocationType> {
  getTerritory(player: number) {
    return this.material(MaterialType.Card)
      .player(player)
      .location((location) => location.type === LocationType.Line || location.type === LocationType.FinalHand)
  }

  getCopies(): NinjaCopies {
    return this.remind<NinjaCopies | undefined>(Memory.NinjaCopies) ?? {}
  }

  /** The Ninjas of a player that have not chosen yet */
  getUndecidedNinjas(player: number): number[] {
    const copies = this.getCopies()
    return this.getTerritory(player)
      .id<CardId>((id) => id === CardId.Ninja || id === CardId.LegendNinja)
      .getIndexes()
      .filter((index) => copies[index] === undefined)
  }

  /** The cards that a Ninja can copy */
  getCopiableCards(ninja: number): number[] {
    const item = this.material(MaterialType.Card).getItem<CardId>(ninja)
    const owner = item.location.player!
    const territoryOwner = item.id === CardId.LegendNinja ? this.game.players.find((player) => player !== owner)! : owner
    return this.getTerritory(territoryOwner)
      .id<CardId>((id) => copiableCharacters.includes(id))
      .getIndexes()
  }

  onRuleStart(_move: RuleMove): MaterialMove[] {
    const moves: MaterialMove[] = []
    for (const player of this.game.players) {
      for (const ninja of this.getUndecidedNinjas(player)) {
        const copiable = this.getCopiableCards(ninja)
        if (copiable.length <= 1) {
          this.memorize<NinjaCopies>(Memory.NinjaCopies, (copies = {}) => ({ ...copies, [ninja]: copiable[0] ?? null }))
        }
      }
      if (this.getUndecidedNinjas(player).length === 0) {
        moves.push(this.endPlayerTurn(player))
      }
    }
    return moves
  }

  /** The Ninjas choose one after the other */
  getActivePlayerLegalMoves(player: number): MaterialMove[] {
    const [ninja] = this.getUndecidedNinjas(player)
    if (ninja === undefined) return []
    return this.getCopiableCards(ninja).map((target) => this.customMove(CustomMoveType.ChooseNinjaCopy, { ninja, target } satisfies ChooseNinjaCopyData))
  }

  onCustomMove(move: CustomMove): MaterialMove[] {
    if (isCustomMoveType(CustomMoveType.ChooseNinjaCopy)(move)) {
      const { ninja, target } = move.data as ChooseNinjaCopyData
      this.memorize<NinjaCopies>(Memory.NinjaCopies, (copies = {}) => ({ ...copies, [ninja]: target }))
      const player = this.material(MaterialType.Card).getItem(ninja).location.player!
      if (this.getUndecidedNinjas(player).length === 0) {
        return [this.endPlayerTurn(player)]
      }
    }
    return []
  }

  getMovesAfterPlayersDone(): MaterialMove[] {
    return [this.endGame()]
  }
}

/**
 * Abstract class for all UnionFind data structure implementations
 */
export abstract class UnionFind {
  protected readonly id: number[]

  protected constructor(n: number) {
    this.id = Array.from({ length: n }, (_, i) => i)
  }

  abstract find(i: number): number
  abstract union(i: number, j: number): void

  /**
   * This function returns the current union array field as a copy
   */
  getArray(): number[] {
    return this.id
  }

  /**
   * Checks if each index is within the compatible range [0, len(id)-1]
   * @param indices
   */
  checkValueRange(indices: number[]) {
    for (const i of indices) {
      if (i < 0 || i > this.id.length - 1) {
        throw new Error("Values have to be in the union size range.")
      }
    }
  }
}

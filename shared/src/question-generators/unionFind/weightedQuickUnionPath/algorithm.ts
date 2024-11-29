import { WeightedQuickUnion } from "@shared/question-generators/unionFind/weightedQuickUnion/algorithm.ts"

/**
 * QuickUnion implementation
 */
export class WeightedQuickUnionPath extends WeightedQuickUnion {
  constructor(n: number) {
    super(n)
  }

  find(i: number): number {
    this.checkValueRange([i])
    if (i !== this.id[i]) {
      this.id[i] = this.find(this.id[i])
    }
    return this.id[i]
  }
}

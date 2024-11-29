import { QuickUnion } from "@shared/question-generators/unionFind/quickUnion/algorithm.ts"

/**
 * QuickUnion implementation
 */
export class WeightedQuickUnionPath extends QuickUnion {
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

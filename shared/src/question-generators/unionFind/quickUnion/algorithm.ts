import { UnionFind } from "@shared/question-generators/unionFind/unionFind.ts"

/**
 * QuickUnion implementation
 */
export class QuickUnion extends UnionFind {
  constructor(n: number) {
    super(n)
  }

  find(i: number): number {
    this.checkValueRange([i])
    while (i !== this.id[i]) {
      i = this.id[i]
    }
    return i
  }

  union(i: number, j: number) {
    this.checkValueRange([i, j])
    const ri = this.find(i)
    const rj = this.find(j)
    if (ri !== rj) {
      this.id[ri] = rj
    }
  }
}

import { UnionFind } from "@shared/question-generators/unionFind/unionFind.ts"

/**
 * QuickUnion implementation
 */
export class WeightedQuickUnion extends UnionFind {
  private readonly sz: number[] = []

  constructor(n: number) {
    super(n)
    this.sz = Array.from({ length: n }).fill(1) as number[]
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
      if (this.sz[ri] < this.sz[rj]) {
        this.id[ri] = rj
        this.sz[rj] += this.sz[ri]
      } else {
        this.id[rj] = ri
        this.sz[ri] += this.sz[rj]
      }
    }
  }
}

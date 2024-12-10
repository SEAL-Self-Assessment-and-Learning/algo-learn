import { UnionFind } from "@shared/question-generators/unionFind/unionFind.ts"

/**
 * QuickUnion implementation
 */
export class WeightedQuickUnionPath extends UnionFind {
  constructor(n: number) {
    super(n)
  }

  _find(id: number[], i: number, sz: number[]): number {
    this.checkValueRange([i])
    if (i !== id[i]) {
      sz[i] = 1
      id[i] = this._find(id, id[i], sz)
    }
    return id[i]
  }

  _union(id: number[], i: number, j: number, sz: number[]): { id: number[]; sz: number[] } {
    this.checkValueRange([i, j])
    const ri = this._find(id, i, sz)
    const rj = this._find(id, j, sz)
    if (ri !== rj) {
      if (sz[ri] <= sz[rj]) {
        id[ri] = rj
        sz[rj] += sz[ri]
      } else {
        id[rj] = ri
        sz[ri] += sz[rj]
      }
    }
    return { id, sz }
  }
}

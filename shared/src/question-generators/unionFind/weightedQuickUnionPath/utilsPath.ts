import { UnionFind } from "@shared/question-generators/unionFind/unionFind.ts"
import { createArrayDisplayCodeBlock } from "@shared/utils/arrayDisplayCodeBlock.ts"
import Random from "@shared/utils/random.ts"

export function createChainedUnionState({ random, union }: { random: Random; union: UnionFind }): {
  gapField: string
  gapOperationValues: number[]
} {
  return createOnePath({ random, union })
}

function createOnePath({ random, union }: { random: Random; union: UnionFind }) {
  const unionSize = union.getSize()
  const workingUnion = union.getArray()[0].map((x) => x)
  // path has to contain at least 3 nodes
  const pathLength = random.int(3, unionSize - 2)
  const pathValues = random.subset(workingUnion, pathLength)

  for (let i = 0; i < pathLength - 1; i++) {
    workingUnion[pathValues[i]] = workingUnion[pathValues[i + 1]]
  }
  const gapOperationValues: number[] = []
  gapOperationValues.push(random.choice(workingUnion.filter((x) => !pathValues.includes(x))))
  gapOperationValues.push(random.choice(pathValues.slice(0, pathLength - 2)))

  union.setStateArtificially(workingUnion, true)

  const gapField = createArrayDisplayCodeBlock({
    array: workingUnion,
  })

  return { gapField, gapOperationValues }
}

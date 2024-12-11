import { UnionFind } from "@shared/question-generators/unionFind/unionFind.ts"
import { createArrayDisplayCodeBlock } from "@shared/utils/arrayDisplayCodeBlock.ts"
import Random from "@shared/utils/random.ts"

export function createChainedUnionState({ random, union }: { random: Random; union: UnionFind }): {
  gapField: string
  gapOperationValues: number[]
} {
  return random.choice([
    createTwoPathTree({random, union}),
    createTwoPath({random, union}),
    createOnePath({random, union})
  ])
}

function createTwoPathTree({ random, union }: { random: Random; union: UnionFind }) {
  const unionSize = union.getSize()
  const workingUnion = union.getArray()[0].map((x) => x)

  const firstPathLength = random.int(2, Math.floor(unionSize / 2) - 1)
  const secondPathLength = random.int(2, Math.floor(unionSize / 2) - 1)

  const firstPathValues = random.subset(workingUnion, firstPathLength)
  const secondPathValues = random.subset(
    workingUnion.filter((x) => !firstPathValues.includes(x)),
    secondPathLength,
  )
  const combinedStartNode = random.choice(
    workingUnion.filter((x) => !firstPathValues.includes(x) && !secondPathValues.includes(x)),
  )
  firstPathValues.push(combinedStartNode)
  secondPathValues.push(combinedStartNode)

  for (let i = 0; i < firstPathLength; i++) {
    workingUnion[firstPathValues[i]] = workingUnion[firstPathValues[i + 1]]
  }

  for (let i = 0; i < secondPathLength; i++) {
    workingUnion[secondPathValues[i]] = workingUnion[secondPathValues[i + 1]]
  }

  const gapOperationValues: number[] = []
  gapOperationValues.push(random.choice(firstPathValues.slice(0, firstPathLength - 1)))
  gapOperationValues.push(random.choice(secondPathValues.slice(0, secondPathLength - 1)))
  random.shuffle(gapOperationValues)

  union.setStateArtificially(workingUnion, true)

  const gapField = createArrayDisplayCodeBlock({
    array: workingUnion,
  })

  union.union(gapOperationValues[0], gapOperationValues[1])

  return { gapField, gapOperationValues }
}

function createTwoPath({ random, union }: { random: Random; union: UnionFind }) {
  const unionSize = union.getSize()
  const workingUnion = union.getArray()[0].map((x) => x)

  const firstPathLength = random.int(3, 4)
  const secondPathLength = random.int(3, unionSize - firstPathLength)

  const firstPathValues = random.subset(workingUnion, firstPathLength)
  const secondPathValues = random.subset(
    workingUnion.filter((x) => !firstPathValues.includes(x)),
    secondPathLength,
  )

  for (let i = 0; i < firstPathLength - 1; i++) {
    workingUnion[firstPathValues[i]] = workingUnion[firstPathValues[i + 1]]
  }

  for (let i = 0; i < secondPathLength - 1; i++) {
    workingUnion[secondPathValues[i]] = workingUnion[secondPathValues[i + 1]]
  }

  const gapOperationValues: number[] = []
  gapOperationValues.push(random.choice(firstPathValues.slice(0, firstPathLength - 2)))
  gapOperationValues.push(random.choice(secondPathValues.slice(0, secondPathLength - 2)))
  random.shuffle(gapOperationValues)

  union.setStateArtificially(workingUnion, true)

  const gapField = createArrayDisplayCodeBlock({
    array: workingUnion,
  })

  union.union(gapOperationValues[0], gapOperationValues[1])

  return { gapField, gapOperationValues }
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
  random.shuffle(gapOperationValues)

  union.setStateArtificially(workingUnion, true)

  const gapField = createArrayDisplayCodeBlock({
    array: workingUnion,
  })

  union.union(gapOperationValues[0], gapOperationValues[1])

  return { gapField, gapOperationValues }
}

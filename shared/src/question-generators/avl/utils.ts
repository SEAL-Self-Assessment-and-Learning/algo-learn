import { AVLTree } from "@shared/question-generators/avl/avlDS.ts"
import Random from "@shared/utils/random.ts"

export type AVLTreeRotations = "none" | "left" | "right" | "left-right" | "right-left"

export const avlTreeWeightedRotations: [AVLTreeRotations, number][] = [
  ["none", 0.1],
  ["left", 0.2],
  ["right", 0.2],
  ["left-right", 0.25],
  ["right-left", 0.25],
]

export function generateAVLTreeInsert({
  random,
  avlTreeSize,
  avlRotation,
}: {
  random: Random
  avlTreeSize: number
  avlRotation: AVLTreeRotations
}) {
  const avl = new AVLTree()
  let askValue = ""

  if (avlRotation === "none") {
    // currently just a helper to generate permutations

    const values = [2, 4, 6, 8, 10, 12, 14]
    const permuations = permute(values)

    const avlTrees: AVLTree[] = []
    const avlSet: Set<string> = new Set()
    for (const perm of permuations) {
      const newTree = new AVLTree()
      avlTrees.push(newTree)
      for (const p of perm) {
        newTree.insert(p)
      }
      avlSet.add(newTree.levelOrderAlternative().toString())
    }

    console.log(avlSet)
  } else if (avlRotation === "left") {
  } else if (avlRotation === "right") {
    // a < b < c < d < e < f < g < h < i < j
    const a = random.int(2, 25)
    const b = random.int(a + 1, a + 15)
    const c = random.int(b + 1, b + 15)
    const d = random.int(c + 1, c + 15)
    const e = random.int(d + 1, d + 15)
    const f = random.int(e + 1, e + 15)
    const g = random.int(f + 1, f + 15)
    const h = random.int(g + 1, g + 15)
    const i = random.int(h + 1, h + 15)
    const j = random.int(i + 1, i + 15)

    const treeSize10Options: Array<[(number | null)[], string]> = [
      [[e, c, g, b, d, f, i, a, null, null, null, null, null, h, j], "a"],
      // just more options
    ]

    const avlChoice = random.choice(treeSize10Options)
    for (const value of avlChoice[0]) {
      if (value) {
        avl.insert(value)
      }
    }

    if (avlChoice[1] === "a") {
      askValue = random.int(1, a - 1).toString()
    }
  } else if (avlRotation === "left-right") {
  } else if (avlRotation === "right-left") {
  }

  return {
    avlTree: avl,
    askValue,
  }
}

function permute<T>(arr: T[]): T[][] {
  // Base case: if the array is empty, return an empty array
  if (arr.length === 0) return [[]]

  const result: T[][] = []

  // Recursive case
  arr.forEach((item, index) => {
    // Create a new array excluding the current item
    const rest = [...arr.slice(0, index), ...arr.slice(index + 1)]

    // Get permutations of the rest of the array
    const restPermutations = permute(rest)

    // Prepend the current item to each permutation of the rest of the array
    restPermutations.forEach((perm) => {
      result.push([item, ...perm])
    })
  })

  return result
}

import { describe, expect, test } from "vitest"
import { AVLTree } from "@shared/question-generators/avl/avlDS.ts"

describe("AVL Tree", () => {
  test("Insertion", () => {
    const avlTree = new AVLTree()

    avlTree.add(10)

    expect(avlTree.levelOrderAlternative().toString()).toBe([10].toString())

    avlTree.add(15)

    expect(avlTree.levelOrderAlternative().toString()).toBe([10, null, 15].toString())

    avlTree.add(20)
    avlTree.add(25)
    avlTree.add(30)
    avlTree.add(35)

    expect(avlTree.levelOrderAlternative().toString()).toBe([25, 15, 30, 10, 20, null, 35].toString())

    avlTree.add(40)
    avlTree.add(45)
    avlTree.add(50)
    avlTree.add(55)
    avlTree.add(27)

    expect(avlTree.levelOrderAlternative().toString()).toBe(
      [35, 25, 45, 15, 30, 40, 50, 10, 20, 27, null, null, null, null, 55].toString(),
    )
  })
})

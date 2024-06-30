import { describe, expect, test } from "vitest"
import { AVLTree } from "@shared/question-generators/avl/avlDS.ts"

describe("AVL Tree", () => {
  test("Insertion", () => {
    const avlTree = new AVLTree()

    avlTree.insert(10)

    expect(avlTree.levelOrderAlternative().toString()).toBe([10].toString())

    avlTree.insert(15)

    expect(avlTree.levelOrderAlternative().toString()).toBe([10, null, 15].toString())

    avlTree.insert(20)
    avlTree.insert(25)
    avlTree.insert(30)
    avlTree.insert(35)

    expect(avlTree.levelOrderAlternative().toString()).toBe([25, 15, 30, 10, 20, null, 35].toString())

    avlTree.insert(40)
    avlTree.insert(45)
    avlTree.insert(50)
    avlTree.insert(55)
    avlTree.insert(27)

    expect(avlTree.levelOrderAlternative().toString()).toBe(
      [35, 25, 45, 15, 30, 40, 50, 10, 20, 27, null, null, null, null, 55].toString(),
    )
  })

  test("Deletion", () => {
    const avlTree = new AVLTree()

    for (let i = 1; i <= 10; i++) {
      avlTree.insert(i)
    }

    expect(avlTree.levelOrderAlternative().toString()).toBe(
      [4, 2, 8, 1, 3, 6, 9, null, null, null, null, 5, 7, null, 10].toString(),
    )

    avlTree.delete(4)
    avlTree.delete(3)

    expect(avlTree.levelOrderAlternative().toString()).toBe(
      [8, 2, 9, 1, 6, null, 10, null, null, 5, 7, null, null, null, null].toString(),
    )

    avlTree.delete(10)

    expect(avlTree.levelOrderAlternative().toString()).toBe([6, 2, 8, 1, 5, 7, 9].toString())
  })
})

import { AVLTree } from "@shared/question-generators/avl/avlDS"
import Random from "@shared/utils/random"

/**
 * All the possible avl tree rotations
 */
export type AVLTreeRotations = "none" | "left" | "right" | "leftRight" | "rightLeft"

export const avlTreeWeightedRotations: [AVLTreeRotations, number][] = [
  ["none", 0.1],
  ["left", 0.2],
  ["right", 0.2],
  ["leftRight", 0.25],
  ["rightLeft", 0.25],
]

/**
 * This is like a BST, but we use it for generating different avl tree structures
 */
export type AVLTreeHelper = {
  root: string
  left: AVLTreeHelper | null
  right: AVLTreeHelper | null
  nodes: number
}

/**
 * This function generates an AVL and a value to insert into the tree
 * Inserting this value will result in the desired rotation
 *
 * @param random - random class
 * @param avlTreeSize - number of nodes the avl tree should have
 * @param rotationOption - the desired rotation (type AVLTreeRotations)
 */
export function generateAVLTreeInsert({
  random,
  avlTreeSize,
  rotationOption,
}: {
  random: Random
  avlTreeSize: number
  rotationOption: AVLTreeRotations
}): { askValue: string; avlTree: AVLTree } {
  // Generates all possible AVL tree structures of the given avlTreeSize
  // TODO calculate maxHeight instead of fixed 5
  const tmpTrees: AVLTreeHelper[] = generateAllAVLTrees(5, avlTreeSize, avlTreeSize)
  // converting the avlTree structures in AVLTrees with numbers as value
  const avlTrees: AVLTree[] = convertAVLHelperToRandomAVLTree(random, tmpTrees)

  const { avlTree, askValue } = handleAVLRotation(random, avlTrees, rotationOption)

  return {
    askValue,
    avlTree,
  }
}

/**
 * This function generates an AVL and a value to insert into the tree
 * @param random
 * @param avlTrees
 * @param rotationOption
 */
function handleAVLRotation(
  random: Random,
  avlTrees: AVLTree[],
  rotationOption: AVLTreeRotations,
): { avlTree: AVLTree; askValue: string } {
  const { insertValue, currentTree } = getRandomTreeInsertPair(random, avlTrees, rotationOption)
  const askValue = insertValue.toString()
  checkAVLNull(currentTree)

  return {
    avlTree: currentTree as AVLTree,
    askValue,
  }
}

// TODO refactor to be more clean
function getRandomTreeInsertPair(random: Random, avlTrees: AVLTree[], rotationOption: AVLTreeRotations) {
  avlTrees = random.shuffle(avlTrees)

  for (let i = 0; i < avlTrees.length; i++) {
    const inOrder = avlTrees[i].inOrder()

    // the minimum node in the generated AVL trees will be 1
    let lastSeen = -1
    const currentTree = avlTrees[i]
    const allPossibleValues: number[] = []
    for (let j = 0; j < inOrder.length; j++) {
      // in this case we can not generate a natrual number
      if (lastSeen + 1 > inOrder[j] - 1) {
        lastSeen = inOrder[j]
        continue
      }

      const insertValue = random.int(lastSeen + 1, inOrder[j] - 1)
      const treeClone = currentTree.clone()
      const treeCloneInsert = treeClone.insert(insertValue)
      // check if it is the desired rotation
      if (treeCloneInsert === rotationOption) {
        allPossibleValues.push(insertValue)
      }
      lastSeen = inOrder[j]
    }

    // We found a tree were an insert operation would result in the desired rotation
    if (allPossibleValues.length > 0) {
      return {
        insertValue: random.choice(allPossibleValues),
        currentTree,
      }
    }
  }

  // will never be reached
  return { insertValue: 0, currentTree: null }
}

/**
 * This function takes a tree with avl structure but no 'real' values
 * and assigns a numbered value to each node
 *
 * @param random - random class object (for random node value)
 * @param treeHelper - the trees with avl structure but currently as BST
 */
function convertAVLHelperToRandomAVLTree(random: Random, treeHelper: AVLTreeHelper[]): AVLTree[] {
  const avlTrees: AVLTree[] = []

  for (let i = 0; i < treeHelper.length; i++) {
    const newAVLTree: AVLTree = new AVLTree()
    avlTrees.push(newAVLTree)

    // get the inorder for the helper tree
    const inOrder = inOrderHelper(treeHelper[i])
    const inOrderToValues: { [key: string]: number } = {}

    // iterate through the inOrder
    // convert every entry into a dict and
    // assign every value in every iteration a new higher value
    let lastUsedNumber = 1
    for (let j = 0; j < inOrder.length; j++) {
      const newNumber = random.int(lastUsedNumber + 1, lastUsedNumber + 15)
      lastUsedNumber = newNumber
      inOrderToValues[inOrder[j]] = newNumber
    }

    // get the lvlOrder, to convert into an avl tree
    const lvlOrder = levelOrderAlternativeHelper(treeHelper[i])

    for (let j = 0; j < lvlOrder.length; j++) {
      if (lvlOrder[j] !== null) {
        // ! to indicate that `lvlOrder[j]` is not null ...
        const insertValue = inOrderToValues[lvlOrder[j]!]
        newAVLTree.insert(insertValue)
      }
    }
  }

  return avlTrees
}

// TODO refactor this function
function generateAllAVLTrees(maxHeight: number, minNodes: number, maxNodes: number) {
  // create the base cases
  const hTrees = [
    [{ root: "x-0-0-0", left: null, right: null, nodes: 1 } as AVLTreeHelper],
    [
      {
        root: "x-1-0-1",
        left: { root: "x-0-0-1", left: null, right: null, nodes: 1 } as AVLTreeHelper,
        right: null,
        nodes: 2,
      } as AVLTreeHelper,

      {
        root: "x-1-1-0",
        left: null,
        right: { root: "x-0-1-0", left: null, right: null, nodes: 1 } as AVLTreeHelper,
        nodes: 2,
      } as AVLTreeHelper,

      {
        root: "x-1-1-1",
        left: { root: "x-0-0-1", left: null, right: null, nodes: 1 } as AVLTreeHelper,
        right: { root: "x-0-1-0", left: null, right: null, nodes: 1 } as AVLTreeHelper,
        nodes: 3,
      } as AVLTreeHelper,
    ],
  ]

  // create all tree by combining new trees
  // root and h-1 * h-1 | root and h-1 * h-2 | and h-2 * h-1
  for (let i = 2; i <= maxHeight; i++) {
    hTrees.push([])
    for (let m = 0; m < hTrees[i - 1].length; m++) {
      for (let n = 0; n < hTrees[i - 1].length; n++) {
        const nodeName = "x-" + i.toString() + "-" + m.toString() + "-" + n.toString()
        const newNode = { root: nodeName, left: null, right: null, nodes: 1 } as AVLTreeHelper
        newNode.left = hTrees[i - 1][n]
        newNode.right = hTrees[i - 1][m]
        newNode.nodes = 1 + newNode.left.nodes + newNode.right.nodes
        if (newNode.nodes <= maxNodes) {
          hTrees[i].push(newNode)
        }
      }
    }
    for (let k = 0; k < hTrees[i - 1].length; k++) {
      for (let l = 0; l < hTrees[i - 2].length; l++) {
        const nodeName1 = "y1-" + i.toString() + "-" + k.toString() + "-" + l.toString()
        const newNode1 = { root: nodeName1, left: null, right: null, nodes: 1 } as AVLTreeHelper
        newNode1.left = hTrees[i - 1][k]
        newNode1.right = hTrees[i - 2][l]
        newNode1.nodes = 1 + newNode1.left.nodes + newNode1.right.nodes
        if (newNode1.nodes <= maxNodes) {
          hTrees[i].push(newNode1)
        }

        const nodeName2 = "y2-" + i.toString() + "-" + k.toString() + "-" + l.toString()
        const newNode2 = { root: nodeName2, left: null, right: null, nodes: 1 } as AVLTreeHelper
        newNode2.left = hTrees[i - 2][l]
        newNode2.right = hTrees[i - 1][k]
        newNode2.nodes = 1 + newNode2.left.nodes + newNode2.right.nodes
        if (newNode2.nodes <= maxNodes) {
          hTrees[i].push(newNode2)
        }
      }
    }
  }

  const resultTrees: AVLTreeHelper[] = []

  for (let i = 0; i < hTrees.length; i++) {
    for (let j = 0; j < hTrees[i].length; j++) {
      if (hTrees[i][j].nodes >= minNodes) {
        resultTrees.push(hTrees[i][j])
      }
    }
  }

  return resultTrees
}

/**
 * Computes the inorder of a tree
 * @param tree
 */
function inOrderHelper(tree: AVLTreeHelper) {
  const result: string[] = []
  function inOrderHelper(node: AVLTreeHelper | null): void {
    if (!node) return
    inOrderHelper(node.left)
    result.push(node.root)
    inOrderHelper(node.right)
  }
  inOrderHelper(tree)
  return result
}

/**
 * The function performs a level-order traversal of an AVL tree and returns an array
 * representing the complete binary tree structure. Each level of the tree is processed
 * in turn, and null values are used to indicate missing nodes, ensuring that the
 * structure of the tree is fully captured in the output array.
 *
 * Example:
 * Tree:
 *      5
 *       \
 *        4
 * Result: [5, null, 4]
 *
 */
function levelOrderAlternativeHelper(tree: AVLTreeHelper): (string | null)[] {
  if (!tree) return []
  let queue: (AVLTreeHelper | null)[] = [tree]
  const result: (string | null)[] = []

  while (queue.length > 0) {
    const newQueue: (AVLTreeHelper | null)[] = []
    const tmpResult: (string | null)[] = []
    for (const node of queue) {
      if (node) {
        tmpResult.push(node.root)
        newQueue.push(node.left, node.right)
      } else {
        tmpResult.push(null)
        newQueue.push(null, null)
      }
    }
    // Check if the current level has any non-null values
    queue = []
    if (tmpResult.some((val) => val !== null)) {
      result.push(...tmpResult)
      queue = newQueue
    }
  }

  return result
}

/**
 * Just checking a value is a AVLTree or null
 * @param tree - the value to check
 */
function checkAVLNull(tree: AVLTree | null) {
  if (tree === null)
    throw new Error("There has been a problem generating a AVL tree and a corresponding insert value")
}

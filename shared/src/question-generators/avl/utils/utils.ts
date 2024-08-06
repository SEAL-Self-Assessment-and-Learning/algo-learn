import { AVLTree } from "@shared/question-generators/avl/avlDS.ts"
import Random from "@shared/utils/random.ts"

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
  numNodes: number
}

/**
 * This function takes a tree with avl structure but no 'real' values
 * and assigns a numbered value to each node
 *
 * @param random - random class object (for random node value)
 * @param treeHelper - the trees with avl structure but currently as BST
 */
export function convertAVLHelperToRandomAVLTree(random: Random, treeHelper: AVLTreeHelper[]): AVLTree[] {
  const avlTrees: AVLTree[] = []

  for (let i = 0; i < treeHelper.length; i++) {
    const newAVLTree: AVLTree = new AVLTree()
    avlTrees.push(newAVLTree)

    const inOrder = inOrderHelper(treeHelper[i])
    const inOrderToValues: { [key: string]: number } = {}

    // convert every entry into a dict with a new higher number
    let lastUsedNumber = 1
    for (let j = 0; j < inOrder.length; j++) {
      const newNumber = random.int(lastUsedNumber + 1, lastUsedNumber + 15)
      lastUsedNumber = newNumber
      inOrderToValues[inOrder[j]] = newNumber
    }

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

/**
 * This function computes the number of nodes in a tree
 * (using the nodes property of the AVLTreeHelper)
 * @param tree - the tree to compute the number of nodes for
 */
function computeNumberOfNodes(tree: AVLTreeHelper | null): number {
  if (!tree) return 0
  return 1 + tree.left!.numNodes + tree.right!.numNodes
}

/**
 * This function filters out all trees with a specific number of nodes
 * @param trees - the list of trees to filter
 * @param numberOfNodes - the minimum number of nodes to filter for
 */
function getAllTreesWithMinNNodes(trees: AVLTreeHelper[][], numberOfNodes: number): AVLTreeHelper[] {
  const resultTrees: AVLTreeHelper[] = []
  for (let i = 0; i < trees.length; i++) {
    for (let j = 0; j < trees[i].length; j++) {
      if (trees[i][j].numNodes >= numberOfNodes) {
        resultTrees.push(trees[i][j])
      }
    }
  }
  return resultTrees
}

/**
 * This function generates all possible AVL tree structures with a specific height and a specific number of nodes
 * @param maxHeight - the maximum height of the trees
 * @param minNodes - the minimum number of nodes
 * @param maxNodes - the maximum number of nodes
 */
export function generateAllAVLTrees(maxHeight: number, minNodes: number, maxNodes: number) {
  const baseCaseTreeStructure = [
    [{ root: "x", left: null, right: null, numNodes: 1 } as AVLTreeHelper],
    [
      {
        root: "x",
        left: { root: "x", left: null, right: null, numNodes: 1 } as AVLTreeHelper,
        right: null,
        numNodes: 2,
      } as AVLTreeHelper,

      {
        root: "x",
        left: null,
        right: { root: "x", left: null, right: null, numNodes: 1 } as AVLTreeHelper,
        numNodes: 2,
      } as AVLTreeHelper,

      {
        root: "x",
        left: { root: "x", left: null, right: null, numNodes: 1 } as AVLTreeHelper,
        right: { root: "x", left: null, right: null, numNodes: 1 } as AVLTreeHelper,
        numNodes: 3,
      } as AVLTreeHelper,
    ],
  ]

  // create all trees by combining new trees
  // root and h-1 * h-1 | root and h-1 * h-2 | and h-2 * h-1
  for (let i = 2; i <= maxHeight; i++) {
    baseCaseTreeStructure.push([])
    for (let m = 0; m < baseCaseTreeStructure[i - 1].length; m++) {
      for (let n = 0; n < baseCaseTreeStructure[i - 1].length; n++) {
        const newNode = { root: "x", left: null, right: null, numNodes: 1 } as AVLTreeHelper
        newNode.left = baseCaseTreeStructure[i - 1][n]
        newNode.right = baseCaseTreeStructure[i - 1][m]
        newNode.numNodes = computeNumberOfNodes(newNode)
        if (newNode.numNodes <= maxNodes) {
          baseCaseTreeStructure[i].push(newNode)
        }
      }
    }
    for (let k = 0; k < baseCaseTreeStructure[i - 1].length; k++) {
      for (let l = 0; l < baseCaseTreeStructure[i - 2].length; l++) {
        const newNode1 = { root: "x", left: null, right: null, numNodes: 1 } as AVLTreeHelper
        newNode1.left = baseCaseTreeStructure[i - 1][k]
        newNode1.right = baseCaseTreeStructure[i - 2][l]
        newNode1.numNodes = computeNumberOfNodes(newNode1)
        if (newNode1.numNodes <= maxNodes) {
          baseCaseTreeStructure[i].push(newNode1)
        }

        const newNode2 = { root: "x", left: null, right: null, numNodes: 1 } as AVLTreeHelper
        newNode2.left = baseCaseTreeStructure[i - 2][l]
        newNode2.right = baseCaseTreeStructure[i - 1][k]
        newNode2.numNodes = computeNumberOfNodes(newNode2)
        if (newNode2.numNodes <= maxNodes) {
          baseCaseTreeStructure[i].push(newNode2)
        }
      }
    }
  }

  return getAllTreesWithMinNNodes(baseCaseTreeStructure, minNodes)
}

/**
 * This function assigns a unique id to every node in every tree in a list of trees
 * @param trees - list of AVLTreeHelpers which where generated without unique ids
 * @param random
 */
export function assignUniqueIDsToTrees(trees: AVLTreeHelper[], random: Random): AVLTreeHelper[] {
  const uniqueIdTrees: AVLTreeHelper[] = []
  for (const tree of trees) {
    const newTree = assignUniqueIDToEveryNode(tree, random)
    if (newTree) {
      uniqueIdTrees.push(newTree)
    }
  }
  return uniqueIdTrees
}

/**
 * This function assigns a unique id to every node in a tree
 * @param tree
 * @param random
 */
function assignUniqueIDToEveryNode(tree: AVLTreeHelper, random: Random) {
  const possibleIDs: string[] = []
  while (possibleIDs.length < tree.numNodes) {
    const newID = random.base36string(tree.numNodes)
    if (!possibleIDs.includes(newID)) {
      possibleIDs.push(newID)
    }
  }

  function recursiveTraversal(node: AVLTreeHelper | null) {
    if (!node) return null
    node.root = possibleIDs.pop()!
    node.left = recursiveTraversal(node.left)
    node.right = recursiveTraversal(node.right)
    return node
  }

  return recursiveTraversal(tree)
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
export function checkAVLNull(tree: AVLTree | null) {
  if (tree === null)
    throw new Error("There has been a problem generating a AVL tree and a corresponding insert value")
}

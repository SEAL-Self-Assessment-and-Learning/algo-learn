import { AVLTree } from "@shared/question-generators/avl/avlDS.ts"
import Random from "@shared/utils/random.ts"

/**
 * All the possible avl tree rotations
 */
export type AVLTreeRotations = "none" | "left" | "right" | "leftRight" | "rightLeft"

export const avlTreeWeightedRotations: [AVLTreeRotations, number][] = [
  ["none", 11110.1],
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
export function generateAllAVLTrees(maxHeight: number, minNodes: number, maxNodes: number) {
  // create the base cases
  const baseCaseTrees = [
    [{ root: "x", left: null, right: null, nodes: 1 } as AVLTreeHelper],
    [
      {
        root: "x",
        left: { root: "x", left: null, right: null, nodes: 1 } as AVLTreeHelper,
        right: null,
        nodes: 2,
      } as AVLTreeHelper,

      {
        root: "x",
        left: null,
        right: { root: "x", left: null, right: null, nodes: 1 } as AVLTreeHelper,
        nodes: 2,
      } as AVLTreeHelper,

      {
        root: "x",
        left: { root: "x", left: null, right: null, nodes: 1 } as AVLTreeHelper,
        right: { root: "x", left: null, right: null, nodes: 1 } as AVLTreeHelper,
        nodes: 3,
      } as AVLTreeHelper,
    ],
  ]

  // create all trees by combining new trees
  // root and h-1 * h-1 | root and h-1 * h-2 | and h-2 * h-1
  // using "x" as node name and assigning unique ids to every node later
  for (let i = 2; i <= maxHeight; i++) {
    baseCaseTrees.push([])
    for (let m = 0; m < baseCaseTrees[i - 1].length; m++) {
      for (let n = 0; n < baseCaseTrees[i - 1].length; n++) {
        const newNode = { root: "x", left: null, right: null, nodes: 1 } as AVLTreeHelper
        newNode.left = baseCaseTrees[i - 1][n]
        newNode.right = baseCaseTrees[i - 1][m]
        newNode.nodes = 1 + newNode.left.nodes + newNode.right.nodes
        if (newNode.nodes <= maxNodes) {
          baseCaseTrees[i].push(newNode)
        }
      }
    }
    for (let k = 0; k < baseCaseTrees[i - 1].length; k++) {
      for (let l = 0; l < baseCaseTrees[i - 2].length; l++) {
        const newNode1 = { root: "x", left: null, right: null, nodes: 1 } as AVLTreeHelper
        newNode1.left = baseCaseTrees[i - 1][k]
        newNode1.right = baseCaseTrees[i - 2][l]
        newNode1.nodes = 1 + newNode1.left.nodes + newNode1.right.nodes
        if (newNode1.nodes <= maxNodes) {
          baseCaseTrees[i].push(newNode1)
        }

        const newNode2 = { root: "x", left: null, right: null, nodes: 1 } as AVLTreeHelper
        newNode2.left = baseCaseTrees[i - 2][l]
        newNode2.right = baseCaseTrees[i - 1][k]
        newNode2.nodes = 1 + newNode2.left.nodes + newNode2.right.nodes
        if (newNode2.nodes <= maxNodes) {
          baseCaseTrees[i].push(newNode2)
        }
      }
    }
  }

  const resultTrees: AVLTreeHelper[] = []

  for (let i = 0; i < baseCaseTrees.length; i++) {
    for (let j = 0; j < baseCaseTrees[i].length; j++) {
      if (baseCaseTrees[i][j].nodes >= minNodes) {
        resultTrees.push(baseCaseTrees[i][j])
      }
    }
  }

  return resultTrees
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
  while (possibleIDs.length < tree.nodes) {
    const newID = random.float(-100, 100).toString()
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

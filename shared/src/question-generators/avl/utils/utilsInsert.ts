import { AVLTree } from "@shared/question-generators/avl/avlDS.ts"
import {
  assignUniqueIDsToTrees,
  AVLTreeHelper,
  AVLTreeRotations,
  checkAVLNull,
  convertAVLHelperToRandomAVLTree,
  generateAllAVLTrees,
  getStandardNextRandInt,
} from "@shared/question-generators/avl/utils/utils.ts"
import Random from "@shared/utils/random.ts"

/**
 * This function generates an AVL and a value to insert into the tree
 * Inserting this value will result in the desired rotation
 *
 * @param random - random class
 * @param avlTreeSize - number of nodes the avl tree should have
 * @param rotationOption - the desired rotation (type AVLTreeRotations)
 * @param randNextInt - a random formula to determine the next value for the tree
 */
export function generateAVLTreeInsert({
  random,
  avlTreeSize,
  rotationOption,
  randNextInt,
}: {
  random: Random
  avlTreeSize: number
  rotationOption: AVLTreeRotations
  randNextInt?: (val: number, random: Random) => number
}): { askValue: number; avlTree: AVLTree } {
  // Generates all possible AVL tree structures of the given avlTreeSize
  const maxHeight = Math.ceil(1.45 * Math.log2(avlTreeSize + 2) - 0.32)
  const allTrees = generateAllAVLTrees(maxHeight, avlTreeSize, avlTreeSize)
  const tmpTrees: AVLTreeHelper[] = assignUniqueIDsToTrees(allTrees, random)
  // converting the avlTree structures in AVLTrees with numbers as value
  const avlTrees: AVLTree[] = convertAVLHelperToRandomAVLTree(
    random,
    randNextInt ? randNextInt : getStandardNextRandInt,
    tmpTrees,
  )

  return handleAVLRotation(random, avlTrees, rotationOption)
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
): { avlTree: AVLTree; askValue: number } {
  const { insertValue, currentTree } = getRandomTreeInsertPairForRotation(
    random,
    avlTrees,
    rotationOption,
  )
  checkAVLNull(currentTree)

  return {
    avlTree: currentTree as AVLTree,
    askValue: insertValue,
  }
}

/**
 * This function checks if the current tree can be rotated in the desired way
 * It trys all possible values
 * So with n nodes there are n+1 possible values
 * @param currentTree - the current AVL tree
 * @param rotationOption - the desired rotation
 * @param random .
 */
function checkTreeForRotation(currentTree: AVLTree, rotationOption: AVLTreeRotations, random: Random) {
  const inOrder = currentTree.inOrder()

  // the minimum node in the generated AVL trees will be 1
  let lastSeen = -1
  const allPossibleValues: number[] = []
  for (let j = 0; j < inOrder.length; j++) {
    // in this case we cannot generate a natural number
    if (lastSeen + 1 > inOrder[j] - 1) {
      lastSeen = inOrder[j]
      continue
    }

    const insertValue = random.int(lastSeen + 1, inOrder[j] - 1)
    // clone the tree, so the current tree can be reused for the next round
    const treeClone = currentTree.clone()
    const treeCloneInsert = treeClone.insert(insertValue)
    if (treeCloneInsert === rotationOption) {
      allPossibleValues.push(insertValue)
    }
    lastSeen = inOrder[j]
  }

  if (allPossibleValues.length > 0) {
    return {
      insertValue: random.choice(allPossibleValues),
      currentTree,
    }
  }

  return null
}

/**
 * This function generates a random tree and a value to insert
 * This insert operation will result in the desired rotation
 * @param random .
 * @param avlTrees - all possible AVL trees
 * @param rotationOption - the desired rotation
 */
function getRandomTreeInsertPairForRotation(
  random: Random,
  avlTrees: AVLTree[],
  rotationOption: AVLTreeRotations,
) {
  avlTrees = random.shuffle(avlTrees)

  for (let i = 0; i < avlTrees.length; i++) {
    const result = checkTreeForRotation(avlTrees[i], rotationOption, random)
    if (result) return result
  }

  // should never be reached
  return { insertValue: 0, currentTree: null }
}

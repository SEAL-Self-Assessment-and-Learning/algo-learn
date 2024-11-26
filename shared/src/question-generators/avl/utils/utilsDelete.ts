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
 * This function generates an AVL tree and a value to delete from the tree
 * Deleting this value will result in the desired rotation
 * @param random
 * @param avlTreeSize
 * @param rotationOption
 * @param randNextInt - a random formula to determine the next value for the tree
 */
export function generateAVLTreeDelete({
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
  const maxHeight = Math.ceil(1.45 * Math.log2(avlTreeSize + 2) - 0.32)
  const tmpTrees: AVLTreeHelper[] = assignUniqueIDsToTrees(
    generateAllAVLTrees(maxHeight, avlTreeSize, avlTreeSize),
    random,
  )
  // converting the avlTree structures in AVLTrees with numbers as value
  const avlTrees: AVLTree[] = convertAVLHelperToRandomAVLTree(
    random,
    randNextInt ? randNextInt : getStandardNextRandInt,
    tmpTrees,
  )

  return handleAVLRotationDelete(random, avlTrees, rotationOption)
}

/**
 * This function generates an AVL and a value to delete from the tree
 * @param random
 * @param avlTrees - all possible AVL trees with n nodes
 * @param rotationOption
 */
function handleAVLRotationDelete(
  random: Random,
  avlTrees: AVLTree[],
  rotationOption: AVLTreeRotations,
): { avlTree: AVLTree; askValue: number } {
  const { deleteValue, currentTree } = getRandomTreeDeleteValueForRotation(
    random,
    avlTrees,
    rotationOption,
  )
  checkAVLNull(currentTree)

  return {
    avlTree: currentTree as AVLTree,
    askValue: deleteValue,
  }
}

/**
 * This function checks if the current tree can be rotated by deleting a specific value
 * Testing all possible values in the tree
 * @param random
 * @param currentTree - the current AVL tree
 * @param rotationOption - the desired rotation
 */
function checkTreeForDeleteRotation(
  random: Random,
  currentTree: AVLTree,
  rotationOption: AVLTreeRotations,
) {
  const inOrder = random.shuffle(currentTree.inOrder())

  while (inOrder.length > 0) {
    const deleteValue = inOrder.pop() as number
    const treeClone = currentTree.clone()
    const treeCloneDelete = treeClone.delete(deleteValue)
    if (treeCloneDelete === rotationOption) {
      return {
        deleteValue,
        currentTree,
      }
    }
  }
  return null
}

/**
 * This function tests AVL trees for a specific rotation by deleting a value
 * Should return a value to delete and the tree
 * Otherwise it will return null
 * @param random
 * @param avlTrees - all possible AVL trees with n nodes
 * @param rotationOption
 */
function getRandomTreeDeleteValueForRotation(
  random: Random,
  avlTrees: AVLTree[],
  rotationOption: AVLTreeRotations,
) {
  avlTrees = random.shuffle(avlTrees)

  for (let i = 0; i < avlTrees.length; i++) {
    const result = checkTreeForDeleteRotation(random, avlTrees[i], rotationOption)
    if (result) return result
  }

  // should never be reached
  return {
    deleteValue: 0,
    currentTree: null,
  }
}

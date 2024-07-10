import Random from "@shared/utils/random.ts";
import {AVLTree} from "@shared/question-generators/avl/avlDS.ts";
import {
  AVLTreeHelper,
  AVLTreeRotations, checkAVLNull,
  convertAVLHelperToRandomAVLTree,
  generateAllAVLTrees
} from "@shared/question-generators/avl/utils/utils.ts";

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

  const {avlTree, askValue} = handleAVLRotation(random, avlTrees, rotationOption)

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
  const {insertValue, currentTree} = getRandomTreeInsertPair(random, avlTrees, rotationOption)
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
  return {insertValue: 0, currentTree: null}
}
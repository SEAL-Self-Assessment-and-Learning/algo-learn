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

export type AVLTreeHelper = {
  root: string
  left: AVLTreeHelper | null
  right: AVLTreeHelper | null
  nodes: number
}

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

  const tmpTrees: AVLTreeHelper[] = generateAllAVLTrees(5, 1, 13)
  const avlTrees: AVLTree[] = convertAVLHelperToRandomAVLTree(random, tmpTrees)
  allTreeInsertPairsForRightRotation(random, avlTrees)


  if (avlRotation === "none") {
  } else if (avlRotation === "left") {
  } else if (avlRotation === "right") {
  } else if (avlRotation === "left-right") {
  } else if (avlRotation === "right-left") {
  }

  return {
    avlTree: avl,
    askValue,
  }
}

function allTreeInsertPairsForRightRotation (random: Random, avlTrees: AVLTree[]) {


  for (let i = 0; i < avlTrees.length; i++) {

    const inOrder = avlTrees[i].inOrder()
    const lvlOrder = avlTrees[i].levelOrderAlternative()

    let lastSeen = 0
    let currentTree = avlTrees[i]
    for (let j = 0; j < inOrder.length; j++) {

      const insertValue = random.float(lastSeen + 0.0000001, inOrder[j] - 0.0000001)

      if (currentTree.insertWouldDoRotation(insertValue) === "none") {
        console.log(lvlOrder, " insert: ", insertValue)
      }

      lastSeen = inOrder[j]
      const newAVLTree = new AVLTree()
      for (let h = 0; h < lvlOrder.length; h++) {
        if (lvlOrder[h] !== null) {
          newAVLTree.insert(lvlOrder[h]!)
        }
      }
      currentTree = newAVLTree

    }

  }

  return []

}

function convertAVLHelperToRandomAVLTree(random: Random, treeHelper: AVLTreeHelper[]): AVLTree[] {

  const avlTrees: AVLTree[] = []

  for (let i = 0; i < treeHelper.length; i++) {

    const newAVLTree: AVLTree = new AVLTree()
    avlTrees.push(newAVLTree)

    // get the inorder order for the helper tree
    const inOrder = inOrderHelper(treeHelper[i])
    const inOrderToValues: {[key: string]: number} = {}

    // iterate through the inOrder
    // convert every entry into a dict and
    // assign every value in every iteration a new higher value
    let lastUsedNumber = 1
    for (let j = 0; j < inOrder.length; j++) {
      const newNumber = random.int(lastUsedNumber + 1, lastUsedNumber + 15)
      lastUsedNumber = newNumber
      inOrderToValues[inOrder[j]] = newNumber
    }

    // get the lvl order to convert to avl tree
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

function download(filename: string, text: string) {
  const element = document.createElement("a")
  element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(text))
  element.setAttribute("download", filename)

  element.style.display = "none"
  document.body.appendChild(element)

  element.click()

  document.body.removeChild(element)
}

/*

// currently just a helper to generate permutations

    const values = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20]
    // const values = [2, 4, 6, 8]
    const permuations = permute(values)

    const avlSet: Set<string> = new Set()
    for (const perm of permuations) {
      const newTree = new AVLTree()
      for (const p of perm) {
        newTree.insert(p)
      }
      avlSet.add(JSON.stringify(newTree.levelOrderAlternative()))
    }

    let downloadText = "["
    for (const s of avlSet) {
      const tmp = JSON.parse(s)as (number | null)[]
      let tmpString = "["
      for (const v of tmp) {
        if (v === null) {
          tmpString += '"",'
        } else {
          tmpString += v + ","
        }
      }
      tmpString += "],"
      downloadText += tmpString + '\n'
    }
    downloadText += "]"

    download('/Users/fabianstiewe/Downloads/output.txt',  downloadText + '\n');


    let downloadTextForPython = "["

    for (let j = 0; j<hTrees.length; j++) {
      for (let i = 0; i < hTrees[j].length; i++) {
        const lvlOrder = levelOrderAlternative(hTrees[j][i])
        let lvlText = "["
        for (const lvl of lvlOrder) {
          if (lvl === null) {
            lvlText += '"",'
          } else {
            lvlText += '"' + lvl + '",'
          }
        }
        lvlText += "],"
        downloadTextForPython += lvlText + "\n"
      }
    }

    downloadTextForPython += "]"

    download("hTrees", downloadTextForPython)


 */

/*


  let downloadTextForPython = "["

  for (let j = 0; j<AVLTrees.length; j++) {
      const lvlOrder = AVLTrees[j].levelOrderAlternative()
      let lvlText = "["
      for (const lvl of lvlOrder) {
        if (lvl === null) {
          lvlText += '"",'
        } else {
          lvlText += '"' + lvl + '",'
        }
      }
      lvlText += "],"
      downloadTextForPython += lvlText + "\n"
  }

  downloadTextForPython += "]"

  download("hTrees", downloadTextForPython)

 */

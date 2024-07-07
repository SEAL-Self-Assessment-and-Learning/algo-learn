// https://www.javaguides.net/2023/09/typescript-implement-avl-tree.html
// https://files.tcs.uni-frankfurt.de/algo1/binarysearchtrees.pdf
// Do we write sources for the code we use? I'm not sure if this is necessary since it's a common algorithm

import { AVLTreeRotations } from "@shared/question-generators/avl/utils.ts"

/**
 * AVL Node structure
 *
 * Only possible to use with numbers
 *
 */
type AVLNode = {
  data: number
  left: AVLNode | null
  right: AVLNode | null
  height: number
}

/**
 * AVL Tree implementation in TypeScript
 * No duplicate values are allowed in the AVL Tree
 */
export class AVLTree {
  root: AVLNode | null = null

  /**
   * Utility function to get the height of a node
   * @param node - The node whose height is to be calculated
   * @private
   */
  private getHeight(node: AVLNode | null): number {
    if (!node) return 0
    return node.height
  }

  /**
   * Utility function to get the balance factor of a node
   *
   * Math: balance = height(left subtree) - height(right subtree)
   *
   * @param node
   * @private
   */
  private getBalance(node: AVLNode | null): number {
    if (!node) return 0
    return this.getHeight(node.left) - this.getHeight(node.right)
  }

  /**
   * Right Rotate to balance the AVL Tree
   * @param y
   * @private
   */
  private rightRotate(y: AVLNode): AVLNode {
    const x = y.left!
    const T3 = x.right

    // Perform rotation
    x.right = y
    y.left = T3

    // Update heights
    y.height = Math.max(this.getHeight(y.left), this.getHeight(y.right)) + 1
    x.height = Math.max(this.getHeight(x.left), this.getHeight(x.right)) + 1

    return x // Return new root
  }

  /**
   * Left Rotate to balance the AVL Tree
   * @param x - The node to be rotated
   * @private
   */
  private leftRotate(x: AVLNode): AVLNode {
    const y = x.right!
    const T2 = y.left

    // Perform rotation
    y.left = x
    x.right = T2

    // Update heights
    x.height = Math.max(this.getHeight(x.left), this.getHeight(x.right)) + 1
    y.height = Math.max(this.getHeight(y.left), this.getHeight(y.right)) + 1

    return y // Return new root
  }

  /**
   * Insert Helper function to insert a new node in the AVL Tree (recursive)
   *
   * !It also return the rotation that has been done during this process
   *
   * @param node - The current node
   * @param data - The data to be inserted
   * @private
   */
  private insertHelper(
    node: AVLNode | null,
    data: number,
  ): { node: AVLNode; rotation: AVLTreeRotations } {
    if (!node) {
      return {
        node: {
          data: data,
          left: null,
          right: null,
          height: 1,
        },
        rotation: "none",
      }
    }

    let rotationType: AVLTreeRotations = "none"

    if (data < node.data) {
      const result = this.insertHelper(node.left, data)
      node.left = result.node
      rotationType = result.rotation
    } else if (data > node.data) {
      const result = this.insertHelper(node.right, data)
      node.right = result.node
      rotationType = result.rotation
    } else {
      return { node, rotation: "none" }
    }

    node.height = 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right))

    const balance = this.getBalance(node)
    let rotation: AVLTreeRotations = "none"

    if (balance > 1) {
      if (this.getBalance(node.left) < 0) {
        node.left = this.leftRotate(node.left!)
        rotation = "leftRight"
      }
      node = this.rightRotate(node)
      if (rotation === "none") rotation = "right"
    } else if (balance < -1) {
      if (this.getBalance(node.right) > 0) {
        node.right = this.rightRotate(node.right!)
        rotation = "rightLeft"
      }
      node = this.leftRotate(node)
      if (rotation === "none") rotation = "left"
    }

    if (rotationType !== "none") {
      return { node, rotation: rotationType }
    }
    return { node, rotation: rotation }
  }

  /**
   * Delete Helper function to delete a node from the AVL Tree (recursive)
   * @param node - The current node
   * @param data - The data to be deleted
   * @private
   */
  private deleteHelper(node: AVLNode | null, data: number): AVLNode | null {
    if (!node) return node

    // Perform standard BST delete
    if (data < node.data) {
      node.left = this.deleteHelper(node.left, data)
    } else if (data > node.data) {
      node.right = this.deleteHelper(node.right, data)
    } else {
      // Node with only one child or no child
      if (!node.left || !node.right) {
        const temp = node.left ? node.left : node.right
        if (!temp) {
          node = null
        } else {
          node = temp
        }
      } else {
        // Node with two children: Get the inorder predecessor (largest in the left subtree)
        const temp = this.findMax(node.left)
        node.data = temp.data
        node.left = this.deleteHelper(node.left, temp.data)
      }
    }

    if (!node) return node

    // Update height of the current node
    node.height = 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right))

    // Get the balance factor of this node
    const balance = this.getBalance(node)

    // Balance the node if it has become unbalanced

    // Left Cases (Left-Left and Left-Right)
    if (balance > 1) {
      if (this.getBalance(node.left) < 0) {
        node.left = this.leftRotate(node.left!)
      }
      return this.rightRotate(node)
    }

    // Right Cases (Right-Right and Right-Left)
    if (balance < -1) {
      if (this.getBalance(node.right) > 0) {
        node.right = this.rightRotate(node.right!)
      }
      return this.leftRotate(node)
    }

    return node
  }

  /**
   * In-order traversal of the AVL Tree
   */
  inOrder(): number[] {
    const result: number[] = []
    function inOrderHelper(node: AVLNode | null): void {
      if (!node) return
      inOrderHelper(node.left)
      result.push(node.data)
      inOrderHelper(node.right)
    }
    inOrderHelper(this.root)
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
  levelOrderAlternative(): (number | null)[] {
    if (!this.root) return []
    let queue: (AVLNode | null)[] = [this.root]
    const result: (number | null)[] = []

    while (queue.length > 0) {
      const newQueue: (AVLNode | null)[] = []
      const tmpResult: (number | null)[] = []
      for (const node of queue) {
        if (node) {
          tmpResult.push(node.data)
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
   * Find the maximum node an AVL Tree
   * @param node - The root node (of the tree or subtree)
   * @private
   */
  private findMax(node: AVLNode): AVLNode {
    while (node.right) {
      node = node.right
    }
    return node
  }

  /**
   * Find the predecessor of given data in an AVL Tree
   * @param data - The data whose predecessor is to be found
   */
  predecessor(data: number): number | null {
    let node = this.root
    let predecessor: AVLNode | null = null

    while (node) {
      if (data > node.data) {
        predecessor = node
        node = node.right
      } else {
        node = node.left
      }
    }

    return predecessor ? predecessor.data : null
  }

  /**
   * Find the successor of given data in an AVL Tree
   * @param data - The data whose successor is to be found
   */
  successor(data: number): number | null {
    let node = this.root
    let successor: AVLNode | null = null

    while (node) {
      if (data < node.data) {
        successor = node
        node = node.left
      } else {
        node = node.right
      }
    }

    return successor ? successor.data : null
  }

  /**
   * Insert a new node in the AVL Tree
   * @param data - The data to be inserted
   */
  insert(data: number): AVLTreeRotations {
    const { node, rotation } = this.insertHelper(this.root, data)
    this.root = node
    return rotation
  }

  /**
   * Delete a node from the AVL Tree
   * @param data - The data to be deleted
   */
  delete(data: number): void {
    this.root = this.deleteHelper(this.root, data)
  }

  /**
   * Returns a deep copy of the AVL Tree
   */
  clone(): AVLTree {
    const newTree: AVLTree = new AVLTree()
    const lvlOrder = this.levelOrderAlternative()

    for (const value of lvlOrder) {
      if (value !== null) {
        newTree.insert(value)
      }
    }

    return newTree
  }
}

// https://www.javaguides.net/2023/09/typescript-implement-avl-tree.html
// Do we write sources for the code we use? I'm not sure if this is necessary since it's a common algorithm

// Node class to represent a node in the AVL Tree
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

  // Utility function to get the height of a node
  private getHeight(node: AVLNode | null): number {
    if (!node) return 0
    return node.height
  }

  // Utility function to get the balance factor of a node
  private getBalance(node: AVLNode | null): number {
    if (!node) return 0
    return this.getHeight(node.left) - this.getHeight(node.right)
  }

  // Right Rotate to balance the AVL Tree
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

  // Left Rotate to balance the AVL Tree
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

  // Insert a node in the AVL Tree and balance the tree
  private insert(node: AVLNode | null, data: number): AVLNode {
    // 1. Standard BST Insertion
    if (!node) {
      return {
        data: data,
        left: null,
        right: null,
        height: 1,
      }
    }

    if (data < node.data) {
      node.left = this.insert(node.left, data)
    } else if (data > node.data) {
      node.right = this.insert(node.right, data)
    } else {
      return node // Duplicate values are not allowed
    }

    // 2. Update height of the current node
    node.height = 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right))

    // 3. Get the balance factor to check if it's unbalanced
    const balance = this.getBalance(node)

    // 4. Balance the node if it's unbalanced
    // Left Left Case
    if (balance > 1 && data < node.left!.data) {
      return this.rightRotate(node)
    }
    // Right Right Case
    if (balance < -1 && data > node.right!.data) {
      return this.leftRotate(node)
    }
    // Left Right Case
    if (balance > 1 && data > node.left!.data) {
      node.left = this.leftRotate(node.left!)
      return this.rightRotate(node)
    }
    // Right Left Case
    if (balance < -1 && data < node.right!.data) {
      node.right = this.rightRotate(node.right!)
      return this.leftRotate(node)
    }

    return node
  }

  // Recursive in-order traversal to display the AVL Tree
  inOrder(node: AVLNode | null): number[] {
    const result: number[] = []
    function inOrderHelper(node: AVLNode | null): void {
      if (!node) return
      inOrderHelper(node.left)
      result.push(node.data)
      inOrderHelper(node.right)
    }
    inOrderHelper(node)
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

  // Insert data into the AVL Tree
  add(data: number): void {
    this.root = this.insert(this.root, data)
  }
}

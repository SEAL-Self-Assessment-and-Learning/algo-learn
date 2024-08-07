import { HashFunction } from "@shared/question-generators/Hashing/MapLinProbing.ts"

/**
 * This is a hash map implementation using linked list to handle collisions
 * The hash function is the modulo of the key by the size of the map * is an array of linked lists
 *
 * If the same key is inserted twice, the value of the first insert is updated
 */
export class MapLinked {
  private map: (ListNode | null)[]
  private readonly size: number
  private amount: number = 0
  private readonly hashFunction: HashFunction

  constructor(size: number, hashFunction?: HashFunction) {
    this.map = new Array(size).fill(null) as (ListNode | null)[]
    this.size = size
    this.hashFunction = hashFunction ? hashFunction : this.defaultHashFunction
  }

  /**
   * Inserts a new key-value pair into the map or updates the value if the key already exists
   * @param key
   * @param value
   */
  insert(key: number, value: string) {
    const hashKey = this.hashFunction(key, this.size)
    if (this.has(key)) {
      this.change(key, value)
      return
    }
    const newNode: ListNode = { key: key, value: value, next: null, prev: null }
    // insert the new node at the beginning
    newNode.next = this.map[hashKey]
    this.map[hashKey] = newNode
    // update the previous node
    if (newNode.next) {
      newNode.next.prev = newNode
    }
    this.amount++
  }

  /**
   * Changes the value of a key
   * @param key
   * @param value
   *
   * @throws Error if the key is not found
   */
  change(key: number, value: string) {
    const hashKey = this.hashFunction(key, this.size)
    let node = this.map[hashKey]
    while (node) {
      if (node.key === key) {
        node.value = value
        return
      }
      node = node.next
    }
    throw new Error(`Key ${key} not found. Cannot change value`)
  }

  /**
   * Deletes a key-value pair from the map
   * @param key
   */
  delete(key: number) {
    const hashKey = this.hashFunction(key, this.size)
    let node = this.map[hashKey]
    if (!node) {
      return
    }
    if (node.key === key) {
      this.amount--
      this.map[hashKey] = node.next
      if (node.next) {
        node.next.prev = null
      }
      return
    }
    while (node.next) {
      if (node.next.key === key) {
        this.amount--
        node.next = node.next.next
        if (node.next) {
          node.next.prev = node
        }
        return
      }
      node = node.next
    }
  }

  /**
   * Returns true if the key is in the map, false otherwise
   * @param key
   */
  has(key: number): boolean {
    return this.get(key) !== null
  }

  /**
   * Returns the value of a key or null if the key is not in the map
   * @param key
   */
  get(key: number): string | null {
    const hashKey = this.hashFunction(key, this.size)
    let node = this.map[hashKey]
    while (node) {
      if (node.key === key) {
        return node.value
      }
      node = node.next
    }
    return null
  }

  /**
   * Returns an array of all the keys in the map
   */
  keys(): number[] {
    const keys: number[] = []
    this.map.forEach((node) => {
      while (node) {
        keys.push(node.key)
        node = node.next
      }
    })
    return keys
  }

  /**
   * Returns an array of all the keys in the map as a list of lists
   * Example:
   *  [[1, 11, 21], [3, 13]]
   */
  keysList(): number[][] {
    const keys: number[][] = []
    this.map.forEach((node) => {
      const keyList: number[] = []
      while (node) {
        keyList.push(node.key)
        node = node.next
      }
      keys.push(keyList)
    })
    return keys
  }

  /**
   * Returns an array of all the values in the map
   */
  values(): string[] {
    const values: string[] = []
    this.map.forEach((node) => {
      while (node) {
        values.push(node.value)
        node = node.next
      }
    })
    return values
  }

  /**
   * Returns an array of all the key-value pairs in the map
   */
  entries(): [number, string][] {
    const entries: [number, string][] = []
    this.map.forEach((node) => {
      while (node) {
        entries.push([node.key, node.value])
        node = node.next
      }
    })
    return entries
  }

  /**
   * Returns if the map is empty
   */
  isEmpty(): boolean {
    return this.getAmount() === 0
  }

  /**
   * Returns the number of key-value pairs in the map
   */
  getAmount(): number {
    return this.amount
  }

  getSize(): number {
    return this.size
  }

  /**
   * Clears the map
   */
  clear() {
    this.map = new Array(this.size).fill(null) as ListNode[] | null[]
    this.amount = 0
  }

  /**
   * Returns the hash value of the key
   * @param key
   * @param size just this.size
   * @private
   */
  private defaultHashFunction = (key: number, size: number): number => {
    return key % size
  }

  /**
   * Returns a string representation of the map
   *
   * Example:
   * 0: (1, "a") -> (11, "b") -> (21, "c")
   * 1:
   * 2: (3, "g") -> (13, "h")
   */
  toString() {
    return this.map
      .map((node, index) => {
        let str = `${index}: `
        while (node) {
          str += `(${node.key}, ${node.value}) ${node.next ? "->" : ""} `
          node = node.next
        }
        return str
      })
      .join("\n")
      .trim()
  }
}

type ListNode = {
  key: number
  value: string
  next: ListNode | null
  prev: ListNode | null
}

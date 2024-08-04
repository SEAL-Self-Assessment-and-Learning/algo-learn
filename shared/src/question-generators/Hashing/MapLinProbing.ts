export type HashFunction = (key: number, size: number) => number
export type DoubleHashFunction = (key: number, i: number, size: number) => number

/**
 * This is a hash map implementation using linear probing to handle collisions
 *
 * As a hash function, there will be two options:
 *  - The modulo of the key by the size of the map
 *  - Double hashing
 *
 * If the same key is inserted twice, the value of the first insert is updated
 */
export class MapLinProbing {
  private mapKeys: (number | null)[]
  private mapValues: (string | null)[]
  private readonly size: number
  private amount: number = 0
  private readonly hashFunction: HashFunction | null = null
  private readonly doubleHashFunction: DoubleHashFunction | null = null
  private readonly doubleHashing: boolean = false

  constructor({
    size,
    hashFunction,
  }: {
    size: number
    hashFunction?: HashFunction | DoubleHashFunction
  }) {
    this.mapKeys = new Array(size).fill(null) as (number | null)[]
    this.mapValues = new Array(size).fill(null) as (string | null)[]
    this.size = size
    if (hashFunction) {
      if (hashFunction.length === 2) {
        this.hashFunction = hashFunction as HashFunction
        this.doubleHashing = false
      } else if (hashFunction.length === 3) {
        this.doubleHashFunction = hashFunction as DoubleHashFunction
        this.doubleHashing = true
      } else {
        throw new Error("Invalid hash function")
      }
    } else {
      this.hashFunction = this.defaultHashFunction
      this.doubleHashing = false
    }
  }

  /**
   * Inserts a new key-value pair into the map or updates the value if the key already exists
   * @param key
   * @param value
   */
  insert(key: number, value: string) {
    if (this.amount >= this.size) {
      throw new Error(`Map is full. Cannot insert key ${key}`)
    }

    let hashKey = this.doubleHashing ? this.getHashValue(key, 0) : this.getHashValue(key)
    if (this.has(key)) {
      this.change(key, value)
      return
    }
    let counter = 1
    while (this.mapKeys[hashKey] !== null) {
      if (this.doubleHashing) {
        hashKey = this.getHashValue(key, counter)
      } else {
        hashKey = (hashKey + 1) % this.size
      }
      counter++
    }
    this.mapKeys[hashKey] = key
    this.mapValues[hashKey] = value
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
    let hashKey = this.doubleHashing ? this.getHashValue(key, 0) : this.getHashValue(key)
    let counter = 1
    while (this.mapKeys[hashKey] !== key) {
      if (this.doubleHashing) {
        hashKey = this.getHashValue(key, counter)
      } else {
        hashKey = (hashKey + 1) % this.size
      }
      if (this.mapKeys[hashKey] === null) {
        throw new Error(`Key ${key} not found. Cannot change value`)
      }
      counter++
    }
    this.mapValues[hashKey] = value
  }

  /**
   * Deletes a key-value pair from the map
   * @param key
   */
  delete(key: number) {
    let hashKey = this.doubleHashing ? this.getHashValue(key, 0) : this.getHashValue(key)
    let counter = 1
    while (this.mapKeys[hashKey] !== key) {
      if (this.doubleHashing) {
        hashKey = this.getHashValue(key, counter)
      } else {
        hashKey = (hashKey + 1) % this.size
      }
      if (this.mapKeys[hashKey] === null) {
        return
      }
      counter++
    }
    this.mapKeys[hashKey] = null
    this.mapValues[hashKey] = null
    this.amount--
    // rehash the following keys
    let count = 1
    hashKey = this.doubleHashing ? this.getHashValue(key, count) : (hashKey + 1) % this.size
    while (this.mapKeys[hashKey] !== null) {
      const keyToRehash = this.mapKeys[hashKey] as number
      const valueToRehash = this.mapValues[hashKey] as string
      this.mapKeys[hashKey] = null
      this.mapValues[hashKey] = null
      this.amount--
      this.insert(keyToRehash, valueToRehash)
      count++
      hashKey = this.doubleHashing ? this.getHashValue(key, count) : (hashKey + 1) % this.size
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
   * Returns the value of a key or null if the key is not found
   * @param key
   */
  get(key: number): string | null {
    let hashKey = this.doubleHashing ? this.getHashValue(key, 0) : this.getHashValue(key)
    let counter = 1
    while (this.mapKeys[hashKey] !== key) {
      if (this.doubleHashing) {
        hashKey = this.getHashValue(key, counter)
      } else {
        hashKey = (hashKey + 1) % this.size
      }
      if (this.mapKeys[hashKey] === null) {
        return null
      }
      counter++
    }
    return this.mapValues[hashKey]
  }

  /**
   * Returns an array of all the keys in the map
   */
  keys(): number[] {
    return this.mapKeys.filter((key) => key !== null) as number[]
  }

  /**
   * Returns the keys of the map
   */
  keysList(): (number | null)[] {
    return this.mapKeys
  }

  /**
   * Returns an array of all the values in the map
   */
  values(): string[] {
    return this.mapValues.filter((value) => value !== null) as string[]
  }

  /**
   * Returns an array of all the key-value pairs in the map
   */
  entries(): [number, string][] {
    const entries: [number, string][] = []
    this.mapKeys.forEach((key, index) => {
      if (key !== null) {
        entries.push([key, this.mapValues[index] as string])
      }
    })
    return entries
  }

  /**
   * Returns if the map is empty
   */
  isEmpty(): boolean {
    return this.amount === 0
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
    this.mapKeys = new Array(this.size).fill(null) as (number | null)[]
    this.mapValues = new Array(this.size).fill(null) as (string | null)[]
    this.amount = 0
  }

  /**
   * Returns the hash value of the key
   * @param key
   * @private
   */
  defaultHashFunction = (key: number): number => {
    return key % this.size
  }

  getHashValue(key: number, i?: number): number {
    if (this.doubleHashing) {
      if (!this.doubleHashFunction) {
        throw new Error("Invalid hash function")
      }
      if (i === undefined) {
        throw new Error("Missing second number for double hashing")
      }
      return this.doubleHashFunction(key, i, this.size) % this.size
    }
    return (
      (this.hashFunction ? this.hashFunction(key, this.size) : this.defaultHashFunction(key)) % this.size
    )
  }

  toString() {
    let indices = "|"
    let keys = "|"
    let values = "|"
    for (let i = 0; i < this.size; i++) {
      if (this.mapKeys[i] !== null) {
        const maxWidth = Math.max(
          (this.mapKeys[i] as number).toString().length,
          (this.mapValues[i] as string).length,
        )
        indices += `${i}|`.padStart(maxWidth + 1)
        keys += `${this.mapKeys[i]}|`.padStart(maxWidth + 1)
        values += `${this.mapValues[i]}|`.padStart(maxWidth + 1)
      } else {
        const maxWidth = i.toString().length
        indices += `${i}|`
        keys += " |".padStart(maxWidth + 1)
        values += " |".padStart(maxWidth + 1)
      }
    }
    return `${indices}\n${keys}\n${values}`
  }
}

/**
 * Class for a MaxHeap
 * Heaps in different files, to avoid confusion
 */
export class MaxHeap {
  private heap: number[] = []

  insert(value: number) {
    this.heap.push(value)
    this.bubbleUp(this.heap.length - 1)
  }

  extractMax() {
    if (this.heap.length === 0) {
      return null
    }
    const max = this.heap[0]
    const lastElement = this.heap.pop()
    if (lastElement !== undefined) {
      this.heap[0] = lastElement
      this.bubbleDown(0)
    }
    return max
  }

  removeIndex(index: number) {
    if (index >= this.heap.length) {
      return
    }
    const lastElement = this.heap.pop()
    if (lastElement !== undefined) {
      this.heap[index] = lastElement
      this.bubbleDown(index)
    }
  }

  removeValue(value: number) {
    const index = this.search(value)
    if (index !== -1) {
      this.removeIndex(index)
    }
  }

  increaseValue(currentValue: number, newValue: number) {
    const index = this.search(currentValue)
    if (index !== -1) {
      this.heap[index] = newValue
      this.bubbleUp(index)
    }
  }

  search(value: number) {
    return this.heap.indexOf(value)
  }

  clear() {
    this.heap = []
  }

  build(newHeap: number[]) {
    this.heap = newHeap
    for (let i = Math.floor(this.heap.length / 2); i >= 0; i--) {
      this.bubbleDown(i)
    }
  }

  private bubbleUp(index: number) {
    while (index > 0) {
      const element = this.heap[index]
      const parentIndex = Math.floor((index - 1) / 2)
      const parent = this.heap[parentIndex]
      if (parent >= element) break
      this.heap[index] = parent
      this.heap[parentIndex] = element
      index = parentIndex
    }
  }

  private bubbleDown(index: number) {
    const value = this.heap[index]
    while (index < this.heap.length) {
      const left = 2 * index + 1
      const right = 2 * index + 2
      let largest = index
      if (left < this.heap.length && this.heap[left] > this.heap[largest]) {
        largest = left
      }
      if (right < this.heap.length && this.heap[right] > this.heap[largest]) {
        largest = right
      }
      if (largest === index) break
      this.heap[index] = this.heap[largest]
      this.heap[largest] = value
      index = largest
    }
  }

  getHeap() {
    return this.heap.slice()
  }

  toString() {
    return this.heap.toString()
  }

  toTableString() {
    let heapTable = "\n"
    heapTable += "|" + this.heap.join("|") + "|\n"
    heapTable += "|---".repeat(this.heap.length) + "|\n"
    return heapTable
  }
}

/**
 * This class represents a queue
 *
 */
export class Queue<T> {
  private readonly queue: T[]
  constructor() {
    this.queue = []
  }

  /**
   * This method adds an element to the queue
   * @param element The element to add
   */
  enqueue(element: T): void {
    this.queue.push(element)
  }

  /**
   * This method returns the front element of the queue
   * @returns The front element of the queue
   */
  dequeue(): T {
    if (this.queue.length > 0) {
      return this.queue.shift() as T
    } else {
      throw new Error("The queue is empty, it's not possible to dequeue")
    }
  }

  /**
   * This method returns the current number of elements in the queue
   * @returns The current number of elements in the queue
   */
  getCurrentNumberOfElements(): number {
    return this.queue.length
  }

  isEmpty(): boolean {
    return this.queue.length === 0
  }

  /**
   * Returns all queue elements as strings
   */
  toStringArray(): string[] {
    return this.queue.map((element) => String(element))
  }

  /**
   * This method returns the current queue as a string
   * @returns The current queue as a string
   */
  toString(): string {
    if (this.queue.length === 0) {
      return ""
    }
    return this.queue.toString()
  }
}

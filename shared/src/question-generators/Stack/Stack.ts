/**
 * This Class represents a Stack
 */
export class Stack<T> {
  private stack: T[]
  constructor() {
    this.stack = []
  }

  /**
   * This method pushes an element to the stack
   * @param element The element to push
   */
  push(element: T): void {
    this.stack.push(element)
  }

  /**
   * This method gets the top element from the stack
   * @returns The element that was popped
   */
  getTop(): T {
    if (this.stack.length > 0) {
      return this.stack.pop() as T
    } else {
      throw new Error("The stack is empty, it's not possible to pop an element")
    }
  }

  /**
   * This method returns the size of the stack
   * @returns The size of the stack
   */
  getSize(): number {
    return this.stack.length
  }

  isEmpty(): boolean {
    return this.stack.length === 0
  }

  getStackAsString(): string[] {
    return this.stack.map((element) => String(element))
  }

  /**
   * This method returns the current stack as a String format [x,y,z,...]
   * @returns The current stack
   */
  toString(): string {
    if (this.isEmpty()) {
      return ""
    }
    return this.stack.toString()
  }
}

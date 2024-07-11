import { describe, expect, test } from "vitest"
import { Queue } from "@shared/question-generators/StackQueue/Queue/Queue.ts"
import { Stack } from "./Stack/Stack.ts"

describe("test for Stack class main", () => {
  let stack: Stack<number>

  test(() => {
    stack = new Stack()
  })

  test("pushes elements to the stack", () => {
    stack = new Stack()
    stack.push(1)
    expect(stack.getSize()).toBe(1)
  })

  test("gets the top element from the stack", () => {
    stack.push(1)
    stack.push(2)
    expect(stack.getTop()).toBe(2)
  })

  test("throws error when trying to get top element from empty stack", () => {
    stack = new Stack()
    expect(() => stack.getTop()).toThrow("The stack is empty, it's not possible to pop an element")
  })

  test("returns the current stack as a string", () => {
    stack = new Stack()
    stack.push(1)
    stack.push(2)
    stack.push(3)
    expect(stack.toString()).toBe("1,2,3")
    stack.getTop()
    stack.getTop()
    stack.getTop()
    expect(stack.toString()).toBe("")
  })

  test("bigger test", () => {
    stack = new Stack()
    expect(stack.getSize()).toBe(0)

    stack.push(1)
    stack.push(2)

    expect(stack.getSize()).toBe(2)

    stack.push(3)

    expect(stack.getTop()).toBe(3)

    for (let i = 3; i < 100; i++) {
      stack.push(i)
    }
    for (let i = 0; i < 80; i++) {
      stack.getTop()
    }

    expect(stack.getSize()).toBe(19)
    expect(stack.getTop()).toBe(19)
    expect(stack.getTop()).toBe(18)
  })
})

describe("test for Queue class", () => {
  let queue: Queue<number>

  test("queues elements", () => {
    queue = new Queue()
    queue.enqueue(1)
    expect(queue.getCurrentNumberOfElements()).toBe(1)
  })

  test("dequeues elements", () => {
    queue = new Queue()
    queue.enqueue(1)
    queue.enqueue(2)
    expect(queue.dequeue()).toBe(1)
  })

  test("returns the current queue as a string", () => {
    queue = new Queue()
    queue.enqueue(1)
    queue.enqueue(2)
    queue.enqueue(3)
    expect(queue.toString()).toBe("1,2,3")
  })
})

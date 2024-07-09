import { describe, expect, test } from "vitest"
import { Queue } from "@shared/question-generators/StackQueue/Queue.ts"
import { Stack } from "./Stack"

describe("test for Stack class main", () => {
  let stack: Stack

  test(() => {
    stack = new Stack(10, true)
  })

  test("pushes elements to the stack", () => {
    stack = new Stack(10, true)
    stack.push(1)
    expect(stack.getCurrentPosition()).toBe(1)
  })

  test("gets the top element from the stack", () => {
    stack.push(1)
    stack.push(2)
    expect(stack.getTop()).toBe(2)
  })

  test("throws error when trying to get top element from empty stack", () => {
    stack = new Stack(10, true)
    expect(() => stack.getTop()).toThrow("The stack is empty")
  })

  test("increases the stack size when resizing is enabled and stack is full", () => {
    stack = new Stack(10, true)
    for (let i = 0; i < 10; i++) {
      stack.push(i)
    }
    stack.push(10)
    expect(stack.getCurrentPosition()).toBe(11)
    expect(stack.getTop()).toBe(10)
  })

  test("throws error when trying to push to a full stack with resizing disabled", () => {
    stack = new Stack(10, false)
    for (let i = 0; i < 10; i++) {
      stack.push(i)
    }
    expect(() => stack.push(10)).toThrow("The stack is full (no resizing enabled)")
  })

  test("decreases the stack size when more than 75% of the stack is empty and resizing is enabled", () => {
    stack = new Stack(20, true)
    for (let i = 0; i < 20; i++) {
      stack.push(i)
    }
    for (let i = 0; i < 15; i++) {
      stack.getTop()
    }
    expect(stack.getCurrentPosition()).toBe(5)
  })

  test("does not decrease the stack size when more than 75% of the stack is empty and resizing is disabled", () => {
    stack = new Stack(20, false)
    for (let i = 0; i < 20; i++) {
      stack.push(i)
    }
    for (let i = 0; i < 19; i++) {
      stack.getTop()
    }
    expect(stack.getCurrentPosition()).toBe(1)
  })

  test("returns the current stack as a string", () => {
    stack = new Stack(20, false)
    stack.push(1)
    stack.push(2)
    stack.push(3)
    expect(stack.toString()).toBe("[1,2,3]")
    stack.getTop()
    stack.getTop()
    stack.getTop()
    expect(stack.toString()).toBe("[]")
  })

  test("bigger test", () => {
    stack = new Stack(2, true)
    expect(stack.getCurrentPosition()).toBe(0)

    stack.push(1)
    stack.push(2)
    expect(stack.getCurrentPosition()).toBe(2)

    stack.push(3)
    expect(stack.getTop()).toBe(3)

    for (let i = 3; i < 100; i++) {
      stack.push(i)
    }

    expect(stack.getSize()).toBe(128)

    for (let i = 0; i < 80; i++) {
      stack.getTop()
    }
    expect(stack.getSize()).toBe(64)
    expect(stack.getCurrentPosition()).toBe(19)
    expect(stack.getTop()).toBe(19)
    expect(stack.getTop()).toBe(18)

    for (let i = 0; i < 15; i++) stack.getTop()

    expect(stack.getCompleteStack()).toBe("[1,2,3,undefined,undefined,undefined,undefined,undefined]")
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

import { describe, expect, test } from "vitest"
import { Queue } from "./Queue.ts"

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

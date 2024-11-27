import { MaxHeap, MinHeap } from "@shared/question-generators/heap/heapMinMax"
import Random from "@shared/utils/random"

/**
 * Generates a random unique list of numbers for heap operations foundation
 * and initializes the solution heap
 * @param random
 */
export function generateHeapOperationsFoundation({ random }: { random: Random }) {
  const heapType: "Max" | "Min" = random.choice(["Max", "Min"])
  const heapSize: number = random.int(5, 7)
  const heapElements: number[] = random.subset(
    Array.from({ length: 20 })
      .fill(0)
      .map((_, i) => i + 1),
    heapSize,
  )

  let solutionHeap: MaxHeap | MinHeap
  if (heapType === "Min") {
    solutionHeap = new MinHeap()
  } else {
    solutionHeap = new MaxHeap()
  }

  return {
    heapType,
    heapElements,
    solutionHeap,
  }
}

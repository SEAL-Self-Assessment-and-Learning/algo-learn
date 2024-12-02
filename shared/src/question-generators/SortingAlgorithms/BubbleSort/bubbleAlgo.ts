export type SortingOrder = "asc" | "des"

function shouldSwap(a: number, b: number, sortingOrder: SortingOrder): boolean {
  return sortingOrder === "asc" ? a > b : a < b
}

function swap(values: number[], index1: number, index2: number): void {
  const temp = values[index1]
  values[index1] = values[index2]
  values[index2] = temp
}

/**
 * Sorting values using Bubble Sort until sorted or specific number of rounds is reached.
 * @param values - numbers to be sorted
 * @param sortingOrder - either ascending or descending order
 * @param rounds - maximum number of iterations
 */
export function bubbleSort(values: number[], sortingOrder: SortingOrder, rounds: number = Infinity) {
  let roundCounter = 0
  let numberSwaps: number = 0
  const n = values.length

  for (let i = 0; i < n; i++) {
    if (roundCounter === rounds) return { values, numberSwaps }
    let swapped = false

    for (let j = 0; j < n - 1 - i; j++) {
      if (shouldSwap(values[j], values[j + 1], sortingOrder)) {
        swap(values, j, j + 1)
        swapped = true
        numberSwaps++
      }
    }

    roundCounter++
    if (!swapped) break
  }

  return { values, numberSwaps }
}

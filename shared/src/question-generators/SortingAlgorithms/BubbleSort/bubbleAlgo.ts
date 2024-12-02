export type SortingOrder = "asc" | "des"

export function bubbleSort(values: number[], sortingOrder: SortingOrder, rounds: number = Infinity) {
  let roundCounter = 0
  for (let i = 0; i < values.length; i++) {
    if (roundCounter === rounds) return values
    let swapped = false
    for (let j = 0; j < values.length - 1 - i; j++) {
      let flip = false
      if (sortingOrder === "asc") {
        if (values[j] > values[j + 1]) {
          flip = true
        }
      } else {
        if (values[j] < values[j + 1]) {
          flip = true
        }
      }
      if (flip) {
        // Swap the elements
        const tmp = values[j]
        values[j] = values[j + 1]
        values[j + 1] = tmp
        swapped = true
      }
    }
    roundCounter++
    if (!swapped) {
      break
    }
  }
  return values
}

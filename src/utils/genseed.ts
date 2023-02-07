export function genSeed(length = 7) {
  return Math.random()
    .toString(36)
    .slice(2, length + 2)
}

/**
 * Converts a matrix (only number[][]) to a **KaTeX** string
 * @param matrix The matrix to convert
 * @param align The alignment of the columns
 *              (l = left, r = right, c = center)
 */
export function matrixToTex(matrix: number[][], align: "l" | "r" | "c" = "c"): string {
  return `\\begin{pmatrix*}[${align}] ${matrix.map((row) => row.join(" & ")).join(" \\\\ ")} \\end{pmatrix*}`
}

/**
 * Converts a vector (only number[]) to a **KaTeX** string.
 * @param vector The vector to convert
 * @param align The alignment of the columns
 *              (l = left, r = right, c = center)
 */
export function vectorToTex(vector: number[], align: "l" | "r" | "c" = "c"): string {
  return `\\begin{pmatrix*}[${align}] ${vector.join(" \\\\ ")} \\end{pmatrix*}`
}

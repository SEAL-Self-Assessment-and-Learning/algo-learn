/**
 * Converts a matrix (only number[][]) to a **KaTeX** string
 * Used to display a matrix on the website
 * @param matrix The matrix to convert
 * @param align The alignment of the columns
 *              (l = left, r = right, c = center)
 */
export function matrixToTex(matrix: number[][], align: "l" | "r" | "c"): string {
  return `\\begin{pmatrix*}[${align}] ${matrix.map((row) => row.join(" & ")).join(" \\\\ ")} \\end{pmatrix*}`
}

/**
 * Converts a vector (only number[]) to a **KaTeX** string
 * Used to display a vector on the website
 * @param vector The vector to convert
 */
export function vectorToTex(vector: number[]): string {
  return `\\begin{pmatrix} ${vector.join(" \\\\ ")} \\end{pmatrix}`
}

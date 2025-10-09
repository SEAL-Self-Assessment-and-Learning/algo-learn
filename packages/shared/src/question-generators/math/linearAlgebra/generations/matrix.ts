import math from "@shared/utils/math.ts"
import type Random from "@shared/utils/random.ts"
import type { PrecisionValues } from "@shared/utils/random.ts"

/**
 * All different types of matrices that can be generated
 * for standard matrix usage
 *
 * *Not included: `CofactorMatrix`*
 */
type MatrixType =
  | "standard"
  | "identity"
  | "upperRightTriangle"
  | "upperLeftTriangle"
  | "lowerLeftTriangle"
  | "lowerRightTriangle"

/**
 * Generate a random matrix based on the given parameters
 * Randomly (weighted) chooses between different types of matrices
 * @param random
 * @param rows - number of rows **(for square matrices also the cols)**
 * @param cols - number of cols
 * @param min - minimum value for the matrix
 * @param max - maximum value for the matrix
 * @param precision - precision of the matrix values
 *                    (e.g., 0.25 --> 0.25, 0.5, 0.75, 1, 1.25, ...)
 * @param identity - weather the option for identity matrix should be included
 */
export function allRandomMatrix({
  random,
  rows,
  cols,
  min = -10,
  max = 10,
  precision = 1,
  identity = false,
}: {
  random: Random
  rows: number
  cols: number
  min?: number
  max?: number
  precision?: PrecisionValues
  identity?: boolean
}) {
  const matrixType: MatrixType = random.weightedChoice([
    ["standard", 0.45],
    ["identity", identity ? 0.05 : 0],
    ["upperRightTriangle", 0.125],
    ["lowerLeftTriangle", 0.125],
    ["lowerRightTriangle", 0.125],
    ["upperLeftTriangle", 0.125],
  ])
  switch (matrixType) {
    case "standard":
      return randomStandardMatrix({ random, rows, cols, min, max, precision })
    case "identity":
      return identityMatrix(rows)
    case "upperRightTriangle":
      return generateUpperRightTriangleMatrix({ random, size: rows, min, max, precision })
    case "lowerLeftTriangle":
      return generateLowerLeftTriangleMatrix({ random, size: rows, min, max, precision })
    case "lowerRightTriangle":
      return generateLowerRightTriangleMatrix({ random, size: rows, min, max, precision })
    case "upperLeftTriangle":
      return generateUpperLeftTriangleMatrix({ random, size: rows, min, max, precision })
  }
}

/**
 * Returns the identity matrix
 * @param size - matrix will be size x size
 */
export function identityMatrix(size: number): number[][] {
  return Array.from({ length: size }, (_, i) => {
    return Array.from({ length: size }, (_, j) => (i === j ? 1 : 0))
  })
}

/**
 * Generate a random matrix with the given parameters
 * @param random
 * @param rows - number of rows
 * @param cols - number of cols
 * @param min - minimum value
 * @param max - maximum value
 * @param precision - precision of the matrix values
 */
export function randomStandardMatrix({
  random,
  rows,
  cols,
  min = -10,
  max = 10,
  precision = 1,
}: {
  random: Random
  rows: number
  cols: number
  min?: number
  max?: number
  precision?: PrecisionValues
}) {
  const matrix = []
  for (let i = 0; i < rows; i++) {
    const row = []
    for (let j = 0; j < cols; j++) {
      row.push(random.floatPrecision(min, max, precision))
    }
    matrix.push(row)
  }
  return matrix
}

/**
 * Generate a random upper right triangular matrix
 * @param random
 * @param size - size of the square matrix
 * @param min - minimum value
 * @param max - maximum value
 * @param precision - precision of the matrix values
 */
export function generateUpperRightTriangleMatrix({
  random,
  size,
  min = -10,
  max = 10,
  precision = 1,
}: {
  random: Random
  size: number
  min?: number
  max?: number
  precision?: PrecisionValues
}) {
  const matrix = []
  for (let i = 0; i < size; i++) {
    const row = []
    for (let j = 0; j < size; j++) {
      if (j <= i) {
        row.push(random.floatPrecision(min, max, precision))
      } else {
        row.push(0)
      }
    }
    matrix.push(row)
  }
  return matrix
}

/**
 * Generate a random lower left triangular matrix
 * by rotating the upper right triangular matrix
 * @param random
 * @param size - size of the square matrix
 * @param min - minimum value
 * @param max - maximum value
 * @param precision - precision of the matrix values
 */
export function generateLowerLeftTriangleMatrix({
  random,
  size,
  min = -10,
  max = 10,
  precision = 1,
}: {
  random: Random
  size: number
  min?: number
  max?: number
  precision?: PrecisionValues
}) {
  const mat = generateUpperRightTriangleMatrix({ random, size, min, max, precision })
  return math.transpose(mat)
}

/**
 * Generate a random lower right triangular matrix
 * @param random
 * @param size - size of the square matrix
 * @param min - minimum value
 * @param max - maximum value
 * @param precision - precision of the matrix values
 */
export function generateLowerRightTriangleMatrix({
  random,
  size,
  min = -10,
  max = 10,
  precision = 1,
}: {
  random: Random
  size: number
  min?: number
  max?: number
  precision?: PrecisionValues
}) {
  // Generate an upper triangular matrix
  const upperMat = generateUpperRightTriangleMatrix({ random, size, min, max, precision })
  // Rotate the matrix 90 degrees clockwise to make it lower right triangular
  return Array.from({ length: size }, (_, i) =>
    Array.from({ length: size }, (_, j) => upperMat[size - j - 1][i]),
  )
}

/**
 * Generate a random upper left triangular matrix
 * @param random
 * @param size - size of the square matrix
 * @param min - minimum value
 * @param max - maximum value
 * @param precision - precision of the matrix values
 */
export function generateUpperLeftTriangleMatrix({
  random,
  size,
  min = -10,
  max = 10,
  precision = 1,
}: {
  random: Random
  size: number
  min?: number
  max?: number
  precision?: PrecisionValues
}) {
  // Generate an upper triangular matrix
  const upperMat = generateUpperRightTriangleMatrix({ random, size, min, max, precision })
  // Flip the matrix horizontally to make it upper-left triangular
  return upperMat.map((row) => row.reverse())
}

/**
 * This generates a random matrix, where its easy to compute the determinant
 * using the cofactor expansion method.
 *
 * Todo: Improve this to be more random and less deterministic
 *
 * @param random
 * @param size - size of the square matrix
 * @param min - minimum value
 * @param max - maximum value
 */
export function generateGoodCofactorMatrix({
  random,
  size,
  min = -10,
  max = 10,
}: {
  random: Random
  size: number
  min?: number
  max?: number
}) {
  if (size <= 3) {
    throw new Error("Size must be at least 4. Use Sarrus for smaller sizes.")
  }

  const manipulationCount = size - 3
  const manipulationTargets: ("row" | "col")[] = []
  // Define which rows or columns to manipulate
  for (let i = 0; i < manipulationCount; i++) {
    manipulationTargets.push(random.choice(["row", "col"]))
  }
  // Determine which rows and columns will be manipulated
  const manipulatedRows = random.subset(random.shuffle([...Array(size).keys()]), manipulationCount)
  const manipulatedCols = random.subset(random.shuffle([...Array(size).keys()]), manipulationCount)

  // Generate initial matrix
  const matrix = randomStandardMatrix({
    random,
    rows: size,
    cols: size,
    min,
    max,
  })

  // Manipulate the matrix by zeroing out rows/columns except for specific indices
  for (let i = 0; i < manipulationCount; i++) {
    const rowToManipulate = manipulatedRows[i]
    const colToManipulate = manipulatedCols[i]
    const manipulationType = manipulationTargets[i]
    const value = random.bool() ? random.int(min, -1) : random.int(1, max)
    // Apply row or column manipulation
    zeroOutExceptIndex(matrix, rowToManipulate, colToManipulate, manipulationType, value)
  }

  return matrix
}

/**
 * In-Place helper function to zero out values in rows or columns
 * @param matrix
 * @param rowIndex - index in row that shouldn't be changed
 * @param colIndex - index in col that shouldn't be changed
 * @param target - zero out all values in col or row
 * @param value - value to be at the specified location
 */
function zeroOutExceptIndex(
  matrix: number[][],
  rowIndex: number,
  colIndex: number,
  target: "row" | "col",
  value: number,
) {
  if (target === "row") {
    for (let j = 0; j < matrix.length; j++) {
      matrix[rowIndex][j] = j === colIndex ? value : 0
    }
  } else {
    for (let i = 0; i < matrix.length; i++) {
      matrix[i][colIndex] = i === rowIndex ? value : 0
    }
  }
}

/**
 * Generates a matrix A given a vector x and b
 * such that **Ax = b**.
 *
 * The b vector adjusts to match the condition
 * (such that more user-friendly values are possible)
 *
 * Given [min, max], the matrix values may be greater/smaller to satisfy the condition.
 * B may be outside the range of [min, max] too.
 *
 * @NotUsed: This is currently not used, but might be useful in future questions
 *
 * @param random
 * @param x - vector x
 * @param b - vector b
 * @param min - minimum value for the matrix
 * @param max - maximum value for the matrix
 * @param precision - precision of the matrix values
 */
export function generateAforAxEqualsB({
  random,
  x,
  b,
  min = -10,
  max = 10,
  precision = 1,
}: {
  random: Random
  x: number[]
  b: number[]
  min?: number
  max?: number
  precision?: PrecisionValues
}) {
  const n = x.length
  const positiveX = x.map((value) => Math.abs(value)).sort()
  const minPositiveX = positiveX.find((value) => value > 0) ?? -1
  const A: number[][] = []
  const updatedB: number[] = []

  for (let k = 0; k < n; k++) {
    // initialize a with random values within [min, max]
    const a = Array.from({ length: n }, () => random.floatPrecision(min, max, precision))

    // Adjust 'a' until it satisfies the condition a*x approx b[k]
    while (math.dot(x, a) > b[k] + minPositiveX || math.dot(x, a) < b[k] - minPositiveX) {
      // goal is to find a such that this is 0
      const currentDistance = math.dot(x, a) - b[k]

      // Adjust 'a' by changing the component corresponding to the largest absolute value in x
      for (let i = 0; i < n; i++) {
        const cpv = positiveX[n - i - 1]
        if (cpv < Math.abs(currentDistance)) {
          const cpvIndex = x.findIndex((value) => value === cpv || value === -cpv)
          // Adjust the relevant component of 'a' based on the direction of the distance
          if (currentDistance > 0) {
            a[cpvIndex] -= x[cpvIndex] > 0 ? precision : -precision
          } else {
            a[cpvIndex] += x[cpvIndex] > 0 ? precision : -precision
          }
          break
        }
      }
    }

    A.push(a)
    updatedB.push(math.dot(x, a))
  }

  return { A, updatedB }
}

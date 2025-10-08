/**
 * This type indicates the props that are needed to display a matrix input.
 * @param rows The number of rows for the matrix.
 * @param cols The number of columns for the matrix.
 * @param name The name of the matrix. (e.g., A)
 * @param elementOf The element of the matrix. (e.g., \\in \\mathbb{N}^{3 \\times 1})
 * @param fieldIDs The IDs for each input-field that should be displayed.
 */
export type MatrixInputProps = {
  rows: number
  cols: number
  name?: string
  elementOf?: string
  inputFields: { [key: string]: string }
}

/**
 * This function creates a matrix input and returns it in a code block.
 * Also returns the fieldIDs for each input-field.
 * @param rows The number of rows for the matrix.
 * @param cols The number of columns for the matrix.
 * @param name The name of the matrix. (e.g., A)
 * @param elementOf The element of the matrix. (e.g., \\in \\mathbb{N}^{3 \\times 1})
 */
export function createMatrixInput({
  rows,
  cols,
  name,
  elementOf,
}: {
  rows: number
  cols: number
  name?: string
  elementOf?: string
}) {
  if (rows < 1 || cols < 1) throw new Error("Rows and cols both have to be at least 1.")
  // input field type: {{id#style#prompt#placeholder#checkformat}}
  const inputFields: { [key: string]: string } = {}
  const fieldIDs: string[][] = []
  for (let i = 0; i < rows; i++) {
    const row: string[] = []
    for (let j = 0; j < cols; j++) {
      const id = `x_${i}_${j}`
      row.push(id)
      inputFields[id] = `{{${id}#MAT###overlay}}`
    }
    fieldIDs.push(row)
  }
  const matrixInputProps: MatrixInputProps = {
    rows,
    cols,
    name,
    elementOf,
    inputFields,
  }
  const matrixInput = `
\`\`\`matrixInput
${JSON.stringify(matrixInputProps)}
\`\`\`
`
  return { matrixInput, fieldIDs }
}

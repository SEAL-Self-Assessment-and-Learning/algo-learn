/**
 * @param variables from left to right each row 0...000, 0...001, 0...010 aso
 * @param valuesHeader e.g. \\varPhi or expr.toString()
 * @param values each cell value below valuesHeader (either input field or already evaluated function)
 * @param inFeedbackPart to show inside main question or in the feedback component
 */
export type TruthTableProps = {
  variables: string[]
  valuesHeader: string[]
  values: string[][]
  inFeedbackPart?: boolean
}

/**
 * Creates n input-field-IDs and n input-fields to provide to a truth table
 * Those input-fields are already with correct classes aso
 * @param numberOfFields
 */
export function createTruthTableInputFields(numberOfFields: number) {
  const fieldIDs: string[] = []
  const inputFields: string[] = []
  for (let i = 0; i < numberOfFields; i++) {
    fieldIDs.push("truthInput-" + i)
    inputFields.push(`{{${fieldIDs[i]}#TTABLE###overlay}}`)
  }
  return { fieldIDs, inputFields }
}

/**
 * See @TruthTableProps
 */
export function createTruthTableProps({
  variables,
  valuesHeader,
  values,
  inFeedbackPart = false,
}: {
  variables: string[]
  valuesHeader: string[]
  values: string[][]
  inFeedbackPart?: boolean
}): string {
  const truthTableProps: TruthTableProps = {
    variables,
    valuesHeader,
    values,
    inFeedbackPart,
  }
  return `
\`\`\`truthTable
${JSON.stringify(truthTableProps)}
\`\`\`
  `
}

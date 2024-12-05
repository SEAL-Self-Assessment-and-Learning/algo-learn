// Todo: add documentation
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
 * Todo: add documentation
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

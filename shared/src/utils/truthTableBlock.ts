export type InputTruthTableProps = { fields: string[]; name: string; vars: string[] }
export type FunctionTruthTableProps = { func: string; alternativeName?: string }

/** Either a propositional logic function or a list of input fields */
export type TruthTableProps = {
  functions: (FunctionTruthTableProps | InputTruthTableProps)[]
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
 * Creates a stringified object to parse via Markdown to use a TruthTable
 * Please provide function already as function.toString()
 * @param functions
 */
export function createTruthTableProps({
  functions,
}: {
  functions: (FunctionTruthTableProps | InputTruthTableProps)[]
}): string {
  const truthTableProps: TruthTableProps = {
    functions,
  }
  return `
\`\`\`truthTable
${JSON.stringify(truthTableProps)}
\`\`\`
  `
}

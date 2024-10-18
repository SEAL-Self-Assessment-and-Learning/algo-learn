export type InputTruthTableProps = { fields: string[]; name: string }
export type FunctionTruthTableProps = { func: string; alternativeName?: string }

/** Either a propositional logic function or a list of input fields */
export type TruthTableProps = {
  functions: (FunctionTruthTableProps | InputTruthTableProps)[]
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

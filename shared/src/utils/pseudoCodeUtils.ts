export type PseudoCodeString = Array<
  string | PseudoCodeVariable | PseudoCodeFunctionName | PseudoCodePrintString
>

export type PseudoCodeVariable = { variable: string }
export type PseudoCodeFunctionName = { functionName: string }
export type PseudoCodePrintString = { printString: string }

export type PseudoCodePrint = { print: PseudoCodeString }
export type PseudoCodeCall = { functionName: string; args: Array<PseudoCodeString> }
// return as it, is a keyword in TS
export type PseudoCodeReturn = { returnValue: PseudoCodeString }

export type PseudoCodeBreak = { breakState: true }
export type PseudoCodeContinue = { continueState: true }
// export type PseudoCodeTrue = { true: true }
// export type PseudoCodeFalse = { false: true }

export type PseudoCodeAssignment = { assignment: string; value: PseudoCodeString }

// then should not be null
// only provided for straight forward creation of pseudoCode
export type PseudoCodeIf = {
  if: {
    condition: PseudoCodeString
    then: PseudoCodeState | PseudoCodeBlock | null
    elseif?: Array<{
      condition: PseudoCodeString
      then: PseudoCodeState | PseudoCodeBlock
    }>
    else?: PseudoCodeState | PseudoCodeBlock | null
  }
}

export type PseudoCodeWhile = {
  while: {
    condition: PseudoCodeString
    do: PseudoCodeState | PseudoCodeBlock | null
  }
}

export type PseudoCodeFor = {
  for: {
    variable: string
    from: PseudoCodeString
    to: PseudoCodeString
    do: PseudoCodeState | PseudoCodeBlock | null
  }
}

export type PseudoCodeForAll = {
  forAll: {
    variable: string
    set: PseudoCodeString
    do: PseudoCodeState | PseudoCodeBlock | null
  }
}

// only if providing a string, provide color
// all the other states have coloring themselves
export type PseudoCodeState = {
  state:
    | PseudoCodeString
    | PseudoCodePrint
    | PseudoCodeReturn
    | PseudoCodeContinue
    | PseudoCodeBreak
    | PseudoCodeCall
    | PseudoCodeAssignment
}
export type PseudoCodeBlock = {
  block: Array<PseudoCodeState | PseudoCodeIf | PseudoCodeWhile | PseudoCodeFor | PseudoCodeForAll>
}

export type PseudoCodeFunction = {
  name: string
  args: Array<string>
  body: PseudoCodeState | PseudoCodeBlock | null
}

export type PseudoCode = Array<PseudoCodeFunction | PseudoCodeBlock | PseudoCodeState>

export function printStarsNew(stars: number): PseudoCodeState {
  const printStarsString: PseudoCodePrint = {
    print: [{ printString: `\\texttt{${"*".repeat(stars)}}` }],
  }
  return { state: printStarsString }
}

export function stringifyPseudoCode(pseudoCode: PseudoCode): string {
  let result = "```pseudoCode\n"
  result += JSON.stringify(pseudoCode)
  result += "\n```\n"
  return result
}

/*
This package works, so we could use this for coloring the pseudocode
https://www.w3schools.com/tags/ref_colornames.asp
*/

export const keyWordsColor = "DarkOrchid"
export const functionColor = "DarkCyan"
export const variableColor = "IndianRed"
export const controlFlowColor = "SeaGreen"
export const printStatementColor = "Orange"

export type PseudoCodePrint = { print: string; printColor?: string }
export type PseudoCodeCall = { functionName: string; args: Array<string>; colorArgs?: Array<string> }
// return as it is a keyword in TS
export type PseudoCodeReturn = { returnValue: string; returnValueColor?: string }

export type PseudoCodeBreak = { breakState: true }
export type PseudoCodeContinue = { continueState: true }
// export type PseudoCodeTrue = { true: true }
// export type PseudoCodeFalse = { false: true }

export type PseudoCodeAssignment = { variable: string; value: string }

export type PseudoCodeIf = {
  if: {
    condition: string
    conditionColor?: string
    then: PseudoCodeState | PseudoCodeBlock | null
    else?: PseudoCodeState | PseudoCodeBlock | null
  }
}

export type PseudoCodeWhile = {
  while: {
    condition: string
    conditionColor?: string
    do: PseudoCodeState | PseudoCodeBlock | null
  }
}

export type PseudoCodeFor = {
  for: {
    variable: string
    from: string
    to: string
    toColor?: string
    step: string
    do: PseudoCodeState | PseudoCodeBlock | null
  }
}

export type PseudoCodeForAll = {
  forAll: {
    variable: string
    set: string
    setColor?: string
    do: PseudoCodeState | PseudoCodeBlock | null
  }
}

// only if providing a string, provide color
// all the other states have coloring themselves
export type PseudoCodeState = {
  state:
    | string
    | PseudoCodePrint
    | PseudoCodeReturn
    | PseudoCodeContinue
    | PseudoCodeBreak
    | PseudoCodeCall
    | PseudoCodeAssignment
  stateColor?: string
}
export type PseudoCodeBlock = {
  block: Array<
    PseudoCodeState | PseudoCodeBlock | PseudoCodeIf | PseudoCodeWhile | PseudoCodeFor | PseudoCodeForAll
  >
}

export type PseudoCodeFunction = {
  name: string
  args: Array<string>
  body: PseudoCodeState | PseudoCodeBlock | null
}

export type PseudoCode = Array<PseudoCodeFunction | PseudoCodeBlock | PseudoCodeState>

export function pseudoCodeToString(pseudoCode: PseudoCode): string {
  let pseudoCodeString: string = ""
  let pseudoCodeStringColor: string = ""
  for (const code of pseudoCode) {
    if ("state" in code) {
      const { stateString, stateStringColor } = pseudoCodeStateToString(code)
      pseudoCodeString += stateString + "\n"
      pseudoCodeStringColor += stateStringColor + "\n"
    } else if ("block" in code) {
      const { blockString, blockStringColor } = pseudoCodeBlockToString(code, 0)
      pseudoCodeString += blockString + "\n"
      pseudoCodeStringColor += blockStringColor + "\n"
    } else if ("name" in code) {
      const { functionString, functionStringColor } = pseudoCodeFunctionToString(code, 0)
      pseudoCodeString += functionString + "\n"
      pseudoCodeStringColor += functionStringColor + "\n"
    }
  }

  pseudoCodeString = pseudoCodeString
    .split("\n")
    .filter((line) => line.trim() !== "")
    .join("\n")

  pseudoCodeStringColor = pseudoCodeStringColor
    .split("\n")
    .filter((line) => line.trim() !== "")
    .join("\n")

  return pseudoCodeString.trim() + "\n## ## ## ## ##\n" + pseudoCodeStringColor.trim()
}

function pseudoCodeFunctionToString(
  func: PseudoCodeFunction,
  indent: number,
): { functionString: string; functionStringColor: string } {
  let functionString =
    leadingWhitespace(indent) +
    `\\textbf{function}\\text{ }\\textit{${func.name}}\\text{ }(${func.args.join(",\\text{ }")}):\n`
  let functionStringColor =
    leadingWhitespace(indent) +
    `{\\color{${keyWordsColor}} \\textbf{function}}\\text{ }{\\color{${functionColor}} \\textit{${func.name}}}\\text{ }({\\color{${variableColor}}${func.args.join(`}{\\color{${variableColor}},\\text{ }`)}}):\n`
  if (func.body) {
    if ("state" in func.body) {
      const { stateString, stateStringColor } = pseudoCodeStateToString(func.body)
      functionString += stateString + "\n"
      functionStringColor += stateStringColor + "\n"
    } else if ("block" in func.body) {
      const { blockString, blockStringColor } = pseudoCodeBlockToString(func.body, indent + 2)
      functionString += blockString + "\n"
      functionStringColor += blockStringColor + "\n"
    }
  }
  return { functionString, functionStringColor }
}

function pseudoCodeBlockToString(
  block: PseudoCodeBlock,
  indent: number,
): { blockString: string; blockStringColor: string } {
  let blockStringAdd = ""
  let blockStringAddColor = ""
  for (const state of block.block) {
    if ("state" in state) {
      const { stateString, stateStringColor } = pseudoCodeStateToString(state)
      blockStringAdd += leadingWhitespace(indent) + stateString + "\n"
      blockStringAddColor += leadingWhitespace(indent) + stateStringColor + "\n"
    } else if ("block" in state) {
      const { blockString, blockStringColor } = pseudoCodeBlockToString(state, indent)
      blockStringAdd += blockString + "\n"
      blockStringAddColor += blockStringColor + "\n"
    } else if ("if" in state) {
      const { ifString, ifStringColor } = pseudoCodeIfToString(state, indent)
      blockStringAdd += ifString + "\n"
      blockStringAddColor += ifStringColor + "\n"
    } else if ("while" in state) {
      const { whileString, whileStringColor } = pseudoCodeWhileToString(state, indent)
      blockStringAdd += whileString + "\n"
      blockStringAddColor += whileStringColor + "\n"
    } else if ("for" in state) {
      const { forString, forStringColor } = pseudoCodeForToString(state, indent)
      blockStringAdd += forString + "\n"
      blockStringAddColor += forStringColor + "\n"
    } else if ("forAll" in state) {
      const { forAllString, forAllStringColor } = pseudocodeForAllToString(state, indent)
      blockStringAdd += forAllString + "\n"
      blockStringAddColor += forAllStringColor + "\n"
    }
  }
  return { blockString: blockStringAdd, blockStringColor: blockStringAddColor }
}

function pseudoCodeIfToString(
  ifState: PseudoCodeIf,
  indent: number,
): { ifString: string; ifStringColor: string } {
  let ifString =
    leadingWhitespace(indent) + `\\textbf{if }\\text{ }${ifState.if.condition}\\text{ }\\textbf{then}\n`
  let ifStringColor =
    leadingWhitespace(indent) +
    `{\\color{${keyWordsColor}} \\textbf{if }}\\text{ }${ifState.if.conditionColor ? ifState.if.conditionColor : ifState.if.condition}\\text{ }{\\color{${keyWordsColor}} \\textbf{then}}\n`
  if (ifState.if.then) {
    if ("state" in ifState.if.then) {
      const { stateString, stateStringColor } = pseudoCodeStateToString(ifState.if.then)
      ifString += leadingWhitespace(indent + 2) + stateString + "\n"
      ifStringColor += leadingWhitespace(indent + 2) + stateStringColor + "\n"
    } else if ("block" in ifState.if.then) {
      const { blockString, blockStringColor } = pseudoCodeBlockToString(ifState.if.then, indent + 2)
      ifString += blockString + "\n"
      ifStringColor += blockStringColor + "\n"
    }
  }
  if (ifState.if.else) {
    ifString += leadingWhitespace(indent) + `\\textbf{else}\n`
    ifStringColor += leadingWhitespace(indent) + `{\\color{${keyWordsColor}} \\textbf{else }}\n`
    if (ifState.if.else !== undefined && "state" in ifState.if.else) {
      const { stateString, stateStringColor } = pseudoCodeStateToString(ifState.if.else)
      ifString += leadingWhitespace(indent + 2) + stateString + "\n"
      ifStringColor += leadingWhitespace(indent + 2) + stateStringColor + "\n"
    } else if (ifState.if.else !== undefined && "block" in ifState.if.else) {
      const { blockString, blockStringColor } = pseudoCodeBlockToString(ifState.if.else, indent + 2)
      ifString += blockString + "\n"
      ifStringColor += blockStringColor + "\n"
    }
  }
  return { ifString, ifStringColor }
}

function pseudoCodeWhileToString(
  whileState: PseudoCodeWhile,
  indent: number,
): { whileString: string; whileStringColor: string } {
  let whileString =
    leadingWhitespace(indent) +
    `\\textbf{while}\\text{ }${whileState.while.condition}\\text{ }\\textbf{do}\n`
  let whileStringColor =
    leadingWhitespace(indent) +
    `{\\color{${keyWordsColor}}\\textbf{while}}\\text{ }${whileState.while.conditionColor ? whileState.while.conditionColor : whileState.while.condition}\\text{ }{\\color{${keyWordsColor}} \\textbf{do}}\n`
  if (whileState.while.do) {
    if ("state" in whileState.while.do) {
      const { stateString, stateStringColor } = pseudoCodeStateToString(whileState.while.do)
      whileString += leadingWhitespace(indent + 2) + stateString + "\n"
      whileStringColor += leadingWhitespace(indent + 2) + stateStringColor + "\n"
    } else if ("block" in whileState.while.do) {
      const { blockString, blockStringColor } = pseudoCodeBlockToString(whileState.while.do, indent + 2)
      whileString += blockString + "\n"
      whileStringColor += blockStringColor + "\n"
    }
  }
  return { whileString, whileStringColor }
}

function pseudoCodeForToString(
  forState: PseudoCodeFor,
  indent: number,
): { forString: string; forStringColor: string } {
  let forString =
    leadingWhitespace(indent) +
    `\\textbf{for}\\text{ }${forState.for.variable}\\text{ }\\textbf{from}\\text{ }${forState.for.from}\\text{ }\\textbf{to}\\text{ }${forState.for.to}`
  let forStringColor =
    leadingWhitespace(indent) +
    `{\\color{${keyWordsColor}} \\textbf{for}}\\text{ }{\\color{${variableColor}}${forState.for.variable}}\\text{ }{\\color{${keyWordsColor}} \\textbf{from}}\\text{ }${forState.for.from}\\text{ }{\\color{${keyWordsColor}} \\textbf{to}}\\text{ }${forState.for.toColor ? forState.for.toColor : forState.for.to}`
  if (forState.for.step) {
    forString += `\\text{ }\\textbf{with step}\\text{ }${forState.for.step}\\text{ }\\textbf{do}\n`
    forStringColor += `\\text{ }{\\color{${keyWordsColor}}\\textbf{with step}}\\text{ }${forState.for.step}\\text{ }{\\color{${keyWordsColor}} \\textbf{do}}\n`
  } else {
    forString += `\\text{ }\\textbf{do}\n`
    forStringColor += `\\text{ }{\\color{${keyWordsColor}} \\textbf{do}}\n`
  }
  if (forState.for.do) {
    if ("state" in forState.for.do) {
      const { stateString, stateStringColor } = pseudoCodeStateToString(forState.for.do)
      forString += leadingWhitespace(indent + 2) + stateString + "\n"
      forStringColor += leadingWhitespace(indent + 2) + stateStringColor + "\n"
    } else if ("block" in forState.for.do) {
      const { blockString, blockStringColor } = pseudoCodeBlockToString(forState.for.do, indent + 2)
      forString += blockString + "\n"
      forStringColor += blockStringColor + "\n"
    }
  }
  return { forString, forStringColor }
}

function pseudocodeForAllToString(
  forAllState: PseudoCodeForAll,
  indent: number,
): { forAllString: string; forAllStringColor: string } {
  let forAllString =
    leadingWhitespace(indent) +
    `\\textbf{for}\\text{ }${forAllState.forAll.variable} \\in ${forAllState.forAll.set}\\text{ }\\textbf{then}\n`
  let forAllStringColor =
    leadingWhitespace(indent) +
    `{\\color{${keyWordsColor}}\\textbf{for}}\\text{ }{\\color{${variableColor}} ${forAllState.forAll.variable}} \\in ${forAllState.forAll.setColor ? forAllState.forAll.setColor : forAllState.forAll.set}\\text{ }{\\color{${keyWordsColor}}\\textbf{do}}\n`
  if (forAllState.forAll.do) {
    if ("state" in forAllState.forAll.do) {
      const { stateString, stateStringColor } = pseudoCodeStateToString(forAllState.forAll.do)
      forAllString += leadingWhitespace(indent + 2) + stateString + "\n"
      forAllStringColor += leadingWhitespace(indent + 2) + stateStringColor + "\n"
    } else if ("block" in forAllState.forAll.do) {
      const { blockString, blockStringColor } = pseudoCodeBlockToString(
        forAllState.forAll.do,
        indent + 2,
      )
      forAllString += blockString + "\n"
      forAllStringColor += blockStringColor + "\n"
    }
  }
  return { forAllString, forAllStringColor }
}

function pseudoCodeStateToString(state: PseudoCodeState): {
  stateString: string
  stateStringColor: string
} {
  let stateString = ""
  let stateStringColor = ""
  if (typeof state.state === "string") {
    stateString += state.state
    stateStringColor += state.stateColor ? state.stateColor : state.state
  } else if ("print" in state.state) {
    const { printNormal, printColor } = pseudoCodePrintToString(state.state)
    stateString += printNormal
    stateStringColor += printColor
  } else if ("returnValue" in state.state) {
    const { returnNormal, returnColor } = pseudoCodeReturnToString(state.state)
    stateString += returnNormal
    stateStringColor += returnColor
  } else if ("continueState" in state.state) {
    const { continueNormal, continueColor } = pseudoCodeContinueToString()
    stateString += continueNormal
    stateStringColor += continueColor
  } else if ("breakState" in state.state) {
    const { breakNormal, breakColor } = pseudoCodeBreakToString()
    stateString += breakNormal
    stateStringColor += breakColor
  } else if ("functionName" in state.state) {
    const { callNormal, callColor } = pseudoCodeCallToString(state.state)
    stateString += callNormal
    stateStringColor += callColor
  } else if ("variable" in state.state) {
    const { assignmentNormal, assignmentColor } = pseudoCodeAssignmentToString(state.state)
    stateString += assignmentNormal
    stateStringColor += assignmentColor
  }
  return { stateString, stateStringColor }
}

function pseudoCodeAssignmentToString(assignment: PseudoCodeAssignment): {
  assignmentNormal: string
  assignmentColor: string
} {
  const assignmentNormal = `${assignment.variable}\\longleftarrow${assignment.value}`
  const assignmentColor = `{\\color{${variableColor}}${assignment.variable}}\\longleftarrow${assignment.value}`
  return { assignmentNormal, assignmentColor }
}

function pseudoCodePrintToString(print: PseudoCodePrint): { printNormal: string; printColor: string } {
  const printNormal = `\\text{print}(${print.print})`
  const printColor = `{\\color{${controlFlowColor}} \\text{print}}(${print.printColor ? print.printColor : print.print})`
  return { printNormal, printColor }
}

function pseudoCodeReturnToString(returnState: PseudoCodeReturn): {
  returnNormal: string
  returnColor: string
} {
  const returnNormal = `\\textbf{return}\\text{ }${returnState.returnValue}`
  const returnColor = `{\\color{${controlFlowColor}} \\textbf{return}}\\text{ }${returnState.returnValueColor ? returnState.returnValueColor : returnState.returnValue}`
  return { returnNormal, returnColor }
}

function pseudoCodeContinueToString(): { continueNormal: string; continueColor: string } {
  const continueNormal = "\\textbf{continue}"
  const continueColor = `{\\color{${controlFlowColor}} \\textbf{continue}}`
  return { continueNormal, continueColor }
}

function pseudoCodeBreakToString(): { breakNormal: string; breakColor: string } {
  const breakNormal = "\\textbf{break}"
  const breakColor = `{\\color{${controlFlowColor}} \\textbf{break}}`
  return { breakNormal, breakColor }
}

function pseudoCodeCallToString(call: PseudoCodeCall): { callNormal: string; callColor: string } {
  const callNormal = `\\textit{${call.functionName} }(${call.args.join(", ")})`
  let callColor: string
  if (call.colorArgs) {
    callColor = `{\\color{${functionColor}} \\textit{${call.functionName} }}(${call.colorArgs.join(`, `)})`
  } else {
    callColor = `{\\color{${functionColor}} \\textit{${call.functionName} }}(${call.args.join(`, `)})`
  }
  return { callNormal, callColor }
}

function leadingWhitespace(indent: number): string {
  return " ".repeat(indent)
}

export function printStarsNew(stars: number): PseudoCodeState {
  const printStarsString: PseudoCodePrint = {
    print: `\\texttt{${"*".repeat(stars)}}`,
    printColor: `{\\color{${printStatementColor}} \\texttt{${"*".repeat(stars)}}}`,
  }
  return { state: printStarsString }
}

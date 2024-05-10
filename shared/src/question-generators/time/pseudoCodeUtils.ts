export type PseudoCodePrint = { print: string }
export type PseudoCodeCall = { functionName: string; args: Array<string> }
// return as it is a keyword in TS
export type PseudoCodeReturn = { returnValue: string }

export type PseudoCodeBreak = { break: true }
export type PseudoCodeContinue = { continue: true }
export type PseudoCodeTrue = { true: true }
export type PseudoCodeFalse = { false: true }

export type PseudoCodeAssignment = { variable: string; value: string }

export type PseudoCodeIf = {
  if: {
    condition: string
    then: PseudoCodeState | PseudoCodeBlock | null
    else?: PseudoCodeState | PseudoCodeBlock | null
  }
}

export type PseudoCodeWhile = {
  while: {
    condition: string
    do: PseudoCodeState | PseudoCodeBlock | null
  }
}

export type PseudoCodeFor = {
  for: {
    variable: string
    from: string
    to: string
    step: string
    do: PseudoCodeState | PseudoCodeBlock | null
  }
}

export type PseudoCodeForAll = {
  forAll: {
    variable: string
    set: string
    do: PseudoCodeState | PseudoCodeBlock | null
  }
}

export type PseudoCodeState = {
  state:
    | string
    | PseudoCodePrint
    | PseudoCodeReturn
    | PseudoCodeContinue
    | PseudoCodeBreak
    | PseudoCodeCall
    | PseudoCodeAssignment
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
  for (const code of pseudoCode) {
    if ("state" in code) {
      pseudoCodeString += pseudoCodeStateToString(code) + "\n"
    } else if ("block" in code) {
      pseudoCodeString += pseudoCodeBlockToString(code, 0) + "\n"
    } else if ("name" in code) {
      pseudoCodeString += pseudoCodeFunctionToString(code, 0) + "\n"
    }
  }

  pseudoCodeString = pseudoCodeString
    .split("\n")
    .filter((line) => line.trim() !== "")
    .join("\n")
  return pseudoCodeString.trim()
}

function pseudoCodeFunctionToString(func: PseudoCodeFunction, indent: number): string {
  let functionString =
    leadingWhitespace(indent) +
    `\\textbf{function}\\text{ }\\textit{${func.name}}(${func.args.join(",\\text{ }")}):\n`
  if (func.body) {
    if ("state" in func.body) {
      functionString += pseudoCodeStateToString(func.body) + "\n"
    } else if ("block" in func.body) {
      functionString += pseudoCodeBlockToString(func.body, indent + 2) + "\n"
    }
  }
  return functionString
}

function pseudoCodeBlockToString(block: PseudoCodeBlock, indent: number): string {
  let blockString = ""
  for (const state of block.block) {
    if ("state" in state) {
      blockString += leadingWhitespace(indent) + pseudoCodeStateToString(state) + "\n"
    } else if ("block" in state) {
      blockString += pseudoCodeBlockToString(state, indent) + "\n"
    } else if ("if" in state) {
      blockString += pseudoCodeIfToString(state, indent) + "\n"
    } else if ("while" in state) {
      blockString += pseudoCodeWhileToString(state, indent) + "\n"
    } else if ("for" in state) {
      blockString += pseudoCodeForToString(state, indent) + "\n"
    } else if ("forAll" in state) {
      blockString += pseudocodeForAllToString(state, indent) + "\n"
    }
  }
  return blockString
}

function pseudoCodeIfToString(ifState: PseudoCodeIf, indent: number): string {
  let ifString =
    leadingWhitespace(indent) + `\\textbf{if }\\text{ }${ifState.if.condition}\\text{ }\\textbf{then}\n`
  if (ifState.if.then) {
    if ("state" in ifState.if.then) {
      ifString += leadingWhitespace(indent + 2) + pseudoCodeStateToString(ifState.if.then) + "\n"
    } else if ("block" in ifState.if.then) {
      ifString += pseudoCodeBlockToString(ifState.if.then, indent + 2) + "\n"
    }
  }
  if (ifState.if.else) {
    if (ifState.if.else !== undefined && "state" in ifState.if.else) {
      ifString += leadingWhitespace(indent) + `\\textbf{else}\n`
      ifString += leadingWhitespace(indent + 2) + pseudoCodeStateToString(ifState.if.else) + "\n"
    } else if (ifState.if.else !== undefined && "block" in ifState.if.else) {
      ifString += leadingWhitespace(indent) + `\\textbf{else}\n`
      ifString += pseudoCodeBlockToString(ifState.if.else, indent + 2) + "\n"
    }
  }
  return ifString
}

function pseudoCodeWhileToString(whileState: PseudoCodeWhile, indent: number): string {
  let whileString =
    leadingWhitespace(indent) +
    `\\textbf{while}\\text{ }${whileState.while.condition}\\text{ }\\textbf{do}\n`
  if (whileState.while.do) {
    if ("state" in whileState.while.do) {
      whileString += leadingWhitespace(indent + 2) + pseudoCodeStateToString(whileState.while.do) + "\n"
    } else if ("block" in whileState.while.do) {
      whileString += pseudoCodeBlockToString(whileState.while.do, indent + 2) + "\n"
    }
  }
  return whileString
}

function pseudoCodeForToString(forState: PseudoCodeFor, indent: number): string {
  let forString =
    leadingWhitespace(indent) +
    `\\textbf{for}\\text{ }${forState.for.variable}\\text{ }\\textbf{from}\\text{ }${forState.for.from}\\text{ }\\textbf{to}\\text{ }${forState.for.to}`
  if (forState.for.step) {
    forString += `\\text{ }\\textbf{with step}\\text{ }${forState.for.step}\\text{ }\\textbf{do}\n`
  } else {
    forString += `\\text{ }\\textbf{do}\n`
  }
  if (forState.for.do) {
    if ("state" in forState.for.do) {
      forString += leadingWhitespace(indent + 2) + pseudoCodeStateToString(forState.for.do) + "\n"
    } else if ("block" in forState.for.do) {
      forString += pseudoCodeBlockToString(forState.for.do, indent + 2) + "\n"
    }
  }
  return forString
}

function pseudocodeForAllToString(forAllState: PseudoCodeForAll, indent: number): string {
  let forAllString =
    leadingWhitespace(indent) +
    `\\textbf{for}\\text{ }${forAllState.forAll.variable} \\in ${forAllState.forAll.set}\\text{ }\\textbf{then}\n`
  if (forAllState.forAll.do) {
    if ("state" in forAllState.forAll.do) {
      forAllString +=
        leadingWhitespace(indent + 2) + pseudoCodeStateToString(forAllState.forAll.do) + "\n"
    } else if ("block" in forAllState.forAll.do) {
      forAllString += pseudoCodeBlockToString(forAllState.forAll.do, indent + 2) + "\n"
    }
  }
  return forAllString
}

function pseudoCodeStateToString(state: PseudoCodeState): string {
  let stateString = ""
  if (typeof state.state === "string") {
    stateString += state.state
  } else if ("print" in state.state) {
    stateString += pseudoCodePrintToString(state.state)
  } else if ("returnValue" in state.state) {
    stateString += pseudoCodeReturnToString(state.state)
  } else if ("continue" in state.state) {
    stateString += pseudoCodeContinueToString()
  } else if ("break" in state.state) {
    stateString += pseudoCodeBreakToString()
  } else if ("functionName" in state.state) {
    stateString += pseudoCodeCallToString(state.state)
  } else if ("variable" in state.state) {
    stateString += pseudoCodeAssignmentToString(state.state)
  }
  return stateString
}

function pseudoCodeAssignmentToString(assignment: PseudoCodeAssignment): string {
  return `${assignment.variable}\\longleftarrow${assignment.value}`
}

function pseudoCodePrintToString(print: PseudoCodePrint): string {
  return `\\text{print}(${print.print})`
}

function pseudoCodeReturnToString(returnState: PseudoCodeReturn): string {
  return `\\textbf{return}\\text{ }${returnState.returnValue}`
}

function pseudoCodeContinueToString(): string {
  return "\\textbf{continue}"
}

function pseudoCodeBreakToString(): string {
  return "\\textbf{break}"
}

function pseudoCodeCallToString(call: PseudoCodeCall): string {
  return `\\textit{${call.functionName} }(${call.args.join(", ")})`
}

function leadingWhitespace(indent: number): string {
  return " ".repeat(indent)
}

/*
This package works, so we could use this for coloring the pseudocode
https://www.overleaf.com/learn/latex/Using_colors_in_LaTeX
\usepackage[dvipsnames]{xcolor}
*/

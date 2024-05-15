import {
  PseudoCode,
  PseudoCodeAssignment,
  PseudoCodeBlock,
  PseudoCodeCall,
  PseudoCodeFor,
  PseudoCodeForAll,
  PseudoCodeFunction,
  PseudoCodeFunctionName,
  PseudoCodeIf,
  PseudoCodePrint,
  PseudoCodePrintString,
  PseudoCodeReturn,
  PseudoCodeState,
  PseudoCodeString,
  PseudoCodeVariable,
  PseudoCodeWhile,
} from "@shared/question-generators/time/pseudoCodeUtils.ts"
import {
  controlFlowColor,
  functionColor,
  keyWordsColor,
  printStatementColor,
  variableColor,
} from "@/components/DrawPseudoCode.tsx"

export function pseudoCodeToString(pseudoCode: PseudoCode): {
  pseudoCodeString: string
  pseudoCodeStringColor: string
  pseudoCodeStringLatex: string
} {
  let pseudoCodeString: string = ""
  let pseudoCodeStringColor: string = ""
  let pseudoCodeStringLatex: string =
    "\\begin{algorithm}[h]\n\\caption{NAME?}\n\\begin{algorithmic}[1]\n"
  for (const code of pseudoCode) {
    if ("state" in code) {
      const { stateString, stateStringColor, stateStringLatex } = pseudoCodeStateToString(code)
      pseudoCodeString += stateString + "\n"
      pseudoCodeStringColor += stateStringColor + "\n"
      pseudoCodeStringLatex += stateStringLatex + "\n"
    } else if ("block" in code) {
      const { blockString, blockStringColor, blockStringLatex } = pseudoCodeBlockToString(code, 0)
      pseudoCodeString += blockString + "\n"
      pseudoCodeStringColor += blockStringColor + "\n"
      pseudoCodeStringLatex += blockStringLatex + "\n"
    } else if ("name" in code) {
      const { functionString, functionStringColor, functionStringLatex } = pseudoCodeFunctionToString(
        code,
        0,
      )
      pseudoCodeString += functionString + "\n"
      pseudoCodeStringColor += functionStringColor + "\n"
      pseudoCodeStringLatex += functionStringLatex + "\n"
    }
  }
  pseudoCodeStringLatex += "\\end{algorithmic}\n\\end{algorithm}"

  pseudoCodeString = pseudoCodeString
    .split("\n")
    .filter((line) => line.trim() !== "")
    .join("\n")

  pseudoCodeStringColor = pseudoCodeStringColor
    .split("\n")
    .filter((line) => line.trim() !== "")
    .join("\n")

  return { pseudoCodeString, pseudoCodeStringColor, pseudoCodeStringLatex }
}

function pseudoCodeFunctionToString(
  func: PseudoCodeFunction,
  indent: number,
): { functionString: string; functionStringColor: string; functionStringLatex: string } {
  let functionString =
    leadingWhitespace(indent) +
    `\\textbf{function}\\text{ }\\textit{${func.name}}\\text{ }(${func.args.join(",\\text{ }")}):\n`
  let functionStringColor =
    leadingWhitespace(indent) +
    `{\\color{${keyWordsColor}} \\textbf{function}}\\text{ }{\\color{${functionColor}} \\textit{${func.name}}}\\text{ }(`
  for (let i = 0; i < func.args.length; i++) {
    functionStringColor += `{\\color{${variableColor}} ${func.args[i]} }`
    if (i < func.args.length - 1) {
      functionStringColor += ",  "
    }
  }
  functionStringColor += "):\n"
  let functionStringLatex = `\\Function{${func.name}}{${func.args.join(", ")}}\n`
  if (func.body) {
    if ("state" in func.body) {
      const { stateString, stateStringColor, stateStringLatex } = pseudoCodeStateToString(func.body)
      functionString += stateString + "\n"
      functionStringColor += stateStringColor + "\n"
      functionStringLatex += stateStringLatex + "\n"
    } else if ("block" in func.body) {
      const { blockString, blockStringColor, blockStringLatex } = pseudoCodeBlockToString(
        func.body,
        indent + 2,
      )
      functionString += blockString + "\n"
      functionStringColor += blockStringColor + "\n"
      functionStringLatex += blockStringLatex + "\n"
    }
  }
  functionStringLatex += "\\EndFunction\n"
  return { functionString, functionStringColor, functionStringLatex }
}

function pseudoCodeBlockToString(
  block: PseudoCodeBlock,
  indent: number,
): { blockString: string; blockStringColor: string; blockStringLatex: string } {
  let blockStringAdd = ""
  let blockStringAddColor = ""
  let blockStringAddLatex = ""
  for (const state of block.block) {
    if ("state" in state) {
      const { stateString, stateStringColor, stateStringLatex } = pseudoCodeStateToString(state)
      blockStringAdd += leadingWhitespace(indent) + stateString + "\n"
      blockStringAddColor += leadingWhitespace(indent) + stateStringColor + "\n"
      blockStringAddLatex += leadingWhitespace(indent) + stateStringLatex + "\n"
    } else if ("block" in state) {
      const { blockString, blockStringColor, blockStringLatex } = pseudoCodeBlockToString(state, indent)
      blockStringAdd += blockString + "\n"
      blockStringAddColor += blockStringColor + "\n"
      blockStringAddLatex += blockStringLatex + "\n"
    } else if ("if" in state) {
      const { ifString, ifStringColor, ifStringLatex } = pseudoCodeIfToString(state, indent)
      blockStringAdd += ifString + "\n"
      blockStringAddColor += ifStringColor + "\n"
      blockStringAddLatex += ifStringLatex + "\n"
    } else if ("while" in state) {
      const { whileString, whileStringColor, whileStringLatex } = pseudoCodeWhileToString(state, indent)
      blockStringAdd += whileString + "\n"
      blockStringAddColor += whileStringColor + "\n"
      blockStringAddLatex += whileStringLatex + "\n"
    } else if ("for" in state) {
      const { forString, forStringColor, forStringLatex } = pseudoCodeForToString(state, indent)
      blockStringAdd += forString + "\n"
      blockStringAddColor += forStringColor + "\n"
      blockStringAddLatex += forStringLatex + "\n"
    } else if ("forAll" in state) {
      const { forAllString, forAllStringColor, forAllStringLatex } = pseudocodeForAllToString(
        state,
        indent,
      )
      blockStringAdd += forAllString + "\n"
      blockStringAddColor += forAllStringColor + "\n"
      blockStringAddLatex += forAllStringLatex + "\n"
    }
  }
  return {
    blockString: blockStringAdd,
    blockStringColor: blockStringAddColor,
    blockStringLatex: blockStringAddLatex,
  }
}

function pseudoCodeIfToString(
  ifState: PseudoCodeIf,
  indent: number,
): { ifString: string; ifStringColor: string; ifStringLatex: string } {
  const { psString, psStringColor, psStringLatex } = pseudoCodeStringToString(ifState.if.condition)
  let ifString = leadingWhitespace(indent) + `\\textbf{if }\\text{ }${psString}\\text{ }\\textbf{then}\n`
  let ifStringColor =
    leadingWhitespace(indent) +
    `{\\color{${keyWordsColor}} \\textbf{if }}\\text{ }${psStringColor}\\text{ }{\\color{${keyWordsColor}} \\textbf{then}}\n`
  let ifStringLatex = leadingWhitespace(indent) + `\\If{$${psStringLatex}$}\n`
  if (ifState.if.then) {
    if ("state" in ifState.if.then) {
      const { stateString, stateStringColor, stateStringLatex } = pseudoCodeStateToString(
        ifState.if.then,
      )
      ifString += leadingWhitespace(indent + 2) + stateString + "\n"
      ifStringColor += leadingWhitespace(indent + 2) + stateStringColor + "\n"
      ifStringLatex += leadingWhitespace(indent + 2) + stateStringLatex + "\n"
    } else if ("block" in ifState.if.then) {
      const { blockString, blockStringColor, blockStringLatex } = pseudoCodeBlockToString(
        ifState.if.then,
        indent + 2,
      )
      ifString += blockString + "\n"
      ifStringColor += blockStringColor + "\n"
      ifStringLatex += blockStringLatex + "\n"
    }
  }

  if (ifState.if.elseif) {
    for (let i = 0; i < ifState.if.elseif.length; i++) {
      const { psString, psStringColor, psStringLatex } = pseudoCodeStringToString(
        ifState.if.elseif[i].condition,
      )
      ifString += leadingWhitespace(indent) + `\\textbf{else if } ${psString}\n`
      ifStringColor +=
        leadingWhitespace(indent) + `{\\color{${keyWordsColor}} \\textbf{else if }} ${psStringColor}\n`
      ifStringLatex += leadingWhitespace(indent) + `\\ElsIf{$${psStringLatex}$}\n`

      if ("state" in ifState.if.elseif[i].then) {
        const { stateString, stateStringColor, stateStringLatex } = pseudoCodeStateToString(
          ifState.if.elseif[i].then as PseudoCodeState,
        )
        ifString += leadingWhitespace(indent + 2) + stateString + "\n"
        ifStringColor += leadingWhitespace(indent + 2) + stateStringColor + "\n"
        ifStringLatex += leadingWhitespace(indent + 2) + stateStringLatex + "\n"
      } else if (ifState.if.elseif[i].then !== null && "block" in ifState.if.elseif[i].then) {
        const { blockString, blockStringColor, blockStringLatex } = pseudoCodeBlockToString(
          ifState.if.elseif[i].then as PseudoCodeBlock,
          indent + 2,
        )
        ifString += blockString + "\n"
        ifStringColor += blockStringColor + "\n"
        ifStringLatex += blockStringLatex + "\n"
      }
    }
  }

  if (ifState.if.else) {
    ifString += leadingWhitespace(indent) + `\\textbf{else}\n`
    ifStringColor += leadingWhitespace(indent) + `{\\color{${keyWordsColor}} \\textbf{else }}\n`
    ifStringLatex += leadingWhitespace(indent) + `\\Else\n`
    if (ifState.if.else !== undefined && "state" in ifState.if.else) {
      const { stateString, stateStringColor, stateStringLatex } = pseudoCodeStateToString(
        ifState.if.else,
      )
      ifString += leadingWhitespace(indent + 2) + stateString + "\n"
      ifStringColor += leadingWhitespace(indent + 2) + stateStringColor + "\n"
      ifStringLatex += leadingWhitespace(indent + 2) + stateStringLatex + "\n"
    } else if (ifState.if.else !== undefined && "block" in ifState.if.else) {
      const { blockString, blockStringColor, blockStringLatex } = pseudoCodeBlockToString(
        ifState.if.else,
        indent + 2,
      )
      ifString += blockString + "\n"
      ifStringColor += blockStringColor + "\n"
      ifStringLatex += blockStringLatex + "\n"
    }
  }
  ifStringLatex += leadingWhitespace(indent) + "\\EndIf\n"
  return { ifString, ifStringColor, ifStringLatex }
}

function pseudoCodeWhileToString(
  whileState: PseudoCodeWhile,
  indent: number,
): { whileString: string; whileStringColor: string; whileStringLatex: string } {
  const { psString, psStringColor, psStringLatex } = pseudoCodeStringToString(whileState.while.condition)
  let whileString =
    leadingWhitespace(indent) + `\\textbf{while}\\text{ }${psString}\\text{ }\\textbf{do}\n`
  let whileStringColor =
    leadingWhitespace(indent) +
    `{\\color{${keyWordsColor}}\\textbf{while}}\\text{ }${psStringColor}\\text{ }{\\color{${keyWordsColor}} \\textbf{do}}\n`
  let whileStringLatex = leadingWhitespace(indent) + `\\While{$${psStringLatex}$}\n`
  if (whileState.while.do) {
    if ("state" in whileState.while.do) {
      const { stateString, stateStringColor, stateStringLatex } = pseudoCodeStateToString(
        whileState.while.do,
      )
      whileString += leadingWhitespace(indent + 2) + stateString + "\n"
      whileStringColor += leadingWhitespace(indent + 2) + stateStringColor + "\n"
      whileStringLatex += leadingWhitespace(indent + 2) + stateStringLatex + "\n"
    } else if ("block" in whileState.while.do) {
      const { blockString, blockStringColor, blockStringLatex } = pseudoCodeBlockToString(
        whileState.while.do,
        indent + 2,
      )
      whileString += blockString + "\n"
      whileStringColor += blockStringColor + "\n"
      whileStringLatex += blockStringLatex + "\n"
    }
  }
  whileStringLatex += leadingWhitespace(indent) + "\\EndWhile\n"
  return { whileString, whileStringColor, whileStringLatex }
}

function pseudoCodeForToString(
  forState: PseudoCodeFor,
  indent: number,
): { forString: string; forStringColor: string; forStringLatex: string } {
  const {
    psString: psStringFrom,
    psStringColor: psStringColorFrom,
    psStringLatex: psStringLatexFrom,
  } = pseudoCodeStringToString(forState.for.from)
  const {
    psString: psStringTo,
    psStringColor: psStringColorTo,
    psStringLatex: psStringLatexTo,
  } = pseudoCodeStringToString(forState.for.to)
  let forString =
    leadingWhitespace(indent) +
    `\\textbf{for}\\text{ }${forState.for.variable}\\text{ }\\textbf{from}\\text{ }${psStringFrom}\\text{ }\\textbf{to}\\text{ }${psStringTo}`
  let forStringColor =
    leadingWhitespace(indent) +
    `{\\color{${keyWordsColor}} \\textbf{for}}\\text{ }{\\color{${variableColor}}${forState.for.variable}}\\text{ }{\\color{${keyWordsColor}} \\textbf{from}}\\text{ }${psStringColorFrom}\\text{ }{\\color{${keyWordsColor}} \\textbf{to}}\\text{ }${psStringColorTo}`
  let forStringLatex =
    leadingWhitespace(indent) +
    `\\For{$${forState.for.variable} \\gets ${psStringLatexFrom} \\text{ to } ${psStringLatexTo}`
  if (forState.for.step) {
    const {
      psString: psStringStep,
      psStringColor: psStringColorStep,
      psStringLatex: psStringLatexStep,
    } = pseudoCodeStringToString(forState.for.step)
    forString += `\\text{ }\\textbf{with step}\\text{ }${psStringStep}\\text{ }\\textbf{do}\n`
    forStringColor += `\\text{ }{\\color{${keyWordsColor}}\\textbf{with step}}\\text{ }${psStringColorStep}\\text{ }{\\color{${keyWordsColor}} \\textbf{do}}\n`
    forStringLatex += `\\text{ with step }${psStringLatexStep}$}\n`
  } else {
    forString += `\\text{ }\\textbf{do}\n`
    forStringColor += `\\text{ }{\\color{${keyWordsColor}} \\textbf{do}}\n`
    forStringLatex += "$}\n"
  }
  if (forState.for.do) {
    if ("state" in forState.for.do) {
      const { stateString, stateStringColor, stateStringLatex } = pseudoCodeStateToString(
        forState.for.do,
      )
      forString += leadingWhitespace(indent + 2) + stateString + "\n"
      forStringColor += leadingWhitespace(indent + 2) + stateStringColor + "\n"
      forStringLatex += leadingWhitespace(indent + 2) + stateStringLatex + "\n"
    } else if ("block" in forState.for.do) {
      const { blockString, blockStringColor, blockStringLatex } = pseudoCodeBlockToString(
        forState.for.do,
        indent + 2,
      )
      forString += blockString + "\n"
      forStringColor += blockStringColor + "\n"
      forStringLatex += blockStringLatex + "\n"
    }
  }
  forStringLatex += leadingWhitespace(indent) + "\\EndFor\n"
  return { forString, forStringColor, forStringLatex }
}

function pseudocodeForAllToString(
  forAllState: PseudoCodeForAll,
  indent: number,
): { forAllString: string; forAllStringColor: string; forAllStringLatex: string } {
  const { psString, psStringColor, psStringLatex } = pseudoCodeStringToString(forAllState.forAll.set)
  let forAllString =
    leadingWhitespace(indent) +
    `\\textbf{for}\\text{ }${forAllState.forAll.variable} \\in ${psString}\\text{ }\\textbf{then}\n`
  let forAllStringColor =
    leadingWhitespace(indent) +
    `{\\color{${keyWordsColor}}\\textbf{for}}\\text{ }{\\color{${variableColor}} ${forAllState.forAll.variable}} \\in ${psStringColor}\\text{ }{\\color{${keyWordsColor}}\\textbf{do}}\n`
  let forAllStringLatex =
    leadingWhitespace(indent) + `\\ForAll{$${forAllState.forAll.variable} \\in ${psStringLatex}$}\n`
  if (forAllState.forAll.do) {
    if ("state" in forAllState.forAll.do) {
      const { stateString, stateStringColor, stateStringLatex } = pseudoCodeStateToString(
        forAllState.forAll.do,
      )
      forAllString += leadingWhitespace(indent + 2) + stateString + "\n"
      forAllStringColor += leadingWhitespace(indent + 2) + stateStringColor + "\n"
      forAllStringLatex += leadingWhitespace(indent + 2) + stateStringLatex + "\n"
    } else if ("block" in forAllState.forAll.do) {
      const { blockString, blockStringColor, blockStringLatex } = pseudoCodeBlockToString(
        forAllState.forAll.do,
        indent + 2,
      )
      forAllString += blockString + "\n"
      forAllStringColor += blockStringColor + "\n"
      forAllStringLatex += blockStringLatex + "\n"
    }
  }
  forAllStringLatex += leadingWhitespace(indent) + "\\EndFor\n"
  return { forAllString, forAllStringColor, forAllStringLatex }
}

function pseudoCodeStateToString(state: PseudoCodeState): {
  stateString: string
  stateStringColor: string
  stateStringLatex: string
} {
  let stateString = ""
  let stateStringColor = ""
  let stateStringLatex = "\\State "
  if (Array.isArray(state.state)) {
    const { psString, psStringColor, psStringLatex } = pseudoCodeStringToString(state.state)
    stateString += psString
    stateStringColor += psStringColor
    stateStringLatex += psStringLatex
  } else if ("print" in state.state) {
    const { printNormal, printColor, printLatex } = pseudoCodePrintToString(state.state)
    stateString += printNormal
    stateStringColor += printColor
    stateStringLatex += printLatex
  } else if ("returnValue" in state.state) {
    const { returnNormal, returnColor, returnLatex } = pseudoCodeReturnToString(state.state)
    stateString += returnNormal
    stateStringColor += returnColor
    stateStringLatex += returnLatex
  } else if ("continueState" in state.state) {
    const { continueNormal, continueColor, continueLatex } = pseudoCodeContinueToString()
    stateString += continueNormal
    stateStringColor += continueColor
    stateStringLatex += continueLatex
  } else if ("breakState" in state.state) {
    const { breakNormal, breakColor, breakLatex } = pseudoCodeBreakToString()
    stateString += breakNormal
    stateStringColor += breakColor
    stateStringLatex += breakLatex
  } else if ("functionName" in state.state) {
    const { callNormal, callColor, callLatex } = pseudoCodeCallToString(state.state)
    stateString += callNormal
    stateStringColor += callColor
    stateStringLatex += callLatex
  } else if ("variable" in state.state) {
    const { assignmentNormal, assignmentColor, assignmentLatex } = pseudoCodeAssignmentToString(
      state.state,
    )
    stateString += assignmentNormal
    stateStringColor += assignmentColor
    stateStringLatex += assignmentLatex
  }
  return { stateString, stateStringColor, stateStringLatex }
}

function pseudoCodeAssignmentToString(assignment: PseudoCodeAssignment): {
  assignmentNormal: string
  assignmentColor: string
  assignmentLatex: string
} {
  const { psString, psStringColor, psStringLatex } = pseudoCodeStringToString(assignment.value)
  const assignmentNormal = `${assignment.variable}\\longleftarrow${psString}`
  const assignmentColor = `{\\color{${variableColor}}${assignment.variable}}\\longleftarrow${psStringColor}`
  const assignmentLatex = `$${assignment.variable} \\gets ${psStringLatex}$`
  return { assignmentNormal, assignmentColor, assignmentLatex }
}

function pseudoCodePrintToString(print: PseudoCodePrint): {
  printNormal: string
  printColor: string
  printLatex: string
} {
  const { psString, psStringColor, psStringLatex } = pseudoCodeStringToString(print.print)
  const printNormal = `\\text{print}(${psString})`
  const printColor = `\\text{print}(${psStringColor})`
  const printLatex = `print($${psStringLatex}$)`
  return { printNormal, printColor, printLatex }
}

function pseudoCodeReturnToString(returnState: PseudoCodeReturn): {
  returnNormal: string
  returnColor: string
  returnLatex: string
} {
  const { psString, psStringColor, psStringLatex } = pseudoCodeStringToString(returnState.returnValue)
  const returnNormal = `\\textbf{return}\\text{ }${psString}`
  const returnColor = `{\\color{${controlFlowColor}} \\textbf{return}}\\text{ }${psStringColor}`
  const returnLatex = `\\Return $${psStringLatex}$`
  return { returnNormal, returnColor, returnLatex }
}

function pseudoCodeContinueToString(): {
  continueNormal: string
  continueColor: string
  continueLatex: string
} {
  const continueNormal = "\\textbf{continue}"
  const continueColor = `{\\color{${controlFlowColor}} \\textbf{continue}}`
  const continueLatex = "continue"
  return { continueNormal, continueColor, continueLatex }
}

function pseudoCodeBreakToString(): { breakNormal: string; breakColor: string; breakLatex: string } {
  const breakNormal = "\\textbf{break}"
  const breakColor = `{\\color{${controlFlowColor}} \\textbf{break}}`
  const breakLatex = "break"
  return { breakNormal, breakColor, breakLatex }
}

function pseudoCodeCallToString(call: PseudoCodeCall): {
  callNormal: string
  callColor: string
  callLatex: string
} {
  let callNormal = `\\textit{${call.functionName} }(`
  let callColor = `{\\color{${functionColor}} \\textit{${call.functionName} }}(`
  let callLatex = `\\Call{${call.functionName}}{`

  for (let i = 0; i < call.args.length; i++) {
    const { psString, psStringColor, psStringLatex } = pseudoCodeStringToString(call.args[i])
    callNormal += psString
    callColor += psStringColor
    callLatex += psStringLatex
    if (i < call.args.length - 1) {
      callNormal += ", "
      callColor += ", "
      callLatex += ", "
    }
  }

  callNormal += ")"
  callColor += ")"
  callLatex += "}"

  return { callNormal, callColor, callLatex }
}

function pseudoCodeStringToString(pseudoString: PseudoCodeString): {
  psString: string
  psStringColor: string
  psStringLatex: string
} {
  let psString = ""
  let psStringColor = ""
  let psStringLatex = ""
  for (let i = 0; i < pseudoString.length; i++) {
    if (typeof pseudoString[i] === "string") {
      psString += pseudoString[i] as string
      psStringColor += pseudoString[i] as string
      psStringLatex += pseudoString[i] as string
    } else if (isPseudoCodeVariable(pseudoString[i])) {
      const { variable } = pseudoString[i] as PseudoCodeVariable
      psString += variable
      psStringColor += `{\\color{${variableColor}}${variable}}`
      psStringLatex += variable
    } else if (isPseudoCodeFunctionName(pseudoString[i])) {
      const { functionName } = pseudoString[i] as PseudoCodeFunctionName
      psString += functionName
      psStringColor += `{\\color{${functionColor}}${functionName}}`
      psStringLatex += functionName
    } else if (isPseudoCodePrintString(pseudoString[i])) {
      const { printString } = pseudoString[i] as PseudoCodePrintString
      psString += printString
      psStringColor += `{\\color{${printStatementColor}}${printString}}`
      psStringLatex += printString
    }
  }

  return { psString, psStringColor, psStringLatex }
}

function isPseudoCodeVariable(
  pseudoString: string | PseudoCodeVariable | PseudoCodeFunctionName | PseudoCodePrintString,
): boolean {
  return typeof pseudoString === "object" && "variable" in pseudoString
}

function isPseudoCodeFunctionName(
  pseudoString: string | PseudoCodeVariable | PseudoCodeFunctionName | PseudoCodePrintString,
): boolean {
  return typeof pseudoString === "object" && "functionName" in pseudoString
}

function isPseudoCodePrintString(
  pseudoString: string | PseudoCodeVariable | PseudoCodeFunctionName | PseudoCodePrintString,
): boolean {
  return typeof pseudoString === "object" && "printString" in pseudoString
}

function leadingWhitespace(indent: number): string {
  return " ".repeat(indent)
}

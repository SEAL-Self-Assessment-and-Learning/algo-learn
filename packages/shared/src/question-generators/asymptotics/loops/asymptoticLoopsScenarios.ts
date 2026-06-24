import { toFraction } from "@shared/utils/toLatex.ts";
import type { PseudoCode, PseudoCodeBlock, PseudoCodeFor, PseudoCodeForAll, PseudoCodeIf, PseudoCodeString, PseudoCodeWhile } from "../../../utils/pseudoCodeUtils.ts";
import { SimpleAsymptoticTerm } from "../asymptoticsUtils.ts";
import { asArray, assignmentState, breakState, incrementState, pickWeightedVariant, powerString, returnState, type ScenarioFactory, type StepVariant } from "./asymptoticLoopsHelpers.ts";


const scenarioFunctionNames = ["loop", "loopFun", "process", "iterate", "compute"]
const outerLoopVariables = ["i", "k", "p"]
const innerLoopVariables = ["j", "q", "r"]
const whileVariables = ["x", "y", "z"]
const nVar = "n"

/**
 * Simple for loop with linear number of iterations and constant work per iteration, resulting in O(n) complexity.
 * @param random
 */
const simpleForScenario: ScenarioFactory = (random) => {
  const functionName = random.choice(scenarioFunctionNames)
  const loopVar = random.choice(outerLoopVariables)

  const forLoop: PseudoCodeFor = {
    for: {
      variable: loopVar,
      from: [random.int(0,5).toString()],
      to: asArray(nVar),
      do: { block: [incrementState("w", random.int(1, 5))] },
    },
  }

  const code: PseudoCode = [
    {
      name: functionName,
      args: [nVar],
      body: {
        block: [assignmentState("w", ["0"]), forLoop, returnState("w")],
      },
    },
  ]

  const complexity = new SimpleAsymptoticTerm({
    variable: nVar,
    polyexponent: 1,
  })

  return { id: "simple-for", code, complexity, functionName, variable: nVar }
}

/**
 * Two nested for loops where the inner loop runs a constant number of times, resulting in O(n) complexity.
 */
const constInnerForScenario: ScenarioFactory = (random) => {
  const functionName = random.choice(scenarioFunctionNames)
  const outerVar = random.choice(outerLoopVariables)
  const innerVar = random.choice(innerLoopVariables)
  const innerLimit = random.weightedChoice([[1, 0.18],[2, 0.18],[3, 0.18],[4, 0.18],[5, 0.18],[1000, 0.1]])

  const innerFor: PseudoCodeFor = {
    for: {
      variable: innerVar,
      from: ["1"],
      to: [innerLimit.toString()],
      do: { block: [incrementState("w")] },
    },
  }

  const outerFor: PseudoCodeFor = {
    for: {
      variable: outerVar,
      from: ["1"],
      to: asArray(nVar),
      do: { block: [innerFor] },
    },
  }

  const code: PseudoCode = [
    {
      name: functionName,
      args: [nVar],
      body: {
        block: [assignmentState("w", ["0"]), outerFor, returnState("w")],
      },
    },
  ]

  const complexity = new SimpleAsymptoticTerm({
    variable: nVar,
    polyexponent: 1,
  })

  return { id: "const-inner-for", code, complexity, functionName, variable: nVar }
}

/**
 * Iterating over a set of size n or a constant size, demonstrating O(n) or O(1) complexity depending on the scenario.
 */
const setIterationScenario: ScenarioFactory = (random) => {
  const functionName = random.choice(scenarioFunctionNames)
  const elementVar = random.choice(innerLoopVariables)
  const constantSized = random.bool(0.35)
  const constantSize = random.int(2, 5)
  const setLabel: PseudoCodeString = constantSized
    ? ["S (\\left|S\\right| = ", constantSize.toString(), ")"]
    : ["S (\\left|S\\right| = ", { variable: nVar }, ")"]

  const forAll: PseudoCodeForAll = {
    forAll: {
      variable: elementVar,
      set: setLabel,
      do: { block: [incrementState("w")] },
    },
  }

  const code: PseudoCode = [
    {
      name: functionName,
      args: [nVar],
      body: { block: [assignmentState("w", ["0"]), forAll, returnState("w")] },
    },
  ]

  const complexity = constantSized
    ? new SimpleAsymptoticTerm({ variable: nVar, polyexponent: 0 })
    : new SimpleAsymptoticTerm({ variable: nVar, polyexponent: 1 })

  return {
    id: constantSized ? "iterate-set-const" : "iterate-set-n",
    code,
    complexity,
    functionName,
    variable: nVar,
  }
}
/**
 * A for loop where the loop variable is updated by adding a constant or multiplying by a constant,
 * resulting in O(n) or O(log n) complexity depending on the step variant.
 */
const steppedForScenario: ScenarioFactory = (random) => {
  const functionName = random.choice(scenarioFunctionNames)
  const loopVar = random.choice(outerLoopVariables)

  const stepVariant: StepVariant = pickWeightedVariant(random, [
    { kind: "add", step: random.int(2, 4), label: "small-add", weight: 4 },
    { kind: "add", step: random.int(10, 50), label: "medium-add", weight: 2 },
    { kind: "add", step: 1000, label: "huge-add", weight: 1 },
    { kind: "add", step: 0.01, label: "tiny-add", weight: 1 },
    { kind: "mul", factor: 2, label: "double", weight: 3 },
    { kind: "mul", factor: 3, label: "triple", weight: 2 },
    { kind: "mul", factor: 10, label: "times-ten", weight: 1 },
    { kind: "mul", factor: 1000, label: "times-thousand", weight: 1 },
  ])

  let loopBlock: PseudoCodeBlock
  if (stepVariant.kind === "mul") {
    loopBlock = {
      block: [
        incrementState("w"),
        assignmentState(loopVar, [
          { variable: loopVar },
          " * ",
          stepVariant.factor.toString(),
        ]),
      ],
    }
  } else {
    loopBlock = {
      block: [
        incrementState("w", stepVariant.step),
        assignmentState(loopVar, [{ variable: loopVar }, "+", stepVariant.step.toString()]),
      ],
    }
  }

  const whileLoop: PseudoCodeWhile = {
    while: {
      condition: [{ variable: loopVar }, " <= ", { variable: nVar }],
      do: loopBlock,
    },
  }

  const code: PseudoCode = [
    {
      name: functionName,
      args: [nVar],
      body: {
        block: [
          assignmentState("w", ["0"]),
          assignmentState(loopVar, ["1"]),
          whileLoop,
          returnState("w"),
        ],
      },
    },
  ]

  const complexity = stepVariant.kind === "mul"
    ? new SimpleAsymptoticTerm({ variable: nVar, logexponent: 1 })
    : new SimpleAsymptoticTerm({ variable: nVar, polyexponent: 1 })

  return { id: `stepped-for-${stepVariant.label}`, code, complexity, functionName, variable: nVar }
}

/**
 * A while loop where the loop variable is multiplied by a factor less than 1 in each iteration,
 * resulting in O(log n) complexity.
 */
const geometricDecayScenario: ScenarioFactory = (random) => {
  const functionName = random.choice(scenarioFunctionNames)
  const loopVar = random.choice(outerLoopVariables)
  const factor = pickWeightedVariant(random, [
    { factor: 0.5, weight: 3 },
    { factor: 0.25, weight: 1 },
  ]).factor

  const whileLoop: PseudoCodeWhile = {
    while: {
      condition: [{ variable: loopVar }, " > ", "1"],
      do: {
        block: [
          incrementState("w"),
          assignmentState(loopVar, [
            { variable: loopVar },
            " * ",
            toFraction(factor),
          ]),
        ],
      },
    },
  }

  const code: PseudoCode = [
    {
      name: functionName,
      args: [nVar],
      body: {
        block: [
          assignmentState("w", ["0"]),
          assignmentState(loopVar, asArray(nVar)),
          whileLoop,
          returnState("w"),
        ],
      },
    },
  ]

  const complexity = new SimpleAsymptoticTerm({
    variable: nVar,
    logexponent: 1,
  })

  return {
    id: `geometric-decay-${factor === 0.5 ? "half" : "quarter"}`,
    code,
    complexity,
    functionName,
    variable: nVar,
  }
}

/**
 * A while loop where the loop variable is halved in each iteration, resulting in O(log n) complexity.
 */
const halveWhileScenario: ScenarioFactory = (random) => {
  const functionName = random.choice(scenarioFunctionNames)
  const tempVar = "m"

  const whileLoop: PseudoCodeWhile = {
    while: {
      condition: [{ variable: tempVar }, " > ", random.int(1,2).toString()],
      do: {
        block: [
          incrementState("w"),
          assignmentState(tempVar, ["\\frac{ ", { variable: tempVar }, "}{", random.int(2, 5).toString(), "}"]),
        ],
      },
    },
  }

  const code: PseudoCode = [
    {
      name: functionName,
      args: [nVar],
      body: {
        block: [
          assignmentState("w", [{variable: nVar}]),
          assignmentState(tempVar, asArray(nVar)),
          whileLoop,
          returnState("w"),
        ],
      },
    },
  ]

  const complexity = new SimpleAsymptoticTerm({
    variable: nVar,
    logexponent: 1,
  })

  return { id: "halve-while", code, complexity, functionName, variable: nVar }
}

/**
 * Two nested while loops where the loop variable is halved in each iteration, resulting in O((log n)^2) complexity.
 */
const doubleHalvingWhileScenario: ScenarioFactory = (random) => {
  const functionName = random.choice(scenarioFunctionNames)
  const outerVar = "m"
  const innerVar = "p"

  const innerWhile: PseudoCodeWhile = {
    while: {
      condition: [{ variable: innerVar }, random.choice([">", "\\geq"]), random.int(1, 5).toString()],
      do: {
        block: [
          incrementState("w"),
          assignmentState(innerVar, ["\\frac{", { variable: innerVar }, `}{${random.int(2,4)}}`]),
        ],
      },
    },
  }

  const outerWhile: PseudoCodeWhile = {
    while: {
      condition: [{ variable: innerVar }, random.choice([">", "\\geq"]), random.int(1, 5).toString()],
      do: {
        block: [
          assignmentState(innerVar, [{ variable: outerVar }]),
          innerWhile,
          assignmentState(outerVar, ["\\frac{", { variable: outerVar }, "}{2}"]),
        ],
      },
    },
  }

  const code: PseudoCode = [
    {
      name: functionName,
      args: [nVar],
      body: {
        block: [
          assignmentState("w", ["0"]),
          assignmentState(outerVar, asArray(nVar)),
          outerWhile,
          returnState("w"),
        ],
      },
    },
  ]

  const complexity = new SimpleAsymptoticTerm({
    variable: nVar,
    logexponent: 2,
  })

  return { id: "double-halving-while", code, complexity, functionName, variable: nVar }
}

/**
 * A for loop containing a while loop where the inner while loop runs O(log n) times for each iteration of the outer loop,
 * the outer loop runs O(n^k) times for some k, resulting in O(n^k log n) complexity.
 */
const forWhileLogScenario: ScenarioFactory = (random, difficulty) => {
  const functionName = random.choice(scenarioFunctionNames)
  const outerVar = random.choice(outerLoopVariables)
  const divisor = difficulty <= 2 ? 2 : random.int(2, difficulty >= 5 ? 5 : 3)
  const outerExponent = difficulty <= 2 ? 1 : random.int(1, difficulty >= 5 ? 3 : 2)
  const tempVar = "m"

  const whileBlock: PseudoCodeBlock = {
    block: [
      {
        if: {
          condition: [{ variable: tempVar }, " \\mod ", divisor.toString(), " = ", random.int(0, divisor - 1).toString()],
          then: { block: [incrementState("w")] },
        },
      },
      assignmentState(tempVar, [
        "\\frac{",
        { variable: tempVar },
        "}{",
        divisor.toString(),
        "}",
      ]),
    ],
  }

  const whileLoop: PseudoCodeWhile = {
    while: {
      condition: [{ variable: tempVar }, random.choice([">", "\\geq"]), random.int(1,2).toString()],
      do: whileBlock,
    },
  }

  const outerBlock: PseudoCodeBlock = {
    block: [assignmentState(tempVar, asArray(nVar)), whileLoop],
  }

  const outerFor: PseudoCodeFor = {
    for: {
      variable: outerVar,
      from: ["1"],
      to: powerString(nVar, outerExponent),
      do: outerBlock,
    },
  }

  const code: PseudoCode = [
    {
      name: functionName,
      args: [nVar],
      body: {
        block: [assignmentState("w", ["1"]), outerFor, returnState("w")],
      },
    },
  ]

  const complexity = new SimpleAsymptoticTerm({
    variable: nVar,
    polyexponent: outerExponent,
    logexponent: 1,
  })

  return { id: "for-while-log", code, complexity, functionName, variable: nVar }
}

/**
 * A while loop containing a for loop where the inner for loop runs O(n^k) times for some k,
 * and the while loop runs O(log n) times, resulting in O(n^k log n) complexity.
 */
const whileForScenario: ScenarioFactory = (random, difficulty) => {
  const functionName = random.choice(scenarioFunctionNames)
  const outerVar = random.choice(whileVariables)
  const innerVar = random.choice(innerLoopVariables)
  const factor = difficulty <= 2 ? 2 : random.int(2, difficulty >= 5 ? 5 : 4)
  const innerExponent = difficulty <= 2 ? 1 : random.int(1, difficulty >= 4 ? 2 : 1)

  const innerIf: PseudoCodeIf = {
    if: {
      condition: [{ variable: innerVar }, random.choice(["<", "\\leq"]), { variable: outerVar }],
      then: { block: [incrementState("w")] },
    },
  }

  const innerFor: PseudoCodeFor = {
    for: {
      variable: innerVar,
      from: ["1"],
      to: powerString(nVar, innerExponent),
      do: { block: [innerIf] },
    },
  }

  const whileBlock: PseudoCodeBlock = {
    block: [innerFor, assignmentState(outerVar, [{ variable: outerVar }, " \\cdot ", factor.toString()])],
  }

  const whileLoop: PseudoCodeWhile = random.bool(0.7)
    ? {
      while: {
        condition: [{ variable: outerVar }, random.choice(["<", "\\leq"]), { variable: nVar }],
        do: whileBlock,
      },
    }
    : {
      while: {
        condition: [random.int(2,3).toString(), "\\cdot ", { variable: outerVar }, random.choice(["<", "\\leq"]), { variable: nVar }],
        do: whileBlock,
      },
    }

  const code: PseudoCode = [
    {
      name: functionName,
      args: [nVar],
      body: {
        block: [
          assignmentState("w", ["0"]),
          assignmentState(outerVar, ["1"]),
          whileLoop,
          returnState("w"),
        ],
      },
    },
  ]

  const complexity = new SimpleAsymptoticTerm({
    variable: nVar,
    polyexponent: innerExponent,
    logexponent: 1,
  })

  return { id: "while-for", code, complexity, functionName, variable: nVar }
}

const nestedForScenario: ScenarioFactory = (random, difficulty) => {
  const functionName = random.choice(scenarioFunctionNames)
  const outerVar = random.choice(outerLoopVariables)
  let innerVar = random.choice(innerLoopVariables)
  while (innerVar === outerVar) {
    innerVar = random.choice(innerLoopVariables)
  }

  const outerExponent = difficulty <= 2 ? 1 : random.int(1, difficulty >= 5 ? 3 : 2)
  const innerExponent = difficulty <= 2 ? 1 : random.int(1, difficulty >= 3 ? 2 : 1)

  const innerIf: PseudoCodeIf = {
    if: {
      condition: [{ variable: innerVar }, " \\mod 2 = 0"],
      then: { block: [incrementState("w")] },
    },
  }

  const innerBlock: PseudoCodeBlock = { block: [innerIf] }
  const innerFor: PseudoCodeFor = {
    for: {
      variable: innerVar,
      from: ["1"],
      to: powerString(outerVar, innerExponent),
      do: innerBlock,
    },
  }

  const outerBlock: PseudoCodeBlock = { block: [innerFor] }
  const outerFor: PseudoCodeFor = {
    for: {
      variable: outerVar,
      from: ["1"],
      to: powerString(nVar, outerExponent),
      do: outerBlock,
    },
  }

  const code: PseudoCode = [
    {
      name: functionName,
      args: [nVar],
      body: {
        block: [assignmentState("w", ["0"]), outerFor, returnState("w")],
      },
    },
  ]

  const complexity = new SimpleAsymptoticTerm({
    variable: nVar,
    polyexponent: outerExponent * (innerExponent + 1),
  })

  return { id: "nested-for", code, complexity, functionName, variable: nVar }
}

const triangularForScenario: ScenarioFactory = (random) => {
  const functionName = random.choice(scenarioFunctionNames)
  const outerVar = random.choice(outerLoopVariables)
  const innerVar = random.choice(innerLoopVariables)

  const innerFor: PseudoCodeFor = {
    for: {
      variable: innerVar,
      from: ["1"],
      to: [{ variable: outerVar }],
      do: { block: [incrementState("w")] },
    },
  }

  const outerFor: PseudoCodeFor = {
    for: {
      variable: outerVar,
      from: ["1"],
      to: asArray(nVar),
      do: { block: [innerFor] },
    },
  }

  const code: PseudoCode = [
    {
      name: functionName,
      args: [nVar],
      body: {
        block: [assignmentState("w", ["0"]), outerFor, returnState("w")],
      },
    },
  ]

  const complexity = new SimpleAsymptoticTerm({
    variable: nVar,
    polyexponent: 2,
  })

  return { id: "triangular-for", code, complexity, functionName, variable: nVar }
}

const tripleNestedForScenario: ScenarioFactory = (random, difficulty) => {
  const functionName = random.choice(scenarioFunctionNames)
  const vars = random.subset(outerLoopVariables.concat(innerLoopVariables), 3)
  const [a, b, c] = vars

  const [e0, e1, e2] = [
    random.int(1, 2),
    random.int(1, difficulty >= 5 ? 3 : 2),
    random.int(1, difficulty >= 3 ? 3 : 2),
  ]

  const canStartMiddleAtOuter = e0 <= e1
  const canStartInnerAtOuter = e0 <= e2

  const useTriangularMiddle = canStartMiddleAtOuter && random.bool?.(difficulty >= 5 ? 0.7 : 0.4)
  const useTriangularInner = canStartInnerAtOuter && random.bool?.(difficulty >= 4 ? 0.7 : 0.4)

  const innerFrom = useTriangularInner ? [a] : ["1"]
  const middleFrom = useTriangularMiddle ? [a] : ["1"]

  const innermostFor: PseudoCodeFor = {
    for: {
      variable: c,
      from: innerFrom,
      to: powerString(nVar, e2),
      do: { block: [incrementState("w")] },
    },
  }

  const middleFor: PseudoCodeFor = {
    for: {
      variable: b,
      from: middleFrom,
      to: powerString(nVar, e1),
      do: { block: [innermostFor] },
    },
  }

  const outerFor: PseudoCodeFor = {
    for: {
      variable: a,
      from: ["1"],
      to: powerString(nVar, e0),
      do: { block: [middleFor] },
    },
  }

  const code: PseudoCode = [
    {
      name: functionName,
      args: [nVar],
      body: { block: [assignmentState("w", ["0"]), outerFor, returnState("w")] },
    },
  ]

  const complexity = new SimpleAsymptoticTerm({
    variable: nVar,
    polyexponent: e0 + e1 + e2,
  })

  return {
    id: "triple-nested-for",
    code,
    complexity,
    functionName,
    variable: nVar,
  }
}

const sqrtForLogScenario: ScenarioFactory = (random) => {
  const functionName = random.choice(scenarioFunctionNames)
  const loopVar = random.choice(outerLoopVariables)
  const tempVar = "m"
  const exponentOptions = [
    { value: 0.5, tex: "1/2" },
    { value: 1 / 3, tex: "1/3" },
    { value: 2 / 3, tex: "2/3" },
    { value: 3 / 2, tex: "3/2" },
  ]
  const exponent = random.choice(exponentOptions)
  const limit: PseudoCodeString = [{ variable: nVar }, "^{", exponent.tex, "}"]

  const logWhile: PseudoCodeWhile = {
    while: {
      condition: [{ variable: tempVar }, " > ", "1"],
      do: {
        block: [
          incrementState("w"),
          assignmentState(tempVar, ["\\frac{", { variable: tempVar }, "}{", random.int(2,4).toString(),"}"]),
        ],
      },
    },
  }

  const forLoop: PseudoCodeFor = {
    for: {
      variable: loopVar,
      from: ["1"],
      to: limit,
      do: { block: [assignmentState(tempVar, asArray(nVar)), logWhile] },
    },
  }

  const code: PseudoCode = [
    {
      name: functionName,
      args: [nVar],
      body: {
        block: [assignmentState("w", ["0"]), forLoop, returnState("w")],
      },
    },
  ]

  const complexity = new SimpleAsymptoticTerm({
    variable: nVar,
    polyexponent: exponent.value,
    logexponent: 1,
  })

  return { id: "sqrt-for-log", code, complexity, functionName, variable: nVar }
}

const fractionalPowerForScenario: ScenarioFactory = (random) => {
  const functionName = random.choice(scenarioFunctionNames)
  const loopVar = random.choice(outerLoopVariables)
  const exponentOptions = [
    { value: 0.5, tex: "1/2", label: "half" },
    { value: 1 / 3, tex: "1/3", label: "third" },
    { value: 2 / 3, tex: "2/3", label: "two-thirds" },
    { value: 3 / 2, tex: "3/2", label: "three-halves" },
    { value: 5 / 2, tex: "5/2", label: "five-halves" },
    { value: 7 / 3, tex: "7/3", label: "seven-thirds" },
  ]
  const exponent = random.choice(exponentOptions)

  const limit: PseudoCodeString = [{ variable: nVar }, "^{", exponent.tex, "}"]

  const forLoop: PseudoCodeFor = {
    for: {
      variable: loopVar,
      from: [random.choice(["1", "2", "3", "1000"])],
      to: limit,
      do: { block: [incrementState("w", random.int(1, 5))] },
    },
  }

  const code: PseudoCode = [
    {
      name: functionName,
      args: [nVar],
      body: {
        block: [assignmentState("w", ["0"]), forLoop, returnState("w")],
      },
    },
  ]

  const complexity = new SimpleAsymptoticTerm({ variable: nVar, polyexponent: exponent.value })

  return { id: `fractional-power-${exponent.label}`, code, complexity, functionName, variable: nVar }
}

const exponentialSumScenario: ScenarioFactory = (random) => {
  const functionName = random.choice(scenarioFunctionNames)
  const outerVar = random.choice(outerLoopVariables)
  let innerVar = random.choice(innerLoopVariables)
  while (innerVar === outerVar) {
    innerVar = random.choice(innerLoopVariables)
  }
  const base = random.choice([2, 3, 4])
  const limit: PseudoCodeString = [base.toString(), "^{", { variable: outerVar }, "}"]

  const innerFor: PseudoCodeFor = {
    for: {
      variable: innerVar,
      from: ["1"],
      to: limit,
      do: { block: [incrementState("w")] },
    },
  }

  const outerFor: PseudoCodeFor = {
    for: {
      variable: outerVar,
      from: ["1"],
      to: asArray(nVar),
      do: { block: [innerFor] },
    },
  }

  const code: PseudoCode = [
    {
      name: functionName,
      args: [nVar],
      body: {
        block: [assignmentState("w", ["0"]), outerFor, returnState("w")],
      },
    },
  ]

  const complexity = new SimpleAsymptoticTerm({ variable: nVar, exponentialBase: base })

  return { id: `exp-sum-${base}`, code, complexity, functionName, variable: nVar }
}

const exponentialDirectScenario: ScenarioFactory = (random) => {
  const functionName = random.choice(scenarioFunctionNames)
  const loopVar = random.choice(outerLoopVariables)
  const base = random.choice([2, 3, 5])
  const limit: PseudoCodeString = [base.toString(), "^{", { variable: nVar }, "}"]

  const forLoop: PseudoCodeFor = {
    for: {
      variable: loopVar,
      from: [random.choice(["1", "2", "3", "10"])],
      to: limit,
      do: { block: [incrementState("w", random.int(1, 4))] },
    },
  }

  const code: PseudoCode = [
    {
      name: functionName,
      args: [nVar],
      body: {
        block: [assignmentState("w", ["0"]), forLoop, returnState("w")],
      },
    },
  ]

  const complexity = new SimpleAsymptoticTerm({ variable: nVar, exponentialBase: base })

  return { id: `exp-direct-${base}`, code, complexity, functionName, variable: nVar }
}

const exponentialLogScenario: ScenarioFactory = (random) => {
  const functionName = random.choice(scenarioFunctionNames)
  const outerVar = random.choice(outerLoopVariables)
  let innerVar = random.choice(innerLoopVariables)
  while (innerVar === outerVar) {
    innerVar = random.choice(innerLoopVariables)
  }
  const tempVar = "m"
  const base = random.choice([2, 3])

  const logWhile: PseudoCodeWhile = {
    while: {
      condition: [{ variable: tempVar }, " > ", "1"],
      do: {
        block: [
          incrementState("w"),
          assignmentState(tempVar, ["\\frac{", { variable: tempVar }, "}{2}"]),
        ],
      },
    },
  }

  const innerFor: PseudoCodeFor = {
    for: {
      variable: innerVar,
      from: ["1"],
      to: [base.toString(), "^{", { variable: random.bool() ? outerVar : nVar }, "}"],
      do: { block: [assignmentState(tempVar, asArray(nVar)), logWhile] },
    },
  }

  const outerFor: PseudoCodeFor = {
    for: {
      variable: outerVar,
      from: ["1"],
      to: asArray(nVar),
      do: { block: [innerFor] },
    },
  }

  const code: PseudoCode = [
    {
      name: functionName,
      args: [nVar],
      body: {
        block: [assignmentState("w", ["0"]), outerFor, returnState("w")],
      },
    },
  ]

  const complexity = new SimpleAsymptoticTerm({
    variable: nVar,
    exponentialBase: base,
    logexponent: 1,
  })

  return { id: `exp-log-${base}`, code, complexity, functionName, variable: nVar }
}

const exponentialLogLogScenario: ScenarioFactory = (random) => {
  const functionName = random.choice(scenarioFunctionNames)
  const loopVar = random.choice(outerLoopVariables)
  const tempVar = "m"
  const base = random.choice([2, 3])

  const logLogWhile: PseudoCodeWhile = {
    while: {
      condition: [{ variable: tempVar }, random.choice([">", "\\geq"]), random.int(2, 4).toString()],
      do: {
        block: [
          incrementState("w"),
          assignmentState(tempVar, [{ variable: tempVar }, "^{\\frac{1}{2}}"]),
        ],
      },
    },
  }

  const forLoop: PseudoCodeFor = {
    for: {
      variable: loopVar,
      from: ["1"],
      to: [base.toString(), "^{", { variable: nVar }, "}"],
      do: { block: [assignmentState(tempVar, asArray(nVar)), logLogWhile] },
    },
  }

  const code: PseudoCode = [
    {
      name: functionName,
      args: [nVar],
      body: {
        block: [assignmentState("w", ["0"]), forLoop, returnState("w")],
      },
    },
  ]

  const complexity = new SimpleAsymptoticTerm({
    variable: nVar,
    exponentialBase: base,
    loglogexponent: 1,
  })

  return { id: `exp-loglog-${base}`, code, complexity, functionName, variable: nVar }
}

const quadraticLogScenario: ScenarioFactory = (random, difficulty) => {
  const functionName = random.choice(scenarioFunctionNames)
  const outerVar = random.choice(outerLoopVariables)
  const innerVar = random.choice(innerLoopVariables)
  const tempVar = "m"

  const divisor = difficulty >= 5 ? random.int(3, 6) : random.int(2, 4)
  const outerExp = difficulty >= 5 ? random.int(2, 3) : 1
  const innerExp = difficulty >= 4 ? random.int(1, 2) : 1

  const logWhile: PseudoCodeWhile = {
    while: {
      condition: [{ variable: tempVar }, " > ", "1"],
      do: {
        block: [
          incrementState("w"),
          assignmentState(tempVar, [
            { variable: tempVar },
            " / ",
            divisor.toString(),
          ]),
        ],
      },
    },
  }

  const innerFor: PseudoCodeFor = {
    for: {
      variable: innerVar,
      from: ["1"],
      to: powerString(nVar, innerExp),
      do: { block: [assignmentState(tempVar, asArray(nVar)), logWhile] },
    },
  }

  const outerFor: PseudoCodeFor = {
    for: {
      variable: outerVar,
      from: ["1"],
      to: powerString(nVar, outerExp),
      do: { block: [innerFor] },
    },
  }

  const code: PseudoCode = [
    {
      name: functionName,
      args: [nVar],
      body: {
        block: [assignmentState("w", ["0"]), outerFor, returnState("w")],
      },
    },
  ]

  const complexity = new SimpleAsymptoticTerm({
    variable: nVar,
    polyexponent: outerExp + innerExp,
    logexponent: 1,
  })

  return { id: "quadratic-log", code, complexity, functionName, variable: nVar }
}

const logLogForScenario: ScenarioFactory = (random) => {
  const functionName = random.choice(scenarioFunctionNames)
  const loopVar = random.choice(outerLoopVariables)
  const limit: PseudoCodeString = ["\\log(\\log ", { variable: nVar }, ")"]

  const forLoop: PseudoCodeFor = {
    for: {
      variable: loopVar,
      from: [random.int(1,5).toString()],
      to: limit,
      do: { block: [incrementState("w", random.choice(["1","2","3","100"]))] },
    },
  }

  const code: PseudoCode = [
    {
      name: functionName,
      args: [nVar],
      body: {
        block: [assignmentState("w", ["0"]), forLoop, returnState("w")],
      },
    },
  ]

  const complexity = new SimpleAsymptoticTerm({ variable: nVar, loglogexponent: 1 })

  return { id: "loglog-for", code, complexity, functionName, variable: nVar }
}

const sqrtWhileLogLogScenario: ScenarioFactory = (random) => {
  const functionName = random.choice(scenarioFunctionNames)
  const tempVar = "m"
  const exponentOptions = [
    { value: 0.5, tex: "\\frac{1}{2}" },
    { value: 1 / 3, tex: "\\frac{1}{3}" },
    { value: 2 / 3, tex: "\\frac{2}{3}" },
  ]
  const exponent = random.choice(exponentOptions)

  const whileLoop: PseudoCodeWhile = {
    while: {
      condition: [{ variable: tempVar }, random.choice([">", "\\geq"]), random.int(2, 5).toString()],
      do: {
        block: [
          incrementState("w", 2),
          assignmentState(tempVar, [{ variable: tempVar }, "^{", exponent.tex, "}"]),
        ],
      },
    },
  }

  const code: PseudoCode = [
    {
      name: functionName,
      args: [nVar],
      body: {
        block: [
          assignmentState("w", ["0"]),
          assignmentState(tempVar, asArray(nVar)),
          whileLoop,
          returnState("w"),
        ],
      },
    },
  ]

  const complexity = new SimpleAsymptoticTerm({ variable: nVar, loglogexponent: 1 })

  return { id: "sqrt-while-loglog", code, complexity, functionName, variable: nVar }
}

const sqrtByStepScenario: ScenarioFactory = (random) => {
  const functionName = random.choice(scenarioFunctionNames)
  const loopVar = random.choice(outerLoopVariables)

  const randomRational = (minNum: number, maxNum: number, denom: number) => {
    const num = random.int(minNum, maxNum)
    return {
      num,
      denom,
      value: num / denom,
      tex: denom === 1 ? `${num}` : `${num}/${denom}`,
    }
  }

  const denom = random.choice([2, 3, 4, 6])
  let limitR = randomRational(4, 12, denom)
  let stepR = randomRational(1, 10, denom)

  if (limitR.num <= stepR.num) {
    ;[limitR, stepR] = [stepR, limitR]
  }

  const limit: PseudoCodeString = [{ variable: nVar }, "^{", limitR.tex, "}"]
  const step: PseudoCodeString = [{ variable: nVar }, "^{", stepR.tex, "}"]
  const whileLoop: PseudoCodeWhile = {
    while: {
      condition: [{ variable: loopVar }, " <= ", ...limit],
      do: {
        block: [incrementState("w"), assignmentState(loopVar, [{ variable: loopVar }, " + ", ...step])],
      },
    },
  }

  const code: PseudoCode = [
    {
      name: functionName,
      args: [nVar],
      body: {
        block: [
          assignmentState("w", ["0"]),
          assignmentState(loopVar, ["1"]),
          whileLoop,
          returnState("w"),
        ],
      },
    },
  ]

  const exponentDiff = (limitR.num - stepR.num) / denom
  const complexity = new SimpleAsymptoticTerm({
    variable: nVar,
    polyexponent: exponentDiff,
  })

  return {
    id: `sqrt-by-step-${limitR.tex}-${stepR.tex}`,
    code,
    complexity,
    functionName,
    variable: nVar,
  }
}

const harmonicInnerScenario: ScenarioFactory = (random) => {
  const functionName = random.choice(scenarioFunctionNames)
  const outerVar = random.choice(outerLoopVariables)
  let innerVar = random.choice(innerLoopVariables)
  while (innerVar === outerVar) {
    innerVar = random.choice(innerLoopVariables)
  }

  const innerLimit: PseudoCodeString = ["\\frac{", { variable: nVar }, "}{", { variable: outerVar }, "}"]

  const innerFor: PseudoCodeFor = {
    for: {
      variable: innerVar,
      from: [random.int(1, 4).toString()],
      to: innerLimit,
      do: { block: [incrementState("w")] },
    },
  }

  const outerFor: PseudoCodeFor = {
    for: {
      variable: outerVar,
      from: ["1"],
      to: asArray(nVar),
      do: { block: [innerFor] },
    },
  }

  const code: PseudoCode = [
    {
      name: functionName,
      args: [nVar],
      body: {
        block: [assignmentState("w", ["0"]), outerFor, returnState("w")],
      },
    },
  ]

  const complexity = new SimpleAsymptoticTerm({ variable: nVar, polyexponent: 1, logexponent: 1 })

  return { id: "harmonic-inner", code, complexity, functionName, variable: nVar }
}

const logSummationScenario: ScenarioFactory = (random) => {
  const functionName = random.choice(scenarioFunctionNames)
  const outerVar = random.choice(outerLoopVariables)
  const tempVar = "m"

  const innerWhile: PseudoCodeWhile = {
    while: {
      condition: [{ variable: tempVar }, random.choice([">", "\\geq"]), random.choice(["2", "3", "10", "100"])],
      do: {
        block: [
          incrementState("w"),
          assignmentState(tempVar, ["\\frac{", { variable: tempVar }, `}{${random.int(2,4)}}`]),
        ],
      },
    },
  }

  const outerFor: PseudoCodeFor = {
    for: {
      variable: outerVar,
      from: ["1"],
      to: asArray(nVar),
      do: { block: [assignmentState(tempVar, [{ variable: outerVar }]), innerWhile] },
    },
  }

  const code: PseudoCode = [
    {
      name: functionName,
      args: [nVar],
      body: {
        block: [assignmentState("w", ["0"]), outerFor, returnState("w")],
      },
    },
  ]

  const complexity = new SimpleAsymptoticTerm({ variable: nVar, polyexponent: 1, logexponent: 1 })

  return { id: "log-summation", code, complexity, functionName, variable: nVar }
}

const factorialForScenario: ScenarioFactory = (random) => {
  const functionName = random.choice(scenarioFunctionNames)
  const loopVar = random.choice(outerLoopVariables)
  const exponent = random.choice([1, 5])
  const limit: PseudoCodeString =
    exponent === 1 ? [{ variable: nVar }, "!"] : ["(", { variable: nVar }, "!)^", exponent.toString()]

  const bodyVariants = [
    [incrementState("w")],
    [assignmentState("w", ["w", "+", "1"])],
    [assignmentState("w", ["w", "+", loopVar])], // still Θ(n!) iterations
    [assignmentState("w", ["w", "+", "2"])],
  ]

  const isReverse = random.bool()

  const forLoop: PseudoCodeFor = {
    for: {
      variable: loopVar,
      from: isReverse ? limit : ["1"],
      to: isReverse ? ["1"] : limit,
      do: { block: random.choice(bodyVariants) },
    },
  }

  const maybeInnerLoop = random.bool()
    ? [
        {
          for: {
            variable: "j",
            from: ["1"],
            to: ["5"], // constant
            do: { block: [incrementState("w")] },
          },
        },
      ]
    : []
  const code: PseudoCode = [
    {
      name: functionName,
      args: [nVar],
      body: {
        block: [...maybeInnerLoop, assignmentState("w", ["0"]), forLoop, returnState("w")],
      },
    },
  ]

  const complexity = new SimpleAsymptoticTerm({ variable: nVar, factorialExponent: exponent })

  return { id: `factorial-for-${exponent}`, code, complexity, functionName, variable: nVar }
}

const factorialLogScenario: ScenarioFactory = (random) => {
  const functionName = random.choice(scenarioFunctionNames)
  const loopVar = random.choice(outerLoopVariables)
  const tempVar = "m"
  const exponent = random.choice([1, 2])
  const limit: PseudoCodeString =
    exponent === 1 ? [{ variable: nVar }, "!"] : ["(", { variable: nVar }, "!)^", exponent.toString()]

  const logWhile: PseudoCodeWhile = {
    while: {
      condition: [{ variable: tempVar }, " > ", "1"],
      do: {
        block: [
          incrementState("w"),
          assignmentState(tempVar, ["\\lfloor ", { variable: tempVar }, " / 2 \\rfloor"]),
        ],
      },
    },
  }

  const forLoop: PseudoCodeFor = {
    for: {
      variable: loopVar,
      from: ["1"],
      to: limit,
      do: { block: [assignmentState(tempVar, asArray(nVar)), logWhile] },
    },
  }

  const code: PseudoCode = [
    {
      name: functionName,
      args: [nVar],
      body: {
        block: [assignmentState("w", ["0"]), forLoop, returnState("w")],
      },
    },
  ]

  const complexity = new SimpleAsymptoticTerm({
    variable: nVar,
    factorialExponent: exponent,
    logexponent: 1,
  })

  return { id: `factorial-log-${exponent}`, code, complexity, functionName, variable: nVar }
}

const factorialLogLogScenario: ScenarioFactory = (random) => {
  const functionName = random.choice(scenarioFunctionNames)
  const loopVar = random.choice(outerLoopVariables)
  const tempVar = "m"
  const exponent = random.choice([1, 2])
  const limit: PseudoCodeString =
    exponent === 1 ? [{ variable: nVar }, "!"] : ["(", { variable: nVar }, "!)^", exponent.toString()]

  const logLogWhile: PseudoCodeWhile = {
    while: {
      condition: [{ variable: tempVar }, " > ", "2"],
      do: {
        block: [
          incrementState("w"),
          assignmentState(tempVar, ["\\lfloor ", { variable: tempVar }, "^{1/2} \\rfloor"]),
        ],
      },
    },
  }

  const forLoop: PseudoCodeFor = {
    for: {
      variable: loopVar,
      from: ["1"],
      to: limit,
      do: { block: [assignmentState(tempVar, asArray(nVar)), logLogWhile] },
    },
  }

  const code: PseudoCode = [
    {
      name: functionName,
      args: [nVar],
      body: {
        block: [assignmentState("w", ["0"]), forLoop, returnState("w")],
      },
    },
  ]

  const complexity = new SimpleAsymptoticTerm({
    variable: nVar,
    factorialExponent: exponent,
    loglogexponent: 1,
  })

  return { id: `factorial-loglog-${exponent}`, code, complexity, functionName, variable: nVar }
}

const sqrtSummationScenario: ScenarioFactory = (random) => {
  const functionName = random.choice(scenarioFunctionNames)
  const outerVar = random.choice(outerLoopVariables)
  let innerVar = random.choice(innerLoopVariables)
  while (innerVar === outerVar) {
    innerVar = random.choice(innerLoopVariables)
  }

  const innerLimit: PseudoCodeString = [{ variable: outerVar }, "^{\\frac{1}{2}}"]

  const innerFor: PseudoCodeFor = {
    for: {
      variable: innerVar,
      from: ["1"],
      to: innerLimit,
      do: { block: [incrementState("w")] },
    },
  }

  const outerFor: PseudoCodeFor = {
    for: {
      variable: outerVar,
      from: ["1"],
      to: asArray(nVar),
      do: { block: [innerFor] },
    },
  }

  const code: PseudoCode = [
    {
      name: functionName,
      args: [nVar],
      body: {
        block: [assignmentState("w", ["0"]), outerFor, returnState("w")],
      },
    },
  ]

  const complexity = new SimpleAsymptoticTerm({ variable: nVar, polyexponent: 1.5 })

  return { id: "sqrt-summation", code, complexity, functionName, variable: nVar }
}

const logLogNestedScenario: ScenarioFactory = (random) => {
  const functionName = random.choice(scenarioFunctionNames)
  const outerVar = random.choice(outerLoopVariables)
  const tempVar = "m"

  const innerWhile: PseudoCodeWhile = {
    while: {
      condition: [{ variable: tempVar }, random.choice([">", "\\geq"]), "2"],
      do: {
        block: [
          incrementState("w"),
          assignmentState(tempVar, [{ variable: tempVar }, `^{\\frac{1}{${random.int(2, 5)}}}`]),
        ],
      },
    },
  }

  const outerFor: PseudoCodeFor = {
    for: {
      variable: outerVar,
      from: ["1"],
      to: asArray(nVar),
      do: { block: [assignmentState(tempVar, asArray(nVar)), innerWhile] },
    },
  }

  const code: PseudoCode = [
    {
      name: functionName,
      args: [nVar],
      body: {
        block: [assignmentState("w", ["0"]), outerFor, returnState("w")],
      },
    },
  ]

  const complexity = new SimpleAsymptoticTerm({ variable: nVar, polyexponent: 1, loglogexponent: 1 })

  return { id: "loglog-nested", code, complexity, functionName, variable: nVar }
}

const logLogSquaredScenario: ScenarioFactory = (random) => {
  const functionName = random.choice(scenarioFunctionNames)
  const outerVar = "m"
  const innerVar = "k"
  const randomValue = random.int(2, 5).toString()

  const innerWhile: PseudoCodeWhile = {
    while: {
      condition: [{ variable: innerVar }, ">", randomValue],
      do: {
        block: [
          incrementState("w"),
          assignmentState(innerVar, [{ variable: innerVar }, `^\\frac{1}{${randomValue}}`]),
        ],
      },
    },
  }

  const outerWhile: PseudoCodeWhile = {
    while: {
      condition: [{ variable: outerVar }, ">", randomValue],
      do: {
        block: [
          assignmentState(innerVar, [{ variable: outerVar }]),
          innerWhile,
          assignmentState(outerVar, [{ variable: outerVar }, `^\\frac{1}{${randomValue}}`]),
        ],
      },
    },
  }

  const code: PseudoCode = [
    {
      name: functionName,
      args: [nVar],
      body: {
        block: [
          assignmentState("w", ["0"]),
          assignmentState(outerVar, asArray(nVar)),
          outerWhile,
          returnState("w"),
        ],
      },
    },
  ]

  const complexity = new SimpleAsymptoticTerm({ variable: nVar, loglogexponent: 2 })

  return { id: "loglog-squared", code, complexity, functionName, variable: nVar }
}

const logLogTimesLogScenario: ScenarioFactory = (random) => {
  const functionName = random.choice(scenarioFunctionNames)
  const outerVar = "m"
  const innerVar = "k"

  const innerWhile: PseudoCodeWhile = {
    while: {
      condition: [{ variable: innerVar }, random.choice([">", "\\geq"]), "4"],
      do: {
        block: [
          incrementState("w"),
          assignmentState(innerVar, [{ variable: innerVar }, `^{\\frac{1}{${random.int(2, 5)}}}`]),
        ],
      },
    },
  }

  const outerWhile: PseudoCodeWhile = {
    while: {
      condition: [{ variable: outerVar }, ">", "1"],
      do: {
        block: [
          assignmentState(innerVar, [{ variable: outerVar }]),
          innerWhile,
          assignmentState(outerVar, [{ variable: outerVar }, `\\cdot {\\frac{1}{${random.int(2, 5)}}}`]),
        ],
      },
    },
  }

  const code: PseudoCode = [
    {
      name: functionName,
      args: [nVar],
      body: {
        block: [
          assignmentState("w", ["0"]),
          assignmentState(outerVar, asArray(nVar)),
          outerWhile,
          returnState("w"),
        ],
      },
    },
  ]

  const complexity = new SimpleAsymptoticTerm({
    variable: nVar,
    logexponent: 1,
    loglogexponent: 1,
  })

  return { id: "log-loglog", code, complexity, functionName, variable: nVar }
}

const sqrtLogSquaredScenario: ScenarioFactory = (random) => {
  const functionName = random.choice(scenarioFunctionNames)
  const outerVar = random.choice(outerLoopVariables)
  const tempVar = "m"
  const innerVar = "k"
  const polyExponent = random.choice([0.25, 0.5, 0.75, 1, 2])

  const innerWhile: PseudoCodeWhile = {
    while: {
      condition: [{ variable: innerVar }, random.choice([">", "\\geq"]), random.int(1, 5).toString()],
      do: {
        block: [
          incrementState("w"),
          assignmentState(innerVar, ["\\frac{", { variable: innerVar }, `}{${random.int(2, 5)}}`]),
        ],
      },
    },
  }

  const outerWhile: PseudoCodeWhile = {
    while: {
      condition: [{ variable: tempVar }, " > ", "1"],
      do: {
        block: [
          incrementState("w"),
          assignmentState(tempVar, ["\\frac{", { variable: tempVar }, "}{2}"]),
          assignmentState(innerVar, asArray(nVar)),
          innerWhile,
        ],
      },
    },
  }

  const forLoop: PseudoCodeFor = {
    for: {
      variable: outerVar,
      from: ["1"],
      // to: [{ variable: nVar }, "^{1/2}"],
      to: powerString(nVar, toFraction(polyExponent)),
      do: { block: [assignmentState(tempVar, asArray(nVar)), outerWhile] },
    },
  }

  const code: PseudoCode = [
    {
      name: functionName,
      args: [nVar],
      body: {
        block: [assignmentState("w", ["0"]), forLoop, returnState("w")],
      },
    },
  ]

  const complexity = new SimpleAsymptoticTerm({
    variable: nVar,
    polyexponent: polyExponent,
    logexponent: 2,
  })

  return { id: "sqrt-log-squared", code, complexity, functionName, variable: nVar }
}

const expLogSquaredScenario: ScenarioFactory = (random) => {
  const functionName = random.choice(scenarioFunctionNames)
  const outerVar = random.choice(outerLoopVariables)
  const tempVar = "m"
  const innerVar = "k"
  const base = random.choice([2, 3])

  const innerWhile: PseudoCodeWhile = {
    while: {
      condition: [{ variable: innerVar }, " > ", "1"],
      do: {
        block: [
          incrementState("w"),
          assignmentState(innerVar, ["\\frac{", { variable: innerVar }, `}{${random.int(2, 5)}}`]),
        ],
      },
    },
  }

  const outerWhile: PseudoCodeWhile = {
    while: {
      condition: [{ variable: tempVar }, random.choice([">", "\\geq"]), random.int(2, 5).toString()],
      do: {
        block: [
          incrementState("w"),
          assignmentState(tempVar, ["\\frac{", { variable: tempVar }, "}{2}"]),
          assignmentState(innerVar, asArray(nVar)),
          innerWhile,
        ],
      },
    },
  }

  const forLoop: PseudoCodeFor = {
    for: {
      variable: outerVar,
      from: ["1"],
      to: [base.toString(), "^{", { variable: nVar }, "}"],
      do: { block: [assignmentState(tempVar, asArray(nVar)), outerWhile] },
    },
  }

  const code: PseudoCode = [
    {
      name: functionName,
      args: [nVar],
      body: {
        block: [assignmentState("w", ["0"]), forLoop, returnState("w")],
      },
    },
  ]

  const complexity = new SimpleAsymptoticTerm({
    variable: nVar,
    exponentialBase: base,
    logexponent: 2,
  })

  return { id: `exp-log-squared-${base}`, code, complexity, functionName, variable: nVar }
}

const harmonicLogScenario: ScenarioFactory = (random) => {
  const functionName = random.choice(scenarioFunctionNames)
  const outerVar = random.choice(outerLoopVariables)
  let innerVar = random.choice(innerLoopVariables)
  while (innerVar === outerVar) {
    innerVar = random.choice(innerLoopVariables)
  }
  const tempVar = "m"

  const innerLimit: PseudoCodeString = [
    "\\frac{",
    { variable: nVar },
    "}{",
    { variable: outerVar },
    "}",
  ]

  const innerWhile: PseudoCodeWhile = {
    while: {
      condition: [{ variable: tempVar }, random.choice([">", "\\geq"]), random.choice(["2", "3", "10"])],
      do: {
        block: [
          incrementState("w"),
          assignmentState(tempVar, ["\\frac{", { variable: tempVar }, `}{${random.int(2, 4)}}`]),
        ],
      },
    },
  }

  const innerFor: PseudoCodeFor = {
    for: {
      variable: innerVar,
      from: [random.int(-1, 3).toString()],
      to: innerLimit,
      do: { block: [assignmentState(tempVar, [{ variable: innerVar }]), innerWhile] },
    },
  }

  const outerFor: PseudoCodeFor = {
    for: {
      variable: outerVar,
      from: [random.int(1,2).toString()],
      to: asArray(nVar),
      do: { block: [innerFor] },
    },
  }

  const code: PseudoCode = [
    {
      name: functionName,
      args: [nVar],
      body: {
        block: [assignmentState("w", ["0"]), outerFor, returnState("w")],
      },
    },
  ]

  const complexity = new SimpleAsymptoticTerm({ variable: nVar, polyexponent: 1, logexponent: 2 })

  return { id: "harmonic-log", code, complexity, functionName, variable: nVar }
}

const exponentialPolyScenario: ScenarioFactory = (random) => {
  const functionName = random.choice(scenarioFunctionNames)
  const loopVar = random.choice(outerLoopVariables)
  let innerVar = random.choice(innerLoopVariables)
  while (innerVar === loopVar) {
    innerVar = random.choice(innerLoopVariables)
  }
  const base = random.choice([2, 5])
  const polyExp = random.choice([1, 3])

  const innerFor: PseudoCodeFor = {
    for: {
      variable: innerVar,
      from: ["1"],
      to: powerString(nVar, polyExp),
      do: { block: [incrementState("w")] },
    },
  }

  const outerFor: PseudoCodeFor = {
    for: {
      variable: loopVar,
      from: ["1"],
      to: [base.toString(), "^{", { variable: nVar }, "}"],
      do: { block: [innerFor] },
    },
  }

  const code: PseudoCode = [
    {
      name: functionName,
      args: [nVar],
      body: {
        block: [assignmentState("w", ["0"]), outerFor, returnState("w")],
      },
    },
  ]

  const complexity = new SimpleAsymptoticTerm({
    variable: nVar,
    exponentialBase: base,
    polyexponent: polyExp,
  })

  return { id: `exp-poly-${base}-${polyExp}`, code, complexity, functionName, variable: nVar }
}

const factorialNestedScenario: ScenarioFactory = (random) => {
  const functionName = random.choice(scenarioFunctionNames)
  const outerVar = random.choice(outerLoopVariables)
  let innerVar = random.choice(innerLoopVariables)
  while (innerVar === outerVar) {
    innerVar = random.choice(innerLoopVariables)
  }
  const exponent = random.choice([1, 2])
  const limit: PseudoCodeString =
    exponent === 1
      ? [{ variable: outerVar }, "!"]
      : ["(", { variable: outerVar }, "!)^", exponent.toString()]

  const innerFor: PseudoCodeFor = {
    for: {
      variable: innerVar,
      from: ["1"],
      to: limit,
      do: { block: [incrementState("w")] },
    },
  }

  const outerFor: PseudoCodeFor = {
    for: {
      variable: outerVar,
      from: ["1"],
      to: asArray(nVar),
      do: { block: [innerFor] },
    },
  }

  const code: PseudoCode = [
    {
      name: functionName,
      args: [nVar],
      body: {
        block: [assignmentState("w", ["0"]), outerFor, returnState("w")],
      },
    },
  ]

  const complexity = new SimpleAsymptoticTerm({ variable: nVar, factorialExponent: exponent })

  return { id: `factorial-nested-${exponent}`, code, complexity, functionName, variable: nVar }
}

const earlyBreakScenario: ScenarioFactory = (random, difficulty) => {
  const functionName = random.choice(scenarioFunctionNames)
  const loopVar = random.choice(outerLoopVariables)
  const breakAfter = difficulty <= 3 ? random.int(1, 3) : random.int(2, 5)

  const breakIf: PseudoCodeIf = {
    if: {
      condition: [{ variable: loopVar }, " >= ", breakAfter.toString()],
      then: { block: [breakState()] },
    },
  }

  const forLoop: PseudoCodeFor = {
    for: {
      variable: loopVar,
      from: ["1"],
      to: asArray(nVar),
      do: { block: [incrementState("w"), breakIf] },
    },
  }

  const code: PseudoCode = [
    {
      name: functionName,
      args: [nVar],
      body: { block: [assignmentState("w", ["0"]), forLoop, returnState("w")] },
    },
  ]

  const complexity = new SimpleAsymptoticTerm({ variable: nVar, polyexponent: 0 })

  return { id: "early-break-constant", code, complexity, functionName, variable: nVar }
}

const fixedIterationsScenario: ScenarioFactory = (random) => {
  const functionName = random.choice(scenarioFunctionNames)
  const loopVar = random.choice(outerLoopVariables)
  const iterations = random.int(2, 6)

  const forLoop: PseudoCodeFor = {
    for: {
      variable: loopVar,
      from: ["1"],
      to: [iterations.toString()],
      do: { block: [incrementState("w")] },
    },
  }

  const code: PseudoCode = [
    {
      name: functionName,
      args: [nVar],
      body: { block: [assignmentState("w", ["0"]), forLoop, returnState("w")] },
    },
  ]

  const complexity = new SimpleAsymptoticTerm({ variable: nVar, polyexponent: 0 })

  return { id: "fixed-iterations", code, complexity, functionName, variable: nVar }
}

const buildScenarioPool = (difficulty: number): ScenarioFactory[] => {
  const options: Array<{ factory: ScenarioFactory; weight: number; min?: number; max?: number }> = [
    { factory: simpleForScenario, weight: difficulty <= 2 ? 2 : 0 },
    { factory: constInnerForScenario, weight: difficulty <= 3 ? 1 : 0 },
    { factory: setIterationScenario, weight: difficulty <= 4 ? 2 : 1 },
    { factory: steppedForScenario, weight: 2 },
    { factory: geometricDecayScenario, weight: difficulty >= 3 ? 1 : 0 },
    { factory: halveWhileScenario, weight: 2 },
    { factory: doubleHalvingWhileScenario, weight: difficulty >= 4 ? 2 : 0 },
    { factory: forWhileLogScenario, weight: difficulty >= 3 ? 2 : 0 },
    { factory: whileForScenario, weight: difficulty >= 3 ? 2 : 0 },
    { factory: nestedForScenario, weight: difficulty >= 4 ? 2 : 1 },
    { factory: triangularForScenario, weight: difficulty >= 4 ? 2 : 1 },
    { factory: quadraticLogScenario, weight: difficulty >= 4 ? 2 : 0 },
    { factory: tripleNestedForScenario, weight: difficulty >= 5 ? 2 : 0 },
    { factory: sqrtForLogScenario, weight: difficulty >= 4 ? 2 : 0 },
    { factory: fractionalPowerForScenario, weight: difficulty >= 3 ? 3 : 1 },
    { factory: exponentialSumScenario, weight: difficulty >= 5 ? 2 : 0 },
    { factory: exponentialDirectScenario, weight: difficulty >= 5 ? 2 : 0 },
    { factory: exponentialLogScenario, weight: difficulty >= 6 ? 2 : 0 },
    { factory: exponentialLogLogScenario, weight: difficulty >= 6 ? 2 : 0 },
    { factory: logLogForScenario, weight: difficulty >= 4 ? 2 : 0 },
    { factory: sqrtWhileLogLogScenario, weight: difficulty >= 5 ? 2 : 0 },
    { factory: sqrtByStepScenario, weight: difficulty >= 5 ? 2 : 0 },
    { factory: harmonicInnerScenario, weight: difficulty >= 5 ? 2 : 0 },
    { factory: logSummationScenario, weight: difficulty >= 5 ? 2 : 0 },
    { factory: harmonicLogScenario, weight: difficulty >= 6 ? 2 : 0 },
    { factory: logLogSquaredScenario, weight: difficulty >= 6 ? 2 : 0 },
    { factory: logLogTimesLogScenario, weight: difficulty >= 6 ? 2 : 0 },
    { factory: sqrtLogSquaredScenario, weight: difficulty >= 6 ? 2 : 0 },
    { factory: expLogSquaredScenario, weight: difficulty >= 6 ? 2 : 0 },
    { factory: exponentialPolyScenario, weight: difficulty >= 6 ? 2 : 0 },
    { factory: sqrtSummationScenario, weight: difficulty >= 5 ? 2 : 0 },
    { factory: logLogNestedScenario, weight: difficulty >= 5 ? 2 : 0 },
    { factory: factorialForScenario, weight: difficulty >= 6 ? 2 : 0 },

    { factory: factorialLogScenario, weight: difficulty >= 6 ? 2 : 0 },

    { factory: factorialLogLogScenario, weight: difficulty >= 6 ? 2 : 0 },
    { factory: factorialNestedScenario, weight: difficulty >= 6 ? 2 : 0 },
    { factory: earlyBreakScenario, weight: difficulty <= 4 ? 2 : 0 },
    { factory: fixedIterationsScenario, weight: difficulty <= 3 ? 1 : 0 },
  ]

  const pool: ScenarioFactory[] = []
  for (const option of options) {
    if (option.weight <= 0) continue
    if (option.min && difficulty < option.min) continue
    if (option.max && difficulty > option.max) continue
    for (let i = 0; i < option.weight; i++) {
      pool.push(option.factory)
    }
  }

  // return pool.length > 0 ? pool : [simpleForScenario]
  return [factorialLogScenario]
}

export { buildScenarioPool }

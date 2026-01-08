import type {
  PseudoCode,
  PseudoCodeBlock,
  PseudoCodeFor,
  PseudoCodeForAll,
  PseudoCodeIf,
  PseudoCodeString,
  PseudoCodeWhile,
} from "../../../utils/pseudoCodeUtils.ts"
import { SimpleAsymptoticTerm } from "../asymptoticsUtils.ts"
import {
  asArray,
  assignmentState,
  breakState,
  incrementState,
  pickWeightedVariant,
  powerString,
  returnState,
  type ScenarioFactory,
  type StepVariant,
} from "./asymptoticLoopsHelpers.ts"

const scenarioFunctionNames = ["loop", "loopFun", "process", "iterate", "compute"]
const outerLoopVariables = ["i", "k", "p"]
const innerLoopVariables = ["j", "q", "r"]
const whileVariables = ["x", "y", "z"]

const nestedForScenario: ScenarioFactory = (random, difficulty) => {
  const nVar = "n"
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

const forWhileLogScenario: ScenarioFactory = (random, difficulty) => {
  const nVar = "n"
  const functionName = random.choice(scenarioFunctionNames)
  const outerVar = random.choice(outerLoopVariables)
  const divisor = difficulty <= 2 ? 2 : random.int(2, difficulty >= 5 ? 5 : 3)
  const outerExponent = difficulty <= 2 ? 1 : random.int(1, difficulty >= 5 ? 3 : 2)
  const tempVar = "m"

  const whileBlock: PseudoCodeBlock = {
    block: [
      {
        if: {
          condition: [{ variable: tempVar }, " \\mod ", divisor.toString(), " = 0"],
          then: { block: [incrementState("w")] },
        },
      },
      assignmentState(tempVar, [
        "\\lfloor ",
        { variable: tempVar },
        " / ",
        divisor.toString(),
        " \\rfloor",
      ]),
    ],
  }

  const whileLoop: PseudoCodeWhile = {
    while: {
      condition: [{ variable: tempVar }, " > ", "1"],
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
        block: [assignmentState("w", ["0"]), outerFor, returnState("w")],
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

const whileForScenario: ScenarioFactory = (random, difficulty) => {
  const nVar = "n"
  const functionName = random.choice(scenarioFunctionNames)
  const outerVar = random.choice(whileVariables)
  const innerVar = random.choice(innerLoopVariables)
  const factor = difficulty <= 2 ? 2 : random.int(2, difficulty >= 5 ? 5 : 4)
  const innerExponent = difficulty <= 2 ? 1 : random.int(1, difficulty >= 4 ? 2 : 1)

  const innerIf: PseudoCodeIf = {
    if: {
      condition: [{ variable: innerVar }, " < ", { variable: outerVar }],
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
    block: [innerFor, assignmentState(outerVar, [{ variable: outerVar }, " * ", factor.toString()])],
  }

  const whileLoop: PseudoCodeWhile = {
    while: {
      condition: [{ variable: outerVar }, " < ", { variable: nVar }],
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

const simpleForScenario: ScenarioFactory = (random) => {
  const nVar = "n"
  const functionName = random.choice(scenarioFunctionNames)
  const loopVar = random.choice(outerLoopVariables)

  const forLoop: PseudoCodeFor = {
    for: {
      variable: loopVar,
      from: ["1"],
      to: asArray(nVar),
      do: { block: [incrementState("w")] },
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

const constInnerForScenario: ScenarioFactory = (random, difficulty) => {
  const nVar = "n"
  const functionName = random.choice(scenarioFunctionNames)
  const outerVar = random.choice(outerLoopVariables)
  const innerVar = random.choice(innerLoopVariables)
  const innerLimit = difficulty <= 2 ? 2 : random.int(2, 4)

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

const steppedForScenario: ScenarioFactory = (random) => {
  const nVar = "n"
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

  const usesMultiplicative = stepVariant.kind === "mul"

  const loopBlock: PseudoCodeBlock = usesMultiplicative
    ? {
        block: [
          incrementState("w"),
          assignmentState(loopVar, [
            "\\lfloor ",
            { variable: loopVar },
            " * ",
            stepVariant.factor.toString(),
            " \\rfloor",
          ]),
        ],
      }
    : {
        block: [
          incrementState("w", stepVariant.step),
          assignmentState(loopVar, [{ variable: loopVar }, "+", stepVariant.step.toString()]),
        ],
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

  const complexity = usesMultiplicative
    ? new SimpleAsymptoticTerm({ variable: nVar, logexponent: 1 })
    : new SimpleAsymptoticTerm({ variable: nVar, polyexponent: 1 })

  return { id: `stepped-for-${stepVariant.label}`, code, complexity, functionName, variable: nVar }
}

const triangularForScenario: ScenarioFactory = (random) => {
  const nVar = "n"
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

const halveWhileScenario: ScenarioFactory = (random) => {
  const nVar = "n"
  const functionName = random.choice(scenarioFunctionNames)
  const tempVar = "m"

  const whileLoop: PseudoCodeWhile = {
    while: {
      condition: [{ variable: tempVar }, " > ", "0"],
      do: {
        block: [
          incrementState("w"),
          assignmentState(tempVar, ["\\lfloor ", { variable: tempVar }, " / 2 \\rfloor"]),
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

  const complexity = new SimpleAsymptoticTerm({
    variable: nVar,
    logexponent: 1,
  })

  return { id: "halve-while", code, complexity, functionName, variable: nVar }
}

const doubleHalvingWhileScenario: ScenarioFactory = (random) => {
  const nVar = "n"
  const functionName = random.choice(scenarioFunctionNames)
  const outerVar = "m"
  const innerVar = "p"

  const innerWhile: PseudoCodeWhile = {
    while: {
      condition: [{ variable: innerVar }, " > ", "1"],
      do: {
        block: [
          incrementState("w"),
          assignmentState(innerVar, ["\\lfloor ", { variable: innerVar }, " / 2 \\rfloor"]),
        ],
      },
    },
  }

  const outerWhile: PseudoCodeWhile = {
    while: {
      condition: [{ variable: outerVar }, " > ", "1"],
      do: {
        block: [
          assignmentState(innerVar, [{ variable: outerVar }]),
          innerWhile,
          assignmentState(outerVar, ["\\lfloor ", { variable: outerVar }, " / 2 \\rfloor"]),
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

const quadraticLogScenario: ScenarioFactory = (random, difficulty) => {
  const nVar = "n"
  const functionName = random.choice(scenarioFunctionNames)
  const outerVar = random.choice(outerLoopVariables)
  const innerVar = random.choice(innerLoopVariables)
  const tempVar = "m"

  const divisor = difficulty >= 6 ? random.int(3, 6) : random.int(2, 4)
  const outerExp = difficulty >= 6 ? random.int(2, 3) : 1
  const innerExp = difficulty >= 5 ? random.int(1, 2) : 1

  const logWhile: PseudoCodeWhile = {
    while: {
      condition: [{ variable: tempVar }, " > ", "1"],
      do: {
        block: [
          incrementState("w"),
          assignmentState(tempVar, [
            "\\lfloor ",
            { variable: tempVar },
            " / ",
            divisor.toString(),
            " \\rfloor",
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

const tripleNestedForScenario: ScenarioFactory = (random, difficulty) => {
  const nVar = "n"
  const functionName = random.choice(scenarioFunctionNames)
  const vars = random.subset(outerLoopVariables.concat(innerLoopVariables), 3)
  const [a, b, c] = vars
  const exps = [
    random.int(1, 2),
    random.int(1, difficulty >= 6 ? 3 : 2),
    random.int(1, difficulty >= 6 ? 2 : 1),
  ]

  const innermostFor: PseudoCodeFor = {
    for: {
      variable: c,
      from: ["1"],
      to: powerString(nVar, exps[2]),
      do: { block: [incrementState("w")] },
    },
  }

  const middleFor: PseudoCodeFor = {
    for: {
      variable: b,
      from: ["1"],
      to: powerString(nVar, exps[1]),
      do: { block: [innermostFor] },
    },
  }

  const outerFor: PseudoCodeFor = {
    for: {
      variable: a,
      from: ["1"],
      to: powerString(nVar, exps[0]),
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
    polyexponent: exps[0] + exps[1] + exps[2],
  })

  return { id: "triple-nested-for", code, complexity, functionName, variable: nVar }
}

const sqrtForLogScenario: ScenarioFactory = (random) => {
  const nVar = "n"
  const functionName = random.choice(scenarioFunctionNames)
  const loopVar = random.choice(outerLoopVariables)
  const tempVar = "m"
  const limit: PseudoCodeString = ["\\lfloor ", { variable: nVar }, "^{0.5} \\rfloor"]

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

  const complexity = new SimpleAsymptoticTerm({ variable: nVar, polyexponent: 0.5, logexponent: 1 })

  return { id: "sqrt-for-log", code, complexity, functionName, variable: nVar }
}

const geometricGrowthScenario: ScenarioFactory = (random) => {
  const nVar = "n"
  const functionName = random.choice(scenarioFunctionNames)
  const loopVar = random.choice(outerLoopVariables)
  const factorVariant = pickWeightedVariant(random, [
    { kind: "mul" as const, factor: 2, label: "x2", weight: 4 },
    { kind: "mul" as const, factor: 3, label: "x3", weight: 2 },
    { kind: "mul" as const, factor: 10, label: "x10", weight: 1 },
    { kind: "mul" as const, factor: 1000, label: "x1000", weight: 1 },
  ])

  const whileLoop: PseudoCodeWhile = {
    while: {
      condition: [{ variable: loopVar }, " <= ", { variable: nVar }],
      do: {
        block: [
          incrementState("w"),
          assignmentState(loopVar, [
            "\\lfloor ",
            { variable: loopVar },
            " * ",
            factorVariant.factor.toString(),
            " \\rfloor",
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
          assignmentState(loopVar, ["1"]),
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
    id: `geometric-growth-${factorVariant.label}`,
    code,
    complexity,
    functionName,
    variable: nVar,
  }
}

const geometricDecayScenario: ScenarioFactory = (random) => {
  const nVar = "n"
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
            "\\lfloor ",
            { variable: loopVar },
            " * ",
            factor.toString(),
            " \\rfloor",
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

const setIterationScenario: ScenarioFactory = (random) => {
  const nVar = "n"
  const functionName = random.choice(scenarioFunctionNames)
  const elementVar = random.choice(innerLoopVariables)
  const constantSized = random.bool(0.35)
  const constantSize = random.int(2, 5)
  const setLabel: PseudoCodeString = constantSized
    ? ["S (size ", constantSize.toString(), ")"]
    : ["S (|S| = ", { variable: nVar }, ")"]

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

const earlyBreakScenario: ScenarioFactory = (random, difficulty) => {
  const nVar = "n"
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
  const nVar = "n"
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
    { factory: geometricGrowthScenario, weight: difficulty >= 3 ? 2 : 1 },
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

  return pool.length > 0 ? pool : [simpleForScenario]
}

export { buildScenarioPool }

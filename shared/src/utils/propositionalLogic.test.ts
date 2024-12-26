import { describe, expect, test } from "vitest"
import { MinimalNormalForm } from "@shared/utils/propositionalLogicMinimize.ts"
import {
  associativeOperators,
  BinaryOperatorType,
  compareExpressions,
  getResolutionTerms,
  Literal,
  literalListsEqual,
  Operator,
  ParserError,
  PropositionalLogicParser,
} from "./propositionalLogic"
import Random, { sampleRandomSeed } from "./random.ts"

const v = [new Literal("x1"), new Literal("x2"), new Literal("x3")]
const notV = [new Literal("x1", true), new Literal("x2", true), new Literal("x3", true)]

describe("operators", () => {
  test("not", () => {
    const expression = notV[0]
    expect(expression.eval({ x1: false })).toStrictEqual(true)
    expect(expression.eval({ x1: true })).toStrictEqual(false)
  })

  test("and", () => {
    const expression = new Operator("\\and", v[0], v[1])
    expect(expression.eval({ x1: false, x2: false })).toStrictEqual(false)
    expect(expression.eval({ x1: false, x2: true })).toStrictEqual(false)
    expect(expression.eval({ x1: true, x2: false })).toStrictEqual(false)
    expect(expression.eval({ x1: true, x2: true })).toStrictEqual(true)
  })

  test("or", () => {
    const expression = new Operator("\\or", v[0], v[1])
    expect(expression.eval({ x1: false, x2: false })).toStrictEqual(false)
    expect(expression.eval({ x1: false, x2: true })).toStrictEqual(true)
    expect(expression.eval({ x1: true, x2: false })).toStrictEqual(true)
    expect(expression.eval({ x1: true, x2: true })).toStrictEqual(true)
  })

  test("xor", () => {
    const expression = new Operator("\\xor", v[0], v[1])
    expect(expression.eval({ x1: false, x2: false })).toStrictEqual(false)
    expect(expression.eval({ x1: false, x2: true })).toStrictEqual(true)
    expect(expression.eval({ x1: true, x2: false })).toStrictEqual(true)
    expect(expression.eval({ x1: true, x2: true })).toStrictEqual(false)
  })

  test("implication", () => {
    const expression = new Operator("=>", v[0], v[1])
    expect(expression.eval({ x1: false, x2: false })).toStrictEqual(true)
    expect(expression.eval({ x1: false, x2: true })).toStrictEqual(true)
    expect(expression.eval({ x1: true, x2: false })).toStrictEqual(false)
    expect(expression.eval({ x1: true, x2: true })).toStrictEqual(true)
  })

  test("equality", () => {
    const expression = new Operator("<=>", v[0], v[1])
    expect(expression.eval({ x1: false, x2: false })).toStrictEqual(true)
    expect(expression.eval({ x1: false, x2: true })).toStrictEqual(false)
    expect(expression.eval({ x1: true, x2: false })).toStrictEqual(false)
    expect(expression.eval({ x1: true, x2: true })).toStrictEqual(true)
  })
})

test("eval", () => {
  const expression = new Operator("\\and", new Operator("\\and", v[0], v[1]), notV[2])
  expect(expression.eval({ x1: true, x2: true, x3: true })).toEqual(false)
  expect(expression.eval({ x1: true, x2: true, x3: false })).toEqual(true)
})

describe("toString", () => {
  test("basic", () => {
    expect(v[0].toString()).toBe("x1")

    const expression = new Operator("\\and", new Operator("\\or", v[0], v[1]), notV[2])
    expect(expression.toString()).toBe("(x1 \\or x2) \\and \\not x3")
  })

  describe("no unnecessary parenthesis", () => {
    for (const x of associativeOperators) {
      test(x, () => {
        const expression = new Operator(x, new Operator(x, v[0], v[1]), notV[2])
        expect(expression.toString()).toBe(`x1 ${x} x2 ${x} \\not x3`)
      })
    }
  })
})

test("variable names", () => {
  const expression = new Operator("=>", new Operator("\\xor", v[1], notV[0]), v[0])
  const variableNames = expression.getVariableNames()

  expect(variableNames).toEqual([v[0].name, v[1].name])
  expect(variableNames.length).toEqual(2)
})

test("truth table", () => {
  const expression = new Operator("\\xor", v[0], v[1])
  const { truthTable } = expression.getTruthTable()
  expect(Object.keys(truthTable).length).toEqual(4)
  expect(truthTable).toEqual([false, true, true, false])
})

describe("normal forms", () => {
  test("literals", () => {
    expect(v[0].isDisjunction()).toEqual(true)
    expect(v[0].isCNF()).toEqual(true)
    expect(notV[0].isDisjunction()).toEqual(true)
    expect(notV[0].isCNF()).toEqual(true)
  })

  describe("CNF", () => {
    const disjunction = new Operator("\\or", new Operator("\\or", v[0], notV[2]), v[1])
    const cnf = new Operator("\\and", disjunction, disjunction)
    test("single disjunction", () => {
      expect(disjunction.isDisjunction()).toEqual(true)
      expect(disjunction.isCNF()).toEqual(true)
    })
    test("full CNF", () => {
      expect(cnf.isConjunction()).toEqual(false)
      expect(cnf.isCNF()).toEqual(true)
      expect(cnf.isDisjunction()).toEqual(false)
      expect(cnf.isDNF()).toEqual(false)
    })
  })

  describe("DNF", () => {
    const conjunction = new Operator("\\and", new Operator("\\and", v[0], notV[2]), v[1])
    const dnf = new Operator("\\or", conjunction, conjunction)
    test("single conjunction", () => {
      expect(conjunction.isConjunction()).toEqual(true)
      expect(conjunction.isDNF()).toEqual(true)
    })
    test("full DNF", () => {
      expect(dnf.isConjunction()).toEqual(false)
      expect(dnf.isCNF()).toEqual(false)
      expect(dnf.isDisjunction()).toEqual(false)
      expect(dnf.isDNF()).toEqual(true)
    })
  })
  // (not x1 and x2) => x3
  const expression = new Operator("=>", new Operator("\\and", notV[0], v[1]), v[2])
  const exprTT = expression.getTruthTable()

  describe("generate CNF", () => {
    const cnf = expression.toCNF()
    const cnfTT = cnf.getTruthTable()
    test("is CNF", () => {
      expect(cnf.isCNF()).toEqual(true)
    })
    test("is equal expression", () => {
      expect(exprTT.truthTable).toEqual(cnfTT.truthTable)
    })
  })

  describe("generate DNF", () => {
    const dnf = expression.toDNF()
    const dnfTT = dnf.getTruthTable()
    test("is DNF", () => {
      expect(dnf.isDNF()).toEqual(true)
    })
    test("is equal expression", () => {
      expect(exprTT.truthTable).toEqual(dnfTT.truthTable)
    })
  })
})

describe("simplify", () => {
  for (const op of ["\\xor", "=>", "<=>"] as BinaryOperatorType[])
    test(op, () => {
      const expression = new Operator(op, v[0], v[1])
      const simplifiedExpression = expression.copy().simplify()
      const tt1 = expression.getTruthTable()
      const tt2 = simplifiedExpression.getTruthTable()
      expect(tt1.variableNames).toEqual(tt2.variableNames)
      expect(tt1.truthTable).toEqual(tt2.truthTable)
      expect(simplifiedExpression.toString()).not.toContain(op)
    })
})

describe("simplify negations", () => {
  test("no negated operators", () => {
    for (const op of ["\\and", "\\or", "\\xor", "=>", "<=>"] as BinaryOperatorType[]) {
      const expr = new Operator(
        op,
        new Operator("\\xor", v[0], v[1]),
        new Operator("<=>", v[2], notV[1]),
        true,
      )
      const exprSimplified = expr.copy().simplifyNegation()
      // contains no negated groups
      expect(exprSimplified.toString()).not.toMatch(/\\not\s*\(/)
      // is still equal to the original
      expect(exprSimplified.getTruthTable().truthTable).toEqual(expr.getTruthTable().truthTable)
    }
  })

  test("no change if not needed", () => {
    for (const op of ["\\and", "\\or", "\\xor", "=>", "<=>"] as BinaryOperatorType[]) {
      const expr = new Operator(
        op,
        new Operator("\\xor", v[0], v[1]),
        new Operator("<=>", v[2], notV[1]),
      )
      const exprSimplified = expr.copy().simplifyNegation()
      expect(exprSimplified.toString()).toEqual(expr.toString())
    }
  })
})

describe("negation", () => {
  for (const op of ["\\and", "\\or", "\\xor", "=>", "<=>"] as BinaryOperatorType[])
    test(op, () => {
      const expression = new Operator(op, v[0], v[1])
      const negatedExpression = expression.copy().negate()
      const tt1 = expression.getTruthTable()
      const tt2 = negatedExpression.getTruthTable()
      expect(tt1.variableNames).toEqual(tt2.variableNames)
      tt1.truthTable.forEach((val, index) => {
        expect(val).toEqual(!tt2.truthTable[index])
      })
    })
})

test("shuffle", () => {
  const seed = sampleRandomSeed()
  const random = new Random(seed)
  const expression = new Operator(
    "\\and",
    new Operator("\\or", new Operator("=>", v[0], notV[1], true), new Operator("\\xor", notV[2], v[1])),
    new Operator("\\and", new Operator("\\xor", v[1], new Operator("\\xor", v[2], v[1]), true), notV[0]),
  )

  for (let i = 0; i < 20; i++) {
    const shuffledExpression = expression.copy().shuffle(random)
    expect(shuffledExpression.getTruthTable()).toEqual(expression.getTruthTable())
  }
})

describe("parser", () => {
  test("errors", () => {
    for (const expr of ["(()", "(A", "\\not", "A \\and"]) {
      expect(PropositionalLogicParser.parse(expr)).toBeInstanceOf(ParserError)
    }
  })

  const inputTester = ([expr, expectedStr]: string[]) => {
    const parseResult = PropositionalLogicParser.parse(expr)
    if (parseResult instanceof ParserError) {
      // expect() does not narrow down the type, so "if" is used here
      expect(parseResult).not.toBeInstanceOf(ParserError)
    } else {
      expect(parseResult.toString()).toEqual(expectedStr)
    }
  }

  test("literals", () => {
    ;[
      ["A", "A"],
      ["x_7", "x_7"],
      ["\\not A", "\\not A"],
      ["(A)", "A"],
      ["\\not(A)", "\\not A"],
      ["(\\not A)", "\\not A"],
    ].forEach(inputTester)
  })

  test("complex", () => {
    ;[
      ["\\not A \\and B", "\\not A \\and B"],
      ["\\not(A \\and B)", "\\not(A \\and B)"],
      ["\\not A \\and (B \\or C)", "\\not A \\and (B \\or C)"],
      ["(\\not A \\or B) \\and (B \\or C)", "(\\not A \\or B) \\and (B \\or C)"],
      ["((\\notA\\orB)\\and(B\\xorC))=>(D<=>E)", "((\\not A \\or B) \\and (B \\xor C)) => (D <=> E)"],
    ].forEach(inputTester)
  })
})

test("function compareExpressions (pairs)", () => {
  const inputTester = ([expr1, expr2, value]: (string | boolean)[]) => {
    const parse1 = PropositionalLogicParser.parse(expr1 as string)
    const parse2 = PropositionalLogicParser.parse(expr2 as string)
    if (parse1 instanceof ParserError || parse2 instanceof ParserError) {
      // expect() does not narrow down the type, so "if" is used here
      expect(parse1).not.toBeInstanceOf(ParserError)
      expect(parse2).not.toBeInstanceOf(ParserError)
    } else {
      expect(compareExpressions([parse1, parse2])).toEqual(value)
    }
  }

  ;[
    ["\\not A \\and B", "\\not (B => A)", true],
    ["\\not(A \\and B)", "(\\not A \\and B) \\or (\\not B \\and A) \\or (\\not A \\and \\not B)", true],
    [
      "\\not A \\and (B \\or C)",
      "(\\not A \\and \\not B \\and C) \\or (\\not A \\and B \\and \\not C) \\or (\\not A \\and B \\and C)",
      true,
    ],
    ["(\\not A \\or B) \\and (B \\or C)", "B \\or (\\not A \\and C)", true],
    ["(\\not A \\or B) \\and (B \\or C)", "B \\and (\\not A \\and C)", false],
    ["A \\and B", "A \\or B", false],
    [
      "(\\not A \\and B \\and C) \\or (\\not A \\and B \\and \\not C) \\or (\\not A => B \\and C)",
      "(\\not A \\and \\not B \\and C) \\or (\\not A \\xor B \\and \\not C) \\or (\\not A <=> B \\and C)",
      false,
    ],
  ].forEach(inputTester)
})

test("function compareExpressions (quadruple)", () => {
  const inputTester = ([expr1, expr2, expr3, expr4, value]: (string | boolean)[]) => {
    const parse1 = PropositionalLogicParser.parse(expr1 as string)
    const parse2 = PropositionalLogicParser.parse(expr2 as string)
    const parse3 = PropositionalLogicParser.parse(expr3 as string)
    const parse4 = PropositionalLogicParser.parse(expr4 as string)
    if (
      parse1 instanceof ParserError ||
      parse2 instanceof ParserError ||
      parse3 instanceof ParserError ||
      parse4 instanceof ParserError
    ) {
      // expect() does not narrow down the type, so "if" is used here
      expect(parse1).not.toBeInstanceOf(ParserError)
      expect(parse2).not.toBeInstanceOf(ParserError)
      expect(parse3).not.toBeInstanceOf(ParserError)
      expect(parse4).not.toBeInstanceOf(ParserError)
    } else {
      expect(compareExpressions([parse1, parse2, parse3, parse4])).toEqual(value)
    }
  }

  ;[
    ["\\not A \\and B", "\\not (B => A)", "\\not (B => A)", "\\not (B => A)", true],
    ["\\not A \\and B", "\\not (B => A)", "\\not (B => A)", "\\not (B \\xor A)", false],
    [
      "A => (B \\and C)",
      "\\not A \\or (B \\and C)",
      "(\\not A \\and \\not  B \\and \\not C) \\or (\\not A \\and \\not B \\and C) \\or (\\not A \\and B \\and \\not C) \\or (\\not A \\and B \\and C) \\or (A \\and B \\and C)",
      "\\not ((A \\and \\not B \\and \\not C) \\or (A \\and \\not B \\and C) \\or (A \\and B \\and \\not C))",
      true,
    ],
    [
      "A => (B \\and C)",
      "\\not A \\or (B \\and C)",
      "(\\not A \\and \\not  B \\and \\not C) \\or (\\not A \\and \\not B \\and C) \\or (\\not A \\and B \\and \\not C) \\or (\\not A \\and B \\and C) \\or (A \\and B \\and C)",
      "\\not ((A \\and B \\and \\not C) \\or (A \\and \\not B \\and C) \\or (A \\and B \\and \\not C))",
      false,
    ],
  ].forEach(inputTester)
})

test("minimize normal forms", () => {
  const inputTester = ([expr, numLiteralsDNF, numLiteralsCNF]: (string | number)[]) => {
    const parseResult = PropositionalLogicParser.parse(expr as string)
    if (parseResult instanceof ParserError) {
      // expect() does not narrow down the type, so "if" is used here
      expect(parseResult).not.toBeInstanceOf(ParserError)
    } else {
      const minimalFormsDNF = new MinimalNormalForm(parseResult, "DNF")
      expect(compareExpressions([minimalFormsDNF.get(), parseResult])).toBeTruthy()
      expect(minimalFormsDNF.get().getNumLiterals()).toEqual(numLiteralsDNF)

      const minimalFormsCNF = new MinimalNormalForm(parseResult, "CNF")
      expect(compareExpressions([minimalFormsCNF.get(), parseResult])).toBeTruthy()
      expect(minimalFormsCNF.get().getNumLiterals()).toEqual(numLiteralsCNF)
    }
  }

  ;[
    ["\\not A \\and B", 2, 2],
    ["\\not(A \\and B)", 2, 2],
    ["\\not A \\and (B \\or C)", 4, 3],
    ["(\\not A \\or B) \\and (B \\or C)", 3, 4],
    ["((\\notA\\orB)\\and(B\\xorC))=>(D<=>E)", 10, 18],
    ["c \\or ((a \\or b) \\and ((\\not a \\xor b \\xor a) \\or a))", 2, 2],
    ["\\not c \\or ((c \\or \\not a) \\and c \\and (a \\or c \\or b)) \\and b", 2, 2],
    [
      "(a \\xor c) \\and (((c => f) \\or e) => (\\not e \\or b \\or c)) \\and (b \\or (f \\and d)) \\and (c \\or f) \\and (a \\or e)",
      18,
      15,
    ],
  ].forEach(inputTester)
})

describe("Resolution", () => {
  const AT = new Literal("A")
  const BT = new Literal("B")
  const CT = new Literal("C")
  const DT = new Literal("D")
  const ET = new Literal("E")
  const AF = new Literal("A", true)
  const BF = new Literal("B", true)
  const CF = new Literal("C", true)
  const DF = new Literal("D", true)
  const EF = new Literal("E", true)

  test("Res - 1", () => {
    // https://ae.cs.uni-frankfurt.de/teaching/22ws/+dismod/selbsttest_01_resolution.pdf
    const dt = [[CT, DT], [ET, DF, CF, AF], [AF, BF], [BF], [CT]]
    const dtl = getResolutionTerms(dt, 2)
    expect(dtl.some((x) => literalListsEqual(x, [DT]))).toBeFalsy()
    expect(dtl.some((x) => literalListsEqual(x, [AT, BT, CF, ET]))).toBeFalsy()
    expect(dtl.some((x) => literalListsEqual(x, [DT, AF]))).toBeFalsy()
    expect(dtl.some((x) => literalListsEqual(x, [CF, CT, ET, AF]))).toBeTruthy()
    expect(dtl.some((x) => literalListsEqual(x, [BT, ET]))).toBeFalsy()
    expect(dtl.some((x) => literalListsEqual(x, [AT, ET, BF]))).toBeFalsy()
    expect(dtl.some((x) => literalListsEqual(x, [ET, AF]))).toBeTruthy()
    expect(dtl.some((x) => literalListsEqual(x, [DF, DT, ET, AF]))).toBeTruthy()
  })

  test("Res - 2", () => {
    // https://ae.cs.uni-frankfurt.de/teaching/22ws/+dismod/selbsttest_01_resolution.pdf
    const dt = [[BT], [AT, DF, CF, BF], [CT, AF], [BT, EF], [CT, DF, ET, AF], [ET]]
    const dtl = getResolutionTerms(dt, 2)
    expect(dtl.some((x) => literalListsEqual(x, [DT]))).toBeFalsy()
    expect(dtl.some((x) => literalListsEqual(x, [AT, DF, AF]))).toBeTruthy()
    expect(dtl.some((x) => literalListsEqual(x, [AT, EF, DF, CF]))).toBeTruthy()
    expect(dtl.some((x) => literalListsEqual(x, [AT, BF, DF, CF, AF]))).toBeTruthy()
    expect(dtl.some((x) => literalListsEqual(x, [BT, ET, BF, DF, AF]))).toBeTruthy()
    expect(dtl.some((x) => literalListsEqual(x, [ET, EF, DF, CF, BF]))).toBeTruthy()
    expect(dtl.some((x) => literalListsEqual(x, [AT, EF, DT, CF]))).toBeFalsy()
    expect(dtl.some((x) => literalListsEqual(x, [CF, BT, DT, ET]))).toBeFalsy()
  })

  test("Res - 3", () => {
    // https://ae.cs.uni-frankfurt.de/teaching/22ws/+dismod/selbsttest_02_resolution.pdf
    const dt = [[AT, BF], [DF], [CT], [DF, BF, AF], [AT, CT, DT, BF], [ET]]
    const dtl = getResolutionTerms(dt, 2)
    expect(dtl.some((x) => literalListsEqual(x, [DF, BF]))).toBeTruthy()
    expect(dtl.some((x) => literalListsEqual(x, [AT, CT, BF]))).toBeTruthy()
    expect(dtl.some((x) => literalListsEqual(x, [BT, DT]))).toBeFalsy()
    expect(dtl.some((x) => literalListsEqual(x, [DT]))).toBeFalsy()
    expect(dtl.some((x) => literalListsEqual(x, [CF, AF]))).toBeFalsy()
    expect(dtl.some((x) => literalListsEqual(x, [EF]))).toBeFalsy()
    expect(dtl.some((x) => literalListsEqual(x, [CF, DF, ET, AF]))).toBeFalsy()
    expect(dtl.some((x) => literalListsEqual(x, [AT, DT]))).toBeFalsy()
  })

  test("Res - 4", () => {
    // https://ae.cs.uni-frankfurt.de/teaching/22ws/+dismod/selbsttest_02_resolution.pdf
    const dt = [[AT, DT], [AT, DT, BF], [AT, CT, DT, ET], [CF], [BT, CT, DF, AF], [EF, DT, CF, BF]]
    const dtl = getResolutionTerms(dt, 2)
    expect(dtl.some((x) => literalListsEqual(x, [BT, DT, DF, ET]))).toBeTruthy()
    expect(dtl.some((x) => literalListsEqual(x, [CT, DT, EF, DF, CF, AF]))).toBeTruthy()
    expect(dtl.some((x) => literalListsEqual(x, [AT, BT, ET, BF, EF, AF]))).toBeTruthy()
    expect(dtl.some((x) => literalListsEqual(x, [AT, EF, BF]))).toBeFalsy()
    expect(dtl.some((x) => literalListsEqual(x, [AT, CT, ET, AF, EF, BF]))).toBeTruthy()
    expect(dtl.some((x) => literalListsEqual(x, [BT, CT, EF, CF, AF]))).toBeTruthy()
    expect(dtl.some((x) => literalListsEqual(x, [AT, BT, CT, DT, BF, CF, AF]))).toBeTruthy()
    expect(dtl.some((x) => literalListsEqual(x, [AT, CT, DT, ET, EF, AF]))).toBeTruthy()
  })
})

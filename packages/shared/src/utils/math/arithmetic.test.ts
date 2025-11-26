import { describe, expect, test } from "vitest"
import {
  approximatelyEqual,
  BinaryNode,
  ConstantNode,
  getFunctionDefinition,
  isApproximatelyZero,
  UnaryNode,
  VariableNode,
  type ExprNode,
} from "@shared/utils/math/arithmeticExpression.ts"
import { expressionsEqual } from "@shared/utils/math/comparingExpressions.ts"
import { parseArithmeticExpression } from "@shared/utils/math/parseArithmeticExpression.ts"
import Random, { sampleRandomSeed } from "@shared/utils/random.ts"

function foldAddition(terms: ExprNode[]): ExprNode {
  if (terms.length === 0) {
    return new ConstantNode(0)
  }
  let result = terms[0]
  for (let i = 1; i < terms.length; i++) {
    result = new BinaryNode("+", result, terms[i])
  }
  return result
}

test("functionRegistry", () => {
  const cos = getFunctionDefinition("cos")
  expect(cos.arity).toEqual(1)
  expect(cos.evaluate(Math.PI)).toBeCloseTo(-1)
  expect(cos.evaluate(5)).toBeCloseTo(0.283662185463226)
  const cosDeg = getFunctionDefinition("cos", true)
  expect(cosDeg.arity).toEqual(1)
  expect(cosDeg.evaluate(Math.PI)).toBeCloseTo(0.9984971498638)
  expect(cosDeg.evaluate(5)).toBeCloseTo(0.996194698)

  expect(() => getFunctionDefinition("nonexistent")).toThrowError()
})

test("Two numbers approximately equal", () => {
  expect(approximatelyEqual(7, 8)).toBe(false)
  expect(approximatelyEqual(7, 7.00000000001)).toBe(true)
  expect(approximatelyEqual(7, 7.0001)).toBe(false)
  expect(isApproximatelyZero(1e-11)).toBe(true)
  expect(isApproximatelyZero(1e-5)).toBe(false)
})

test("ConstantNode (Base)", () => {
  const constNode = new ConstantNode(5)
  expect(constNode.evaluate()).toBe(5)
  expect(constNode.toTex()).toBe("5")

  const constNodeNegFloat = new ConstantNode(-3.14159)
  expect(constNodeNegFloat.evaluate()).toBeCloseTo(-3.14159)
  expect(constNodeNegFloat.toTex(4)).toBe("-\\dfrac{3927}{1250}")
})

test("VariableNode (Base)", () => {
  const v = new VariableNode("x")
  expect(v.name).toBe("x")
  expect(v.multiplier).toBe(1)
  expect(v.toTex()).toBe("x")

  const v2 = new VariableNode("y", -1)
  expect(v2.toTex()).toBe("-y")

  const v3 = new VariableNode("z", 3.5)
  expect(v3.toTex()).toBe("\\dfrac{7}{2}z")

  // evaluate
  expect(v.evaluate({ x: 4 })).toBe(4)
  expect(v3.evaluate({ z: 2 })).toBeCloseTo(7)

  // unresolved should return clone
  const unresolved = v.evaluate({})
  expect(unresolved).not.toBe(v) // must be cloned
  expect((unresolved as VariableNode).name).toBe("x")

  // containsVariable
  expect(v.containsVariable()).toBe(true)

  // simplify
  const vZero = new VariableNode("x", 0)
  const simplifiedZero = vZero.simplify()
  expect(simplifiedZero).toBeInstanceOf(ConstantNode)
  expect((simplifiedZero as ConstantNode).value).toBe(0)

  const vNorm = new VariableNode("x", 1.000000001)
  const simplifiedNorm = vNorm.simplify()
  expect(simplifiedNorm).not.toBe(vNorm) // new instance
  expect((simplifiedNorm as VariableNode).multiplier).toBe(1)

  // getVariables
  expect(v.getVariables()).toEqual(new Set(["x"]))

  // clone
  const cloned = v.clone()
  expect(cloned).not.toBe(v)
  expect((cloned as VariableNode).name).toBe("x")
  expect((cloned as VariableNode).multiplier).toBe(1)

  // substitute
  const substTarget = new VariableNode("a", 2)
  const substExpr = new VariableNode("x", 3)
  const substMap = { x: substTarget }

  // 3 x -->  3 * (2 a)  = 6 a
  expect(substExpr.substitute(substMap).toTex()).toBe("6a")

  // substitution merging with constant multiplication
  const c = new ConstantNode(5)
  const subst2 = new VariableNode("x", 4).substitute({ x: c })
  expect((subst2 as ConstantNode).value).toBe(20)
})

test("UnaryNode (Base)", () => {
  const cx = new ConstantNode(3)
  const vx = new VariableNode("x")

  const u1 = new UnaryNode("-", cx)
  expect(u1.toTex()).toBe("-3")

  const u2 = new UnaryNode("-", vx)
  expect(u2.toTex()).toBe("-x")

  // Nested expression formatting
  const nested = new UnaryNode("-", new BinaryNode("+", cx, vx))
  expect(nested.toTex()).toBe("-\\left(3 + x\\right)")
  // double negation
  const doubleNeg = new UnaryNode("-", new UnaryNode("-", vx))
  expect(doubleNeg.toTex()).toBe("-\\left(-x\\right)")

  // evaluate: direct numeric
  expect(u1.evaluate()).toBe(-3)

  // evaluate: variable unresolved → returns new UnaryNode with Expr child
  const unresolved = u2.evaluate({})
  expect(unresolved).toBeInstanceOf(VariableNode)
  expect((unresolved as VariableNode).multiplier.toString()).toBe("-1")

  // evaluate: variable resolved
  const evaluated = u2.evaluate({ x: 7 })
  expect(evaluated).toBe(-7)

  // containsVariable
  expect(u2.containsVariable()).toBe(true)
  expect(u1.containsVariable()).toBe(false)

  //
  // simplify()
  //

  // 1. Simplify on ConstantNode
  const sc = new UnaryNode("-", new ConstantNode(5)).simplify()
  expect(sc).toBeInstanceOf(ConstantNode)
  expect((sc as ConstantNode).value).toBe(-5)

  // 2. Simplify on VariableNode
  const sv = new UnaryNode("-", new VariableNode("y", 2)).simplify()
  expect(sv).toBeInstanceOf(VariableNode)
  expect((sv as VariableNode).name).toBe("y")
  expect((sv as VariableNode).multiplier).toBe(-2)

  // 3. Double negation: -(-x) → x
  const double = new UnaryNode("-", new UnaryNode("-", vx)).simplify()
  expect(double).toBeInstanceOf(VariableNode)

  // 4. Double negation on constants: -(-3) → 3
  const doubleConst = new UnaryNode("-", new UnaryNode("-", new ConstantNode(3))).simplify()
  expect(doubleConst).toBeInstanceOf(ConstantNode)
  expect((doubleConst as ConstantNode).value).toBe(3)

  // 5. Simplify should recurse into child expressions
  const b = new BinaryNode("+", new ConstantNode(2), new ConstantNode(3)) // simplifies to 5
  const u = new UnaryNode("-", b)
  const us = u.simplify()
  expect(us).toBeInstanceOf(ConstantNode)
  expect((us as ConstantNode).value).toBe(-5)

  // 6. Non-trivial child is preserved when not simplifiable
  const complex = new UnaryNode("-", new BinaryNode("*", vx, new ConstantNode(2)))
  expect(complex.toTex()).toBe("-x \\cdot 2")
  const simplifiedComplex = complex.simplify()
  expect(simplifiedComplex).toBeInstanceOf(VariableNode)
  expect((simplifiedComplex as VariableNode).toTex()).toBe("-2x")

  // getVariables
  expect(u2.getVariables()).toEqual(new Set(["x"]))
  expect(u1.getVariables()).toEqual(new Set())

  // clone
  const clone = nested.clone()
  expect(clone).not.toBe(nested)
  expect((clone as UnaryNode).child.toTex()).toBe("3 + x")

  // substitute
  const sub = new UnaryNode("-", vx).substitute({ x: new ConstantNode(4) })
  expect(sub).toBeInstanceOf(UnaryNode)
  expect((sub as UnaryNode).child.toTex()).toBe("4")
})

describe("BinaryNode (Base)", () => {
  const c0 = new ConstantNode(0)
  const c1 = new ConstantNode(1)
  const c2 = new ConstantNode(2)
  const c5 = new ConstantNode(5)
  const cNeg10 = new ConstantNode(-10)
  const vY = new VariableNode("y")
  const vZ = new VariableNode("z", 4)
  const addition = new BinaryNode("+", c2, c5)
  const subtraction = new BinaryNode("-", c5, c2)
  const doubleSubtraction = new BinaryNode("-", c5, subtraction)
  const multiplication = new BinaryNode("*", c2, vZ)
  const division = new BinaryNode("/", vZ, c5)
  const power = new BinaryNode("^", vY, c2)
  const complex = new BinaryNode("+", multiplication, subtraction) // (2 * 4z) + (5 - 2)
  const complex2 = new BinaryNode("/", complex, cNeg10) // ((2 * 4z) + (5 - 2)) / -10
  const complex3 = new BinaryNode("*", complex2, power) // [((2 * 4z) + (5 - 2)) / -10] * (y ^ 2)
  const complex4 = new BinaryNode("^", complex2, vY)
  test("evaluate", () => {
    // Base evaluations
    expect(addition.evaluate()).toBe(7)
    expect(subtraction.evaluate()).toBe(3)
    expect(doubleSubtraction.evaluate()).toBe(2)
    expect(multiplication.evaluate({ z: 2 })).toBe(16)
    expect(division.evaluate({ z: 1 })).toBeCloseTo(0.8)
    expect(power.evaluate({ y: 3 })).toBe(9)
    expect(power.evaluate({ y: 0 })).toBe(0)
    expect(power.evaluate({ y: -2 })).toBe(4)

    // Complex evaluations
    expect(complex.evaluate({ z: 2 })).toBe(19)
    expect(complex2.evaluate({ z: 0 })).toBe(-0.3)
    expect(complex3.evaluate({ z: 1, y: 2 })).toBe(-4.4)
    expect(complex4.evaluate({ z: 1, y: 0 })).toBeCloseTo(1)

    // Division by zero
    const divByZero = new BinaryNode("/", c2, new ConstantNode(0))
    expect(divByZero.evaluate()).toBe(Infinity)

    // Evaluate with unresolved variable
    const evaluateNode: BinaryNode = multiplication.evaluate({}) as BinaryNode
    const unresolved = evaluateNode.simplify()
    expect(unresolved).toBeInstanceOf(VariableNode)
    expect((unresolved as VariableNode).name).toBe("z")
    expect((unresolved as VariableNode).multiplier).toBe(8)

    const evaluateNode2: BinaryNode = complex3.evaluate({ z: 2 }) as BinaryNode
    expect(evaluateNode2.toTex()).toBe("-\\dfrac{19}{10} \\cdot y^{2}")

    const evaluateNode3: BinaryNode = complex4.evaluate({ z: 2 }) as BinaryNode
    expect(evaluateNode3.toTex()).toBe("\\left(-\\dfrac{19}{10}\\right)^{y}")

    expect((new BinaryNode("+", vY, new BinaryNode("+", vY, vY)).evaluate() as ExprNode).toTex()).toBe(
      "3y",
    )
  })
  test("simplify", () => {
    // Constant folding
    expect(new BinaryNode("+", c2, c5).simplify().toTex()).toBe("7")
    expect(new BinaryNode("*", c2, c5).simplify().toTex()).toBe("10")
    expect(new BinaryNode("-", c5, c2).simplify().toTex()).toBe("3")
    expect(new BinaryNode("/", c5, c2).simplify().toTex()).toBe("\\dfrac{5}{2}")

    // Neutral elements
    expect(new BinaryNode("+", vY, c0).simplify().toTex()).toBe("y")
    expect(new BinaryNode("+", c0, vY).simplify().toTex()).toBe("y")

    expect(new BinaryNode("*", vY, c1).simplify().toTex()).toBe("y")
    expect(new BinaryNode("*", c1, vY).simplify().toTex()).toBe("y")

    // Zero multiplication
    expect(new BinaryNode("*", vY, c0).simplify().toTex()).toBe("0")
    expect(new BinaryNode("*", c0, vY).simplify().toTex()).toBe("0")

    // Subtraction by zero
    expect(new BinaryNode("-", vY, c0).simplify().toTex()).toBe("y")

    // Exponent rules
    expect(new BinaryNode("^", vY, c1).simplify().toTex()).toBe("y")
    expect(new BinaryNode("^", vY, c0).simplify().toTex()).toBe("1")
    expect(new BinaryNode("^", c5, c2).simplify().toTex()).toBe("25")

    // Complex: distributive constant folding
    const expr = new BinaryNode("+", new BinaryNode("*", c2, vY), new BinaryNode("-", c5, c2))
    expect(expr.simplify().toTex()).toMatch(/2y \+ 3|3 \+ 2y/)
  })
  test("variable including", () => {
    const c2 = new ConstantNode(2)
    const vY = new VariableNode("y")
    const expr = new BinaryNode("*", new BinaryNode("+", c2, vY), c2)

    expect(expr.containsVariable()).toBe(true)
    expect(new BinaryNode("+", c2, c2).containsVariable()).toBe(false)
  })
  test("clone", () => {
    const vY = new VariableNode("y")
    const expr = new BinaryNode("*", new BinaryNode("+", vY, new ConstantNode(3)), new ConstantNode(2))

    const cloned = expr.clone() as BinaryNode

    // Structural equality
    expect(cloned.toTex()).toBe(expr.toTex())

    // Different references
    expect(cloned).not.toBe(expr)
    expect(cloned.left).not.toBe(expr.left)
    expect(cloned.right).not.toBe(expr.right)

    // Mutate clone
    ;(cloned.left as BinaryNode).left = new ConstantNode(99)

    // Original remains unchanged
    expect(expr.toTex()).toBe("\\left(y + 3\\right) \\cdot 2")
    expect(cloned.toTex()).toBe("\\left(99 + 3\\right) \\cdot 2")
  })
  test("substitute", () => {
    const vX = new VariableNode("x")
    const vY = new VariableNode("y")
    const expr = new BinaryNode("+", vX, new BinaryNode("*", vY, new ConstantNode(3)))

    // Substitute x → 10
    const sub1 = expr.substitute({ x: new ConstantNode(10) })
    expect(sub1.toTex()).toBe("10 + y \\cdot 3")

    // Substitute y → (x + 1)
    const sub2 = expr.substitute({
      y: new BinaryNode("+", vX.clone(), new ConstantNode(1)),
    })
    expect(sub2.toTex()).toBe("x + \\left(x + 1\\right) \\cdot 3")
  })
})

test("Basic arithmetic addition", () => {
  const const4 = new ConstantNode(4)
  const constNeg2 = new ConstantNode(-2)
  const variableX = new VariableNode("x")

  const addition = new BinaryNode("+", const4, constNeg2)
  expect(addition.evaluate()).toBe(2)
  expect(addition.toTex()).toEqual("4 + \\left(-2\\right)")

  const additionWithVariable = new BinaryNode("+", variableX, const4)
  expect((additionWithVariable.evaluate() as ExprNode).toTex()).toMatch(/x \+ 4|4 \+ x/)
  expect(additionWithVariable.evaluate({ x: 6 })).toEqual(10)
})

describe("expressionsEqual", () => {
  const r = new Random(sampleRandomSeed())
  test("Base", () => {
    const expr1 = new BinaryNode("+", new VariableNode("x"), new ConstantNode(2))
    const expr2 = new BinaryNode("+", new ConstantNode(2), new VariableNode("x"))
    const expr3 = new BinaryNode("*", new VariableNode("x"), new ConstantNode(2))

    expect(expressionsEqual(expr1, expr2, r).equal).toBeTruthy()
    expect(expressionsEqual(expr1, expr3, r).equal).toBeFalsy()
    expect(expressionsEqual(expr2, expr3, r).equal).toBeFalsy()

    const expr4 = new BinaryNode(
      "+",
      new VariableNode("x"),
      new BinaryNode("+", new ConstantNode(2), new VariableNode("y", 0)),
    )
    expect(expressionsEqual(expr1, expr4, r).equal).toBeTruthy()
    expect(expressionsEqual(expr2, expr4, r).equal).toBeTruthy()
    expect(expressionsEqual(expr3, expr4, r).equal).toBeFalsy()
  })

  test("High-degree polynomial", () => {
    const e1 = new BinaryNode(
      "+",
      new BinaryNode(
        "*",
        new VariableNode("x", 7),
        new BinaryNode("^", new VariableNode("x"), new ConstantNode(40)),
      ),
      new ConstantNode(3),
    )

    const e2 = new BinaryNode(
      "+",
      new ConstantNode(3),
      new BinaryNode(
        "*",
        new ConstantNode(7),
        new BinaryNode("^", new VariableNode("x"), new ConstantNode(41)),
      ),
    )

    expect(expressionsEqual(e1, e2, r).equal).toBeTruthy()
  })

  test("Expressions Equal – nested polynomial equivalence", () => {
    // (x^3 + 2x^2) + (3x + 5)
    const e1 = new BinaryNode(
      "+",
      new BinaryNode(
        "+",
        new BinaryNode("^", new VariableNode("x"), new ConstantNode(3)),
        new BinaryNode(
          "*",
          new ConstantNode(2),
          new BinaryNode("^", new VariableNode("x"), new ConstantNode(2)),
        ),
      ),
      new BinaryNode(
        "+",
        new BinaryNode("*", new ConstantNode(3), new VariableNode("x")),
        new ConstantNode(5),
      ),
    )

    // 5 + x(3 + 2x + x^2)
    const e2 = new BinaryNode(
      "+",
      new ConstantNode(5),
      new BinaryNode(
        "*",
        new VariableNode("x"),
        new BinaryNode(
          "+",
          new ConstantNode(3),
          new BinaryNode(
            "+",
            new BinaryNode("*", new ConstantNode(2), new VariableNode("x")),
            new BinaryNode("^", new VariableNode("x"), new ConstantNode(2)),
          ),
        ),
      ),
    )

    expect(expressionsEqual(e1, e2, r).equal).toBeTruthy()
  })

  test("Expressions Equal – huge zero polynomial", () => {
    // (x^5 - x^5) + (3x^3 - 3x^3) + (7x - 7x)
    const e = new BinaryNode(
      "+",
      new BinaryNode(
        "-",
        new BinaryNode("^", new VariableNode("x"), new ConstantNode(5)),
        new BinaryNode("^", new VariableNode("x"), new ConstantNode(5)),
      ),
      new BinaryNode(
        "+",
        new BinaryNode(
          "-",
          new BinaryNode(
            "*",
            new ConstantNode(3),
            new BinaryNode("^", new VariableNode("x"), new ConstantNode(3)),
          ),
          new BinaryNode(
            "*",
            new ConstantNode(3),
            new BinaryNode("^", new VariableNode("x"), new ConstantNode(3)),
          ),
        ),
        new BinaryNode(
          "-",
          new BinaryNode("*", new ConstantNode(7), new VariableNode("x")),
          new BinaryNode("*", new ConstantNode(7), new VariableNode("x")),
        ),
      ),
    )

    const zero = new ConstantNode(0)

    expect(expressionsEqual(e, zero, r).equal).toBeTruthy()
  })

  test("Expressions Equal – nested powers", () => {
    // x^(2+3)
    const e1 = new BinaryNode(
      "^",
      new VariableNode("x"),
      new BinaryNode("+", new ConstantNode(2), new ConstantNode(3)),
    )

    // x^5
    const e2 = new BinaryNode("^", new VariableNode("x"), new ConstantNode(5))

    expect(expressionsEqual(e1, e2, r).equal).toBeTruthy()
  })

  test("Expressions Equal – factored vs expanded polynomial", () => {
    // (x + 2)*(x + 3)
    const e1 = new BinaryNode(
      "*",
      new BinaryNode("+", new VariableNode("x"), new ConstantNode(2)),
      new BinaryNode("+", new VariableNode("x"), new ConstantNode(3)),
    )

    // x^2 + 5x + 6
    const e2 = new BinaryNode(
      "+",
      new BinaryNode("^", new VariableNode("x"), new ConstantNode(2)),
      new BinaryNode(
        "+",
        new BinaryNode("*", new ConstantNode(5), new VariableNode("x")),
        new ConstantNode(6),
      ),
    )

    expect(expressionsEqual(e1, e2, r).equal).toBeTruthy()
  })

  test("Expressions Equal – deep random polynomial tree", () => {
    // (7x^8 + 4x^6) + ((3x^4 + 2x^2) + 9)
    const e1 = new BinaryNode(
      "+",
      new BinaryNode(
        "+",
        new BinaryNode(
          "*",
          new ConstantNode(7),
          new BinaryNode("^", new VariableNode("x"), new ConstantNode(8)),
        ),
        new BinaryNode(
          "*",
          new ConstantNode(4),
          new BinaryNode("^", new VariableNode("x"), new ConstantNode(6)),
        ),
      ),
      new BinaryNode(
        "+",
        new BinaryNode(
          "+",
          new BinaryNode(
            "*",
            new ConstantNode(3),
            new BinaryNode("^", new VariableNode("x"), new ConstantNode(4)),
          ),
          new BinaryNode(
            "*",
            new ConstantNode(2),
            new BinaryNode("^", new VariableNode("x"), new ConstantNode(2)),
          ),
        ),
        new ConstantNode(9),
      ),
    )

    // Same polynomial reordered
    const e2 = new BinaryNode(
      "+",
      new ConstantNode(9),
      new BinaryNode(
        "+",
        new BinaryNode(
          "*",
          new ConstantNode(2),
          new BinaryNode("^", new VariableNode("x"), new ConstantNode(2)),
        ),
        new BinaryNode(
          "+",
          new BinaryNode(
            "*",
            new ConstantNode(4),
            new BinaryNode("^", new VariableNode("x"), new ConstantNode(6)),
          ),
          new BinaryNode(
            "+",
            new BinaryNode(
              "*",
              new ConstantNode(3),
              new BinaryNode("^", new VariableNode("x"), new ConstantNode(4)),
            ),
            new BinaryNode(
              "*",
              new ConstantNode(7),
              new BinaryNode("^", new VariableNode("x"), new ConstantNode(8)),
            ),
          ),
        ),
      ),
    )

    expect(expressionsEqual(e1, e2, r).equal).toBeTruthy()
  })

  test("Expressions Equal – multivariate symmetric expansion", () => {
    const sumXYZ = new BinaryNode(
      "+",
      new BinaryNode("+", new VariableNode("x"), new VariableNode("y")),
      new VariableNode("z"),
    )

    const permuted = foldAddition([
      new BinaryNode("^", new VariableNode("x"), new ConstantNode(2)),
      new BinaryNode("^", new VariableNode("y"), new ConstantNode(2)),
      new BinaryNode("^", new VariableNode("z"), new ConstantNode(2)),
      new BinaryNode(
        "*",
        new ConstantNode(2),
        new BinaryNode("*", new VariableNode("x"), new VariableNode("y")),
      ),
      new BinaryNode(
        "*",
        new ConstantNode(2),
        new BinaryNode("*", new VariableNode("x"), new VariableNode("z")),
      ),
      new BinaryNode(
        "*",
        new ConstantNode(2),
        new BinaryNode("*", new VariableNode("y"), new VariableNode("z")),
      ),
    ])

    expect(
      expressionsEqual(new BinaryNode("^", sumXYZ, new ConstantNode(2)), permuted, r).equal,
    ).toBeTruthy()
  })

  test("Expressions Equal – adversarial simplifier cancellation", () => {
    const sumXY = new BinaryNode("+", new VariableNode("x"), new VariableNode("y"))
    const sumZc = new BinaryNode("+", new VariableNode("z"), new ConstantNode(-1))
    const factored = new BinaryNode("*", sumXY, sumZc)

    const expanded = foldAddition([
      new BinaryNode("*", new VariableNode("x"), new VariableNode("z")),
      new BinaryNode("*", new VariableNode("y"), new VariableNode("z")),
      new UnaryNode("-", new VariableNode("x")),
      new UnaryNode("-", new VariableNode("y")),
    ])

    const difference = new BinaryNode("-", factored, expanded)
    expect(expressionsEqual(difference.simplify(), new ConstantNode(0), r).equal).toBeTruthy()
  })

  test("Expressions Equal – floating point stability", () => {
    const fractional = foldAddition([
      new BinaryNode("*", new ConstantNode(0.1), new VariableNode("x")),
      new BinaryNode("*", new ConstantNode(0.2), new VariableNode("x")),
      new BinaryNode("*", new ConstantNode(0.3), new VariableNode("x")),
    ])

    const aggregate = new BinaryNode("*", new ConstantNode(0.6), new VariableNode("x"))

    const irrationalExpansion = foldAddition([
      new ConstantNode(Math.PI),
      new UnaryNode("-", new ConstantNode(Math.E)),
      new ConstantNode(Math.E),
    ])

    expect(expressionsEqual(fractional, aggregate, r).equal).toBeTruthy()
    expect(expressionsEqual(irrationalExpansion, new ConstantNode(Math.PI), r).equal).toBeTruthy()
  })

  test("Floating point stability (2)", () => {
    // Note typescript only stable up tp e15
    const e1 = new BinaryNode("-", new ConstantNode(1e14 + 1), new ConstantNode(1e14))

    const e2 = new ConstantNode(1)

    expect(expressionsEqual(e1, e2, r).equal).toBeTruthy()
  })

  test("Expressions Equal - float as base", () => {})

  test("Expressions Equal - detects inequality", () => {
    const expr1 = new BinaryNode(
      "+",
      new BinaryNode("^", new VariableNode("x"), new ConstantNode(2)),
      foldAddition([
        new BinaryNode("*", new ConstantNode(3), new VariableNode("x")),
        new ConstantNode(1),
      ]),
    )

    const expr2 = new BinaryNode(
      "+",
      new BinaryNode("^", new VariableNode("x"), new ConstantNode(2)),
      foldAddition([
        new BinaryNode("*", new ConstantNode(3), new VariableNode("x")),
        new ConstantNode(2),
      ]),
    )

    expect(expressionsEqual(expr1, expr2, r).equal).toBeFalsy()
  })
})

describe("Parser for ArithmeticExpression", () => {
  test("Basic addition with simplification", () => {
    const exprStr = "2 + 3 + x + 5"
    const pasrsedExpr = parseArithmeticExpression(exprStr)
    const variables = pasrsedExpr.getVariables()
    expect(variables).toEqual(new Set(["x"]))
    expect(pasrsedExpr.simplify().toTex()).toBe("x + 10")
  })
})

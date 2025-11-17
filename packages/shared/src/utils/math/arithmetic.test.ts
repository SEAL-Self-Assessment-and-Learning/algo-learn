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
} from "@shared/utils/math/ArithmeticExpression.ts"

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
  expect(constNode.toString()).toBe("5")
  expect(constNode.toTex()).toBe("5")
  expect(constNode.toCanonicalKey()).toBe("C:5")

  const constNodeNegFloat = new ConstantNode(-3.14159)
  expect(constNodeNegFloat.evaluate()).toBeCloseTo(-3.14159)
  expect(constNodeNegFloat.toString()).toBe("(-3927/1250)")
  expect(constNodeNegFloat.toTex()).toBe("\\left(-\\dfrac{3927}{1250}\\right)")
  expect(constNodeNegFloat.toCanonicalKey()).toBe("C:-3927/1250")
})

test("VariableNode (Base)", () => {
  const v = new VariableNode("x")
  expect(v.name).toBe("x")
  expect(v.multiplier).toBe(1)
  expect(v.toString()).toBe("x")
  expect(v.toTex()).toBe("x")

  const v2 = new VariableNode("y", -1)
  expect(v2.toString()).toBe("(-y)")
  expect(v2.toTex()).toBe("\\left(-y\\right)")

  const v3 = new VariableNode("z", 3.5)
  expect(v3.toString()).toBe("7/2z")
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

  const vNorm = new VariableNode("x", 1.0000001)
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
  expect(substExpr.substitute(substMap).toString()).toBe("6a")

  // substitution merging with constant multiplication
  const c = new ConstantNode(5)
  const subst2 = new VariableNode("x", 4).substitute({ x: c })
  expect((subst2 as ConstantNode).value).toBe(20)

  // canonical key
  expect(v.toCanonicalKey()).toBe("V:x:1")
  expect(v3.toCanonicalKey()).toBe("V:z:7/2")
})

test("UnaryNode (Base)", () => {
  const cx = new ConstantNode(3)
  const vx = new VariableNode("x")

  const u1 = new UnaryNode("-", cx)
  expect(u1.toString()).toBe("(-3)")
  expect(u1.toTex()).toBe("\\left(-3\\right)")

  const u2 = new UnaryNode("-", vx)
  expect(u2.toString()).toBe("(-x)")
  expect(u2.toTex()).toBe("\\left(-x\\right)")

  // Nested expression formatting
  const nested = new UnaryNode("-", new BinaryNode("+", cx, vx))
  expect(nested.toString()).toBe("-(3 + x)")
  expect(nested.toTex()).toBe("-\\left(3 + x\\right)")
  // double negation
  const doubleNeg = new UnaryNode("-", new UnaryNode("-", vx))
  expect(doubleNeg.toString()).toBe("-(-x)")
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
  expect((double as VariableNode).toString()).toBe("x")

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
  expect(complex.toString()).toBe("-(x * 2)")
  const simplifiedComplex = complex.simplify()
  expect(simplifiedComplex).toBeInstanceOf(VariableNode)
  expect((simplifiedComplex as VariableNode).toString()).toBe("(-2x)")

  // getVariables
  expect(u2.getVariables()).toEqual(new Set(["x"]))
  expect(u1.getVariables()).toEqual(new Set())

  // clone
  const clone = nested.clone()
  expect(clone).not.toBe(nested)
  expect((clone as UnaryNode).child.toString()).toBe("3 + x")

  // substitute
  const sub = new UnaryNode("-", vx).substitute({ x: new ConstantNode(4) })
  expect(sub).toBeInstanceOf(UnaryNode)
  expect((sub as UnaryNode).child.toString()).toBe("4")

  // canonical key
  expect(u2.toCanonicalKey()).toBe("U:-:V:x:1")
})

describe("BinaryNode (Base)", () => {
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
  test("toString and toTex", () => {
    expect(addition.toString()).toMatch(/2 \+ 5|5 \+ 2/)
    expect(addition.toTex()).toMatch(/2 \+ 5|5 \+ 2/)

    expect(subtraction.toString()).toBe("5 - 2")
    expect(subtraction.toTex()).toBe("5 - 2")

    expect(doubleSubtraction.toString()).toBe("5 - (5 - 2)")
    expect(doubleSubtraction.toTex()).toBe("5 - \\left(5 - 2\\right)")

    expect(multiplication.toString()).toMatch(/2 \* 4z|4z \* 2/)
    expect(multiplication.toTex()).toMatch(/2 \\cdot 4z|4z \\cdot 2/)

    expect(division.toString()).toBe("(4z / 5)")
    expect(division.toTex()).toBe("\\dfrac{4z}{5}")

    expect(power.toString()).toBe("y ^ 2")
    expect(power.toTex()).toBe("{y}^{2}")

    expect(complex.toString()).toMatch(/2 \* 4z \+ 5 - 2|5 - 2 \+ 2 \* 4z/)
    expect(complex.toTex()).toBe("2 \\cdot 4z + 5 - 2")

    expect(complex2.toString()).toBe("(2 * 4z + 5 - 2 / (-10))")
    expect(complex2.toTex()).toBe("\\dfrac{2 \\cdot 4z + 5 - 2}{\\left(-10\\right)}")

    expect(complex3.toString()).toBe("(2 * 4z + 5 - 2 / (-10)) * y ^ 2")
    expect(complex3.toTex()).toBe(
      "\\left(\\dfrac{2 \\cdot 4z + 5 - 2}{\\left(-10\\right)}\\right) \\cdot {y}^{2}",
    )

    expect(complex4.toString()).toBe("(2 * 4z + 5 - 2 / (-10)) ^ y")
    expect(complex4.toTex()).toBe(
      "{\\left(\\dfrac{2 \\cdot 4z + 5 - 2}{\\left(-10\\right)}\\right)}^{y}",
    )
  })
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
    expect(evaluateNode2.toString()).toBe("(-19/10) * y ^ 2")

    const evaluateNode3: BinaryNode = complex4.evaluate({ z: 2 }) as BinaryNode
    expect(evaluateNode3.toString()).toBe("(-19/10) ^ y")
    expect(evaluateNode3.toTex()).toBe("{\\left(-\\dfrac{19}{10}\\right)}^{y}")

    expect(
      (new BinaryNode("+", vY, new BinaryNode("+", vY, vY)).evaluate() as ExprNode).toString(),
    ).toBe("3y")
  })
  test("simplify", () => {})
  test("variable including", () => {})
  test("clone", () => {})
  test("substitute", () => {})
  test("canonical", () => {})
})

test("Basic arithmetic addition", () => {
  const const4 = new ConstantNode(4)
  const constNeg2 = new ConstantNode(-2)
  const variableX = new VariableNode("x")

  const addition = new BinaryNode("+", const4, constNeg2)
  expect(addition.evaluate()).toBe(2)
  expect(addition.toString()).toEqual("4 - 2")

  const additionWithVariable = new BinaryNode("+", variableX, const4)
  expect((additionWithVariable.evaluate() as ExprNode).toString()).toMatch(/x \+ 4|4 \+ x/)
  expect(additionWithVariable.evaluate({ x: 6 })).toEqual(10)
})

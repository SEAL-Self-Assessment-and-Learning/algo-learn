import { describe, expect, test } from "vitest"
import {
  approximatelyEqual,
  BinaryNode,
  ConstantNode,
  isApproximatelyZero,
  UnaryNode,
  VariableNode,
} from "@shared/utils/math/arithmeticExpression.ts"

/**
 * Tests to ensure that parentheses are correctly added in toTex method
 *
 * Also evaluating every expression to ensure correctness
 */
describe("Correct parenthesization in toString and toTex", () => {
  const c1 = new ConstantNode(1)
  const c2 = new ConstantNode(2)

  const x = new VariableNode("x")
  const y = new VariableNode("y")
  const z = new VariableNode("z")

  const uc1 = new UnaryNode("-", c1)
  const uc2 = new UnaryNode("-", c2)

  const ux = new UnaryNode("-", x)
  const uy = new UnaryNode("-", y)
  const uz = new UnaryNode("-", z)

  const assignments = {
    x: 3,
    y: -2,
    z: 5,
  }

  /**************************************************
   * Basic arithmetic
   **************************************************/
  test("x-1", () => {
    const expr = new BinaryNode("-", x, c1)
    expect(expr.toTex()).toBe("x - 1")
    expect(expr.evaluate(assignments)).toBe(2)
  })

  test("-1*(2)", () => {
    const expr = new BinaryNode("*", new ConstantNode(-1), c2)
    expect(expr.toTex()).toBe("-1 \\cdot 2")
    expect(expr.evaluate(assignments)).toBe(-2)
  })

  test("-1*(x)", () => {
    const expr = new BinaryNode("*", new ConstantNode(-1), x)
    expect(expr.toTex()).toBe("-1 \\cdot x")
    expect(expr.evaluate(assignments)).toBe(-3)
  })

  test("-1*(-x)", () => {
    const expr = new BinaryNode("*", new ConstantNode(-1), ux)
    expect(expr.toTex()).toBe("-1 \\cdot \\left(-x\\right)")
    expect(expr.evaluate(assignments)).toBe(3)
  })

  test("-1-x", () => {
    const expr = new BinaryNode("-", uc1, x)
    expect(expr.toTex()).toBe("-1 - x")
    expect(expr.evaluate(assignments)).toBe(-4)
  })

  test("-1-x", () => {
    const expr = new BinaryNode("-", new ConstantNode(-1), x)
    expect(expr.toTex()).toBe("-1 - x")
    expect(expr.evaluate(assignments)).toBe(-4)
  })

  test("-(x-1)", () => {
    const inner = new BinaryNode("-", x, c1)
    const expr = new UnaryNode("-", inner)
    expect(expr.toTex()).toBe("-\\left(x - 1\\right)")
    expect(expr.evaluate(assignments)).toBe(-2)
  })

  test("x-(y-z)", () => {
    const inner = new BinaryNode("-", y, z)
    const expr = new BinaryNode("-", x, inner)
    expect(expr.toTex()).toBe("x - \\left(y - z\\right)")
    expect(expr.evaluate(assignments)).toBe(10)
  })

  test("x-(-z)", () => {
    const expr = new BinaryNode("-", x, uz)
    expect(expr.toTex()).toBe("x - \\left(-z\\right)")
    expect(expr.evaluate(assignments)).toBe(8)
  })

  test("-(x-y)-z", () => {
    const inner = new BinaryNode("-", x, y)
    const outer = new UnaryNode("-", inner)
    const expr = new BinaryNode("-", outer, z)
    expect(expr.toTex()).toBe("-\\left(x - y\\right) - z")
    expect(expr.evaluate(assignments)).toBe(-10)
  })

  test("-x-(-y)", () => {
    const expr = new BinaryNode("-", ux, uy)
    expect(expr.toTex()).toBe("-x - \\left(-y\\right)")
    expect(expr.evaluate(assignments)).toBe(-5)
  })

  test("-(-(-x))", () => {
    const inner = new UnaryNode("-", ux)
    const expr = new UnaryNode("-", inner)
    expect(expr.toTex()).toBe("-\\left(-\\left(-x\\right)\\right)")
    expect(expr.evaluate(assignments)).toBe(-3)
  })

  test("2*2*x", () => {
    const expr = new BinaryNode("*", new BinaryNode("*", c2, c2), x)
    expect(expr.toTex()).toBe("2 \\cdot 2x")
    expect(expr.evaluate(assignments)).toBe(12)
  })

  test("2*2*x", () => {
    const expr = new BinaryNode("*", c2, new VariableNode("x", 2))
    expect(expr.toTex()).toBe("2 \\cdot 2x")
    expect(expr.evaluate(assignments)).toBe(12)
  })

  /**************************************************
   * Fractions
   **************************************************/
  test("(x-1)/2", () => {
    const numerator = new BinaryNode("-", x, c1)
    const expr = new BinaryNode("/", numerator, c2)
    expect(expr.toTex()).toBe("\\dfrac{x - 1}{2}")
    expect(expr.evaluate(assignments)).toBe(1)
  })

  test("(-x)/(-(1-y))", () => {
    const divider = new UnaryNode("-", new BinaryNode("-", c1, y))
    const expr = new BinaryNode("/", ux, divider)
    expect(expr.toTex()).toBe("\\dfrac{-x}{-\\left(1 - y\\right)}")
    expect(expr.evaluate(assignments)).toBe(1)
  })

  test("-((-x)/(-y))", () => {
    const innerFraction = new BinaryNode("/", ux, uy)
    const expr = new UnaryNode("-", innerFraction)
    expect(expr.toTex()).toBe("-\\dfrac{-x}{-y}")
    expect(expr.evaluate(assignments)).toBe(1.5)
  })

  test("(-x)/(-(y-z)) + (-(-1)/(-(-2-x)))", () => {
    const leftDenominator = new UnaryNode("-", new BinaryNode("-", y, z)) // 7
    const leftFraction = new BinaryNode("/", ux, leftDenominator) // -3/7

    const rightDenominator = new UnaryNode("-", new BinaryNode("-", uc2, x)) // 5
    const rightFraction = new UnaryNode("-", new BinaryNode("/", uc1, rightDenominator)) // 1/5
    const expr = new BinaryNode("+", leftFraction, rightFraction) // -1/7 + 1/5
    expect(expr.toTex()).toBe(
      "\\dfrac{-x}{-\\left(y - z\\right)} + \\left(-\\dfrac{-1}{-\\left(-2 - x\\right)}\\right)",
    )
    expect(approximatelyEqual(-0.2285714286, expr.evaluate(assignments) as number)).toBeTruthy()
  })

  test("(-1) * (-(-1)/(-2))", () => {
    const innerFraction = new BinaryNode("/", uc1, uc2) // 1/2
    const expr = new BinaryNode("*", uc1, new UnaryNode("-", innerFraction)) // 1/2
    expect(expr.toTex()).toBe("-1 \\cdot \\left(-\\dfrac{-1}{-2}\\right)")
    expect(expr.evaluate(assignments)).toBe(0.5)
  })

  test("(-1) * (-(-1)/(-2))", () => {
    const innerFraction = new BinaryNode("/", uc1, uc2) // 1/2
    const expr = new BinaryNode("*", new ConstantNode(-1), new UnaryNode("-", innerFraction)) // 1/2
    expect(expr.toTex()).toBe("-1 \\cdot \\left(-\\dfrac{-1}{-2}\\right)")
    expect(expr.evaluate(assignments)).toBe(0.5)
  })

  /**************************************************
   * Power
   **************************************************/
  test("(x)^(-1)", () => {
    const expr = new BinaryNode("^", x, uc1)
    expect(expr.toTex()).toBe("x^{-1}")
    expect(approximatelyEqual(0.33333333, expr.evaluate(assignments) as number)).toBeTruthy()
  })

  test("(-x)^(y-z)", () => {
    const exponent = new BinaryNode("-", y, z) // -7
    const expr = new BinaryNode("^", ux, exponent) // (-3)^(-7)
    expect(expr.toTex()).toBe("\\left(-x\\right)^{y - z}")
    expect(approximatelyEqual(-0.0004572473708, expr.evaluate(assignments) as number)).toBeTruthy()
  })

  test("(-(x)^(-1))", () => {
    const power = new BinaryNode("^", x, uc1) // 1/3
    const expr = new UnaryNode("-", power) // -1/3
    expect(expr.toTex()).toBe("-x^{-1}")
    expect(approximatelyEqual(-0.33333333, expr.evaluate(assignments) as number)).toBeTruthy()
  })

  test("1 + (- (x)^( -1))", () => {
    const power = new BinaryNode("^", x, uc1) // 1/3
    const negativePower = new UnaryNode("-", power) // -1/3
    const expr = new BinaryNode("+", c1, negativePower) // 2/3
    expect(expr.toTex()).toBe("1 + \\left(-x^{-1}\\right)")
    expect(approximatelyEqual(0.66666666, expr.evaluate(assignments) as number)).toBeTruthy()
  })

  test("(-x)^( - (y - z))", () => {
    const innerExponent = new BinaryNode("-", y, z) // -7
    const negativeExponent = new UnaryNode("-", innerExponent) // 7
    const expr = new BinaryNode("^", ux, negativeExponent) // (-3)^7 = -2187
    expect(expr.toTex()).toBe("\\left(-x\\right)^{-\\left(y - z\\right)}")
    expect(expr.evaluate(assignments)).toBe(-2187)
  })

  test("(-1*(-2)⋅2)^1", () => {
    const base = new BinaryNode("*", new BinaryNode("*", uc1, uc2), c2) // 4
    const expr = new BinaryNode("^", base, c1)
    expect(expr.toTex()).toBe("\\left(-1 \\cdot \\left(-2\\right) \\cdot 2\\right)^{1}")
    expect(expr.evaluate(assignments)).toBe(4)
  })

  /**************************************************
   * Mixed
   **************************************************/
  test("-1 - (- (-1)/(-(-(-x-(-2))))^(-((-1)/(-(-x-(-2))))", () => {
    // -x - (-2)
    const powerInnerDenominator = new UnaryNode("-", new BinaryNode("-", ux, uc2)) // 1
    // (-1) / (-( -x - (-2)))
    const powerInnerFraction = new BinaryNode("/", uc1, powerInnerDenominator) // -1
    // - ( (-1) / (-( -x - (-2))) )
    const powerFraction = new UnaryNode("-", powerInnerFraction) // 1

    // -x - (-2)
    const baseInnerDenominator = new UnaryNode("-", new BinaryNode("-", ux, uc2)) // 1
    // - ( -x - (-2) )
    const baseInnerDenominator2 = new UnaryNode("-", baseInnerDenominator) // -1
    // (-1) / ( - ( -(-x) - (-2) ) )
    const baseInnerFraction = new BinaryNode("/", uc1, baseInnerDenominator2) // 1
    // - ( (-1) / ( - ( -(-x) - (-2) ) ) )
    const baseFraction = new UnaryNode("-", baseInnerFraction) // -1
    const power = new BinaryNode("^", baseFraction, powerFraction) // -1^( 1 )
    const expr = new BinaryNode("-", uc1, power) // -1 - -1 = 0
    expect(expr.toTex()).toBe(
      "-1 - \\left(-\\dfrac{-1}{-\\left(-\\left(-x - \\left(-2\\right)\\right)\\right)}\\right)^{-\\dfrac{-1}{-\\left(-x - \\left(-2\\right)\\right)}}",
    )
    expect(isApproximatelyZero(expr.evaluate(assignments) as number)).toBeTruthy()
  })

  test("((-x-(-z))/(x⋅y-2⋅2x))^2", () => {
    const upper = new BinaryNode("-", ux, uz) // 2
    const lowerLeft = new BinaryNode("*", x, y) // -6
    const lowerRight = new BinaryNode("*", c2, new BinaryNode("*", c2, x)) // 12
    const lower = new BinaryNode("-", lowerLeft, lowerRight) // -18
    const fraction = new BinaryNode("/", upper, lower) // 2/-18 = -1/9
    const expr = new BinaryNode("^", fraction, c2) // (-1/9)^2
    expect(expr.toTex()).toBe("\\dfrac{-x - \\left(-z\\right)}{x \\cdot y - 2 \\cdot 2x}^{2}")
    expect(approximatelyEqual((-1 / 9) ** 2, expr.evaluate(assignments) as number)).toBeTruthy()
  })

  test("((2-1)⋅((-1)/(2x)))/((2y-x)^1)", () => {
    const upperLeft = new BinaryNode("-", c2, c1) // 1
    const upperRightFraction = new BinaryNode("/", uc1, new BinaryNode("*", c2, x)) // -1/6
    const upper = new BinaryNode("*", upperLeft, upperRightFraction) // -1/6

    const lowerPower = new BinaryNode("^", new BinaryNode("-", new BinaryNode("*", c2, y), x), c1) // -7
    const expr = new BinaryNode("/", upper, lowerPower) // (-1/6)/(-7) = 1/42
    expect(expr.toTex()).toBe(
      "\\dfrac{\\left(2 - 1\\right) \\cdot \\dfrac{-1}{2x}}{\\left(2y - x\\right)^{1}}",
    )
    expect(approximatelyEqual(1 / 42, expr.evaluate(assignments) as number)).toBeTruthy()
  })

  test("(-2)/(((z)/(y))^2)", () => {
    const innerFraction = new BinaryNode("/", z, y) // -2.5
    const innerPower = new BinaryNode("^", innerFraction, c2) // 6.25
    const expr = new BinaryNode("/", new UnaryNode("-", c2), innerPower) // -2/6.25
    expect(expr.toTex()).toBe("\\dfrac{-2}{\\dfrac{z}{y}^{2}}")
    expect(approximatelyEqual(-2 / 6.25, expr.evaluate(assignments) as number)).toBeTruthy()
  })

  test("-(z+a)*2^1*(2y+b+(-3)+c)", () => {
    const expr = new UnaryNode(
      "-",
      new BinaryNode(
        "*",
        new BinaryNode(
          "*",
          new BinaryNode("+", new VariableNode("z"), new VariableNode("a")),
          new BinaryNode("^", c2, c1),
        ),
        new BinaryNode(
          "+",
          new BinaryNode("+", new VariableNode("y", 2), new VariableNode("b")),
          new BinaryNode("+", new ConstantNode(-3), new VariableNode("c")),
        ),
      ),
    )
    expect(expr.toTex()).toBe(
      "-\\left(z + a\\right) \\cdot 2^{1} \\cdot \\left(2y + b + \\left(-3\\right) + c\\right)",
    )
  })

  test("--1⋅y^2", () => {
    const expr = new UnaryNode(
      "-",
      new BinaryNode("*", new UnaryNode("-", c1), new BinaryNode("^", y, c2)),
    )
    expect(expr.toTex()).toBe("-\\left(-1 \\cdot y^{2}\\right)")
  })

  test("c--5⋅(2z-x)", () => {
    const expr = new BinaryNode(
      "-",
      new VariableNode("c"),
      new BinaryNode(
        "*",
        new UnaryNode("-", new ConstantNode(5)),
        new BinaryNode("-", new BinaryNode("*", c2, z), x),
      ),
    )
    expect(expr.toTex()).toBe("c - \\left(-5\\right) \\cdot \\left(2z - x\\right)")
  })

  test("-(2z)/(c)-(-4)*(-6)", () => {
    const expr = new BinaryNode(
      "-",
      new UnaryNode("-", new BinaryNode("/", new BinaryNode("*", c2, z), new VariableNode("c"))),
      new BinaryNode("*", new ConstantNode(-4), new ConstantNode(-6)),
    )
    expect(expr.toTex()).toBe("-\\dfrac{2z}{c} - \\left(-4\\right) \\cdot \\left(-6\\right)")
  })

  test("7+(-(-4))*(1+1)", () => {
    const expr = new BinaryNode(
      "+",
      new ConstantNode(7),
      new BinaryNode("*", new UnaryNode("-", new ConstantNode(-4)), new BinaryNode("+", c1, c1)),
    )
    expect(expr.toTex()).toBe("7 + \\left(-\\left(-4\\right)\\right) \\cdot \\left(1 + 1\\right)")
  })

  test("", () => {
    const expr = new BinaryNode(
      "+",
      new BinaryNode(
        "-",
        new BinaryNode("/", new ConstantNode(6), new ConstantNode(2)),
        new UnaryNode("-", new ConstantNode(1)),
      ),
      new BinaryNode(
        "-",
        new UnaryNode("-", new ConstantNode(-6)),
        new BinaryNode("*", new VariableNode("c", 1), new ConstantNode(-3)),
      ),
    )
    expect(expr.toTex()).toBe(
      "\\dfrac{6}{2} - \\left(-1\\right) + \\left(-\\left(-6\\right)\\right) - c \\cdot \\left(-3\\right)",
    )
  })

  test("((-y + (2z)/(z))^1", () => {
    const expr = new BinaryNode(
      "^",
      new BinaryNode("+", uy, new BinaryNode("/", new BinaryNode("*", c2, z), z)),
      c1,
    )
    expect(expr.toTex()).toBe("\\left(-y + \\dfrac{2z}{z}\\right)^{1}")
  })

  test("((−3)−2c)^1", () => {
    const expr = new BinaryNode(
      "^",
      new BinaryNode(
        "-",
        new BinaryNode("*", new ConstantNode(-1), new ConstantNode(3)),
        new BinaryNode("*", new ConstantNode(2), new VariableNode("c")),
      ),
      c1,
    )
    expect(expr.toTex()).toBe("\\left(-1 \\cdot 3 - 2c\\right)^{1}")
  })
})

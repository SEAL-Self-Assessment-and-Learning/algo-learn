import { describe, expect, test } from "vitest";
import { approximatelyEqual, BinaryNode, ConstantNode, UnaryNode, VariableNode } from "@shared/utils/math/arithmeticExpression.ts";


const c0 = new ConstantNode(0)
const c1 = new ConstantNode(1)
const c2 = new ConstantNode(2)
const c3 = new ConstantNode(3)
const c4 = new ConstantNode(4)

const x = new VariableNode("x")
const y = new VariableNode("y")
const z = new VariableNode("z")

const uc1 = new UnaryNode("-", c1)
const uc2 = new UnaryNode("-", c2)
const uc4 = new UnaryNode("-", c4)

const ux = new UnaryNode("-", x)
const uy = new UnaryNode("-", y)
const uz = new UnaryNode("-", z)

const assignments = {
  x: 3,
  y: -2,
  z: 5,
}

/**
 * Tests to ensure quite good simplifications of arithmetic expressions
 *
 * Also evaluating the simplifications to ensure they are equivalent to the original expression
 */

/**************************************************
 * Basic arithmetic
 **************************************************/
describe("Arithmetic > Simplify > Base", () => {
  test("1+1", () => {
    const expr = new BinaryNode("+", c1, c1)
    const simplified = expr.simplify()
    expect(simplified).toEqual(new ConstantNode(2))
    expect(simplified.evaluate(assignments)).toEqual(expr.evaluate(assignments))
  })

  test("1+2+x+2", () => {
    const expr = new BinaryNode("+", new BinaryNode("+", new BinaryNode("+", c1, c2), x), c2)
    const simplified = expr.simplify()
    expect(simplified.toTex()).toMatch(/x \+ 5|5 \+ x/)
    expect(simplified.evaluate(assignments)).toEqual(expr.evaluate(assignments))
  })

  test("x+0+(-x)", () => {
    const expr = new BinaryNode("+", new BinaryNode("+", x, c0), ux)
    const simplified = expr.simplify()
    expect(simplified).toEqual(c0)
    expect(simplified.evaluate(assignments)).toEqual(expr.evaluate(assignments))
  })

  test("x*0*2", () => {
    const expr = new BinaryNode("*", new BinaryNode("*", x, c0), c2)
    const simplified = expr.simplify()
    expect(simplified).toEqual(c0)
    expect(simplified.evaluate(assignments)).toEqual(expr.evaluate(assignments))
  })

  test("x*2*3 (1)", () => {
    const expr = new BinaryNode("*", new BinaryNode("*", x, c2), c3)
    const simplified = expr.simplify()
    expect(simplified.toTex()).toBe("6x")
    expect(simplified.evaluate(assignments)).toEqual(expr.evaluate(assignments))
  })

  test("x*2*3 (2)", () => {
    const expr = new BinaryNode("*", c3, new VariableNode("x", 2))
    const simplified = expr.simplify()
    expect(simplified.toTex()).toBe("6x")
    expect(simplified.evaluate(assignments)).toEqual(expr.evaluate(assignments))
  })

  test("1-1+x-x", () => {
    const expr = new BinaryNode("-", new BinaryNode("+", new BinaryNode("-", c1, c1), x), x)
    const simplified = expr.simplify()
    expect(simplified).toEqual(c0)
    expect(simplified.evaluate(assignments)).toEqual(expr.evaluate(assignments))
  })

  test("1/4 x + 2 + 1/2 x + 3 + 1/4 x", () => {
    const expr = new BinaryNode(
      "+",
      new BinaryNode(
        "+",
        new BinaryNode("+", new BinaryNode("*", new BinaryNode("/", c1, c4), x), c2),
        new BinaryNode("+", new BinaryNode("*", new BinaryNode("/", c1, c2), x), c3),
      ),
      new BinaryNode("*", new BinaryNode("/", c1, c4), x),
    )
    // Quick check to ensure construction is correct
    expect(expr.toTex()).toBe(
      "\\dfrac{1}{4} \\cdot x + 2 + \\dfrac{1}{2} \\cdot x + 3 + \\dfrac{1}{4} \\cdot x",
    )
    const simplified = expr.simplify()
    expect(simplified.toTex()).toMatch(/x \+ 5|5 \+ x/)
    expect(simplified.evaluate(assignments)).toEqual(expr.evaluate(assignments))
  })
})

/**************************************************
 * Powers
 **************************************************/
describe("Arithmetic > Simplify > Powers", () => {
  test("2^2", () => {
    const expr = new BinaryNode("^", c2, c2)
    const simplified = expr.simplify()
    expect(simplified).toEqual(new ConstantNode(4))
    expect(simplified.evaluate(assignments)).toEqual(expr.evaluate(assignments))
  })

  test("2^2 + 2^3", () => {
    const expr = new BinaryNode("+", new BinaryNode("^", c2, c2), new BinaryNode("^", c2, c3))
    const simplified = expr.simplify()
    expect(simplified).toEqual(new ConstantNode(12))
    expect(simplified.evaluate(assignments)).toEqual(expr.evaluate(assignments))
  })

  test("x^2 + x^2", () => {
    const expr = new BinaryNode("+", new BinaryNode("^", x, c2), new BinaryNode("^", x, c2))
    const simplified = expr.simplify()
    expect(simplified.toTex()).toBe("2 \\cdot x^{2}")
    expect(simplified.evaluate(assignments)).toEqual(expr.evaluate(assignments))
  })

  test("x^2 + 2x^2 + 3x^2", () => {
    const expr = new BinaryNode(
      "+",
      new BinaryNode(
        "+",
        new BinaryNode("^", x, c2),
        new BinaryNode("*", c2, new BinaryNode("^", x, c2)),
      ),
      new BinaryNode("*", c3, new BinaryNode("^", x, c2)),
    )
    const simplified = expr.simplify()
    expect(simplified.toTex()).toBe("6 \\cdot x^{2}")
    expect(simplified.evaluate(assignments)).toEqual(expr.evaluate(assignments))
  })

  // Product rule for exponents
  test("x^2 * x^3 => x^5", () => {
    const expr = new BinaryNode("*", new BinaryNode("^", x, c2), new BinaryNode("^", x, c3))
    const simplified = expr.simplify()
    expect(simplified.toTex()).toBe("x^{5}")
    expect(simplified.evaluate(assignments)).toEqual(expr.evaluate(assignments))
  })

  // quotient rule for exponents
  test("x^5 / x^2 => x^3", () => {
    const expr = new BinaryNode(
      "/",
      new BinaryNode("^", x, new ConstantNode(5)),
      new BinaryNode("^", x, new ConstantNode(2)),
    )
    // validate construction
    expect(expr.toTex()).toBe("\\dfrac{x^{5}}{x^{2}}")

    const simplified = expr.simplify()
    expect(simplified.toTex()).toBe("x^{3}")
    expect(simplified.evaluate(assignments)).toEqual(expr.evaluate(assignments))
  })

  // power rule for exponents
  test("(x^2)^3 => x^6", () => {
    const expr = new BinaryNode("^", new BinaryNode("^", x, c2), c3)
    // validate construction
    expect(expr.toTex()).toBe("\\left(x^{2}\\right)^{3}")

    const simplified = expr.simplify()
    expect(simplified.toTex()).toBe("x^{6}")
    expect(simplified.evaluate(assignments)).toEqual(expr.evaluate(assignments))
  })

  // power of a product rule for exponents
  test("x^2 * y^2 => (x*y)^2", () => {
    const expr = new BinaryNode("*", new BinaryNode("^", x, c2), new BinaryNode("^", y, c2))
    // validate construction
    expect(expr.toTex()).toBe("x^{2} \\cdot y^{2}")

    const simplified = expr.simplify()
    expect(simplified.toTex()).toBe("\\left(xy\\right)^{2}")
    expect(simplified.evaluate(assignments)).toEqual(expr.evaluate(assignments))
  })

  // power of a fraction rule for exponents
  test("x^2 / y^2 => (x/y)^2", () => {
    const expr = new BinaryNode("/", new BinaryNode("^", x, c2), new BinaryNode("^", y, c2))
    // validate construction
    expect(expr.toTex()).toBe("\\dfrac{x^{2}}{y^{2}}")

    const simplified = expr.simplify()
    expect(simplified.toTex()).toBe("\\left(\\dfrac{x}{y}\\right)^{2}")
    expect(simplified.evaluate(assignments)).toEqual(expr.evaluate(assignments))
  })

  // zero exponent rule
  test("x^0 => 1", () => {
    const expr = new BinaryNode("^", x, c0)
    const simplified = expr.simplify()
    expect(simplified.toTex()).toBe("1")
    expect(simplified.evaluate(assignments)).toEqual(expr.evaluate(assignments))
  })

  // negative exponent (STAYS THE SAME) rule (1)
  test("x^-2 => x^-2", () => {
    const expr = new BinaryNode("^", x, uc2)
    const simplified = expr.simplify()
    expect(simplified.toTex()).toBe("x^{-2}")
    expect(simplified.evaluate(assignments)).toEqual(expr.evaluate(assignments))
  })

  // negative exponent (STAYS THE SAME) rule (2)
  test("2^-x => 2^-x", () => {
    const expr = new BinaryNode("^", c2, ux)
    const simplified = expr.simplify()
    expect(simplified.toTex()).toBe("2^{-x}")
    expect(simplified.evaluate(assignments)).toEqual(expr.evaluate(assignments))
  })

  // negative exponent (STAYS THE SAME) rule (3)
  test("(2)/(x^2) => (2)/(x^2)", () => {
    const expr = new BinaryNode("/", c2, new BinaryNode("^", x, c2))
    const simplified = expr.simplify()
    expect(simplified.toTex()).toBe("\\dfrac{2}{x^{2}}")
    expect(simplified.evaluate(assignments)).toEqual(expr.evaluate(assignments))
  })

  // negative base with even power => remove negative
  test("(-x)^2 => x^2", () => {
    const expr = new BinaryNode("^", ux, c2)
    const simplified = expr.simplify()
    expect(simplified.toTex()).toBe("x^{2}")
    expect(simplified.evaluate(assignments)).toEqual(expr.evaluate(assignments))
  })

  test("(-2y)^16 => (2y)^16", () => {
    const expr = new BinaryNode("^", new UnaryNode("-", new BinaryNode("*", c2, y)), new ConstantNode(16))
    const simplified = expr.simplify()
    expect(simplified.toTex()).toBe("\\left(2y\\right)^{16}")
    expect(simplified.evaluate(assignments)).toEqual(expr.evaluate(assignments))
  })

  // negative base with odd power => STAYS THE SAME
  test("(-3z)^5 => (-3z)^5", () => {
    const expr = new BinaryNode("^", new UnaryNode("-", new BinaryNode("*", c3, z)), new ConstantNode(5))
    const simplified = expr.simplify()
    expect(simplified.toTex()).toBe("\\left(-3z\\right)^{5}")
    expect(simplified.evaluate(assignments)).toEqual(expr.evaluate(assignments))
  })

  test("(-(-1))^2 => 1", () => {
    const expr = new BinaryNode("^", new UnaryNode("-", uc1), c2)
    const simplified = expr.simplify()
    expect(simplified.toTex()).toBe("1")
    expect(simplified.evaluate(assignments)).toEqual(expr.evaluate(assignments))
  })

  test("-(-(-1))^2 => -1", () => {
    const expr = new UnaryNode("-", new BinaryNode("^", new UnaryNode("-", uc1), c2))
    const simplified = expr.simplify()
    expect(simplified.toTex()).toBe("-1")
    expect(simplified.evaluate(assignments)).toEqual(expr.evaluate(assignments))
  })

  test("(-x^3)^4 => -x^{12}", () => {
    const expr = new BinaryNode("^", new UnaryNode("-", new BinaryNode("^", x, c3)), c4)
    const simplified = expr.simplify()
    expect(simplified.toTex()).toBe("-x^{12}")
    expect(simplified.evaluate(assignments)).toEqual(expr.evaluate(assignments))
  })

  /*
  Sqrt not supported yet
  To extend with two special cases of exponents:
  x^(1/2) => sqrt{x}
  x^{p/2} => sqrt{x^{p}}

  But in GENERAL keep:
  x^{p/q} => x^{p/q}
  */
})

/**************************************************
 * Fractions
 *
 * Ideas from:
 * https://www.mathwords.com/f/fraction_rules.htm
 **************************************************/
describe("Arithmetic > Simplify > Fractions", () => {
  test("(2)/(4) => 1/2", () => {
    const expr = new BinaryNode("/", c2, c4)
    const simplified = expr.simplify()
    expect(simplified.toTex()).toBe("\\dfrac{1}{2}")
    expect(simplified.evaluate(assignments)).toEqual(expr.evaluate(assignments))
  })

  test("(4)/(2) => 2", () => {
    const expr = new BinaryNode("/", c4, c2)
    const simplified = expr.simplify()
    expect(simplified.toTex()).toBe("2")
    expect(simplified.evaluate(assignments)).toEqual(expr.evaluate(assignments))
  })

  test("(2x)/(4) => (1/2)x", () => {
    const expr = new BinaryNode("/", new BinaryNode("*", c2, x), c4)
    const simplified = expr.simplify()
    expect(simplified.toTex()).toBe("\\dfrac{1}{2}x")
    expect(simplified.evaluate(assignments)).toEqual(expr.evaluate(assignments))
  })

  test("(2)/(4x) => (1/2x)", () => {
    const expr = new BinaryNode("/", c2, new BinaryNode("*", c4, x))
    const simplified = expr.simplify()
    expect(simplified.toTex()).toBe("\\dfrac{1}{2x}")
    expect(simplified.evaluate(assignments)).toEqual(expr.evaluate(assignments))
  })

  test("(2x)/(4y) => (1/2)(x/y)", () => {
    const expr = new BinaryNode("/", new BinaryNode("*", c2, x), new BinaryNode("*", c4, y))
    const simplified = expr.simplify()
    expect(simplified.toTex()).toBe("\\dfrac{1}{2} \\cdot \\dfrac{x}{y}")
    expect(simplified.evaluate(assignments)).toEqual(expr.evaluate(assignments))
  })

  test("2 * (x)/(x) => 2", () => {
    const expr = new BinaryNode("*", c2, new BinaryNode("/", x, x))
    const simplified = expr.simplify()
    expect(simplified.toTex()).toBe("2")
    expect(simplified.evaluate(assignments)).toEqual(expr.evaluate(assignments))
  })

  // one denominator => simplify to numerator
  test("(x)/(1) => x", () => {
    const expr = new BinaryNode("/", x, c1)
    const simplified = expr.simplify()
    expect(simplified.toTex()).toBe("x")
    expect(simplified.evaluate(assignments)).toEqual(expr.evaluate(assignments))
  })

  // one numerator => stays the same
  test("(1)/(x) => (1)/(x)", () => {
    const expr = new BinaryNode("/", c1, x)
    const simplified = expr.simplify()
    expect(simplified.toTex()).toBe("\\dfrac{1}{x}")
    expect(simplified.evaluate(assignments)).toEqual(expr.evaluate(assignments))
  })

  // zero numerator => zero
  test("(0)/(x) => 0", () => {
    const expr = new BinaryNode("/", c0, x)
    const simplified = expr.simplify()
    expect(simplified.toTex()).toBe("0")
    expect(simplified.evaluate(assignments)).toEqual(expr.evaluate(assignments))
  })

  // division by zero
  test("(x)/(0) => undefined (division by zero)", () => {
    const expr = new BinaryNode("/", x, c0)
    expect(() => expr.simplify()).toThrowError("Division by zero")
  })

  // one negative => take out negative
  test("(-x)/(y) => -(x/y)", () => {
    const expr = new BinaryNode("/", ux, y)
    // validate construction
    expect(expr.toTex()).toBe("\\dfrac{-x}{y}")

    const simplified = expr.simplify()
    expect(simplified.toTex()).toBe("-\\dfrac{x}{y}")
    expect(simplified.evaluate(assignments)).toEqual(expr.evaluate(assignments))
  })

  // one negative => take out negative
  test("(x)/(-y) => -(x/y)", () => {
    const expr = new BinaryNode("/", x, uy)
    // validate construction
    expect(expr.toTex()).toBe("\\dfrac{x}{-y}")

    const simplified = expr.simplify()
    expect(simplified.toTex()).toBe("-\\dfrac{x}{y}")
    expect(simplified.evaluate(assignments)).toEqual(expr.evaluate(assignments))
  })

  // one negative => take out negative
  test("(-1)/(2) => -(1/2)", () => {
    const expr = new BinaryNode("/", uc1, c2)
    // validate construction
    expect(expr.toTex()).toBe("\\dfrac{-1}{2}")

    const simplified = expr.simplify()
    expect(simplified.toTex()).toBe("-\\dfrac{1}{2}")
    expect(simplified.evaluate(assignments)).toEqual(expr.evaluate(assignments))
  })

  // both negative => positive
  test("(-x)/(-y) => x/y", () => {
    const expr = new BinaryNode("/", ux, uy)
    // validate construction
    expect(expr.toTex()).toBe("\\dfrac{-x}{-y}")

    const simplified = expr.simplify()
    expect(simplified.toTex()).toBe("\\dfrac{x}{y}")
    expect(simplified.evaluate(assignments)).toEqual(expr.evaluate(assignments))
  })

  // numerator = denominator => 1
  test("(x)/(x) => 1", () => {
    const expr = new BinaryNode("/", x, x)
    const simplified = expr.simplify()
    expect(simplified.toTex()).toBe("1")
    expect(simplified.evaluate(assignments)).toEqual(expr.evaluate(assignments))
  })

  // numerator = denominator => 1
  test("(x + y + z)/(x + y + z) => 1", () => {
    const sum = new BinaryNode("+", new BinaryNode("+", x, y), z)
    const expr = new BinaryNode("/", sum, sum)
    const simplified = expr.simplify()
    expect(simplified.toTex()).toBe("1")
    expect(simplified.evaluate(assignments)).toEqual(expr.evaluate(assignments))
  })

  // numerator * something / numerator * something => numerator / denominator
  test("(x*2)/(x*3) => 2/3", () => {
    const expr = new BinaryNode("/", new BinaryNode("*", x, c2), new BinaryNode("*", x, c3))
    const simplified = expr.simplify()
    expect(simplified.toTex()).toBe("\\dfrac{2}{3}")
    expect(simplified.evaluate(assignments)).toEqual(expr.evaluate(assignments))
  })

  // numerator * something / numerator * something => numerator / denominator
  test("(x*2^2)/(x*(-z)^2) => 2/3", () => {
    const expr = new BinaryNode(
      "/",
      new BinaryNode("*", x, new BinaryNode("^", c2, c2)),
      new BinaryNode("*", x, new BinaryNode("^", uz, c2)),
    )
    // validate construction
    expect(expr.toTex()).toBe("\\dfrac{x \\cdot 2^{2}}{x \\cdot \\left(-z\\right)^{2}}")

    const simplified = expr.simplify()
    expect(simplified.toTex()).toBe("\\dfrac{4}{\\left(-z\\right)^{2}}")
    expect(simplified.evaluate(assignments)).toEqual(expr.evaluate(assignments))
  })

  // numerator * something / numerator * something => numerator / denominator
  test("(2)/(x) * (x)/(3) => 2/3", () => {
    const expr = new BinaryNode("*", new BinaryNode("/", c2, x), new BinaryNode("/", x, c3))
    // validate construction
    expect(expr.toTex()).toBe("\\dfrac{2}{x} \\cdot \\dfrac{x}{3}")

    const simplified = expr.simplify()
    expect(simplified.toTex()).toBe("\\dfrac{2}{3}")
    expect(simplified.evaluate(assignments)).toEqual(expr.evaluate(assignments))
  })

  // numerator * something / numerator * something => numerator / denominator
  test("(z)/(x) * (y)/(z) => y/x", () => {
    const expr = new BinaryNode("*", new BinaryNode("/", z, x), new BinaryNode("/", y, z))
    // validate construction
    expect(expr.toTex()).toBe("\\dfrac{z}{x} \\cdot \\dfrac{y}{z}")

    const simplified = expr.simplify()
    expect(simplified.toTex()).toBe("\\dfrac{y}{x}")
    expect(simplified.evaluate(assignments)).toEqual(expr.evaluate(assignments))
  })

  // something * a/something => a
  test("x * (2)/(x) => 2", () => {
    const expr = new BinaryNode("*", x, new BinaryNode("/", c2, x))
    const simplified = expr.simplify()
    expect(simplified.toTex()).toBe("2")
    expect(simplified.evaluate(assignments)).toEqual(expr.evaluate(assignments))
  })

  // something * a/something => a
  test("(y)/(2) * 2 => 2", () => {
    const expr = new BinaryNode("*", new BinaryNode("/", y, c2), c2)
    const simplified = expr.simplify()
    expect(simplified.toTex()).toBe("y")
    expect(simplified.evaluate(assignments)).toEqual(expr.evaluate(assignments))
  })

  // addition with same denominator
  test("(x)/(2) + (3)/(2) => (x+3)/2", () => {
    const expr = new BinaryNode("+", new BinaryNode("/", x, c2), new BinaryNode("/", c3, c2))
    // validate construction
    expect(expr.toTex()).toBe("\\dfrac{x}{2} + \\dfrac{3}{2}")

    const simplified = expr.simplify()
    expect(simplified.toTex()).toBe("\\dfrac{x + 3}{2}")
    expect(simplified.evaluate(assignments)).toEqual(expr.evaluate(assignments))
  })

  // subtraction with same denominator
  test("(x)/(y) - (3)/(y) => (x-3)/y", () => {
    const expr = new BinaryNode("-", new BinaryNode("/", x, y), new BinaryNode("/", c3, y))
    // validate construction
    expect(expr.toTex()).toBe("\\dfrac{x}{y} - \\dfrac{3}{y}")

    const simplified = expr.simplify()
    expect(simplified.toTex()).toBe("\\dfrac{x - 3}{y}")
    expect(simplified.evaluate(assignments)).toEqual(expr.evaluate(assignments))
  })

  // multiplication of fractions
  test("(x)/(2) * (3)/(y) => (3x)/(2y)", () => {
    const expr = new BinaryNode("*", new BinaryNode("/", x, c2), new BinaryNode("/", c3, y))
    // validate construction
    expect(expr.toTex()).toBe("\\dfrac{x}{2} \\cdot \\dfrac{3}{y}")

    const simplified = expr.simplify()
    expect(simplified.toTex()).toBe("\\dfrac{3x}{2y}")
    expect(simplified.evaluate(assignments)).toEqual(expr.evaluate(assignments))
  })

  // multiplication of fractions
  test("(x)/(y) * (2)/(y) => (2x)/(y^2)", () => {
    const expr = new BinaryNode("*", new BinaryNode("/", x, y), new BinaryNode("/", c2, y))
    // validate construction
    expect(expr.toTex()).toBe("\\dfrac{x}{y} \\cdot \\dfrac{2}{y}")

    const simplified = expr.simplify()
    expect(simplified.toTex()).toBe("\\dfrac{2x}{y^{2}}")
    expect(simplified.evaluate(assignments)).toEqual(expr.evaluate(assignments))
  })

  // division of fractions
  test("((x)/(2))/((3)/(y)) => (xy)/(6)", () => {
    const expr = new BinaryNode("/", new BinaryNode("/", x, c2), new BinaryNode("/", c3, y))
    // validate construction
    expect(expr.toTex()).toBe("\\dfrac{\\dfrac{x}{2}}{\\dfrac{3}{y}}")

    const simplified = expr.simplify()
    expect(simplified.toTex()).toBe("\\dfrac{xy}{6}")
    expect(simplified.evaluate(assignments)).toEqual(expr.evaluate(assignments))
  })

  // division of fractions
  test("(x/y)/2 => 1/2 * (x)/(y)", () => {
    const expr = new BinaryNode("/", new BinaryNode("/", x, y), c2)
    // validate construction
    expect(expr.toTex()).toBe("\\dfrac{\\dfrac{x}{y}}{2}")

    const simplified = expr.simplify()
    expect(simplified.toTex()).toBe("\\dfrac{1}{2} \\cdot \\dfrac{x}{y}")
    expect(simplified.evaluate(assignments)).toEqual(expr.evaluate(assignments))
  })

  // division of fractions
  test("(x/y)/z => x/(z*y)", () => {
    const expr = new BinaryNode("/", new BinaryNode("/", x, y), z)
    // validate construction
    expect(expr.toTex()).toBe("\\dfrac{\\dfrac{x}{y}}{z}")

    const simplified = expr.simplify()
    expect(simplified.toTex()).toBe("\\dfrac{x}{yz}")
    expect(simplified.evaluate(assignments)).toEqual(expr.evaluate(assignments))
  })

  // division of fractions
  test("x/(y/z) => xz/(y)", () => {
    const expr = new BinaryNode("/", x, new BinaryNode("/", y, z))
    // validate construction
    expect(expr.toTex()).toBe("\\dfrac{x}{\\dfrac{y}{z}}")

    const simplified = expr.simplify()
    expect(simplified.toTex()).toBe("\\dfrac{xz}{y}")
    expect(simplified.evaluate(assignments)).toEqual(expr.evaluate(assignments))
  })

  /*
  Longer fractions:
   */
  test("x-((-1)/(3-1))", () => {
    const expr = new BinaryNode("-", x, new BinaryNode("/", uc1, new BinaryNode("-", c3, c1)))
    // validate construction
    expect(expr.toTex()).toBe("x - \\dfrac{-1}{3 - 1}")

    const simplified = expr.simplify()
    expect(simplified.toTex()).toBe("x + \\dfrac{1}{2}")
    expect(simplified.evaluate(assignments)).toEqual(expr.evaluate(assignments))
  })

  test("(2x- 2)/(-4) => - (x-1)/(2)", () => {
    const expr = new BinaryNode("/", new BinaryNode("-", new BinaryNode("*", c2, x), c2), uc4)
    // validate construction
    expect(expr.toTex()).toBe("\\dfrac{2x - 2}{-4}")

    const simplified = expr.simplify()
    expect(simplified.toTex()).toBe("-\\dfrac{x - 1}{2}")
    expect(simplified.evaluate(assignments)).toEqual(expr.evaluate(assignments))
  })
})

describe("Arithmetic > Simplify > Combined cases", () => {
  // double negative
  test("−(−(1)/(7) * y)", () => {
    const expr = new UnaryNode("-", new UnaryNode("-", new VariableNode("y", 1/7)))
    // validate construction
    expect(expr.toTex()).toBe("-\\left(-\\dfrac{1}{7}y\\right)")

    const simplified = expr.simplify()
    expect(simplified.toTex()).toBe("\\dfrac{1}{7}y")
    expect(approximatelyEqual(expr.evaluate(assignments) as number, simplified.evaluate(assignments)  as number)).toBeTruthy()
  })
})

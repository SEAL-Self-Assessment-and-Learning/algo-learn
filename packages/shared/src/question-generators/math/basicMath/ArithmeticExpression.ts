import type Random from "@shared/utils/random.ts"

export type ArithmeticOperator = "+" | "-" | "*" | "/" | "^"

// Base Expression Node Class
export abstract class ExprNode {
  abstract toString(): string
  abstract toTex(): string
  abstract evaluate(assign: Record<string, number>): number
  // Optional: track whether expression contains a variable
  abstract containsVariable(): boolean
  abstract getVariables(): Set<string>

  /**
   * Just a basic simplification method.
   * E.g.: --( -x ) => x,  -(5) => -5,  x + 0 => x,  x * 1 => x,  x * 0 => 0,  etc.
   *
   * But does not 2a + 3a => 5a or similar advanced simplifications.
   */
  abstract simplify(): ExprNode
}

// CONSTANT NODE:  e.g., "5"
export class ConstantNode extends ExprNode {
  constructor(public value: number) {
    super()
  }

  toString() {
    return this.value.toString()
  }

  toTex() {
    return this.value.toString()
  }

  evaluate() {
    return this.value
  }

  containsVariable() {
    return false
  }

  simplify() {
    return this
  }

  getVariables(): Set<string> {
    return new Set()
  }
}

// VARIABLE NODE:  e.g., "x"
export class VariableNode extends ExprNode {
  constructor(
    public name: string,
    public multiplier: number = 1,
  ) {
    super()
  }

  toString() {
    // multiplier should be positive integer
    if (this.multiplier > 1) {
      return `${this.multiplier}${this.name}`
    } else {
      return this.name
    }
  }

  toTex() {
    return this.toString()
  }

  evaluate(assign: Record<string, number>) {
    if (!(this.name in assign)) {
      throw new Error(`Missing assignment for variable '${this.name}'`)
    }
    return this.multiplier * assign[this.name]
  }

  containsVariable() {
    return true
  }

  simplify() {
    return this
  }

  getVariables(): Set<string> {
    return new Set([this.name])
  }
}

// UNARY OP:   e.g., "-x"
export class UnaryNode extends ExprNode {
  constructor(
    public op: "-",
    public child: ExprNode,
  ) {
    super()
  }

  toString() {
    const c =
      this.child instanceof ConstantNode || this.child instanceof VariableNode
        ? this.child.toString()
        : `(${this.child.toString()})`
    return `-${c}`
  }

  toTex() {
    if (this.child instanceof VariableNode || this.child instanceof ConstantNode) {
      return `-${this.child.toTex()}`
    }
    return `-\\left(${this.child.toTex()}\\right)`
  }

  evaluate(assign: Record<string, number>) {
    return -this.child.evaluate(assign)
  }

  containsVariable() {
    return this.child.containsVariable()
  }

  simplify(): ExprNode {
    const c = this.child.simplify()

    // ---( -x ) => x
    if (c instanceof UnaryNode && c.op === "-") return c.child

    // -(constant)
    if (c instanceof ConstantNode) return new ConstantNode(-c.value)

    return new UnaryNode("-", c)
  }

  getVariables(): Set<string> {
    return this.child.getVariables()
  }
}

export class BinaryNode extends ExprNode {
  constructor(
    public op: ArithmeticOperator,
    public left: ExprNode,
    public right: ExprNode,
  ) {
    super()
  }

  toString() {
    const L =
      this.left instanceof ConstantNode || this.left instanceof VariableNode
        ? this.left.toString()
        : `(${this.left.toString()})`

    const R =
      this.right instanceof ConstantNode || this.right instanceof VariableNode
        ? this.right.toString()
        : `(${this.right.toString()})`

    return `${L} ${this.op} ${R}`
  }

  toTex() {
    const needsParensLeft = this.needsParens(this.left, true)
    const needsParensRight = this.needsParens(this.right, false)

    const L = needsParensLeft ? `\\left(${this.left.toTex()}\\right)` : this.left.toTex()
    const R = needsParensRight ? `\\left(${this.right.toTex()}\\right)` : this.right.toTex()

    if (this.op === "/") {
      // Fraction handles its own grouping
      return `\\frac{${this.left.toTex()}}{${this.right.toTex()}}`
    } else if (this.op === "^") {
      const base = needsParensLeft ? `\\left(${this.left.toTex()}\\right)` : this.left.toTex()
      return `{${base}}^{${this.right.toTex()}}`
    } else {
      return `${L} ${this.op} ${R}`
    }
  }

  private needsParens(child: ExprNode, isLeft: boolean): boolean {
    if (!(child instanceof BinaryNode)) return false

    const childPrecedence = this.getPrecedence(child.op)
    const parentPrecedence = this.getPrecedence(this.op)

    if (childPrecedence < parentPrecedence) return true
    if (childPrecedence === parentPrecedence && !isLeft && !this.isAssociative()) return true

    return false
  }

  private getPrecedence(op: ArithmeticOperator): number {
    if (op === "^") return 3
    if (op === "*" || op === "/") return 2
    if (op === "+" || op === "-") return 1
    return 0
  }

  private isAssociative(): boolean {
    return this.op === "+" || this.op === "*"
  }

  evaluate(assign: Record<string, number>) {
    const a = this.left.evaluate(assign)
    const b = this.right.evaluate(assign)

    switch (this.op) {
      case "+":
        return a + b
      case "-":
        return a - b
      case "*":
        return a * b
      case "/":
        return a / b
      case "^":
        return a ** b
    }
  }

  containsVariable() {
    return this.left.containsVariable() || this.right.containsVariable()
  }

  simplify(): ExprNode {
    const L = this.left.simplify()
    const R = this.right.simplify()

    // both constants → reduce
    if (L instanceof ConstantNode && R instanceof ConstantNode) {
      return new ConstantNode(this.evaluate({})) // safe, no vars
    }

    // identities
    if (this.op === "+") {
      if (R instanceof ConstantNode && R.value === 0) return L
      if (L instanceof ConstantNode && L.value === 0) return R
    }
    if (this.op === "-") {
      if (R instanceof ConstantNode && R.value === 0) return L
    }
    if (this.op === "*") {
      if (R instanceof ConstantNode && R.value === 1) return L
      if (L instanceof ConstantNode && L.value === 1) return R
      if (R instanceof ConstantNode && R.value === 0) return new ConstantNode(0)
      if (L instanceof ConstantNode && L.value === 0) return new ConstantNode(0)
    }
    if (this.op === "^") {
      if (R instanceof ConstantNode && R.value === 1) return L
      if (R instanceof ConstantNode && R.value === 0) return new ConstantNode(1)
    }

    return new BinaryNode(this.op, L, R)
  }

  getVariables(): Set<string> {
    const vars = new Set<string>()
    for (const v of this.left.getVariables()) vars.add(v)
    for (const v of this.right.getVariables()) vars.add(v)
    return vars
  }
}

function getExpressionSettings(difficulty: number) {
  if (difficulty < 0 || difficulty > 5) {
    throw new Error("Difficulty must be between 1 and 5")
  }
  return {
    maxDepth: [2, 2, 3, 3, 4][difficulty - 1] ?? 2,
    useMul: difficulty >= 2,
    useDiv: difficulty >= 3,
    usePow: difficulty >= 4,
  }
}

function getConstantRange(difficulty: number, forAssignment = false): [number, number] {
  if (forAssignment) {
    // Assignments should use simpler numbers
    return [1, 5]
  }
  // In-expression constants
  return difficulty <= 2 ? [1, 5] : [1, 9]
}

export function randomExpressionTree(
  random: Random,
  difficulty = 1,
  depth = 0,
  mustContainVariable = true,
  variables: string[],
): ExprNode {
  const settings = getExpressionSettings(difficulty)

  // ----- BASE CASE -----
  if (depth >= settings.maxDepth) {
    if (mustContainVariable || random.bool(0.3)) {
      return new VariableNode(
        random.choice(variables),
        random.weightedChoice([1, 2, 3], [0.7, 0.2, 0.1]),
      )
    }
    return new ConstantNode(
      random.int(getConstantRange(difficulty, false)[0], getConstantRange(difficulty, false)[1]),
    )
  }

  // ----- POSSIBLE OPERATIONS -----
  const ops = ["+", "-"]
  if (settings.useMul) ops.push("*")
  if (settings.useDiv) ops.push("/")
  if (settings.usePow) ops.push("^")
  if (difficulty >= 2) ops.push("unary")

  const op = random.choice(ops)

  // ----- VARIABLE REQUIREMENTS -----
  let leftMust = false
  let rightMust = false

  if (mustContainVariable) {
    if (op === "unary") {
      leftMust = true
    } else if (op === "^") {
      // base must contain variable
      leftMust = true
    } else {
      const choice = random.choice(["left", "right", "both"])
      if (choice === "left") leftMust = true
      if (choice === "right") rightMust = true
      if (choice === "both") {
        leftMust = true
        rightMust = true
      }
    }
  }

  // ----- UNARY -----
  if (op === "unary") {
    const child = randomExpressionTree(random, difficulty, depth + 1, leftMust, variables)
    return new UnaryNode("-", child)
  }

  // ----- LEFT CHILD -----
  const left = randomExpressionTree(random, difficulty, depth + 1, leftMust, variables)

  // ----- POWER -----
  if (op === "^") {
    // 0 or 1 as base cases
    const exponent = random.int(0, 2)
    return new BinaryNode("^", left, new ConstantNode(exponent))
  }

  // In randomExpressionTree, when creating division:
  if (op === "/") {
    const right = randomExpressionTree(random, difficulty, depth + 1, rightMust, variables)

    // Prevent division by expressions that could be zero or very small
    if (right instanceof ConstantNode && Math.abs(right.value) < 2) {
      return randomExpressionTree(random, difficulty, depth, mustContainVariable, variables)
    }

    return new BinaryNode("/", left, right)
  }

  // ----- BINARY + - * / -----
  const right = randomExpressionTree(random, difficulty, depth + 1, rightMust, variables)
  return new BinaryNode(op as ArithmeticOperator, left, right)
}

export function randomAssignment(
  random: Random,
  varExpression: boolean = false,
  vars: string[],
): Record<string, ExprNode> {
  const assign: Record<string, ExprNode> = {}
  let varToMakeExpression: string = "?" // default invalid

  if (varExpression && vars.length > 1) {
    varToMakeExpression = random.choice(vars)
  }

  for (const v of vars) {
    if (varToMakeExpression === v) {
      const varSet = vars.filter((varName) => varName !== v)
      assign[v] = randomExpressionTree(random, 1, 0, true, varSet)
    } else {
      assign[v] = new ConstantNode(
        random.int(getConstantRange(1, false)[0], getConstantRange(1, false)[1]),
      )
    }
  }
  return assign
}

// Evaluation function (unchanged, it was correct)
export function evalWithExprAssignments(expr: ExprNode, assigns: Record<string, ExprNode>): number {
  const resolved: Record<string, number> = {}
  const unresolved = new Set(Object.keys(assigns))

  // First pass: resolve constants
  for (const v of unresolved) {
    const node = assigns[v]
    if (node instanceof ConstantNode) {
      resolved[v] = node.value
      unresolved.delete(v)
    }
  }

  let progress = true
  const maxIterations = 100 // Prevent infinite loops
  let iterations = 0

  // Keep evaluating until every variable is resolved or no progress is made
  while (unresolved.size > 0 && progress && iterations < maxIterations) {
    progress = false
    iterations++

    for (const v of Array.from(unresolved)) {
      try {
        const node = assigns[v]
        resolved[v] = node.evaluate(resolved)
        unresolved.delete(v)
        progress = true
      } catch {
        // It failed because a dependency is still unresolved -> skip
      }
    }
  }

  // If we are stuck, some variables cannot be resolved
  if (unresolved.size > 0) {
    throw new Error(
      `Cannot resolve assignments for: ${Array.from(unresolved).join(", ")}.\n` +
        `Check for circular or missing dependencies.`,
    )
  }

  // Finally evaluate the main expression
  return expr.evaluate(resolved)
}

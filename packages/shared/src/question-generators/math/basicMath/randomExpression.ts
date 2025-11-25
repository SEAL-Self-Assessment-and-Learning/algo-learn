import type Random from "@shared/utils/random.ts"
import {
  BinaryNode,
  ConstantNode,
  expectNumeric,
  UnaryNode,
  VariableNode,
  type ArithmeticOperator,
  type ExprNode,
} from "../../../utils/math/arithmeticExpression.ts"

type AssignmentMode = "numeric" | "numericExpression" | "symbolic"

export interface ExpressionScenario {
  expression: ExprNode
  assignments: Record<string, ExprNode>
  expected: number | ExprNode
  expectsNumeric: boolean
}

const MAX_GENERATION_ATTEMPTS = 60
const NUMERIC_MAGNITUDES = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const
const SYMBOLIC_ANCHORS = ["m", "n", "p", "t", "s"] as const
const SYMBOLIC_CONSTANTS = [-4, -3, -2, -1, 0, 1, 2, 3, 4] as const
const DEFAULT_VARIABLES = ["x", "y", "z", "a", "b", "c"] as const

interface DifficultyConfig {
  mode: AssignmentMode
  treeDifficulty: number
}

function mapDifficultyToConfig(difficulty: number): DifficultyConfig {
  if (difficulty <= 3) {
    return { mode: "numeric", treeDifficulty: clampTreeDifficulty(difficulty) }
  }
  if (difficulty <= 6) {
    return { mode: "numericExpression", treeDifficulty: clampTreeDifficulty(difficulty - 1) }
  }
  return { mode: "symbolic", treeDifficulty: clampTreeDifficulty(difficulty - 3) }
}

function clampTreeDifficulty(value: number): number {
  return Math.min(5, Math.max(1, Math.ceil(value)))
}

function randomNonZeroConstant(random: Random): number {
  const magnitude = random.choice(NUMERIC_MAGNITUDES)
  return random.bool() ? magnitude : -magnitude
}

function randomSmallPositive(random: Random): number {
  return random.choice([1, 2, 3, 4])
}

function buildNumericAssignmentExpr(random: Random): ExprNode {
  const a = randomNonZeroConstant(random)
  const b = randomNonZeroConstant(random)
  const c = randomSmallPositive(random)
  const forms: Array<() => ExprNode> = [
    () => new BinaryNode("+", new ConstantNode(a), new ConstantNode(b)),
    () => new BinaryNode("-", new ConstantNode(a + c), new ConstantNode(c)),
    () => new BinaryNode("*", new ConstantNode(a), new ConstantNode(random.bool() ? 2 : 3)),
    () =>
      new BinaryNode(
        "+",
        new ConstantNode(a),
        new BinaryNode("*", new ConstantNode(random.bool() ? 1 : -1), new ConstantNode(c)),
      ),
  ]
  return forms[random.int(0, forms.length - 1)]()
}

function buildSymbolicAssignmentExpr(random: Random, anchor: string): ExprNode {
  const coefficient = random.choice([1, 2, 3])
  const constant = random.choice(SYMBOLIC_CONSTANTS)
  const positiveConstant = Math.abs(constant) || 1
  const forms: Array<() => ExprNode> = [
    () => new VariableNode(anchor, coefficient),
    () => new BinaryNode("+", new ConstantNode(constant), new VariableNode(anchor, coefficient)),
    () =>
      new BinaryNode("-", new VariableNode(anchor, coefficient + 1), new ConstantNode(positiveConstant)),
    () => new BinaryNode("*", new ConstantNode(coefficient), new VariableNode(anchor, 1)),
  ]
  let result = forms[random.int(0, forms.length - 1)]()
  if (random.bool(0.3)) {
    result = new BinaryNode("+", new ConstantNode(randomNonZeroConstant(random)), result)
  }
  return result
}

function chooseAnchorSymbol(
  random: Random,
  expressionVariables: string[],
  variablePool: readonly string[],
): string {
  const used = new Set(expressionVariables)
  const candidates = [...variablePool, ...SYMBOLIC_ANCHORS].filter((symbol) => !used.has(symbol))
  const fallback = [...variablePool, ...SYMBOLIC_ANCHORS]
  const pool = candidates.length > 0 ? candidates : fallback
  return random.choice(pool)
}

function buildAssignments(
  random: Random,
  variables: string[],
  mode: AssignmentMode,
  variablePool: readonly string[],
): Record<string, ExprNode> {
  const uniqueVariables = Array.from(new Set(variables))
  const assignments: Record<string, ExprNode> = {}

  if (uniqueVariables.length === 0) {
    return assignments
  }

  if (mode === "numeric") {
    for (const variable of uniqueVariables) {
      assignments[variable] = new ConstantNode(randomNonZeroConstant(random))
    }
    return assignments
  }

  if (mode === "numericExpression") {
    for (const variable of uniqueVariables) {
      assignments[variable] = random.bool(0.25)
        ? new ConstantNode(randomNonZeroConstant(random))
        : buildNumericAssignmentExpr(random)
    }
    return assignments
  }

  const anchor = chooseAnchorSymbol(random, uniqueVariables, variablePool)
  let anchorUsed = false

  for (const variable of uniqueVariables) {
    let expr: ExprNode
    if (random.bool(0.3)) {
      expr = new ConstantNode(randomNonZeroConstant(random))
    } else if (random.bool(0.45)) {
      expr = buildNumericAssignmentExpr(random)
    } else {
      expr = buildSymbolicAssignmentExpr(random, anchor)
      anchorUsed = true
    }
    assignments[variable] = expr
  }

  if (!anchorUsed) {
    const target = random.choice(uniqueVariables)
    assignments[target] = buildSymbolicAssignmentExpr(random, anchor)
  }

  return assignments
}

function isReadableExpression(expr: ExprNode, maxLength = 90): boolean {
  return expr.toTex().length <= maxLength
}

function areAssignmentsReadable(assignments: Record<string, ExprNode>, maxLength = 60): boolean {
  return Object.values(assignments).every((node) => isReadableExpression(node, maxLength))
}

export function generateExpressionScenario(
  random: Random,
  difficulty: number,
  variablePool: string[],
): ExpressionScenario {
  const pool = variablePool.length > 0 ? variablePool : [...DEFAULT_VARIABLES]
  const config = mapDifficultyToConfig(difficulty)

  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt++) {
    const expr = randomExpressionTree(random, config.treeDifficulty, 0, true, pool)
    // const expr = randomExpressionTree(random, config.treeDifficulty, 0, true, pool).simplify()
    if (!expr.containsVariable()) continue
    if (!isReadableExpression(expr)) continue

    const vars = Array.from(expr.getVariables())
    const assignments = buildAssignments(random, vars, config.mode, pool)
    if (!areAssignmentsReadable(assignments)) continue

    if (config.mode === "symbolic") {
      const substituted = expr.substitute(assignments)
      if (!substituted.containsVariable()) continue
      if (!isReadableExpression(substituted)) continue

      return {
        expression: expr,
        assignments,
        expected: substituted,
        expectsNumeric: false,
      }
    }

    try {
      const value = evalWithExprAssignments(expr, assignments)
      return {
        expression: expr,
        assignments,
        expected: value,
        expectsNumeric: true,
      }
    } catch {
      continue
    }
  }

  throw new Error("Unable to generate a suitable expression scenario")
}

function getExpressionSettings(difficulty: number) {
  if (difficulty < 1 || difficulty > 5) {
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
    return [1, 4]
  }
  if (difficulty <= 2) return [1, 5]
  if (difficulty <= 4) return [1, 7]
  return [1, 9]
}

export function randomExpressionTree(
  random: Random,
  difficulty = 1,
  depth = 0,
  mustContainVariable = true,
  variables: readonly string[],
  unaryDepth = 0,
): ExprNode {
  const settings = getExpressionSettings(difficulty)

  if (depth >= settings.maxDepth) {
    if (mustContainVariable || random.bool(0.3)) {
      return new VariableNode(
        random.choice(variables),
        random.weightedChoice([1, 2, 3], [0.7, 0.2, 0.1]),
      )
    }
    const [min, max] = getConstantRange(difficulty, false)
    const value = random.int(min, max)
    return new ConstantNode(random.bool(0.3) ? -value : value)
  }

  const ops: Array<ArithmeticOperator | "unary"> = ["+", "-"]
  if (settings.useMul) ops.push("*")
  if (settings.useDiv) ops.push("/")
  if (settings.usePow) ops.push("^")
  if (difficulty >= 2 && unaryDepth < 2) ops.push("unary")

  const op = random.choice(ops)

  let leftMust = false
  let rightMust = false

  if (mustContainVariable) {
    if (op === "unary") {
      leftMust = true
    } else if (op === "^") {
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

  if (op === "unary") {
    const child = randomExpressionTree(
      random,
      difficulty,
      depth + 1,
      leftMust,
      variables,
      unaryDepth + 1,
    )
    return new UnaryNode("-", child)
  }

  const left = randomExpressionTree(random, difficulty, depth + 1, leftMust, variables, 0)

  if (op === "^") {
    const exponent = random.int(1, 3)
    return new BinaryNode("^", left, new ConstantNode(exponent))
  }

  if (op === "/") {
    const right = randomExpressionTree(random, difficulty, depth + 1, rightMust, variables, 0)
    if (right instanceof ConstantNode && Math.abs(right.value) < 2) {
      return randomExpressionTree(random, difficulty, depth, mustContainVariable, variables, unaryDepth)
    }
    return new BinaryNode("/", left, right)
  }

  const right = randomExpressionTree(random, difficulty, depth + 1, rightMust, variables, 0)
  return new BinaryNode(op as ArithmeticOperator, left, right)
}

// Evaluation helper that resolves variable expressions to numeric values when possible
export function evalWithExprAssignments(expr: ExprNode, assigns: Record<string, ExprNode>): number {
  const resolved: Record<string, number> = {}
  const unresolved = new Set(Object.keys(assigns))

  for (const v of unresolved) {
    const node = assigns[v]
    if (node instanceof ConstantNode) {
      resolved[v] = node.value
      unresolved.delete(v)
    }
  }

  let progress = true
  const maxIterations = 100
  let iterations = 0

  while (unresolved.size > 0 && progress && iterations < maxIterations) {
    progress = false
    iterations++

    for (const v of Array.from(unresolved)) {
      try {
        const node = assigns[v]
        resolved[v] = expectNumeric(node.evaluate(resolved), `Assignment '${v}'`)
        unresolved.delete(v)
        progress = true
      } catch {
        // dependency unresolved – try later
      }
    }
  }

  if (unresolved.size > 0) {
    throw new Error(
      `Cannot resolve assignments for: ${Array.from(unresolved).join(", ")}.\n` +
        `Check for circular or missing dependencies.`,
    )
  }

  return expectNumeric(expr.evaluate(resolved), "Main expression")
}

import {
  BinaryNode,
  ConstantNode,
  FunctionNode,
  UnaryNode,
  VariableNode,
  type ExprNode,
  type ParseOptions,
} from "@shared/utils/math/arithmeticExpression.ts"

/**
 * Types of tokens in the arithmetic expression
 *
 * Also to be extended in the future if needed
 * E.g. for function definitions, custom operators, etc.
 */
type TokenType =
  | "number"
  | "identifier"
  | "plus"
  | "minus"
  | "star"
  | "slash"
  | "caret"
  | "lparen"
  | "rparen"
  | "comma"
  | "eof"

interface Token {
  type: TokenType
  value: string
  start: number
  end: number
}

/**
 * Current options for indiviudal parsing process
 * - allowImplicitMultiplication: Whether implicit multiplication is allowed (e.g. "2x" = "2*x")
 *
 * To be extended in the future if needed
 * E.g. for function definitions, custom operators, etc.
 */
interface InternalParseOptions {
  allowImplicitMultiplication: boolean
}

/**
 * Error thrown when parsing an arithmetic expression fails
 */
export class ArithmeticExpressionParseError extends Error {
  constructor(
    message: string,
    public readonly expression: string,
    public readonly position: number,
  ) {
    super(buildParseErrorMessage(message, expression, position))
    this.name = "ArithmeticExpressionParseError"
  }
}

/**
 * Class to parse arithmetic expressions into expression trees
 *
 * @throws ArithmeticExpressionParseError
 */
class ArithmeticExpressionParser {
  private current = 0

  constructor(
    private readonly tokens: Token[],
    private readonly expression: string,
    private readonly options: InternalParseOptions,
  ) {}

  parse(): ExprNode {
    return this.parseExpression()
  }

  private parseExpression(): ExprNode {
    return this.parseAddition()
  }

  private parseAddition(): ExprNode {
    let node = this.parseMultiplication()
    while (true) {
      if (this.match("plus")) {
        node = new BinaryNode("+", node, this.parseMultiplication())
        continue
      }
      if (this.match("minus")) {
        node = new BinaryNode("-", node, this.parseMultiplication())
        continue
      }
      break
    }
    return node
  }

  private parseMultiplication(): ExprNode {
    let node = this.parsePower()
    while (true) {
      if (this.match("star")) {
        node = new BinaryNode("*", node, this.parsePower())
        continue
      }
      if (this.match("slash")) {
        node = new BinaryNode("/", node, this.parsePower())
        continue
      }
      if (this.shouldApplyImplicitMultiplication()) {
        node = new BinaryNode("*", node, this.parsePower())
        continue
      }
      break
    }
    return node
  }

  private parsePower(): ExprNode {
    const base = this.parseUnary()
    if (this.match("caret")) {
      const exponent = this.parsePower()
      return new BinaryNode("^", base, exponent)
    }
    return base
  }

  private parseUnary(): ExprNode {
    if (this.match("minus")) {
      return new UnaryNode("-", this.parseUnary())
    }
    if (this.match("plus")) {
      return this.parseUnary()
    }
    return this.parsePrimary()
  }

  private parsePrimary(): ExprNode {
    const token = this.peek()
    switch (token.type) {
      case "number": {
        this.advance()
        const value = Number.parseFloat(token.value)
        if (!Number.isFinite(value)) {
          throw this.error(token, `Invalid number '${token.value}'`)
        }
        return new ConstantNode(value)
      }
      case "identifier":
        return this.parseIdentifier()
      case "lparen": {
        this.advance()
        const expr = this.parseExpression()
        this.consume("rparen", "Expected ')' to close '('")
        return expr
      }
      default:
        throw this.error(token, `Unexpected token '${token.value || token.type}'`)
    }
  }

  private parseIdentifier(): ExprNode {
    const token = this.advance()
    const name = token.value
    if (this.match("lparen")) {
      const args: ExprNode[] = []
      if (!this.check("rparen")) {
        do {
          args.push(this.parseExpression())
        } while (this.match("comma"))
      }
      this.consume("rparen", `Expected ')' after arguments of '${name}'`)
      try {
        return new FunctionNode(name, args)
      } catch (error) {
        if (error instanceof Error) {
          throw this.error(token, error.message)
        }
        throw this.error(token, `Invalid function '${name}'`)
      }
    }
    return new VariableNode(name)
  }

  private shouldApplyImplicitMultiplication(): boolean {
    if (!this.options.allowImplicitMultiplication) return false
    const token = this.peek()
    if (token.type === "eof" || token.type === "comma" || token.type === "rparen") {
      return false
    }
    return token.type === "number" || token.type === "identifier" || token.type === "lparen"
  }

  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance()
        return true
      }
    }
    return false
  }

  private consume(type: TokenType, message: string): void {
    if (this.check(type)) {
      this.advance()
      return
    }
    throw this.error(this.peek(), message)
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false
    return this.peek().type === type
  }

  private advance(): Token {
    if (!this.isAtEnd()) {
      this.current++
    }
    return this.previous()
  }

  private isAtEnd(): boolean {
    return this.peek().type === "eof"
  }

  private peek(): Token {
    return this.tokens[this.current]
  }

  private previous(): Token {
    return this.tokens[this.current - 1]
  }

  private error(token: Token, message: string): ArithmeticExpressionParseError {
    return new ArithmeticExpressionParseError(message, this.expression, token.start)
  }
}

function tokenizeArithmeticExpression(expression: string): Token[] {
  const tokens: Token[] = []
  let index = 0

  while (index < expression.length) {
    const char = expression[index]

    if (isWhitespace(char)) {
      index++
      continue
    }

    if (isDigit(char) || (char === "." && isDigit(expression[index + 1] ?? ""))) {
      const start = index
      let hasDot = char === "."
      index++
      while (index < expression.length) {
        const next = expression[index]
        if (isDigit(next)) {
          index++
          continue
        }
        if (next === ".") {
          if (hasDot) {
            throw new ArithmeticExpressionParseError("Invalid number format", expression, index)
          }
          hasDot = true
          index++
          continue
        }
        break
      }
      const value = expression.slice(start, index)
      tokens.push({ type: "number", value, start, end: index })
      continue
    }

    if (isAlpha(char)) {
      const start = index
      index++
      while (index < expression.length && isAlphaNumeric(expression[index])) {
        index++
      }
      const value = expression.slice(start, index)
      tokens.push({ type: "identifier", value, start, end: index })
      continue
    }

    const start = index
    index++

    switch (char) {
      case "+":
        tokens.push({ type: "plus", value: char, start, end: index })
        break
      case "-":
        tokens.push({ type: "minus", value: char, start, end: index })
        break
      case "*":
        tokens.push({ type: "star", value: char, start, end: index })
        break
      case "/":
        tokens.push({ type: "slash", value: char, start, end: index })
        break
      case "^":
        tokens.push({ type: "caret", value: char, start, end: index })
        break
      case "(":
        tokens.push({ type: "lparen", value: char, start, end: index })
        break
      case ")":
        tokens.push({ type: "rparen", value: char, start, end: index })
        break
      case ",":
        tokens.push({ type: "comma", value: char, start, end: index })
        break
      default:
        throw new ArithmeticExpressionParseError(`Unexpected character '${char}'`, expression, start)
    }
  }

  tokens.push({ type: "eof", value: "", start: expression.length, end: expression.length })
  return tokens
}

/**
 * Checks if a character is one of the whitespace characters
 * @param char
 */
function isWhitespace(char: string): boolean {
  return char === " " || char === "\t" || char === "\n" || char === "\r"
}

/**
 * Checks if a character is a digit (0-9)
 * @param char
 */
function isDigit(char: string): boolean {
  return char >= "0" && char <= "9"
}

/**
 * Checks if the car is between a-z, A-Z or _
 * @param char
 */
function isAlpha(char: string): boolean {
  return (char >= "a" && char <= "z") || (char >= "A" && char <= "Z") || char === "_"
}

/**
 * Either digit or alpha
 * @param char
 */
function isAlphaNumeric(char: string): boolean {
  return isAlpha(char) || isDigit(char)
}

/**
 * Builds a parse error message with context to help locate the error
 * @param message
 * @param expression
 * @param position
 */
function buildParseErrorMessage(message: string, expression: string, position: number): string {
  const clamped = Math.max(0, Math.min(position, expression.length))
  const indicator = `${" ".repeat(clamped)}`
  return `${message} at position ${clamped}.\n${expression}\n${indicator}`
}

/**
 * Parses an arithmetic expression into an expression tree
 *
 * Can use the following options:
 * - allowImplicitMultiplication:
 *     Whether implicit multiplication is allowed (e.g. "2x" = "2*x"), default: true
 * - simplify:
 *     Whether to simplify the resulting expression tree, default: true
 *
 * @throws ArithmeticExpressionParseError
 * @param text
 * @param options
 */
export function parseArithmeticExpression(text: string, options: ParseOptions = {}): ExprNode {
  const expression = text ?? ""
  if (expression.trim().length === 0) {
    // Empty expression defaults to 0 if nothing is provided
    return new ConstantNode(0)
  }

  const allowImplicitMultiplication = options.allowImplicitMultiplication !== false
  const simplify = options.simplify !== false

  try {
    const tokens = tokenizeArithmeticExpression(expression)
    const parser = new ArithmeticExpressionParser(tokens, expression, {
      allowImplicitMultiplication,
    })
    const node = parser.parse()
    return simplify ? node.simplify() : node
  } catch (error) {
    if (error instanceof ArithmeticExpressionParseError) {
      throw error
    }
    const message = error instanceof Error ? error.message : "Unknown parsing error"
    throw new ArithmeticExpressionParseError(message, expression, 0)
  }
}

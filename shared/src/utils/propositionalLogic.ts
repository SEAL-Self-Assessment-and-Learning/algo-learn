import Random from "./random.ts"

export type VariableValues = Record<string, boolean>

export type ExpressionProperties = {
  variables: string[]
  satisfiable: false | VariableValues
  falsifiable: false | VariableValues
}

export type TruthTable = boolean[]

abstract class SyntaxTreeNode {
  public negated: boolean = false
  /**
   * Returns a deep copy of the Operator
   * @returns
   */
  public abstract copy(): SyntaxTreeNode
  /**
   * Evaluates the expression for the given values
   * @param values
   */
  public abstract eval(values: VariableValues): boolean
  public abstract toString(latex: boolean): string
  /**
   * Moves negation inwards to the literals
   */
  public abstract simplifyNegation(): this
  /**
   * replaces all \\xor, => and <=> operators by an equivalent \\and / \\or expression
   */
  public abstract simplifyLocal(): this
  /**
   * replaces all \\xor, => and <=> operators by an equivalent \\and / \\or expression
   */
  public abstract simplify(): this
  /**
   * Permutes the syntax tree
   */
  public abstract shuffle(random: Random): this
  /**
   * returns an array containing all variable names in the expression
   */
  public abstract getVariableNames(): string[]
  public abstract isConjunction(): boolean
  public abstract isDisjunction(): boolean
  public abstract isCNF(): boolean
  public abstract isDNF(): boolean

  public negate(): this {
    this.negated = !this.negated
    return this
  }

  protected static getTruthTableSize(vs: number | string[]): number {
    const size = typeof vs === "number" ? vs : vs.length
    return 1 << size
  }

  /**
   * Generates a truth table (array of boolean values) where each index corresponds to variable values
   * according to the numToVariableValues(index, variableNames).
   * @returns
   */
  public getTruthTable(): { truthTable: TruthTable; variableNames: string[] } {
    const variableNames = this.getVariableNames()

    const truthTableSize = SyntaxTreeNode.getTruthTableSize(variableNames)

    const truthTable: TruthTable = []
    for (let i = 0; i < truthTableSize; i++) {
      truthTable.push(this.eval(numToVariableValues(i, variableNames)))
    }

    return { truthTable, variableNames }
  }

  /**
   * Returns variable names and checks if the expression is satisfiable or falsifiable and if so providing an example in each case.
   * @returns
   */
  public getProperties(): ExpressionProperties {
    const properties: ExpressionProperties = {
      variables: this.getVariableNames(),
      satisfiable: false,
      falsifiable: false,
    }

    const truthTableSize = SyntaxTreeNode.getTruthTableSize(properties.variables)
    for (let i = 0; i < truthTableSize; i++) {
      const variableValues = numToVariableValues(i, properties.variables)
      const expressionValue = this.eval(variableValues)
      if (expressionValue) {
        properties.satisfiable = variableValues
      } else {
        properties.falsifiable = variableValues
      }

      if (properties.satisfiable !== false && properties.falsifiable !== false) return properties
    }

    return properties
  }

  private makeNormalForm(setting: {
    inner: (nodes: SyntaxTreeNodeType[]) => SyntaxTreeNodeType
    outer: (nodes: SyntaxTreeNodeType[]) => SyntaxTreeNodeType
    invert: boolean
  }): SyntaxTreeNodeType {
    const { truthTable, variableNames } = this.getTruthTable()

    const innerNodes: SyntaxTreeNodeType[] = []

    truthTable.forEach((value: boolean, index: number) => {
      if (value === setting.invert) return

      innerNodes.push(
        setting.inner(variableValuesToLiterals(numToVariableValues(index, variableNames), setting.invert)),
      )
    })

    return setting.outer(innerNodes)
  }

  /**
   * Generates an equivalent CNF
   * @returns
   */
  public toCNF(): SyntaxTreeNodeType {
    return this.makeNormalForm({
      inner: Operator.makeDisjunction,
      outer: Operator.makeConjunction,
      invert: true,
    })
  }

  /**
   * Generates an equivalent DNF
   * @returns
   */
  public toDNF(): SyntaxTreeNodeType {
    return this.makeNormalForm({
      inner: Operator.makeConjunction,
      outer: Operator.makeDisjunction,
      invert: false,
    })
  }
}

export class Literal extends SyntaxTreeNode {
  readonly name: string

  constructor(name: string, negated: boolean = false) {
    super()
    this.name = name
    this.negated = negated
  }

  public copy(): Literal {
    return new Literal(this.name, this.negated)
  }

  // does nothing on literals
  public simplifyNegation(): this {
    return this
  }

  // does nothing on literals
  public simplifyLocal(): this {
    return this
  }

  public simplify(): this {
    return this
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public shuffle(random: Random): this {
    return this
  }

  public eval(values: VariableValues): boolean {
    return this.negated ? !values[this.name] : values[this.name]
  }

  public toString(latex: boolean = false): string {
    return this.addNegation(this.name, latex)
  }

  private addNegation(str: string, latex = false): string {
    if (this.negated) return `${latex ? operatorToLatex[negationType] : negationType} ${str}`

    return str
  }

  public getVariableNames(): string[] {
    return [this.name]
  }

  public isConjunction(): boolean {
    return true
  }

  public isDisjunction(): boolean {
    return true
  }

  public isCNF(): boolean {
    return true
  }

  public isDNF(): boolean {
    return true
  }
}

const negationType = "\\not"
type NegationOperatorType = typeof negationType

export const binaryOperatorTypes = ["\\and", "\\or", "\\xor", "=>", "<=>"] as const
export type BinaryOperatorType = (typeof binaryOperatorTypes)[number]
export const associativeOperators: ReadonlyArray<BinaryOperatorType> = ["\\and", "\\or", "\\xor"]
export type AssociativeOperatorsType = (typeof associativeOperators)[number]

const operatorToLatex: Record<BinaryOperatorType | NegationOperatorType, string> = {
  "\\not": "\\neg",
  "\\and": "\\wedge",
  "\\or": "\\vee",
  "\\xor": "\\oplus",
  "=>": "\\Rightarrow",
  "<=>": "\\Leftrightarrow",
}

export class Operator extends SyntaxTreeNode {
  public type: BinaryOperatorType
  private leftOperand: SyntaxTreeNodeType
  private rightOperand: SyntaxTreeNodeType

  constructor(
    type: BinaryOperatorType,
    leftOperand: SyntaxTreeNodeType,
    rightOperand: SyntaxTreeNodeType,
    negated: boolean = false,
  ) {
    super()
    this.type = type
    this.leftOperand = leftOperand
    this.rightOperand = rightOperand
    this.negated = negated
  }

  public copy(): Operator {
    return new Operator(this.type, this.leftOperand.copy(), this.rightOperand.copy(), this.negated)
  }

  public static makeFromList(
    type: AssociativeOperatorsType,
    nodes: SyntaxTreeNodeType[],
  ): SyntaxTreeNodeType {
    if (nodes.length === 1) return nodes[0]

    let op: SyntaxTreeNodeType = nodes[0]
    for (let i = 1; i < nodes.length; i++) {
      op = new Operator(type, op, nodes[i])
    }

    return op
  }

  public static makeConjunction(nodes: SyntaxTreeNodeType[]): SyntaxTreeNodeType {
    return Operator.makeFromList("\\and", nodes)
  }

  public static makeDisjunction(nodes: SyntaxTreeNodeType[]): SyntaxTreeNodeType {
    return Operator.makeFromList("\\or", nodes)
  }

  public eval(values: VariableValues): boolean {
    let value

    switch (this.type) {
      case "\\and":
        value = this.leftOperand.eval(values) && this.rightOperand.eval(values)
        break
      case "\\or":
        value = this.leftOperand.eval(values) || this.rightOperand.eval(values)
        break
      case "\\xor":
        value = this.leftOperand.eval(values) !== this.rightOperand.eval(values)
        break
      case "=>":
        value = !this.leftOperand.eval(values) || this.rightOperand.eval(values)
        break
      case "<=>":
        value = this.leftOperand.eval(values) === this.rightOperand.eval(values)
        break
    }

    return this.negated ? !value : value
  }

  public toString(latex: boolean = false): string {
    return this.addNegation(
      `${this.addParenthesis(this.leftOperand, latex)} ${
        latex ? operatorToLatex[this.type] : this.type
      } ${this.addParenthesis(this.rightOperand, latex)}`,
      latex,
    )
  }

  private addNegation(str: string, latex: boolean = false): string {
    if (this.negated) return `${latex ? operatorToLatex[negationType] : negationType}(${str})`

    return str
  }

  public simplifyNegationLocal(): this {
    if (!this.negated) return this

    if (["\\xor", "=>", "<=>"].includes(this.type)) {
      this.simplifyLocal() // changes this.type to "\\and" or "\\or", this.leftOperand, this.rightOperand
    }

    this.negated = false

    switch (this.type) {
      case "\\and":
        this.type = "\\or"
        this.leftOperand.negate()
        this.rightOperand.negate()
        break
      case "\\or":
        this.type = "\\and"
        this.leftOperand.negate()
        this.rightOperand.negate()
        break
    }

    return this
  }

  public simplifyNegation(): this {
    this.simplifyNegationLocal()
    this.leftOperand.simplifyNegation()
    this.rightOperand.simplifyNegation()

    return this
  }

  /**
   * Replaces xor, => and <=> by an equivalent and/or expression only on the current node
   */
  public simplifyLocal(): this {
    if (["\\and", "\\or"].includes(this.type)) return this

    let newLeftOp, newRightOp
    switch (this.type) {
      case "\\xor": // a xor b  <=> (a and not b) or (not a and b)
        newLeftOp = new Operator("\\and", this.leftOperand.copy(), this.rightOperand.copy().negate())
        newRightOp = new Operator("\\and", this.leftOperand.copy().negate(), this.rightOperand.copy())
        this.leftOperand = newLeftOp
        this.rightOperand = newRightOp
        break
      case "=>": // (a => b) <=> (not a or b)
        this.leftOperand.negate()
        break
      case "<=>": // (a <=> b) <=> ((a and b) or (not a and not b))
        newLeftOp = new Operator("\\and", this.leftOperand.copy(), this.rightOperand.copy())
        newRightOp = new Operator(
          "\\and",
          this.leftOperand.copy().negate(),
          this.rightOperand.copy().negate(),
        )
        this.leftOperand = newLeftOp
        this.rightOperand = newRightOp
        break
    }

    this.type = "\\or"
    return this
  }

  /**
   * Replaces all xor, => and <=> by an equivalent and/or expression
   */
  public simplify(): this {
    this.simplifyLocal()
    this.leftOperand.simplify()
    this.rightOperand.simplify()

    return this
  }

  public shuffle(random: Random): this {
    // obscure operators
    if (random.bool(0.2)) {
      if (["=>", "<=>", "\\xor"].includes(this.type)) {
        this.simplifyLocal()
      } else if (this.type === "\\and") {
        this.type = "=>"
        this.negate()
        this.rightOperand.negate()
      } else if (this.type === "\\or") {
        this.type = "=>"
        this.leftOperand.negate()
      }
    }

    // obscure negation
    if (random.bool(0.3) && this.negated) {
      this.simplifyNegationLocal()
    }

    // permute syntax tree
    if (this.type !== "=>") {
      switch (random.int(0, 5)) {
        case 0:
          ;[this.leftOperand, this.rightOperand] = [this.rightOperand, this.leftOperand]
          break
        case 1:
          if (
            isOperator(this.leftOperand) &&
            this.leftOperand.type === this.type &&
            !this.leftOperand.negated
          ) {
            if (random.bool()) {
              ;[this.rightOperand, this.leftOperand.rightOperand] = [
                this.leftOperand.rightOperand,
                this.rightOperand,
              ]
            } else {
              ;[this.rightOperand, this.leftOperand.leftOperand] = [
                this.leftOperand.leftOperand,
                this.rightOperand,
              ]
            }
          }
          break
        case 2:
          if (
            isOperator(this.rightOperand) &&
            this.rightOperand.type === this.type &&
            !this.rightOperand.negated
          ) {
            if (random.bool()) {
              ;[this.leftOperand, this.rightOperand.rightOperand] = [
                this.rightOperand.rightOperand,
                this.leftOperand,
              ]
            } else {
              ;[this.leftOperand, this.rightOperand.leftOperand] = [
                this.rightOperand.leftOperand,
                this.leftOperand,
              ]
            }
          }
          break
        case 3:
          if (
            isOperator(this.leftOperand) &&
            isOperator(this.rightOperand) &&
            this.type === this.leftOperand.type &&
            this.type === this.rightOperand.type &&
            !this.leftOperand.negated &&
            !this.rightOperand.negated
          ) {
            if (random.bool()) {
              if (random.bool()) {
                ;[this.leftOperand.leftOperand, this.rightOperand.leftOperand] = [
                  this.rightOperand.leftOperand,
                  this.leftOperand.leftOperand,
                ]
              } else {
                ;[this.leftOperand.leftOperand, this.rightOperand.rightOperand] = [
                  this.rightOperand.rightOperand,
                  this.leftOperand.leftOperand,
                ]
              }
            } else {
              if (random.bool()) {
                ;[this.leftOperand.rightOperand, this.rightOperand.leftOperand] = [
                  this.rightOperand.leftOperand,
                  this.leftOperand.rightOperand,
                ]
              } else {
                ;[this.leftOperand.rightOperand, this.rightOperand.rightOperand] = [
                  this.rightOperand.rightOperand,
                  this.leftOperand.rightOperand,
                ]
              }
            }
          }
          break
      }
    }

    this.leftOperand.shuffle(random)
    this.rightOperand.shuffle(random)
    return this
  }

  private addParenthesis(node: SyntaxTreeNodeType, latex: boolean): string {
    if (!isOperator(node)) return node.toString(latex)

    if (node.type === this.type && associativeOperators.includes(this.type)) return node.toString(latex)

    return `(${node.toString(latex)})`
  }

  public getVariableNames(): string[] {
    return [...this.leftOperand.getVariableNames(), ...this.rightOperand.getVariableNames()]
      .sort()
      .reduce((names: string[], nextName: string) => {
        if (names[names.length - 1] !== nextName) names.push(nextName)
        return names
      }, [])
  }

  public isConjunction(): boolean {
    return this.type === "\\and" && this.leftOperand.isConjunction() && this.rightOperand.isConjunction()
  }

  public isDisjunction(): boolean {
    return this.type === "\\or" && this.leftOperand.isDisjunction() && this.rightOperand.isDisjunction()
  }

  public isCNF(): boolean {
    return (
      (this.type === "\\and" &&
        (this.leftOperand.isCNF() || this.leftOperand.isDisjunction()) &&
        (this.rightOperand.isCNF() || this.rightOperand.isDisjunction())) ||
      (this.type === "\\or" && this.leftOperand.isDisjunction() && this.rightOperand.isDisjunction())
    )
  }

  public isDNF(): boolean {
    return (
      (this.type === "\\or" &&
        (this.leftOperand.isDNF() || this.leftOperand.isConjunction()) &&
        (this.rightOperand.isDNF() || this.rightOperand.isConjunction())) ||
      (this.type === "\\and" && this.leftOperand.isConjunction() && this.rightOperand.isConjunction())
    )
  }
}

export type SyntaxTreeNodeType = Operator | Literal

function isOperator(obj: any): obj is Operator {
  return (obj as Operator).type !== undefined
}

/**
 * Turns a number into an name/value object. The i-th bit of num is interpreted as the value of the i-th variable.
 * @param num
 * @param variableNames
 * @returns
 */
export function numToVariableValues(num: number, variableNames: string[]): VariableValues {
  const values: VariableValues = {}
  let i = 0
  while (num) {
    values[variableNames[i]] = (num & 1) === 1
    num >>= 1
    i++
  }

  for (; i < variableNames.length; i++) {
    values[variableNames[i]] = false
  }

  return values
}

/**
 *
 * @param variableValues Object of variable name / value pairs
 * @param invert
 * @returns Array of one literal for each variable. The literal is negated if the value is false.
 *          If invert is true the literal is negated if the value is true
 */
export function variableValuesToLiterals(
  variableValues: VariableValues,
  invert: boolean,
): SyntaxTreeNodeType[] {
  const nodes: SyntaxTreeNodeType[] = []

  for (const varName in variableValues) {
    nodes.push(new Literal(varName, variableValues[varName] === invert))
  }

  return nodes
}

/**
 * Error class that could be thrown by PropositionalLogicParser.
 * The infoToStr() function can show the position of a missing or unexpected token.
 */
export class ParserError extends Error {
  readonly str: string | undefined
  readonly pos: number | undefined

  constructor(msg: string, str?: string, pos?: number) {
    super(msg)
    this.str = str
    this.pos = pos
  }

  public infoToStr(): string {
    if (this.str === undefined) return ""

    // todo shorten the string if longer than 60 chars
    let str = `"${this.str}"\n`
    if (this.pos !== undefined) str += `${" ".repeat(this.pos + 1)}^`

    return str
  }
}

export class PropositionalLogicParser {
  public static parse(str: string): SyntaxTreeNodeType {
    str = str.trim()

    // strBeginning[0] is the whole matched string
    // strBeginning[1] = "\\not" | undefined
    // strBeginning[2] = "(" | string (without whitespace)
    const strBeginning = /^(\\not)?\s*(\(|[^\s()])/.exec(str)
    if (strBeginning === null) throw new ParserError("Empty expression")
    else if (strBeginning[2] in binaryOperatorTypes)
      throw new ParserError(
        "Unexpected token",
        str,
        strBeginning[1] === undefined ? 0 : strBeginning[1].length,
      )

    let leftOperand
    let nextTokenStartIndex
    if (strBeginning[2] === "(") {
      nextTokenStartIndex =
        PropositionalLogicParser.findClosingParenthesisPos(str, strBeginning[0].length - 1) + 1
      leftOperand = PropositionalLogicParser.parse(
        str.substring(strBeginning[0].length, nextTokenStartIndex - 1),
      )
    } else {
      nextTokenStartIndex = strBeginning[0].length
      leftOperand = new Literal(strBeginning[2])
    }

    // left operand is negated
    if (strBeginning[1] !== undefined) leftOperand.negate()

    // nothing else in the string
    if (nextTokenStartIndex === str.length) return leftOperand

    // operator
    const nextTokenRegEx = /\s*([^\s]*)/g
    nextTokenRegEx.lastIndex = nextTokenStartIndex
    const operator = nextTokenRegEx.exec(str)
    if (operator === null || !binaryOperatorTypes.includes(operator[1] as BinaryOperatorType)) {
      throw new ParserError("Missing operator", str, nextTokenStartIndex)
    }
    const nextTokenEndIndex = nextTokenStartIndex + operator[0].length

    return new Operator(
      operator[1] as BinaryOperatorType,
      leftOperand,
      PropositionalLogicParser.parse(str.slice(nextTokenEndIndex)),
    )
  }

  /**
   * @param str
   * @param start index of the opening parenthesis to be matched
   * @returns index of the closing parenthesis
   */
  private static findClosingParenthesisPos(str: string, start: number = 0): number {
    let level = 1
    for (let i = start + 1; i < str.length; i++) {
      if (["(", ")"].includes(str[i])) {
        if (str[i] === "(") level++
        else if (str[i] === ")") level--

        if (level === 0) return i
      }
    }

    throw new ParserError(`Missing closing parenthesis (level: ${level})`)
  }
}

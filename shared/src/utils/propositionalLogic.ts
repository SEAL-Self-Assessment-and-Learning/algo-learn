export type VariableValues = Record<string, boolean>

export type ExpressionProperties = {
  variables: string[]
  satisfiable: false | VariableValues
  falsifiable: false | VariableValues
}

export type TruthTable = boolean[]

abstract class SyntaxTreeNode {
  protected negated: boolean = false
  public abstract copy(): SyntaxTreeNode
  public abstract eval(values: VariableValues): boolean
  public abstract toString(): string
  public abstract simplifyNegation(): void
  public abstract simplify(): void
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

  public getTruthTable(): { truthTable: TruthTable; variableNames: string[] } {
    const variableNames = this.getVariableNames()

    const truthTableSize = SyntaxTreeNode.getTruthTableSize(variableNames)

    const truthTable: TruthTable = []
    for (let i = 0; i < truthTableSize; i++) {
      truthTable.push(this.eval(numToVariableValues(i, variableNames)))
    }

    return { truthTable, variableNames }
  }

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
      if (expressionValue === true) {
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

  public toCNF(): SyntaxTreeNodeType {
    return this.makeNormalForm({
      inner: Operator.makeDisjunction,
      outer: Operator.makeConjunction,
      invert: true,
    })
  }

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
  public simplifyNegation(): void {
    return
  }

  // does nothing on literals
  public simplify(): void {
    return
  }

  public eval(values: VariableValues): boolean {
    return this.negated ? !values[this.name] : values[this.name]
  }

  public toString(): string {
    return this.addNegation(this.name)
  }

  private addNegation(str: string): string {
    if (this.negated) return `${negationType} ${str}`

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
export const associativeOperators: BinaryOperatorType[] = ["\\and", "\\or", "\\xor"] as const
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

  public toString(): string {
    return this.addNegation(
      `${this.addParenthesis(this.leftOperand)} ${this.type} ${this.addParenthesis(this.rightOperand)}`,
    )
  }

  private addNegation(str: string): string {
    if (this.negated) return `${negationType}(${str})`

    return str
  }

  public simplifyNegation(): void {
    if (this.negated) {
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
        default:
          this.simplify()
          this.simplifyNegation()
          break
      }
    }

    this.leftOperand.simplifyNegation()
    this.rightOperand.simplifyNegation()
  }

  public simplify(): this {
    if (this.type in ["\\and", "\\or"]) return this

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

  private addParenthesis(node: SyntaxTreeNodeType): string {
    if (!isOperator(node)) return node.toString()

    if (node.type === this.type && associativeOperators.includes(this.type)) return node.toString()

    return `(${node.toString()})`
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

type SyntaxTreeNodeType = Operator | Literal

function isOperator(obj: any): obj is Operator {
  return (obj as Operator).type !== undefined
}

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
    // console.log(strBeginning)
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
      console.log(operator, nextTokenStartIndex, nextTokenRegEx.lastIndex)
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

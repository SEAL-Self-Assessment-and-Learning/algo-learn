import { max, min } from "mathjs"
import {
  minimalMultipleChoiceFeedback,
  type MultipleChoiceQuestion,
  type QuestionGenerator,
} from "@shared/api/QuestionGenerator.ts"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter.ts"
import { variableNames } from "@shared/question-generators/propositional-logic/utils.ts"
import {
  compareExpressions,
  expressionsDifferent,
  generateRandomExpression,
  type SyntaxTreeNodeType,
} from "@shared/utils/propositionalLogic/propositionalLogic.ts"
import Random from "@shared/utils/random.ts"
import { t, tFunctional, type Translations } from "@shared/utils/translations.ts"

const translations: Translations = {
  en: {
    name: "Semantic Equivalence",
    description: "Determine which expression are equivalent",
    size: "The size of the generated expression",
    text: "Given the following boolean expressions: {{0}} Determine which **equivalences** are `{{1}}`:",
    true: "true",
    false: "false",
  },
  de: {
    name: "Semantische Äquivalenz",
    description: "Bestimme welche Formeln äquivalent sind",
    size: "Die Größe des erzeugten Ausdrucks.",
    text: "Bestimme welche der folgenden Äquivalenzen `{{0}}` sind:",
    true: "wahr",
    false: "falsch",
  },
}

/**
 * Creates [5,6] boolean expressions (some are equivalent some not).
 * Creates equivalence statements and asks the user which are true/false.
 * Based on the following question template:
 *  https://ae.cs.uni-frankfurt.de/teaching/22ws/+dismod/selbsttest_01_semantische_%C3%A4quivalenz.pdf
 */
export const SemanticEquivalence: QuestionGenerator = {
  id: "semequ",
  name: tFunctional(translations, "name"),
  description: tFunctional(translations, "description"),
  tags: ["boolean logic", "propositional logic", "propositional calculus", "equivalence"],
  languages: ["en", "de"],
  license: "MIT",
  expectedParameters: [
    {
      name: "size",
      description: tFunctional(translations, "size"),
      type: "integer",
      min: 2,
      max: 4,
    },
  ],

  generate: (lang = "en", parameters, seed) => {
    const permalink = serializeGeneratorCall({
      generator: SemanticEquivalence,
      lang,
      parameters,
      seed,
    })
    const random: Random = new Random(seed)

    const exprNames = ["A", "B", "C", "D", "E"]
    const equivBool = random.bool()

    const numDiffExpr = random.int(2, 3)
    const numExpr = random.int(4, 5)
    const numVars = (parameters.size ?? 2) as number
    const numLeaves = random.int(numVars + 2, numVars * 2)
    const varNames = random.choice(variableNames.filter((x) => !x.includes("A")))

    const expr = getRandomExpressions(random, numLeaves, varNames, numVars, numDiffExpr, numExpr)
    const { equivStatements, notEquivStatements } = createEquivStatements(random, expr, exprNames)
    const { answers, correctAnswerIndex } = getAnswers(
      random,
      equivStatements,
      notEquivStatements,
      equivBool,
    )
    const inputExpressions = createInputExpressions(expr, exprNames)

    const question: MultipleChoiceQuestion = {
      type: "MultipleChoiceQuestion",
      name: SemanticEquivalence.name(lang),
      path: permalink,
      text: t(translations, lang, "text", [
        inputExpressions,
        t(translations, lang, equivBool.toString()),
      ]),
      answers,
      allowMultiple: true,
      feedback: minimalMultipleChoiceFeedback({ correctAnswerIndex }),
    }

    return { question }
  },
}

/**
 * Creates five answers, combining true and not true statements.
 * Computes the indices for the correct answers.
 * @param random
 * @param equivStatements - all possible true equivalences
 * @param notEquivStatements - all possible false equivalences
 * @param equivBool - If questions asks to determine true/false equivalences
 */
function getAnswers(
  random: Random,
  equivStatements: string[],
  notEquivStatements: string[],
  equivBool: boolean,
) {
  // If there are more equivStatements, include as many as necessary such that non-equivalences reach 5.
  // Otherwise, include enough equivalences and fill with non-equivalences.
  const answers = random.subset(
    equivStatements,
    min(equivStatements.length, random.int(max(5 - notEquivStatements.length, 1), 4)),
  )
  answers.push(...random.subset(notEquivStatements, 5 - answers.length))
  random.shuffle(answers)

  const correctAnswerIndex: number[] = answers
    .map((x, i) => (equivStatements.includes(x) === equivBool ? i : -1))
    .filter((index) => index !== -1)

  return { answers, correctAnswerIndex }
}

/**
 * Creates a tex block for each expression
 * @param expr - list of boolean expressions
 * @param exprNames - each expression gets a different name
 */
function createInputExpressions(expr: SyntaxTreeNodeType[], exprNames: string[]) {
  let inputExpressions: string = ""
  for (let i = 0; i < expr.length; i++) {
    inputExpressions += `\\[ ${exprNames[i]}=${expr[i].toString(true)} \\] `
  }
  return inputExpressions
}

/**
 * Creates n boolean expressions.
 * @param random
 * @param numLeaves - size of the tree +- random.int(-1, 2) to have different sizes
 * @param varNames - possible variable names in the expression
 * @param numVars - number of different variables
 * @param numDiffExpr - number of expressions which aren't equivalent
 * @param numExpr
 */
function getRandomExpressions(
  random: Random,
  numLeaves: number,
  varNames: string[],
  numVars: number,
  numDiffExpr: number,
  numExpr: number,
) {
  const expr: SyntaxTreeNodeType[] = [
    generateRandomExpression(random, numLeaves + random.int(-1, 2), varNames.slice(0, numVars)),
  ]
  for (let i = 1; i < numDiffExpr; i++) {
    do {
      expr[i] = generateRandomExpression(
        random,
        numLeaves + random.int(-1, 2),
        varNames.slice(0, numVars),
      )
    } while (!expressionsDifferent(expr))
  }
  for (let i = 0; i < numExpr - numDiffExpr; i++) {
    // Choose a statement and shuffle it uniquely
    const indexExpr = random.int(0, numDiffExpr - 1)
    let newExpr: SyntaxTreeNodeType
    do {
      newExpr = expr[indexExpr].copy().shuffle(random)
    } while (expr.some((x) => x.toString() === newExpr.toString()))
    expr.push(newExpr)
  }
  random.shuffle(expr)
  return expr
}
/**
 * Creates all possible equivalence and non-equivalence combinations from a list of boolean expressions.
 * @param random
 * @param expr - list of boolean expression
 * @param exprNames - using expression names for shorter statements (same order as expressions)
 */
function createEquivStatements(random: Random, expr: SyntaxTreeNodeType[], exprNames: string[]) {
  const equivStatements: string[] = []
  const notEquivStatements: string[] = []
  for (let i = 0; i < expr.length; i++) {
    for (let j = i + 1; j < expr.length; j++) {
      const statement = random.bool()
        ? `$ ${exprNames[i]} \\equiv ${exprNames[j]} $`
        : `$ ${exprNames[j]} \\equiv ${exprNames[i]} $`
      ;(compareExpressions([expr[i], expr[j]]) ? equivStatements : notEquivStatements).push(statement)
    }
  }
  return { equivStatements, notEquivStatements }
}

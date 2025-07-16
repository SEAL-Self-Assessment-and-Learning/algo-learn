import type { Language } from "../../api/Language.ts"
import {
  minimalMultipleChoiceFeedback,
  type FreeTextAnswer,
  type FreeTextFeedbackFunction,
  type FreeTextFormatFunction,
  type FreeTextQuestion,
  type MultipleChoiceQuestion,
  type QuestionGenerator,
} from "../../api/QuestionGenerator.ts"
import { serializeGeneratorCall } from "../../api/QuestionRouter.ts"
import { _ } from "../../utils/generics.ts"
import {
  generateRandomExpression,
  numToVariableValues,
  ParserError,
  PropositionalLogicParser,
  tokenToLatex,
  type ExpressionProperties,
  type SyntaxTreeNodeType,
} from "../../utils/propositionalLogic/propositionalLogic.ts"
import Random from "../../utils/random.ts"
import { t, tFunctional, type Translations } from "../../utils/translations.ts"

const translations: Translations = {
  en: {
    name: "Normal Forms",
    description: "Find the right normal form of a given propositional logic expression.",
    param_size: "The number of variables used",
    choice_question:
      "Let the following propositional logic expression be given: \\[{{0}}\\] Select the {{1}} of the expression?",
    freetext_question:
      "Let the following propositional logic expression be given: \\[{{0}}\\] Enter an equivalent {{1}}.",
    freetext_prompt: "Normal Form:",
    freetext_bottom_text: "Use the following buttons for easier input",
    freetext_feedback_not_equivalent: "Your answer is not equivalent to the given expression.",
    freetext_feedback_unknown_variables:
      "Your answer contains variables not used in the given expression.",
    freetext_feedback_no_normal_form: "Your answer is not a {{0}}.",
    freetext_feedback_parse_error: "Your answer couldn't be parsed.",
    dnf: "disjunctive normal form (DNF)",
    cnf: "conjunctive normal form (CNF)",
    "aria.left-parenthesis": "left parenthesis",
    "aria.right-parenthesis": "right parenthesis",
    "aria.or": "logical or",
    "aria.and": "logical and",
    "aria.not": "negation",
    "aria.variable": "variable {{0}}",
  },
  de: {
    name: "Normalformen",
    description: "Finde die richtige Normalform zu einer gegebenen aussagenlogischen Formel.",
    param_size: "Die Anzahl der verwendeten Variablen",
    choice_question:
      "Betrachte den folgenden aussagenlogischen Ausdruck \\[{{0}}\\] Welche der folgenden Aussagen treffen auf den Ausdruck zu?",
    freetext_question:
      "Betrachte den folgenden aussagenlogischen Ausdruck \\[{{0}}\\] Geben Sie eine äquivalente {{1}} an.",
    freetext_prompt: "Normalform:",
    freetext_bottom_text: "Verwende die folgenden Buttons als Eingabehilfe.",
    freetext_feedback_not_equivalent: "Deine Antwort ist nicht äquivalent zum gegebenen Ausdruck.",
    freetext_feedback_unknown_variables:
      "Deine Antwort verwendet andere Variablen als der gegebene Ausdruck.",
    freetext_feedback_no_normal_form: "Deine Antwort ist keine {{0}}.",
    freetext_feedback_parse_error: "Deine Antwort ist kein gültiger aussagenlogischer Ausdruck.",
    dnf: "disjunktive Normalform (DNF)",
    cnf: "konjunktive Normalform (KNF)",
    "aria.left-parenthesis": "Klammer auf",
    "aria.right-parenthesis": "Klammer zu",
    "aria.or": "logisches Oder",
    "aria.and": "logisches Und",
    "aria.not": "Negation",
    "aria.variable": "Variable {{0}}",
  },
}

const variableNames = [
  ["x_1", "x_2", "x_3"],
  ["A", "B", "C"],
  ["u", "v", "w"],
]

export const NormalForms: QuestionGenerator = {
  id: "plnf",
  name: tFunctional(translations, "name"),
  description: tFunctional(translations, "description"),
  tags: ["boolean logic", "propositional logic", "propositional calculus", "normal forms", "CNF", "DNF"],
  languages: ["en", "de"],
  author: "Alex Schickedanz",
  license: "MIT",
  expectedParameters: [
    {
      name: "variant",
      type: "string",
      allowedValues: ["choice", "input"],
    },
    {
      name: "size",
      description: tFunctional(translations, "param_size"),
      type: "integer",
      min: 2,
      max: 3,
    },
  ],

  /**
   * Generates a new MultipleChoiceQuestion question.
   *
   * @param lang The language of the question
   * @param parameters The parameters for the question.
   * @param seed The seed for the random number generator
   * @returns A new MultipleChoiceQuestion question
   */
  generate: (lang = "en", parameters, seed) => {
    const path = serializeGeneratorCall({
      generator: NormalForms,
      lang,
      parameters,
      seed,
    })

    // initialize the RNG so the question can be generated again
    const random = new Random(seed)

    // casting necessary since Typescript cannot deduce the type of the parameter object
    const parSize = (parameters.size as number) ?? 2
    const parVariant = (parameters.variant ?? "choice") as string

    const varNames = random.choice(variableNames).slice(0, parSize)
    const numLeaves = parSize * 3

    let expression: SyntaxTreeNodeType
    let satisfiabilityProperties: ExpressionProperties

    do {
      expression = generateRandomExpression(random, numLeaves, varNames)
      satisfiabilityProperties = expression.getProperties()
    } while (!satisfiabilityProperties.satisfiable || !satisfiabilityProperties.falsifiable)

    const dnf = random.bool()
    const normalForm = dnf ? expression.toDNF() : expression.toCNF()

    const question =
      parVariant === "choice"
        ? makeMultipleChoiceQuestion(lang, path, random, expression, normalForm, dnf)
        : makeFreeTextQuestion(lang, path, expression, dnf)

    return {
      question,
      // allows for unit tests
      testing: {
        expression,
        normalForm,
      },
    }
  },
}

function makeMultipleChoiceQuestion(
  lang: Language,
  path: string,
  random: Random,
  expression: SyntaxTreeNodeType,
  correctNormalForm: SyntaxTreeNodeType,
  isDNF: boolean,
): MultipleChoiceQuestion {
  const correctAnswerTruthTable = correctNormalForm.getTruthTable().truthTable
  const correctAnswerStr = correctNormalForm.toString(true)

  const answers: string[] = []

  const wrongAnswerStrategies: (() => SyntaxTreeNodeType)[] = [
    () => {
      return correctNormalForm.copy().invertRandomLiterals(random, random.int(2, 4))
    },
    () => {
      while (true) {
        const tmpExpr = expression.copy().invertRandomLiterals(random, random.int(1, 3))
        const { satisfiable, falsifiable } = tmpExpr.getProperties()
        if (satisfiable !== false && falsifiable !== false)
          return isDNF ? tmpExpr.toDNF() : tmpExpr.toCNF()
      }
    },
    () => {
      while (true) {
        const tmpExpr = expression.copy().invertRandomLiterals(random, random.int(1, 3))
        const { satisfiable, falsifiable } = tmpExpr.getProperties()
        if (satisfiable !== false && falsifiable !== false)
          return random.bool() ? tmpExpr.toDNF() : tmpExpr.toCNF()
      }
    },
  ]

  const wrongAnswersStrategy = random.choice(wrongAnswerStrategies)
  while (answers.length < 3) {
    const newWrongAnswer = wrongAnswersStrategy()
    const newWrongAnswerStr = newWrongAnswer.toString(true)
    if (
      !_.isEqual(correctAnswerTruthTable, newWrongAnswer.getTruthTable().truthTable) &&
      answers.every((answerStr) => answerStr !== newWrongAnswerStr)
    )
      answers.push(newWrongAnswerStr)
  }

  answers.push(correctAnswerStr)
  random.shuffle(answers)

  const correctAnswerIndex = answers.indexOf(correctAnswerStr)

  return {
    type: "MultipleChoiceQuestion",
    name: NormalForms.name(lang),
    path: path,
    text: t(translations, lang, "choice_question", [
      expression.toString(true),
      t(translations, lang, isDNF ? "dnf" : "cnf"),
    ]),
    answers: answers.map((str) => `$${str}$`),
    allowMultiple: true,
    feedback: minimalMultipleChoiceFeedback({
      correctAnswerIndex,
    }),
  }
}

function getCorrectNormalFormStr(expression: SyntaxTreeNodeType, isDNF: boolean): string {
  return "$" + (isDNF ? expression.toDNF() : expression.toCNF()).toString(true) + "$"
}

function getFreeTextFeedbackFunction(
  lang: Language,
  expression: SyntaxTreeNodeType,
  isDNF: boolean,
): FreeTextFeedbackFunction {
  return ({ text }) => {
    const answer = PropositionalLogicParser.parse(text)

    if (answer instanceof ParserError) {
      return {
        correct: false,
        correctAnswer: getCorrectNormalFormStr(expression, isDNF),
        feedbackText: t(translations, lang, "freetext_feedback_parse_error"),
      }
    }

    if (isDNF ? !answer.isDNF() : !answer.isCNF())
      return {
        correct: false,
        correctAnswer: getCorrectNormalFormStr(expression, isDNF),
        feedbackText: t(translations, lang, "freetext_feedback_no_normal_form", [
          t(translations, lang, isDNF ? "dnf" : "cnf"),
        ]),
      }

    const { variableNames: exprVars, truthTable: exprTruthTable } = expression.getTruthTable()
    const answerVars = answer.getVariableNames()

    // check if the answer contains variables that do not exist in the expression
    if (_.difference(answerVars, exprVars).length > 0)
      return {
        correct: false,
        correctAnswer: getCorrectNormalFormStr(expression, isDNF),
        feedbackText: t(translations, lang, "freetext_feedback_unknown_variables"),
      }

    if (
      exprTruthTable.some(
        (expResult, index) => answer.eval(numToVariableValues(index, exprVars)) !== expResult,
      )
    )
      return {
        correct: false,
        correctAnswer: getCorrectNormalFormStr(expression, isDNF),
        feedbackText: t(translations, lang, "freetext_feedback_not_equivalent"),
      }

    return {
      correct: true,
    }
  }
}

function makeFreeTextQuestion(
  lang: Language,
  path: string,
  expression: SyntaxTreeNodeType,
  isDNF: boolean,
): FreeTextQuestion {
  const vars = expression.getVariableNames()
  const checkFormat: FreeTextFormatFunction = (answer: FreeTextAnswer) => {
    const res = PropositionalLogicParser.parse(answer.text)

    return {
      valid: !(res instanceof ParserError || _.difference(res.getVariableNames(), vars).length > 0),
      message: `$ ${tokenToLatex(answer.text)}$`,
    }
  }

  return {
    type: "FreeTextQuestion",
    name: NormalForms.name(lang),
    path: path,
    text: t(translations, lang, "freetext_question", [
      expression.toString(true),
      t(translations, lang, isDNF ? "dnf" : "cnf"),
    ]),
    prompt: t(translations, lang, "freetext_prompt"),
    // placeholder: t(translations, lang, "freetext_placeholder"),
    bottomText: t(translations, lang, "freetext_bottom_text"),
    feedback: getFreeTextFeedbackFunction(lang, expression, isDNF),
    checkFormat,
    typingAid: [
      { text: "$($", input: "(", label: t(translations, lang, "aria.left-parenthesis") },
      { text: "$)$", input: ")", label: t(translations, lang, "aria.right-parenthesis") },
      { text: "$\\vee$", input: "\\or", label: t(translations, lang, "aria.or") },
      { text: "$\\wedge$", input: "\\and", label: t(translations, lang, "aria.and") },
      { text: "$\\neg$", input: "\\not", label: t(translations, lang, "aria.not") },
    ].concat(
      vars.map((v) => {
        return { text: `$${v}$`, input: ` ${v}`, label: t(translations, lang, "aria.variable", [v]) }
      }),
    ),
  }
}

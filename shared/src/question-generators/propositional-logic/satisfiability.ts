import { t, tFunctional, Translations } from "../../utils/translations.ts"
import Random from "../../utils/random.ts"
import {
  minimalMultipleChoiceFeedback,
  MultipleChoiceQuestion,
  QuestionGenerator,
} from "../../api/QuestionGenerator.ts"
import { serializeGeneratorCall } from "../../api/QuestionRouter.ts"

import {
  BinaryOperatorType,
  binaryOperatorTypes,
  Literal,
  Operator,
  SyntaxTreeNodeType,
} from "../../utils/propositionalLogic.ts"

// todo
const translations: Translations = {
  en: {
    name: "Satisfiability Properties",
    description: "Choose the right satisfiability properties of a given expression.",
    size: "The size of the generated expression",
    text: "Let the following propositional logic expression be given: \\[{{0}}\\] Which of the following statements apply to this expression?",
    answer_tautology: "The expression is a **tautology**",
    answer_verifiable: "The expression is **verifiable**",
    answer_falsifiable: "The expression is **falsifiable**",
    answer_contradiction: "The expression is  a **contradiction**",
  },
  de: {
    name: "Erfüllbarkeitseigenschaften",
    description: "Wähle die richtigen Erfüllbarkeitseigenschaften eines aussagenlogischen Ausdrucks aus.",
    size: "Die Größe des erzeugten Ausdrucks.",
    text: "Betrachten Sie den folgenden aussagenlogischen Ausdruck \\[{{0}}\\] Welche der folgenden Aussagen treffen auf den Ausdruck zu?",
    answer_tautology: "Die Aussage is eine **Tautologie**",
    answer_verifiable: "Die Aussage is **erfüllbar**",
    answer_falsifiable: "Die Aussage is **falsifizierbar**",
    answer_contradiction: "Die Aussage is ein **Widerspruch**",
  },
}

const variableNames = [
  ["x_1", "x_2", "x_3", "x_4", "x_5", "x_6"],
  ["A", "B", "C", "D", "E", "F"],
  ["u", "v", "w", "x", "y", "z"],
]

function generateRandomExpression(
  random: Random,
  depth: number,
  variableNames: string[],
): SyntaxTreeNodeType {
  if (depth === 0) {
    return new Literal(random.choice(variableNames), random.bool(0.2))
  } else {
    const operandDepths = random.shuffle([depth - 1, random.int(Math.min(depth - 1, 1), depth - 1)])
    const leftOperand = generateRandomExpression(random, operandDepths[0], variableNames)
    const rightOperand = generateRandomExpression(random, operandDepths[1], variableNames)
    return new Operator(
      random.choice(binaryOperatorTypes),
      leftOperand,
      rightOperand,
      random.bool(0.2),
    ).simplifyNegation()
  }
}

function generateRandomTautology(random: Random, depth: number, variableNames: string[]): SyntaxTreeNodeType {
  const operand = generateRandomExpression(random, depth - 1, variableNames)
  const rootOperator = random.choice(["<=>", "=>", "\\xor", "\\or"] as BinaryOperatorType[])
  if (rootOperator === "\\or") {
    return new Operator(rootOperator, operand.copy().negate(), operand).shuffle(random).simplifyNegation()
  } else {
    return new Operator(rootOperator, operand.copy(), operand)
      .simplifyLocal()
      .shuffle(random)
      .simplifyNegation()
  }
}

function generateRandomContradiction(
  random: Random,
  depth: number,
  variableNames: string[],
): SyntaxTreeNodeType {
  return generateRandomTautology(random, depth, variableNames).negate().simplifyNegation()
}

export const Satisfiability: QuestionGenerator = {
  name: tFunctional(translations, "name"),
  description: tFunctional(translations, "description"),
  tags: ["boolean logic", "propositional logic", "propositional calculus"],
  languages: ["en", "de"],
  author: "Alex Schickedanz",
  license: "MIT",
  expectedParameters: [
    {
      name: "size",
      description: tFunctional(translations, "size"),
      type: "integer",
      min: 2,
      max: 6,
    },
  ],

  /**
   * Generates a new MultipleChoiceQuestion question.
   *
   * @param generatorPath The path the generator is located on the page. Defined in settings/questionSelection.ts
   * @param lang The language of the question
   * @param parameters The parameters for the question.
   * @param seed The seed for the random number generator
   * @returns A new MultipleChoiceQuestion question
   */
  generate: (generatorPath, lang = "en", parameters, seed) => {
    // initialize the RNG so the question can be generated again
    const random = new Random(seed)

    const size = <number>parameters.size ?? 2
    const varNames = random.choice(variableNames).slice(0, size)
    let expression
    switch (random.int(0, 4)) {
      case 0:
        expression = generateRandomTautology(random, size, varNames)
        break
      case 1:
        expression = generateRandomContradiction(random, size, varNames)
        break
      default:
        expression = generateRandomExpression(random, size, varNames)
        break
    }

    const { satisfiable, falsifiable } = expression.getProperties()

    const correctAnswerIndex = satisfiable === false ? [2, 3] : falsifiable === false ? [0, 1] : [1, 2]

    // generate the question object
    const question: MultipleChoiceQuestion = {
      type: "MultipleChoiceQuestion",
      name: Satisfiability.name(lang),
      path: serializeGeneratorCall({
        generator: Satisfiability,
        lang,
        parameters,
        seed,
        generatorPath,
      }),
      text: t(translations, lang, "text", [expression.toString(true)]),
      answers: [
        t(translations, lang, "answer_tautology"),
        t(translations, lang, "answer_verifiable"),
        t(translations, lang, "answer_falsifiable"),
        t(translations, lang, "answer_contradiction"),
      ],
      allowMultiple: true,
      // todo add better feedback (variable values for satisfiable/falsifiable
      feedback: minimalMultipleChoiceFeedback({ correctAnswerIndex }),
    }

    return {
      question,
      // allows for unit tests
      testing: {
        expression,
        correctAnswerIndex,
      },
    }
  },
}

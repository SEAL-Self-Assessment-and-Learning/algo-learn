import {
  minimalMultipleChoiceFeedback,
  MultipleChoiceQuestion,
  QuestionGenerator,
} from "../../api/QuestionGenerator"
import { serializeGeneratorCall } from "../../api/QuestionRouter"
import Random from "../../utils/random"
import { t, tFunctional, Translations } from "../../utils/translations"
import {
  PseudoCode,
  PseudoCodeAssignment,
  PseudoCodeBlock,
  PseudoCodeBreak,
  PseudoCodeCall,
  PseudoCodeContinue,
  PseudoCodeFor,
  PseudoCodeForAll,
  PseudoCodeFunction,
  PseudoCodeIf,
  PseudoCodePrint,
  PseudoCodeReturn,
  PseudoCodeState,
  pseudoCodeToString,
  PseudoCodeWhile,
  variableColor,
} from "../time/pseudoCodeUtils"

/**
 * All text displayed text goes into the translations object.
 * Include at least english and german.
 */
const translations: Translations = {
  en: {
    name: "Compute a sum",
    description: `Compute the sum of two integers`,
    text: `Let {{0}} and {{1}} be two - natural numbers. What is the **sum** {{0}}+{{1}}?

    
\`\`\`python3
{{2}}
\`\`\`
        
        
    `,
  },
  de: {
    name: "Summe berechnen",
    description: "Berechne die Summe zweier Zahlen",
    text: "Seien ${{0}}$ und ${{1}}$ zwei natürliche Zahlen. Was ist die **Summe** ${{0}}+{{1}}$?",
  },
}

function generateWrongAnswers(random: Random, correctAnswer: number): Array<string> {
  let wrongAnswers = [
    `$${correctAnswer + 3}$`,
    `$${correctAnswer + 2}$`,
    `$${correctAnswer + 1}$`,
    `$${correctAnswer - 1}$`,
    `$${correctAnswer - 2}$`,
    `$${correctAnswer - 3}$`,
  ]

  return random.subset(wrongAnswers, 3)
}

/**
 * This question generator generates a simple multiple choice question.
 */
export const ExampleQuestion: QuestionGenerator = {
  name: tFunctional(translations, "name"),
  description: tFunctional(translations, "description"),
  tags: ["calculus", "sum"],
  languages: ["en", "de"],
  author: "Max Mustermann",
  license: "MIT",
  link: "https://example.com",
  expectedParameters: [],

  /**
   * Generates a new MultipleChoiceQuestion question.
   *
   * @generatorPath The path the generator is located on the page. Defined in settings/questionSelection.ts
   * @param lang The language of the question
   * @param parameters The parameters for the question. In this case none are used.
   * @param seed The seed for the random number generator
   * @returns A new MultipleChoiceQuestion question
   */
  generate: (generatorPath, lang = "en", parameters, seed) => {
    // initialize the RNG so the question can be generated again
    const random = new Random(seed)

    // generate the question values
    const a = random.int(5, 15)
    const b = random.int(5, 15)
    const correctAnswer = a + b

    // get a set of wrong answers
    const answers = generateWrongAnswers(random, correctAnswer)

    // add the correct answer, shuffle and find the index of the correct answer
    answers.push(`$${correctAnswer}$`)
    random.shuffle(answers)
    const correctAnswerIndex = answers.indexOf(`$${correctAnswer}$`)

    // create a Pseudo-Object for testing
    const printLine1: PseudoCodePrint = {
      print: `a + b`,
      printColor: `{\\color{${variableColor}}a} + {\\color{${variableColor}}b}`,
    }

    const returnLine1: PseudoCodeReturn = {
      returnValue: `a + b`,
      returnValueColor: `{\\color{${variableColor}}a} + {\\color{${variableColor}}b}`,
    }

    const stateLine1: PseudoCodeState = {
      state: `a = a`,
      stateColor: `{\\color{${variableColor}}a} = {\\color{${variableColor}}a}`,
    }
    const stateLine2: PseudoCodeState = {
      state: `a = b`,
      stateColor: `{\\color{${variableColor}}a} = {\\color{${variableColor}}b}`,
    }
    const stateLine3: PseudoCodeState = { state: printLine1 }
    const stateLine4: PseudoCodeState = { state: returnLine1 }

    const ifLine1: PseudoCodeIf = {
      if: {
        condition: `a > a`,
        conditionColor: `{\\color{${variableColor}}a} > {\\color{${variableColor}}a}`,
        then: stateLine1,
        else: stateLine2,
      },
    }

    const forLine1: PseudoCodeFor = {
      for: {
        variable: `i`,
        from: `1`,
        to: `\\sum_{i=0}^{n} \\left( \\frac{1}{i} \\right)`,
        toColor: `\\sum_{{\\color{${variableColor}}i}=0}^{{\\color{${variableColor}}n}} \\left( \\frac{1}{{\\color{${variableColor}}i}} \\right)`,
        step: ``,
        do: stateLine1,
      },
    }

    const newBlock: PseudoCodeBlock = {
      block: [],
    }
    // test continue and break
    const continueLine1: PseudoCodeContinue = {
      continueState: true,
    }
    newBlock.block.push({ state: continueLine1 })

    const breakLine1: PseudoCodeBreak = {
      breakState: true,
    }
    newBlock.block.push({ state: breakLine1 })
    newBlock.block.push(forLine1)

    const callLine1: PseudoCodeCall = {
      functionName: `sum`,
      args: [`a`, `b`],
      colorArgs: [`{\\color{${variableColor}}a}`, `{\\color{${variableColor}}b}`],
    }
    newBlock.block.push({ state: callLine1 })

    const AssignmentLine1: PseudoCodeAssignment = {
      variable: `a`,
      value: `10^2`,
    }
    newBlock.block.push({ state: AssignmentLine1 })

    const printStatement: PseudoCodePrint = {
      print: `\\begin{bmatrix} \\sum_{i=0}^{n} \\left( \\frac{1}{i} \\right) & b \\\\ c & d \\end{bmatrix}`,
      printColor: `\\begin{bmatrix} \\sum_{{\\color{${variableColor}}i}=0}^{{\\color{${variableColor}}a}} \\left( \\frac{1}{{\\color{${variableColor}}i}} \\right) & {\\color{${variableColor}}b} \\\\ {\\color{${variableColor}}c} & {\\color{${variableColor}}d} \\end{bmatrix}`,
    }
    newBlock.block.push({ state: printStatement })

    const forAllLine1: PseudoCodeForAll = {
      forAll: {
        variable: `i`,
        set: `\\{1,\\dots,n (\\text{this is just a very long superfluous sentence to test scrolling})\\}`,
        setColor: `\\{1,\\dots,{\\color{${variableColor}}n} (\\text{this is just a very long superfluous sentence to test scrolling})\\}`,
        do: newBlock,
      },
    }

    const blockLine1: PseudoCodeBlock = {
      block: [stateLine1, stateLine4, ifLine1, forLine1, forAllLine1],
    }

    const whileLine1: PseudoCodeWhile = {
      while: {
        condition: `a > b`,
        conditionColor: `{\\color{${variableColor}}a} > {\\color{${variableColor}}b}`,
        do: blockLine1,
      },
    }

    const blockLine2: PseudoCodeBlock = { block: [stateLine3, whileLine1] }

    const functionLine1: PseudoCodeFunction = { name: `sum`, args: [`a`, `b`], body: blockLine2 }

    const completeCode: PseudoCode = [functionLine1]

    // generate the question object
    const question: MultipleChoiceQuestion = {
      type: "MultipleChoiceQuestion",
      name: ExampleQuestion.name(lang),
      path: serializeGeneratorCall({
        generator: ExampleQuestion,
        lang,
        parameters,
        seed,
        generatorPath,
      }),
      text: t(translations, lang, "text", [`${a}`, `${b}`, pseudoCodeToString(completeCode)]),
      answers,
      feedback: minimalMultipleChoiceFeedback({ correctAnswerIndex }),
    }

    return {
      question,
      // allows for unit tests
      testing: {
        a,
        b,
        correctAnswer,
        correctAnswerIndex,
      },
    }
  },
}

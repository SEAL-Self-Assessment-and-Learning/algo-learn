import { Language } from "../../api/Language"
import {
  ExpectedParameters,
  Parameters,
  validateParameters,
} from "../../api/Parameters"
import {
  minimalMultipleChoiceFeedback,
  MultipleChoiceQuestion,
  QuestionGenerator,
} from "../../api/QuestionGenerator"
import { serializeGeneratorCall } from "../../api/QuestionRouter"
import { format } from "../../utils/format"
import Random from "../../utils/random"
import { DeepTranslations, Translations } from "../../utils/translations"

/**
 * Interface for "basic" Multiple-Choice Questions. These are fairly static,
 * text-based questions. Randomness will be used to replace parameter names with
 * random string (usually variable and function names) and to shuffle the
 * answers.
 */
export interface BasicMCQuestion {
  /**
   * Optionally, we can declare parameters that are replaced with random
   * strings, for example, "{{var}}" could be replaced with "x", "y", or "z".
   *
   * @example
   *   parameters: {
   *   "var1": "xyz",
   *   "var2": "xyz",
   *   }
   *   in the following texts, {{var1}} and {{var2}} with be replaced with a random character]
   *   from the given string. It is made sure the chosen strings for var1 and var2 are distinct.
   *   Multi-character strings can be given as a list as follows.
   *   parameters: {
   *   "func": ["\\log n", "n^7"]
   *   }
   */
  parameters?: Record<string, string | string[]>

  /**
   * Provides translations for the question text as well as for the correct and
   * wrong answers.
   */
  translations: DeepTranslations &
    Partial<
      Record<
        Language,
        { text: string; correctAnswers: string[]; wrongAnswers: string[] }
      >
    >
}

const translations: Translations = {
  en_US: {
    consider: "Consider the following sentence:",
    what: "What do we know now?",
  },
  de_DE: {
    consider: "Betrachte den folgenden Satz:",
    what: "Was wissen wir jetzt?",
  },
}

/**
 * Generate and render a question formal mathematical language
 *
 * @param generatorPath The path to the question
 * @param name The title of the question
 * @param questions The questions to ask
 * @returns The question as a Question object
 */
export function PreciseLanguageMeta(
  generatorPath: string,
  name: (lang: Language) => string,
  questions: BasicMCQuestion[],
): QuestionGenerator {
  const variants = questions.map((_, i) => i)
  const languages = Object.keys(questions[0].translations) as Language[]
  const expectedParameters: ExpectedParameters =
    variants.length > 0
      ? [
          {
            type: "integer",
            name: "number",
            min: 0,
            max: variants.length - 1,
          },
        ]
      : []

  function generate(lang: Language, parameters: Parameters, seed: string) {
    if (!validateParameters(parameters, expectedParameters)) {
      throw new Error(
        `Unknown variant ${parameters.variant.toString()}. Valid variants are: ${variants.join(
          ", ",
        )}`,
      )
    }
    const i = parameters.number as number

    const random = new Random(seed)

    const vars = questions[i].parameters
    const p: Record<string, string> = {}
    if (vars !== undefined) {
      const usedValues: string[] = []
      Object.keys(vars).forEach((pattern) => {
        let replacement = vars[pattern]
        if (typeof replacement === "string") {
          replacement = replacement.split("")
        }
        replacement = replacement.filter((c) => !usedValues.includes(c))
        p[pattern] = random.choice(replacement)
        usedValues.push(p[pattern])
      })
    }

    const ownt = questions[i].translations[lang]
    const numCorrect = ownt.correctAnswers.length
    const answers = ownt.correctAnswers
      .map((a: string, index: number) => ({
        correct: true,
        key: `answer-${index}`,
        element: format(a, p),
      }))
      .concat(
        ownt.wrongAnswers.map((a: string, index: number) => ({
          correct: false,
          key: `answer-${numCorrect + index}`,
          element: format(a, p),
        })),
      )

    random.shuffle(answers)

    const markdown = `
${translations[lang]["consider"]}

> ${format(ownt["text"], p)}

${translations[lang]["what"]}
`
    const question: MultipleChoiceQuestion = {
      type: "MultipleChoiceQuestion",
      name: name(lang),
      path: serializeGeneratorCall({ generator, lang, parameters, seed }),
      answers: answers.map(({ element }) => element),
      text: markdown,
      allowMultiple: true,
      feedback: minimalMultipleChoiceFeedback({
        correctAnswerIndex: answers
          .map((x, i) => ({ ...x, i }))
          .filter((x) => x.correct)
          .map((x) => x.i),
      }),
    }
    return { question }
  }
  const generator: QuestionGenerator = {
    path: generatorPath,
    name,
    languages,
    expectedParameters,
    generate,
  }
  return generator
}

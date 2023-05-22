import { ExerciseMultipleChoice } from "../components/ExerciseMultipleChoice"
import { Question, QuestionProps } from "../hooks/useSkills"
import Random from "./random"
import { RecursionFormula } from "../routes/recursion/RecursionFormula"
import { FlatTranslations, Language, Translations } from "./translations"
import { format } from "./format"
import { Markdown } from "../components/Markdown"
import { useTranslation } from "../hooks/useTranslation"

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
  translations: Translations &
    Partial<
      Record<
        Language,
        { text: string; correctAnswers: string[]; wrongAnswers: string[] }
      >
    >
}

const translations: FlatTranslations = {
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
 * @param path The path to the question
 * @param title The title of the question
 * @param questions The questions to ask
 * @returns The question as a Question object
 */
export const PreciseLanguageMeta: (
  path: string,
  title: string,
  questions: BasicMCQuestion[]
) => Question = (path, title, questions) => {
  const variants = questions.map((_, i) => `${i}`)
  return {
    name: path,
    title: title,
    variants: variants,
    independentVariants: true,
    examVariants: [],
    masteryThreshold: 1,
    Component: ({
      seed,
      variant,
      onResult,
      regenerate,
      viewOnly,
    }: QuestionProps) => {
      const permalink = RecursionFormula.name + "/" + variant + "/" + seed
      const { t, lang } = useTranslation()
      const random = new Random(seed)

      if (!variants.includes(variant)) {
        throw new Error(
          `Unknown variant ${variant}. Valid variants are: ${variants.join(
            ", "
          )}`
        )
      }
      const i = parseInt(variant, 10)

      const parameters = questions[i].parameters
      const p: Record<string, string> = {}
      if (parameters !== undefined) {
        const usedValues: string[] = []
        Object.keys(parameters).forEach((pattern) => {
          let replacement = parameters[pattern]
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
          element: <Markdown md={format(a, p)} />,
        }))
        .concat(
          ownt.wrongAnswers.map((a: string, index: number) => ({
            correct: false,
            key: `answer-${numCorrect + index}`,
            element: <Markdown md={format(a, p)} />,
          }))
        )

      random.shuffle(answers)

      return (
        <ExerciseMultipleChoice
          title={t(title)}
          answers={answers}
          onResult={onResult}
          regenerate={regenerate}
          permalink={permalink}
          viewOnly={viewOnly}
          allowMultiple
        >
          {translations[lang]["consider"]}
          <blockquote className="my-4 border-l-4 pl-2">
            <Markdown md={format(ownt["text"], p)} />
          </blockquote>
          {translations[lang]["what"]}
        </ExerciseMultipleChoice>
      )
    },
  }
}

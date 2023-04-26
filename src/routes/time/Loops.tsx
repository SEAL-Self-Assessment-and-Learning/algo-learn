import { ExerciseMultipleChoice } from "../../components/ExerciseMultipleChoice"
import TeX from "../../components/TeX"
import { Question, QuestionProps } from "../../hooks/useSkills"
import Random from "../../utils/random"
import { ExerciseTextInput } from "../../components/ExerciseTextInput"
import {
  parseRecursiveFunction,
  sampleExactIfEven,
  sampleLoop,
  sampleRecurrenceAnswers,
} from "./loopUtils"
import SyntaxHighlighter from "react-syntax-highlighter"
import { useTheme } from "../../hooks/useTheme"
import {
  solarizedDark,
  solarizedLight,
} from "react-syntax-highlighter/dist/esm/styles/hljs"
import { Trans } from "react-i18next"

/**
 * Generate and render a question about asymptotic notation
 *
 * @param {Object} props
 * @param {string} props.seed - Seed for random number generator
 * @param {TFunction} props.t - Translation function
 * @param {(result: "correct" | "incorrect" | "abort") => void} props.onResult
 *   - Callback function
 *
 * @param {boolean} props.regeneratable - Whether the question can be
 *   regenerated
 * @returns {ReactElement} Output
 */

export const Loops: Question = {
  name: "time/loops",
  title: "time.loops.title",
  variants: ["simpleExact"],
  examVariants: ["simpleExact"],
  Component: ({
    seed,
    variant,
    t,
    onResult,
    regenerate,
    viewOnly,
  }: QuestionProps) => {
    const { theme } = useTheme()
    const permalink = Loops.name + "/" + variant + "/" + seed
    const random = new Random(seed)

    const { functionText, functionName, n, b, a, d, c } = sampleLoop(random)

    const T = random.choice("TABCDEFGHS".split(""))
    const answers = sampleRecurrenceAnswers({ random, T, n, a, b, c, d })

    const desc = (
      <>
        <Trans t={t} i18nKey="time.loops.description">
          Consider the following procedure{" "}
          <span className="font-mono">{functionName}</span> with integer input{" "}
          <span className="font-mono">{n}</span>:
        </Trans>
        <div className="my-5">
          <SyntaxHighlighter
            language="python3"
            style={theme === "light" ? solarizedLight : solarizedDark}
          >
            {functionText}
          </SyntaxHighlighter>
        </div>
        {/* </pre> */}
        <Trans t={t} i18nKey="recursion.formula.description2">
          Let{" "}
          <TeX>
            {T}({n})
          </TeX>{" "}
          be the number of stars (<span className="font-mono">*</span>) that the
          procedure prints.
        </Trans>
        {variant !== "choice" && (
          <>
            {" "}
            {t("recursion.formula.basecase")}{" "}
            <TeX>
              {T}(1)={d}
            </TeX>
            .
          </>
        )}{" "}
        {t("recursion.formula.question")}{" "}
        <TeX>
          {T}({n})
        </TeX>
        {variant !== "choice" && (
          <>
            {" "}
            {t("for")} <TeX>{n} \geq 2</TeX>
          </>
        )}
        ?
      </>
    )
    if (variant === "simpleExact") {
      const { code, numStars } = sampleExactIfEven({ random })
      const desc = (
        <>
          <Trans t={t} i18nKey="time.loops.simpleExact.description">
            Consider the following piece of code:
          </Trans>
          <div className="my-5">
            <SyntaxHighlighter
              language="python3"
              style={theme === "light" ? solarizedLight : solarizedDark}
            >
              {code}
            </SyntaxHighlighter>
          </div>
          {t("time.loops.simpleExact.question")}
        </>
      )
      const prompt = t("time.loops.simpleExact.prompt")
      const feedback = (input: string) => {
        if (input === "") {
          return {
            isValid: false,
            isCorrect: false,
            FeedbackText: null,
          }
        }
        const m = input.match(/^\d+$/)
        const p = parseInt(input, 10)
        if (m === null || isNaN(p)) {
          return {
            isValid: false,
            isCorrect: false,
            FeedbackText: t("feedback.nan"),
          }
        } else {
          return {
            isValid: true,
            isCorrect: p === numStars,
            FeedbackText: `${p}`,
          }
        }
      }
      return (
        <ExerciseTextInput
          title={t("time.loops.long-title")}
          feedback={feedback}
          onResult={onResult}
          regenerate={regenerate}
          permalink={permalink}
          viewOnly={viewOnly}
          prompt={prompt}
          possibleCorrectSolution={numStars}
        >
          {desc}
        </ExerciseTextInput>
      )
    } else if (variant === "choice") {
      return (
        <ExerciseMultipleChoice
          title={t("time.loops.long-title")}
          answers={answers}
          onResult={onResult}
          regenerate={regenerate}
          permalink={permalink}
          viewOnly={viewOnly}
        >
          {desc}
        </ExerciseMultipleChoice>
      )
    } else if (variant === "input") {
      const prompt = (
        <TeX>
          {T}({n}) ={" "}
        </TeX>
      )
      const feedback = (input: string) => {
        if (input === "")
          return {
            isValid: false,
            isCorrect: false,
            FeedbackText: null,
          }
        try {
          const p = parseRecursiveFunction(input)
          return {
            isValid: true,
            isCorrect:
              p.a === a && p.b === b && p.c === c && p.T === T && p.n === n,
            FeedbackText: null,
          }
        } catch (e) {
          return {
            isValid: false,
            isCorrect: false,
            FeedbackText: t("feedback.incomplete"),
          }
        }
      }
      return (
        <ExerciseTextInput
          title={t("recursion.formula.long-title")}
          feedback={feedback}
          onResult={onResult}
          regenerate={regenerate}
          permalink={permalink}
          viewOnly={viewOnly}
          prompt={prompt}
          possibleCorrectSolution={
            <TeX>
              {a} {T}({n}/{b}) + {c}
            </TeX>
          }
        >
          {desc}
        </ExerciseTextInput>
      )
    } else {
      throw new Error(
        `Unknown variant ${variant}. Valid variants are: ${Loops.variants.join(
          ", "
        )}`
      )
    }
  },
}

import TeX from "../../components/TeX"
import { Question, QuestionProps } from "../../hooks/useSkills"
import Random from "../../utils/random"
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
import {
  MultipleChoiceQuestion,
  minimalMultipleChoiceFeedback,
} from "../test/QuestionGenerator"
import { format } from "../../utils/format"
import { ExerciseMultipleChoice } from "../../components/ExerciseMultipleChoice"
import { ExerciseTextInput } from "../../components/ExerciseTextInput"

/**
 * Generate and render a question about asymptotic notation
 *
 * @param props
 * @param props.seed - Seed for random number generator
 * @param props.t - Translation function
 * @param props.onResult - Callback function
 * @param props.regeneratable - Whether the question can be regenerated
 * @returns Output
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

    let desc = `
${format(t("time.loops.description", [functionName, n]))}

\`\`\`python3
${functionText}
\`\`\`

${format(t("time.loops.description2", [`${T}(${n})`]))}

`
    if (variant !== "choice") {
      desc += ` ${t("recursion.formula.basecase")} $${T}(1)=${d}$. `
    }
    desc += t("recursion.formula.question") + " " + `${T}(${n})`
    if (variant !== "choice") {
      desc += ` ${t("for")} ${n} \\geq 2`
    }
    desc += "?"

    if (variant === "simpleExact") {
      const { code, numStars } = sampleExactIfEven({ random })
      const desc = (
        <>
          {t("time.loops.simpleExact.description")}
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
      const question: MultipleChoiceQuestion = {
        type: "MultipleChoiceQuestion",
        name: t("time.loops.long-title"),
        text: desc,
        path: permalink,
        answers: answers.map(({ element }) => element),
        feedback: minimalMultipleChoiceFeedback({
          correctAnswerIndex: answers
            .map((x, i) => ({ ...x, i }))
            .filter((x) => x.correct)
            .map((x) => x.i),
        }),
      }
      return (
        <ExerciseMultipleChoice
          question={question}
          onResult={onResult}
          regenerate={regenerate}
          permalink={permalink}
          viewOnly={viewOnly}
        />
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

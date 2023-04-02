import { ExerciseMultipleChoice } from "../../components/ExerciseMultipleChoice"
import TeX from "../../components/TeX"
import { Question, QuestionProps } from "../../hooks/useSkills"
import Random from "../../utils/random"
import { ExerciseTextInput } from "../../components/ExerciseTextInput"
import {
  parseRecursiveFunction,
  sampleRecurrenceAnswers,
  sampleRecursiveFunction,
} from "./recursiveFormulaUtils"
import SyntaxHighlighter from "react-syntax-highlighter"
import { useTheme } from "../../hooks/useTheme"
import {
  solarizedDark,
  solarizedLight,
} from "react-syntax-highlighter/dist/esm/styles/hljs"

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

export const RecursionFormula: Question = {
  name: "recursion/formula",
  title: "recursion.formula.title",
  variants: ["choice", "input"],
  examVariants: ["input"],
  Component: ({
    seed,
    variant,
    t,
    onResult,
    regenerate,
    viewOnly,
  }: QuestionProps) => {
    const { theme } = useTheme()
    const permalink = RecursionFormula.name + "/" + variant + "/" + seed
    const random = new Random(seed)

    const { functionText, functionName, n, b, a, d, c } =
      sampleRecursiveFunction(random)

    const T = random.choice("TABCDEFGHS".split(""))
    const answers = sampleRecurrenceAnswers({ random, T, n, a, b, c, d })

    const desc = (
      <>
        Consider the following recursive procedure{" "}
        <span className="font-mono">{functionName}</span> with integer input{" "}
        <span className="font-mono">{n}</span>:
        {/* <pre className="bg-shading m-2 max-w-max rounded-lg p-5"> */}
        <div className="my-5">
          <SyntaxHighlighter
            language="python3"
            style={theme === "light" ? solarizedLight : solarizedDark}
          >
            {functionText}
          </SyntaxHighlighter>
        </div>
        {/* </pre> */}
        Let{" "}
        <TeX>
          {T}({n})
        </TeX>{" "}
        is the number of stars (<span className="font-mono">*</span>) that the
        procedure prints.
        {variant !== "choice" && (
          <>
            {" "}
            The base case is{" "}
            <TeX>
              {T}(1)={d}
            </TeX>
            .
          </>
        )}{" "}
        What is the recurrence relation of{" "}
        <TeX>
          {T}({n})
        </TeX>
        {variant !== "choice" && (
          <>
            {" "}
            for <TeX>{n} \geq 2</TeX>
          </>
        )}
        ?
      </>
    )
    if (variant === "choice") {
      return (
        <ExerciseMultipleChoice
          title={t("recursion.formula.long-title")}
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
            FeedbackText: (
              <>
                {/* press &ldquo;Check&rdquo; and see
                <br />
                if your answer is correct. */}
                {/* Interpreted as{" "}
                <TeX>
                  {p.T}({p.n}) = {p.a} \cdot {p.T}({p.b} \cdot {p.n}) + {p.c}
                </TeX> */}
              </>
            ),
          }
        } catch (e) {
          return {
            isValid: false,
            isCorrect: false,
            FeedbackText: <>Incomplete or too complex</>,
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
        >
          {desc}
        </ExerciseTextInput>
      )
    } else {
      throw new Error(
        `Unknown variant ${variant}. Valid variants are: ${RecursionFormula.variants.join(
          ", "
        )}`
      )
    }
  },
}

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
import { Trans } from "../../hooks/useTranslation"
import {
  MultipleChoiceQuestion,
  minimalMultipleChoiceFeedback,
} from "../../api/QuestionGenerator"
import { format } from "../../utils/format"
import { Markdown } from "../../components/Markdown"

/**
 * Generate and render a question about recurrence formulas
 *
 * @param props
 * @param props.seed - Seed for random number generator
 * @param props.t - Translation function
 * @param props.onResult - Callback function
 * @param props.regeneratable - Whether the question can be regenerated
 * @returns Output
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
    const permalink = RecursionFormula.name + "/" + variant + "/" + seed
    const random = new Random(seed)

    const { functionText, functionName, n, b, a, d, c } =
      sampleRecursiveFunction(random)

    const T = random.choice("TABCDEFGHS".split(""))
    const answers = sampleRecurrenceAnswers({ random, T, n, a, b, c, d })

    let desc = `
${format(t("recursion.formula.description"), [functionName, n])}

\`\`\`python3
${functionText.trim()}
\`\`\`

${format(t("recursion.formula.description2"), [`${T}(${n})`])}`

    if (variant !== "choice") {
      desc += ` ${t("recursion.formula.basecase")} $${T}(1)=${d}$.`
    }
    desc += ` ${t("recursion.formula.question") + " "} $${`${T}(${n})`}$`

    if (variant !== "choice") {
      desc += ` ${t("for")} $${n} \\geq 2$`
    }
    desc += " ?"
    // const desc2 = (
    //   <>
    //     <Trans t={t} i18nKey="recursion.formula.description">
    //       <span className="font-mono">{functionName}</span>
    //       <span className="font-mono">{n}</span>:
    //     </Trans>
    //     <div className="my-5">
    //       <SyntaxHighlighter
    //         language="python3"
    //         style={theme === "light" ? solarizedLight : solarizedDark}
    //       >
    //         {functionText}
    //       </SyntaxHighlighter>
    //     </div>
    //     <Trans t={t} i18nKey="recursion.formula.description2">
    //       <TeX>{`${T}(${n})`}</TeX>
    //       <span className="font-mono">*</span>
    //     </Trans>
    //     {variant !== "choice" && (
    //       <>
    //         {" "}
    //         {t("recursion.formula.basecase")}{" "}
    //         <TeX>
    //           {T}(1)={d}
    //         </TeX>
    //         .
    //       </>
    //     )}{" "}
    //     {t("recursion.formula.question")} <TeX>{`${T}(${n})`}</TeX>
    //     {variant !== "choice" && (
    //       <>
    //         {" "}
    //         {t("for")} <TeX>{n} \geq 2</TeX>
    //       </>
    //     )}
    //     ?
    //   </>
    // )
    if (variant === "choice") {
      const question: MultipleChoiceQuestion = {
        type: "MultipleChoiceQuestion",
        name: t("recursion.formula.long-title"),
        path: permalink,
        text: desc,
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
      const bottomNote = (
        <Trans i18nKey="recursion.choice.bottomnote">
          <span className="font-mono">{`a ${T}(${n}/b) + c`}</span>
        </Trans>
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
            FeedbackText: <></>,
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
          bottomNote={bottomNote}
          possibleCorrectSolution={
            <TeX>
              {a} {T}({n}/{b}) + {c}
            </TeX>
          }
        >
          <Markdown md={desc} />
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

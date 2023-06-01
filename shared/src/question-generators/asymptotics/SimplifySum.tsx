import { ExerciseMultipleChoice } from "../../../../front-end/src/components/ExerciseMultipleChoice"
import {
  OldQuestionGenerator,
  OldQuestionProps,
} from "../../../../front-end/src/hooks/useSkills"
import { sampleTermSet, TermSetVariants } from "./asymptoticsUtils"
import Random from "../../utils/random"
import {
  MultipleChoiceQuestion,
  minimalMultipleChoiceFeedback,
} from "../../api/QuestionGenerator"
import { format } from "../../utils/format"

/**
 * Generate and render a question about simplifying sums
 *
 * @returns Output
 */
export const SimplifySum: OldQuestionGenerator = {
  name: "asymptotics/sum",
  title: "asymptotics.sum.title",
  variants: ["pure", "polylog", "polylogexp"],
  examVariants: ["polylogexp"],
  Component: ({
    seed,
    variant,
    t,
    onResult,
    regenerate,
    viewOnly,
  }: OldQuestionProps) => {
    const permalink = SimplifySum.name + "/" + variant + "/" + seed
    const random = new Random(seed)

    const functionName = random.choice("fghFGHT".split(""))
    const variable = random.choice("nmNMxyztk".split(""))
    const sum = sampleTermSet({
      variable,
      numTerms: 4,
      variant: variant as TermSetVariants,
      random,
    })
    const correctTerm = sum
      .slice()
      .sort((t1, t2) => t1.compare(t2))
      .at(-1)
    const answers = sum.map((term) => ({
      key: term.toLatex(variable, true),
      element: `$\\Theta\\big(${term.toLatex(variable, true)}\\big)$`,
      correct: term === correctTerm,
    }))

    const functionDeclaration = `${functionName}\\colon\\mathbb N\\to\\mathbb R`
    const functionDefinition = `${functionName}(${variable})=${sum
      .map((t) => t.toLatex())
      .join(" + ")}`

    const question: MultipleChoiceQuestion = {
      type: "MultipleChoiceQuestion",
      name: t(SimplifySum.title) ?? "",
      text: format(
        t("asymptotics.simplifySum.text" ?? "asymptotics.simplifySum.text", [
          functionDeclaration,
          functionDefinition,
        ])
      ),
      answers: answers.map(({ element }) => element),
      feedback: minimalMultipleChoiceFeedback({
        correctAnswerIndex: answers
          .map((x, i) => ({ ...x, i }))
          .filter((x) => x.correct)
          .map((x) => x.i),
      }),
      path: permalink,
    }
    return (
      <ExerciseMultipleChoice
        question={question}
        regenerate={regenerate}
        onResult={onResult}
        permalink={permalink}
        viewOnly={viewOnly}
      />
    )
  },
}

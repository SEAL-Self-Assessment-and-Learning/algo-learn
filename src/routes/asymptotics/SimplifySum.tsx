import { Trans } from "react-i18next"
import { ExerciseMultipleChoice } from "../../components/ExerciseMultipleChoice"
import TeX from "../../components/TeX"
import { Question, QuestionProps } from "../../hooks/useSkills"
import { sampleTermSet, TermSetVariants } from "../../utils/AsymptoticTerm"
import Random from "../../utils/random"

/**
 * Generate and render a question about simplifying sums
 *
 * @returns {ReactElement} Output
 */
export const SimplifySum: Question = {
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
  }: QuestionProps) => {
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
      element: <TeX>\Theta\big({term.toLatex(variable, true)}\big)</TeX>,
      correct: term === correctTerm,
    }))

    const functionDeclaration = `${functionName}\\colon\\mathbb N\\to\\mathbb R`
    const functionDefinition = `${functionName}(${variable})=${sum
      .map((t) => t.toLatex())
      .join(" + ")}`

    return (
      <ExerciseMultipleChoice
        title={t(SimplifySum.title)}
        answers={answers}
        regenerate={regenerate}
        allowMultiple={false}
        onResult={onResult}
        permalink={permalink}
        viewOnly={viewOnly}
      >
        <Trans t={t} i18nKey="asymptotics.simplifySum.text">
          F <TeX>{{ functionDeclaration } as any}</TeX> F{" "}
          <TeX block>{{ functionDefinition } as any}</TeX> F
        </Trans>
      </ExerciseMultipleChoice>
    )
  },
}

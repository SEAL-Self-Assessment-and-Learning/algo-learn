import { TFunction } from "i18next"
import random, { RNGFactory } from "random"
import { ReactElement } from "react"
import { Trans } from "react-i18next"
import { ExerciseMultipleChoice } from "../../components/BasicQuizQuestions"
import TeX from "../../components/TeX"
import { sampleTermSet, TermSetVariants } from "../../utils/AsymptoticTerm"

/**
 * Generate and render a question about simplifying sums
 *
 * @returns {ReactElement} Output
 */

export default function SimplifySum({
  seed,
  variant,
  t,
  onResult,
  regeneratable = false,
}: {
  seed: string
  variant: string
  t: TFunction
  onResult: (result: "correct" | "incorrect" | "abort") => void
  regeneratable?: boolean
}): ReactElement {
  const permalink = SimplifySum.path + "/" + variant + "/" + seed
  random.use(RNGFactory(seed))

  const functionName = random.choice("fghFGHT".split("")) as string
  const variable = random.choice("nmNMxyztk".split("")) as string
  const sum = sampleTermSet({
    variable,
    numTerms: 4,
    variant: variant as TermSetVariants,
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
      regeneratable={regeneratable}
      allowMultiple={false}
      onResult={onResult}
      permalink={permalink}
    >
      <Trans t={t} i18nKey="asymptotics.simplifySum.text">
        F <TeX>{{ functionDeclaration } as any}</TeX> F{" "}
        <TeX block>{{ functionDefinition } as any}</TeX> F
      </Trans>
    </ExerciseMultipleChoice>
  )
}
SimplifySum.variants = ["pure", "polylog", "polylogexp"]
SimplifySum.path = "asymptotics/sum"
SimplifySum.title = "asymptotics.sum.title"

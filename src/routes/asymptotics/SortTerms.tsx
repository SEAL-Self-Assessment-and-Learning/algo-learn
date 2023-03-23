import { TFunction } from "i18next"
import random, { RNGFactory } from "random"
import { ReactElement } from "react"
import { ExerciseSort } from "../../components/BasicQuizQuestions"
import TeX from "../../components/TeX"
import {
  sampleTermSet,
  SimpleAsymptoticTerm,
  TermSetVariants,
} from "../../utils/AsymptoticTerm"

/**
 * Generate and render a question about sorting terms
 *
 * This exercise trains students on the competency of understanding and applying
 * asymptotic notation in the context of analyzing algorithmic time complexity.
 * Specifically, the exercise focuses on the skill of sorting terms in order of
 * their growth rate, which is a key step in analyzing the time complexity of an
 * algorithm.
 *
 * By practicing this skill, students will become more familiar with the
 * different types of asymptotic notation (e.g., big-O, big-omega, big-theta),
 * and they will learn how to identify the dominant term in an expression and
 * compare its growth rate with other terms. This is a foundational skill for
 * analyzing the time complexity of algorithms and designing efficient
 * algorithms.
 *
 * @returns {ReactElement} Output
 */

export default function SortTerms({
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
  random.use(RNGFactory(seed))

  const variable = random.choice("nmNMxyztk".split(""))

  interface AsymptoticTermWithIndex extends SimpleAsymptoticTerm {
    index: number
    correctIndex: number
  }

  const set = sampleTermSet({
    variable,
    numTerms: 5,
    variant: variant as TermSetVariants,
  }) as Array<AsymptoticTermWithIndex>
  for (const [i, t] of set.entries()) {
    t.index = i
  }
  const sorted = set.slice().sort((t1, t2) => t1.compare(t2))
  for (const [i, t] of sorted.entries()) {
    t.correctIndex = i
  }

  const answers = set.map((t) => ({
    key: t.toLatex(variable, true),
    index: t.index,
    element: <TeX>{t.toLatex(variable, true)}</TeX>,
    correctIndex: t.correctIndex,
  }))

  return (
    <ExerciseSort
      title={t(SortTerms.title)}
      answers={answers}
      key={window.location.pathname}
      onResult={onResult}
      regeneratable={regeneratable}
    >
      {t("asymptotics.sortTerms.text")}
    </ExerciseSort>
  )
}
SortTerms.variants = ["start", "pure", "polylog", "polylogexp"]
SortTerms.path = "asymptotics/sort"
SortTerms.title = "asymptotics.sort.title"

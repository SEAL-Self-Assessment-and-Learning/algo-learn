import { TFunction } from "i18next"
import random, { RNGFactory } from "random"
import { ReactElement } from "react"
import { ExerciseMultipleChoice } from "../../components/BasicQuizQuestions"
import TeX from "../../components/TeX"
import shuffleArray from "../../utils/shuffleArray"

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

export default function LandauNotation({
  variant = "default",
  seed,
  t,
  onResult,
  regeneratable = false,
}: {
  variant?: string
  seed: string
  t: TFunction
  onResult: (result: "correct" | "incorrect" | "abort") => void
  regeneratable?: boolean
}): ReactElement {
  const permalink = LandauNotation.path + variant + "/" + seed
  random.use(RNGFactory(seed))

  const functionTypes = ["\\log n", "n", "n^2", "2^n"]
  const notationTypes = ["o", "O", "\\omega", "\\Theta", "\\Omega"]

  const NUM_QUESTIONS = 8

  // Choose a function and an asymptotic notation type
  const answers = []
  while (answers.length < NUM_QUESTIONS) {
    const variable = random.choice("nmNMxyztk".split("")) as string
    const functionLeft = random.choice(functionTypes) as string
    const functionRight = random.choice(functionTypes) as string
    const notation = random.choice(notationTypes) as string
    const correct =
      functionLeft === functionRight
        ? notation === "\\Theta" || notation === "O" || notation === "\\Omega"
        : functionTypes.findIndex((e) => e === functionLeft) <
          functionTypes.findIndex((e) => e === functionRight)
        ? notation == "o" || notation == "O"
        : notation == "\\omega" || notation == "\\Omega"
    const key = `${functionLeft.replaceAll(
      "n",
      variable
    )} = ${notation}(${functionRight.replaceAll("n", variable)})`
    const element = <TeX>{key}</TeX>

    const isDuplicate = answers.findIndex((e) => e.key === key) >= 0
    const allIncorrect =
      answers.length == NUM_QUESTIONS - 1 &&
      answers.findIndex((e) => e.correct) == -1 &&
      !correct
    if (!isDuplicate && !allIncorrect) {
      answers.push({ key, correct, element })
    }
  }

  shuffleArray(answers)

  return (
    <ExerciseMultipleChoice
      title={t("asymptotics.landau.long-title")}
      answers={answers}
      onResult={onResult}
      regeneratable={regeneratable}
      permalink={permalink}
      allowMultiple
    >
      {t("asymptotics.landau.text")}
    </ExerciseMultipleChoice>
  )
}
LandauNotation.path = "asymptotics/landau"
LandauNotation.title = "asymptotics.landau.title"
LandauNotation.variants = ["default"]

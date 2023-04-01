import { ExerciseMultipleChoice } from "../../components/ExerciseMultipleChoice"
import TeX from "../../components/TeX"
import { QuizQuestion, QuestionProps } from "../../hooks/useSkills"
import Random from "../../utils/random"

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

export const LandauNotation: QuizQuestion = {
  path: "asymptotics/landau",
  title: "asymptotics.landau.title",
  variants: ["default"],
  examVariants: ["default"],
  Component: ({ seed, variant, t, onResult, regenerate }: QuestionProps) => {
    const permalink = LandauNotation.path + "/" + variant + "/" + seed
    const random = new Random(seed)

    const functionTypes = ["\\log n", "n", "n^2", "2^n"]
    const notationTypes = ["o", "O", "\\omega", "\\Theta", "\\Omega"]

    const NUM_QUESTIONS = 8

    // Choose a function and an asymptotic notation type
    const answers = []
    while (answers.length < NUM_QUESTIONS) {
      const variable = random.choice("nmNMxyztk".split(""))
      const functionLeft = random.choice(functionTypes)
      const functionRight = random.choice(functionTypes)
      const notation = random.choice(notationTypes)
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

    random.shuffle(answers)

    return (
      <ExerciseMultipleChoice
        title={t("asymptotics.landau.long-title")}
        answers={answers}
        onResult={onResult}
        regenerate={regenerate}
        permalink={permalink}
        allowMultiple
      >
        {t("asymptotics.landau.text")}
      </ExerciseMultipleChoice>
    )
  },
}

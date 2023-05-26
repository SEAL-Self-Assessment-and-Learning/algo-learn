import { ExerciseMultipleChoice } from "../../components/ExerciseMultipleChoice"
import TeX from "../../components/TeX"
import { Question, QuestionProps } from "../../hooks/useSkills"
import Random from "../../utils/random"
import {
  MultipleChoiceQuestion,
  minimalMultipleChoiceFeedback,
} from "../../api/QuestionGenerator"

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

export const LandauNotation: Question = {
  name: "asymptotics/landau",
  title: "asymptotics.landau.title",
  variants: ["default"],
  examVariants: ["default"],
  Component: ({
    seed,
    variant,
    t,
    onResult,
    regenerate,
    viewOnly,
  }: QuestionProps) => {
    const permalink = LandauNotation.name + "/" + variant + "/" + seed
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

    const question: MultipleChoiceQuestion = {
      type: "MultipleChoiceQuestion",
      allowMultiple: true,
      path: permalink,
      name: t("asymptotics.landau.long-title"),
      text: t("asymptotics.landau.text") ?? "",
      answers: answers.map(({ key }) => `$${key}$`),
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
        permalink={permalink}
        onResult={onResult}
        regenerate={regenerate}
        viewOnly={viewOnly}
      />
    )
  },
}

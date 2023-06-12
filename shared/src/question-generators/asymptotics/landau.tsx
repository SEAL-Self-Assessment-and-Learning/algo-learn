import TeX from "../../../../front-end/src/components/TeX"
import Random from "../../utils/random"
import {
  MultipleChoiceQuestion,
  QuestionGenerator,
  minimalMultipleChoiceFeedback,
} from "../../api/QuestionGenerator"
import { Translations, tFunction, tFunctional } from "../../utils/translations"
import { serializeGeneratorCall } from "../../api/QuestionRouter"

const translations: Translations = {
  en_US: {
    name: "Landau Notation",
    text: "Which of these statements are true? Select all that apply.",
  },
  de_DE: {
    name: "Landau Notation",
    text: "Welche dieser Aussagen sind wahr? Wähle alle aus.",
  },
}
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
export const LandauNotation: QuestionGenerator = {
  path: "asymptotics/landau",
  name: tFunctional(translations, "name"),
  expectedParameters: [],
  languages: ["en_US", "de_DE"],
  generate: (lang, parameters, seed) => {
    const random = new Random(seed)
    const { t } = tFunction(translations, lang)

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
      path: serializeGeneratorCall({
        generator: LandauNotation,
        lang,
        parameters,
        seed,
      }),
      name: t("name"),
      text: t("text"),
      answers: answers.map(({ key }) => `$${key}$`),
      feedback: minimalMultipleChoiceFeedback({
        correctAnswerIndex: answers
          .map((x, i) => ({ ...x, i }))
          .filter((x) => x.correct)
          .map((x) => x.i),
      }),
    }

    return { question }
  },
}

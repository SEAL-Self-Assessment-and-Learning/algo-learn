import {
  minimalMultipleChoiceFeedback,
  MultipleChoiceQuestion,
  QuestionGenerator,
} from "../../api/QuestionGenerator"
import { serializeGeneratorCall } from "../../api/QuestionRouter"
import Random from "../../utils/random"
import { tFunction, tFunctional, Translations } from "../../utils/translations"

const translations: Translations = {
  en: {
    name: "Landau Notation",
    text: "Which of these statements are true? Select all that apply.",
  },
  de: {
    name: "Landau Notation",
    text: "Welche dieser Aussagen sind wahr? Wähle alle aus.",
  },
}
/** Multiple-choice questions for asymptotic notation */
export const LandauNotation: QuestionGenerator = {
  name: tFunctional(translations, "name"),
  expectedParameters: [
    // {
    //   type: "boolean",
    //   name: "o/omega",
    //   default: true,
    // },
    // {
    //   type: "boolean",
    //   name: "tilde",
    //   default: false,
    // },
  ],
  languages: ["en", "de"],
  generate: (generatorPath, lang, parameters, seed) => {
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
        variable,
      )} = ${notation}(${functionRight.replaceAll("n", variable)})`

      const isDuplicate = answers.findIndex((e) => e.key === key) >= 0
      const allIncorrect =
        answers.length == NUM_QUESTIONS - 1 &&
        answers.findIndex((e) => e.correct) == -1 &&
        !correct
      if (!isDuplicate && !allIncorrect) {
        answers.push({ key, correct })
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
        generatorPath,
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

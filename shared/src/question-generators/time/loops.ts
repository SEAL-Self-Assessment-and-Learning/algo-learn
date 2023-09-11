import { validateParameters } from "../../api/Parameters"
import {
  FreeTextFeedbackFunction,
  FreeTextQuestion,
  QuestionGenerator,
} from "../../api/QuestionGenerator"
import { serializeGeneratorCall } from "../../api/QuestionRouter"
import Random from "../../utils/random"
import { tFunction, tFunctional, Translations } from "../../utils/translations"
import { RecursionFormula } from "../recursion/formula"
import { sampleLoop } from "./loopsUtils"

const translations: Translations = {
  en_US: {
    description:
      "Consider the following procedure `{{0}}` with integer input ${{1}}$:",
    description2:
      "Let ${{0}}$ be the number of stars (`*`) that the procedure prints.",
    "long-title": "Loops",
    "simpleExact.description": "Consider the following piece of code:",
    "simpleExact.prompt": "Number of stars:",
    "simpleExact.question": "How many stars are printed?",
    name: "Loops",
  },
  de_DE: {
    description:
      "Betrachte die folgende Prozedur {{0}} mit ganzzahliger Eingabe {{1}}:",
    description2:
      "Sei ${{0}}$ die Anzahl der Sterne (`*`), die die Prozedur ausgibt.",
    "long-title": "Schleifen",
    "simpleExact.description": "Betrachte den folgenden Code:",
    "simpleExact.prompt": "Anzahl der Sterne:",
    "simpleExact.question": "Wie viele Sterne werden ausgegeben?",
    name: "Schleifen",
  },
}

export const Loops: QuestionGenerator = {
  path: "time/loops",
  name: tFunctional(translations, "name"),
  languages: ["en_US", "de_DE"],
  expectedParameters: [
    {
      type: "string",
      name: "variant",
      allowedValues: ["simpleExact"],
    },
  ],
  generate(lang, parameters, seed) {
    const { t } = tFunction(translations, lang)

    if (!validateParameters(parameters, Loops.expectedParameters)) {
      throw new Error(
        `Unknown variant ${parameters.variant.toString()}. Valid variants are: ${Loops.expectedParameters.join(
          ",",
        )}`,
      )
    }
    const permalink = serializeGeneratorCall({
      generator: RecursionFormula,
      lang,
      parameters,
      seed,
    })

    const random = new Random(seed)
    const { functionText, functionName, n, numStars } = sampleLoop(random)

    const T = random.choice("TABCDEFGHS".split(""))
    const description = `
${t("description", [functionName, n])}

\`\`\`python3
${functionText}
\`\`\`

${t("description2", [`${T}(${n})`])}`
    const prompt = t("simpleExact.prompt")
    const feedback: FreeTextFeedbackFunction = ({ text }) => {
      if (text === "") {
        return {
          isValid: false,
          isCorrect: false,
          FeedbackText: null,
        }
      }
      const m = text.match(/^\d+$/)
      const p = parseInt(text, 10)
      if (m === null || isNaN(p)) {
        return {
          correct: false,
          message: t("feedback.nan"),
          correctAnswer: `${numStars}`,
        }
      } else {
        return {
          correct: p === numStars,
          message: `${p}`,
          correctAnswer: `${numStars}`,
        }
      }
    }
    const question: FreeTextQuestion = {
      type: "FreeTextQuestion",
      name: t("long-title"),
      text: description,
      path: permalink,
      feedback,
      prompt,
    }
    return { question }
  },
}

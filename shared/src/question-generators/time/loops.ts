import { validateParameters } from "../../api/Parameters"
import {
  FreeTextFeedbackFunction,
  FreeTextFormatFunction,
  FreeTextQuestion,
  QuestionGenerator,
} from "../../api/QuestionGenerator"
import { serializeGeneratorCall } from "../../api/QuestionRouter"
import Random from "../../utils/random"
import { tFunction, tFunctional, Translations } from "../../utils/translations"
import { sampleLoop } from "./loopsUtilsStars.ts"

const translations: Translations = {
  en: {
    name: "Loops",
    description: "Determine the number of iterations in a loop",
    text1: "Consider the following procedure `{{0}}` with integer input ${{1}}$:",
    text2: "Let ${{0}}$ be the number of stars (`*`) that the procedure prints.",
    longTitle: "Loops",
    simpleExactDescription: "Consider the following piece of code:",
    simpleExactPrompt: "Number of stars:",
    simpleExactQuestion: "How many stars are printed?",
  },
  de: {
    name: "Schleifen",
    description: "Bestimme die Anzahl der Iterationen in einer Schleife",
    text1: "Betrachte die folgende Prozedur {{0}} mit ganzzahliger Eingabe {{1}}:",
    text2: "Sei ${{0}}$ die Anzahl der Sterne (`*`), die die Prozedur ausgibt.",
    longTitle: "Schleifen",
    simpleExactDescription: "Betrachte den folgenden Code:",
    simpleExactPrompt: "Anzahl der Sterne:",
    simpleExactQuestion: "Wie viele Sterne werden ausgegeben?",
  },
}

export const loops: QuestionGenerator = {
  name: tFunctional(translations, "name"),
  description: tFunctional(translations, "description"),
  languages: ["en", "de"],
  expectedParameters: [
    {
      type: "string",
      name: "variant",
      allowedValues: ["simpleExact"],
    },
  ],
  generate(generatorPath, lang, parameters, seed) {
    const { t } = tFunction(translations, lang)

    if (!validateParameters(parameters, loops.expectedParameters)) {
      throw new Error(
        `Unknown variant ${parameters.variant.toString()}. Valid variants are: ${loops.expectedParameters.join(
          ",",
        )}`,
      )
    }
    const permalink = serializeGeneratorCall({
      generator: loops,
      lang,
      parameters,
      seed,
      generatorPath,
    })

    const random = new Random(seed)
    const { functionText, functionName, n, numStars } = sampleLoop(random)

    const T = random.choice("TABCDEFGHS".split(""))
    const description = `
${t("text1", [functionName, n])}

\`\`\`python
${functionText}
\`\`\`

${t("text2", [`${T}(${n})`])}`
    const prompt = t("simpleExactPrompt")
    const checkFormat: FreeTextFormatFunction = ({ text }) => {
      text = text.replace(/\s/g, "")
      if (text === "") {
        return { valid: false }
      }
      if (isNaN(parseInt(text, 10))) {
        return { valid: false, message: t("feedback.nan") }
      }
      return { valid: true }
    }
    const feedback: FreeTextFeedbackFunction = ({ text }) => {
      if (text === "") {
        return {
          isValid: false,
          isCorrect: false,
          message: null,
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
      name: t("longTitle"),
      text: description,
      path: permalink,
      checkFormat,
      feedback,
      prompt,
    }
    return { question }
  },
}

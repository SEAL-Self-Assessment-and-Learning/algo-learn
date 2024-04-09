import Fraction from "fraction.js"
import { MathNode } from "mathjs"
import {
  mathNodeToSumProductTerm,
  SumProductTerm,
} from "@shared/question-generators/asymptotics/asymptoticsUtils.ts"
import { sampleLoopBigO } from "@shared/question-generators/time/loopsUtilsBigO.ts"
import math, { getVars } from "@shared/utils/math.ts"
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
import { sampleLoopStars } from "./loopsUtilsStars.ts"

const translations: Translations = {
  en: {
    name: "Loops",
    bigOname: "Loops O-Notation",
    description: "Determine the number of iterations in a loop",
    bigOdescription: "Determine the time complexity of a code",
    text1: "Consider the following procedure `{{0}}` with integer input ${{1}}$:",
    text2: "Let ${{0}}$ be the number of stars (`*`) that the procedure prints.",
    longTitle: "Loops",
    bigOLongTitle: "Loops (Big O)",
    simpleExactDescription: "Consider the following piece of code:",
    simpleExactPrompt: "Number of stars:",
    bigOPrompt: "$\\Theta$",
    simpleExactQuestion: "How many stars are printed?",
    bigOQuestion: "What is the time complexity of this code in depencdence of ${{0}}$?",
    bigONote: "Note: The input field expects a input like {{0}}^2, 2^({{0}}) or equivalent.",
  },
  de: {
    name: "Schleifen",
    bigOname: "Schleifen O-Notation",
    description: "Bestimme die Anzahl der Iterationen in einer Schleife",
    bigOdescription: "Bestimme die Zeitkomplexität eines Codes",
    text1: "Betrachte die folgende Prozedur {{0}} mit ganzzahliger Eingabe {{1}}:",
    text2: "Sei ${{0}}$ die Anzahl der Sterne (`*`), die die Prozedur ausgibt.",
    longTitle: "Schleifen",
    bigOLongTitle: "Loops (Big O)",
    simpleExactDescription: "Betrachte den folgenden Code:",
    simpleExactPrompt: "Anzahl der Sterne:",
    bigOPrompt: "$\\Theta$",
    simpleExactQuestion: "Wie viele Sterne werden ausgegeben?",
    bigOQuestion: "Was ist die Zeitkomplexität dieses Codes in Abhängigkeit von ${{0}}$?",
    bigONote: "Hinweis: Das Eingabefeld erwartet eine Eingabe wie {{0}}^2, 2^({{0}}) oder äquivalenten.",
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
      allowedValues: ["simpleExact", "ab-String"],
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
    const { functionText, functionName, n, numStars } = sampleLoopStars(random)

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

export const loopsBigO: QuestionGenerator = {
  name: tFunctional(translations, "bigOname"),
  description: tFunctional(translations, "bigOdescription"),
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

    if (!validateParameters(parameters, loopsBigO.expectedParameters)) {
      throw new Error(
        `Unknown variant ${parameters.variant.toString()}. Valid variants are: ${loopsBigO.expectedParameters.join(
          ",",
        )}`,
      )
    }
    const permalink = serializeGeneratorCall({
      generator: loopsBigO,
      lang,
      parameters,
      seed,
      generatorPath,
    })

    const random = new Random(seed)
    const { code, functionName, variable, solution } = sampleLoopBigO(random)

    // const T = random.choice("TABCDEFGHS".split(""))
    const description = `
${t("text1", [functionName, variable])}

\`\`\`python
${code}
\`\`\`
${t("bigOQuestion", [variable])}
`
    const prompt = t("bigOPrompt")

    // TODO: This checkFormat and RecurrenceMaster checkFormat are nearly the same (consider combining them)
    const checkFormat: FreeTextFormatFunction = ({ text }) => {
      if (text.trim() === "") return { valid: false }
      let mathNode: MathNode
      try {
        mathNode = math.parse(text)
        const unknownVars = getVars(mathNode).filter((v) => v !== variable)
        const unknownVar: string | null = unknownVars.length > 0 ? unknownVars[0] : null
        if (unknownVar) {
          return {
            valid: false,
            message: `Unknown Variable`,
          }
        }
        try {
          mathNodeToSumProductTerm(math.parse(text))
          return {
            valid: true,
            message:
              "$" +
              mathNode.toTex({
                parenthesis: "auto",
                implicit: "show",
              }) +
              "$",
          }
        } catch (e) {
          return {
            valid: false,
            message: t("feedback.incomplete"),
          }
        }
      } catch (e) {
        return {
          valid: false,
          message: t("feedback.invalid-expression"),
        }
      }
    }

    const feedback: FreeTextFeedbackFunction = ({ text }) => {
      solution.coefficient = new Fraction(1)
      const correctAnswer = "$\\Theta(" + solution.toLatex("n") + ")$"
      const sumProductTerm: SumProductTerm = mathNodeToSumProductTerm(math.parse(text))

      return {
        correct: solution.Theta(sumProductTerm.dominantTerm()),
        correctAnswer,
      }
    }

    const question: FreeTextQuestion = {
      type: "FreeTextQuestion",
      name: t("bigOLongTitle"),
      text: description,
      bottomText: t("bigONote", [variable]),
      path: permalink,
      checkFormat,
      feedback,
      prompt,
    }
    return { question }
  },
}

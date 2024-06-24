import { stringifyPseudoCode } from "@shared/utils/pseudoCodeUtils.ts"
import {
  FreeTextFeedbackFunction,
  FreeTextFormatFunction,
  minimalMultipleChoiceFeedback,
  Question,
  QuestionGenerator,
} from "../../api/QuestionGenerator"
import { serializeGeneratorCall } from "../../api/QuestionRouter"
import { format } from "../../utils/format"
import Random from "../../utils/random"
import { tFunction, tFunctional, Translations } from "../../utils/translations"
import { parseRecursiveFunction, sampleRecurrenceAnswers, sampleRecursiveFunction } from "./formulaUtils"

const translations: Translations = {
  en: {
    basecase: "The base case is",
    text1: "Consider the following recursive procedure `{{0}}` with integer input ${{1}}$:",
    text2Stars: "Let ${{0}}$ be the number of stars (`*`) that the procedure prints.",
    text2Arithmetic: "Let ${{0}}$ be the number of arithmetic operations (+, -, $*$, /).",
    longName: "Recurrence Relation",
    question: "What is the recurrence relation of",
    name: "Recurrence",
    description: "Determine the recurrence relation of a recursive function",
    bottomnote: "Note: This field expects a string of the form `{{0}}` as input.",
    feedbackIncomplete: "Incomplete or too complex",
    invalidName: "Invalid function name, please use: {{0}} and {{1}}",
  },
  de: {
    basecase: "Der Basisfall ist",
    text1: "Betrachte die folgende rekursive Prozedur `{{0}}` mit ganzzahliger Eingabe ${{1}}$:",
    text2Stars: "Sei ${{0}}$ die Anzahl der Sterne (`*`), die die Prozedur ausgibt.",
    text2Arithmetic: "Sei ${{0}}$ die Anzahl der arithmetischen Operationen (+, -, $*$, /).",
    longName: "Rekurrenzrelation",
    question: "Was ist die Rekurrenzrelation von",
    name: "Rekurrenz",
    description: "Bestimme die Rekurrenzrelation einer rekursiven Funktion",
    bottomnote: "Hinweis: Dieses Feld erwartet einen String der Form `{{0}}` als Eingabe.",
    feedbackIncomplete: "Nicht vollständig oder zu komplex",
    invalidName: "Ungültiger Funktionsname, bitte verwende: {{0}} und {{1}}",
  },
}

export const RecursionFormula: QuestionGenerator = {
  id: "recurrence",
  name: tFunctional(translations, "name"),
  description: tFunctional(translations, "description"),
  languages: ["en", "de"],
  expectedParameters: [
    {
      type: "string",
      name: "variant",
      allowedValues: ["choice", "input"],
    },
  ],
  generate(lang, parameters, seed) {
    const permalink = serializeGeneratorCall({
      generator: RecursionFormula,
      lang,
      parameters,
      seed,
    })
    const random = new Random(seed)
    const { t } = tFunction(translations, lang)

    const variant = parameters.variant as "choice" | "input"
    const divOrSub: "div" | "sub" = random.choice(["div", "sub"])
    const { functionText, functionName, n, b, a, d, c, type } = sampleRecursiveFunction(divOrSub, random)

    const T = random.choice("TABCDEFGHS".split(""))
    const answers = sampleRecurrenceAnswers({ random, divOrSub, t: T, n, a, b, c, d })

    let text = `
${format(t("text1"), [functionName, n])}

${stringifyPseudoCode(functionText)}

${format(t("text2" + type), [`${T}(${n})`])}`

    if (variant !== "choice") {
      text += ` ${t("basecase")} $${T}(1)=${d}$.`
    }
    text += ` ${t("question") + " "} $${T}(${n})$`

    if (variant !== "choice") {
      text += ` ${t("for")} $${n} \\geq 2$`
    }
    text += " ?"

    let question: Question
    if (variant === "choice") {
      question = {
        type: "MultipleChoiceQuestion",
        name: t("longName"),
        path: permalink,
        text: text,
        answers: answers.map(({ element }) => element),
        feedback: minimalMultipleChoiceFeedback({
          correctAnswerIndex: answers
            .map((x, i) => ({ ...x, i }))
            .filter((x) => x.correct)
            .map((x) => x.i),
        }),
      }
    } else {
      const prompt = `$${T}(${n}) =$ `
      const bottomText = t("bottomnote", [`a ${T}(${n}${divOrSub === "div" ? "/" : "-"}b) + c`])

      const checkFormat: FreeTextFormatFunction = ({ text }) => {
        if (text.trim() === "") return { valid: false }
        try {
          const parsed = parseRecursiveFunction(text)
          if (parsed.t !== T || parsed.n !== n) {
            return { valid: false, message: t("invalidName", [T, n]) }
          }
          return {
            valid: true,
            message: `${parsed.a} ${parsed.t}(${parsed.n}${parsed.divOrSub === "div" ? "/" : "-"}${parsed.b}) + ${parsed.c}`,
          }
        } catch (e) {
          return { valid: false, message: t("feedbackIncomplete") }
        }
      }

      const feedback: FreeTextFeedbackFunction = ({ text }) => {
        const correctAnswer = `$${a} ${T}(${n}${divOrSub === "div" ? "/" : "-"}${b}) + ${c}$`

        let p: ReturnType<typeof parseRecursiveFunction>
        try {
          p = parseRecursiveFunction(text)
        } catch (e) {
          return {
            correct: false,
            message: t("feedbackIncomplete"),
            correctAnswer,
          }
        }

        return {
          correct:
            p.a === a && p.b === b && p.c === c && p.t === T && p.n === n && p.divOrSub === divOrSub,
          correctAnswer,
        }
      }
      question = {
        type: "FreeTextQuestion",
        path: permalink,
        name: t("longName"),
        text,
        prompt,
        bottomText,
        feedback,
        checkFormat,
      }
    }
    return { question }
  },
}

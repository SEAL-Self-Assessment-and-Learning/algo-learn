import type { Language } from "@shared/api/Language.ts"
import type {
  FreeTextFeedbackFunction,
  FreeTextFormatFunction,
  FreeTextQuestion,
} from "@shared/api/QuestionGenerator"
import { insertSpaceAfterEveryXChars } from "@shared/question-generators/huffman-coding/utils/utils"
import { Stack } from "@shared/question-generators/Stack/Stack"
import { stackQuestion } from "@shared/question-generators/Stack/StackGenerator"
import type Random from "@shared/utils/random"
import { t, type Translations } from "@shared/utils/translations"

/**
 * Generates a new Stack question for the seqLetter variant
 *
 * Generates a sequence of letters and stars (vja* ad*a s...) (letter means push and * means pop)
 * Asks the user to enter the sequence of letters that are popped from the stack
 *
 * @param lang
 * @param random
 * @param permalink
 * @param translations
 */
export function generateVariantPopSeq(
  lang: "de" | "en",
  random: Random,
  permalink: string,
  translations: Translations,
) {
  const { sequence, popSequence } = generateOperationsVariantPopSeq(random)

  const checkFormat: FreeTextFormatFunction = ({ text }) => {
    // check if the user input only consists of letters
    text = text.replace(/\s/g, "")
    if (!/^[A-Z]*$/.test(text.toUpperCase())) {
      return {
        valid: false,
        message: t(translations, lang, "checkFormatSeqLetter"),
      }
    }
    return {
      valid: true,
    }
  }

  const feedback: FreeTextFeedbackFunction = ({ text }) => {
    // remove whitespaces and comparing user input (as uppercase) with the correct answer
    text = text.replace(/\s/g, "")
    if (text.toUpperCase() === popSequence) {
      return {
        correct: true,
      }
    }
    return {
      correct: false,
      correctAnswer: popSequence,
      feedbackText: buildDetailedFeedback(sequence, translations, lang),
    }
  }

  const question: FreeTextQuestion = {
    type: "FreeTextQuestion",
    name: stackQuestion.name(lang),
    path: permalink,
    text: t(translations, lang, "popSeqText", [insertSpaceAfterEveryXChars(sequence, 3)]),
    checkFormat,
    feedback,
  }
  return { question }
}

/**
 * Generates a sequence of letters and stars
 *
 * @param random
 */
function generateOperationsVariantPopSeq(random: Random) {
  const s = new Stack<string>()
  const possibleChars: string = random.choice(["ABCDEF", "GHIJKL", "KLMNOP", "UVWXYZ"])

  const amountPopOperations = random.int(4, 6)
  let seenAmountPopOperations = 0

  let sequence = ""
  let popSequence = ""
  let lastOperation = "push"

  while (seenAmountPopOperations < amountPopOperations) {
    let currentOperation: string
    if (lastOperation === "pop") {
      // increases the chance of multiple pop operations in a row
      currentOperation = random.weightedChoice(["push", "pop"], [0.4, 0.6])
    } else {
      currentOperation = random.weightedChoice(["push", "pop"], [0.65, 0.35])
    }
    if (s.isEmpty()) currentOperation = "push"

    if (currentOperation === "push") {
      const value = random.choice(Array.from(possibleChars))
      sequence += value
      s.push(value)
    } else {
      popSequence += s.getTop()
      sequence += "*"
      seenAmountPopOperations++
    }
    lastOperation = currentOperation
  }
  return {
    sequence,
    popSequence,
  }
}

function buildDetailedFeedback(popSequence: string, translations: Translations, lang: Language): string {
  const header = `|#|${t(translations, lang, "Operation")}|Stack|${t(translations, lang, "Output")}|\n`
  const separator = "|===|===|===|===|\n"
  let feedback = ""

  const stack: Stack<string> = new Stack<string>()
  let output = ""

  for (let i = 0; i < popSequence.length; i++) {
    let operation = popSequence[i] === "*" ? "pop" : "push"
    let stackStatus = ""
    if (operation === "push") {
      operation += `(**${popSequence[i]}**)`
      stack.push(popSequence[i])
      stackStatus = stack.toString() || ""
    } else {
      operation += `()`
      output += stack.getTop()
      stackStatus = stack.toString() || ""
    }
    feedback += `|${i + 1}|${operation}|${stackStatus}|${output}|\n`
  }

  return header + separator + feedback
}

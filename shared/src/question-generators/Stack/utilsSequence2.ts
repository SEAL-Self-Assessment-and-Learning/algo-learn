import {
  FreeTextFeedbackFunction,
  FreeTextFormatFunction,
  FreeTextQuestion,
} from "@shared/api/QuestionGenerator.ts"
import { insertSpaceAfterEveryXChars } from "@shared/question-generators/huffman-coding/utils/utils.ts"
import { Stack } from "@shared/question-generators/Stack/Stack.ts"
import { stackQuestion } from "@shared/question-generators/Stack/StackGenerator.ts"
import Random from "@shared/utils/random.ts"
import { t, Translations } from "@shared/utils/translations.ts"

/**
 * Generates a new Stack question for the sequence2 variant
 *
 * Generates a sequence of letter and star (vja*ad*as...) (letter means push and * means pop)
 * Asks the user to enter the sequence of letters that are popped from the stack
 *
 * @param lang
 * @param random
 * @param permalink
 * @param translations
 */
export function generateVariantSequence2(
  lang: "de" | "en",
  random: Random,
  permalink: string,
  translations: Translations,
) {
  const { sequence, popSequence } = generateOperationsVariantSequence2(random)

  const checkFormat: FreeTextFormatFunction = ({ text }) => {
    // check if the user input only consists of letters
    text = text.replace(/\s/g, "")
    if (!/^[A-Z]*$/.test(text.toUpperCase())) {
      return {
        valid: false,
        message: t(translations, lang, "checkFormatSeq2"),
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
    }
  }

  const question: FreeTextQuestion = {
    type: "FreeTextQuestion",
    name: stackQuestion.name(lang),
    path: permalink,
    text: t(translations, lang, "sequence2Text", [insertSpaceAfterEveryXChars(sequence, 3)]),
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
function generateOperationsVariantSequence2(random: Random) {
  const s = new Stack<string>()
  const possibleChars: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

  const amountPopOperations = random.int(4, 6)
  let seenAmountPopOperations = 0

  let sequence = ""
  let popSequence = ""
  let lastOperation = "push"

  while (seenAmountPopOperations < amountPopOperations) {
    let nextOperation: string

    if (lastOperation === "pop") {
      // increases the chance of multiple pop operations in a row
      nextOperation = random.weightedChoice(["push", "pop"], [0.4, 0.6])
    } else {
      nextOperation = random.weightedChoice(["push", "pop"], [0.65, 0.35])
    }

    if (s.isEmpty()) nextOperation = "push"

    if (nextOperation === "push") {
      const value = random.choice(Array.from(possibleChars))
      sequence += value
      s.push(value.toString())
      lastOperation = "push"
    } else {
      popSequence += s.getTop()
      sequence += "*"
      seenAmountPopOperations++
      lastOperation = "pop"
    }
  }
  return {
    sequence,
    popSequence,
  }
}

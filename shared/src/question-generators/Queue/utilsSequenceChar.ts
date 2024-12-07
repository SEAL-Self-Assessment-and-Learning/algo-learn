import {
  FreeTextFeedbackFunction,
  FreeTextFormatFunction,
  FreeTextQuestion,
} from "@shared/api/QuestionGenerator.ts"
import { insertSpaceAfterEveryXChars } from "@shared/question-generators/huffman-coding/utils/utils.ts"
import { Queue } from "@shared/question-generators/Queue/Queue.ts"
import { queueQuestion } from "@shared/question-generators/Queue/QueueGenerator.ts"
import Random from "@shared/utils/random.ts"
import { t, Translations } from "@shared/utils/translations.ts"

/**
 * Generates a new Stack question for the seqLetter variant
 *
 * Generates a sequence of chars and stars (vja* ad*a s...) (char means enqueue and * means dequeue)
 * Asks the user to enter the sequence of chars that are dequeued from the queue
 *
 * @param lang
 * @param random
 * @param permalink
 * @param translations
 */
export function generateVariantSequenceChar(
  lang: "de" | "en",
  random: Random,
  permalink: string,
  translations: Translations,
) {
  const { sequence, popSequence } = generateOperationsVariantSequenceChar(random)

  const checkFormat: FreeTextFormatFunction = ({ text }) => {
    // check if the user input only consists of letters
    text = text.replace(/\s/g, "")
    if (!/^[A-Z]*$/.test(text.toUpperCase())) {
      return {
        valid: false,
        message: t(translations, lang, "checkFormatSeqChar"),
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
    name: queueQuestion.name(lang),
    path: permalink,
    text: t(translations, lang, "sequenceLetterText", [insertSpaceAfterEveryXChars(sequence, 3)]),
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
function generateOperationsVariantSequenceChar(random: Random) {
  const queue = new Queue<string>()
  const possibleChars: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

  const amountPopOperations = random.int(4, 6)
  let seenAmountPopOperations = 0

  let sequence = ""
  let popSequence = ""

  while (seenAmountPopOperations < amountPopOperations) {
    let currentOperation: "enqueue" | "dequeue" = random.weightedChoice(
      ["enqueue", "dequeue"],
      [0.6, 0.4],
    )
    if (queue.isEmpty()) currentOperation = "enqueue"

    if (currentOperation === "enqueue") {
      const value = random.choice(Array.from(possibleChars))
      sequence += value
      queue.enqueue(value)
    } else {
      popSequence += queue.dequeue()
      sequence += "*"
      seenAmountPopOperations++
    }
  }
  // Contain at least one dequeue operation
  if (queue.getCurrentNumberOfElements() > 0) {
    popSequence += queue.dequeue()
    sequence += "*"
    seenAmountPopOperations++
  }
  return {
    sequence,
    popSequence,
  }
}

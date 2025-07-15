import type {
  MultiFreeTextFeedbackFunction,
  MultiFreeTextFormatFunction,
  MultiFreeTextQuestion,
} from "@shared/api/QuestionGenerator.ts"
import { Queue } from "@shared/question-generators/Queue/Queue.ts"
import { queueQuestion } from "@shared/question-generators/Queue/QueueGenerator.ts"
import {
  createArrayDisplayCodeBlock,
  createArrayDisplayCodeBlockUserInput,
} from "@shared/utils/arrayDisplayCodeBlock.ts"
import type Random from "@shared/utils/random.ts"
import { t, type Translations } from "@shared/utils/translations.ts"

/**
 * Generates a new Queue question for the seqQueue variant
 *
 * Generates a sequence of enqueue and dequeue operations
 * and asks the user for the final state of the queue.
 *
 * User has to shift all elements to index 0.
 *
 * @param lang
 * @param random
 * @param permalink
 * @param translations
 */
export function generateVariantSequenceQueue(
  lang: "de" | "en",
  random: Random,
  permalink: string,
  translations: Translations,
) {
  const { operations, queue } = generateOperationsVariantSequenceStack(random)
  const { arrayDisplayBlock } = createArrayDisplayCodeBlockUserInput({
    numberOfInputFields: operations.length,
    lang,
  })

  const feedback: MultiFreeTextFeedbackFunction = ({ text }) => {
    const correctAnswer = {
      correct: false,
      correctAnswer: createArrayDisplayCodeBlock({
        array: [
          ...queue.getQueueAsString(),
          ...(Array(operations.length - queue.getCurrentNumberOfElements()).fill("") as string[]),
        ],
        lang,
      }),
    }
    const allKeys: Set<string> = new Set<string>(Object.keys(text))
    // input-x is the form for the input fields
    for (let i = 0; i < queue.getCurrentNumberOfElements(); i++) {
      allKeys.delete(`input-${i}`)
      if (text[`input-${i}`] !== queue.getQueueAsString()[i]) {
        return correctAnswer
      }
    }
    // expect the rest input fields inside allKeys to be empty
    for (const restKey of allKeys) {
      if (text[restKey].trim() !== "") {
        return correctAnswer
      }
    }
    return {
      correct: true,
    }
  }

  const checkFormat: MultiFreeTextFormatFunction = ({ text }, fieldID) => {
    // check if the user input only consists of letters
    const userInput = text[fieldID].replace(/\s/g, "")
    if (!/^[0-9]*$/.test(userInput)) {
      return {
        valid: false,
        message: t(translations, lang, "checkFormatSeqQueue"),
      }
    }
    return {
      valid: true,
    }
  }

  const question: MultiFreeTextQuestion = {
    type: "MultiFreeTextQuestion",
    name: queueQuestion.name(lang),
    path: permalink,
    text: t(translations, lang, "sequenceQueueText", [operations.join(", "), arrayDisplayBlock]),
    feedback,
    checkFormat,
  }
  return { question }
}

/**
 * Generates a sequence of enqueue and dequeue operations
 * and returns the final state of the queue.
 * @param random
 */
function generateOperationsVariantSequenceStack(random: Random) {
  const amountOperations = random.int(6, 9)
  const queue = new Queue<number>()
  const operations: string[] = []
  for (let i = 0; i < amountOperations; i++) {
    let operation: "enqueue" | "dequeue" = random.weightedChoice(["enqueue", "dequeue"], [0.7, 0.3])
    if (queue.isEmpty() || queue.getCurrentNumberOfElements() === 1) operation = "enqueue"
    if (queue.getCurrentNumberOfElements() >= 7) operation = "dequeue"
    if (operation === "enqueue") {
      const value = random.int(1, 30)
      queue.enqueue(value)
      operations.push("`enqueue(" + value + ")`")
    } else {
      queue.dequeue()
      operations.push("`dequeue()`")
    }
  }
  return {
    operations,
    queue,
  }
}

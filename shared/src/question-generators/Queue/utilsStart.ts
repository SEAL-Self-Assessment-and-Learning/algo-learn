import { Queue } from "@shared/question-generators/Queue/Queue.ts"
import { queueQuestion } from "@shared/question-generators/Queue/QueueGenerator.ts"
import { createArrayDisplayCodeBlock } from "@shared/utils/arrayDisplayCodeBlock.ts"
import Random from "@shared/utils/random.ts"
import { t, tFunction, Translations } from "@shared/utils/translations.ts"

/**
 * Function to generate the operations for the queue (FREETEXT option)
 * @param elements
 * @param random
 */
export function generateOperationsQueueFreetext(elements: number[], random: Random) {
  const queue: Queue<number> = new Queue()
  for (const value of elements) {
    queue.enqueue(value)
  }

  let isEmptyUsed: boolean = false

  const operations: { [key: string]: string }[] = []
  const numOperations = random.int(7, 9)

  for (let i = 0; i < numOperations; i++) {
    const queueOrEmpty: "queue" | "empty" = isEmptyUsed
      ? "queue"
      : random.weightedChoice([
          ["queue", 0.05],
          ["empty", 0.05],
        ])

    if (queueOrEmpty === "queue") {
      // as in generateOperationsQueue | en -> enqueue or de -> dequeue
      let enOrDe = random.weightedChoice([
        ["enqueue", 0.35],
        ["dequeue", 0.65],
      ])
      if (queue.getCurrentNumberOfElements() === 0) {
        // only possible to enqueue
        enOrDe = "enqueue"
      }
      // if enqueue or dequeue is chosen, add the operation
      if (enOrDe === "enqueue") {
        const enqueueValue = random.int(1, 20)
        operations.push({ enqueue: enqueueValue.toString() })
        queue.enqueue(enqueueValue)
      } else {
        const dequeueValue = queue.dequeue()
        operations.push({ dequeue: dequeueValue.toString() })
      }
    }
    // use operation numberElements, getRear or getFront
    else {
      isEmptyUsed = true
      operations.push({ empty: queue.isEmpty().toString() })
    }
  }

  // ensure at least one dequeue operation is done
  if (!queue.isEmpty()) {
    operations.push({ dequeue: queue.dequeue().toString() })
  }

  return {
    operations,
    queue,
  }
}

export function generateQueueStartElements({
  random,
  translations,
  lang,
}: {
  random: Random
  translations: Translations
  lang: "en" | "de"
}) {
  const startElementsAmount = random.int(0, 8)

  const startElements: number[] = []
  let queueInformationElements: string
  if (startElementsAmount === 0) {
    queueInformationElements = t(translations, lang, "queueEmpty")
  } else {
    queueInformationElements = t(translations, lang, "queueContainsValues")
    for (let i = 0; i < startElementsAmount; i++) {
      const newValue = random.int(1, 20)
      startElements.push(newValue)
    }
    queueInformationElements += createArrayDisplayCodeBlock({
      array: startElements,
      lang,
    })
  }

  return {
    startElements,
    queueInformationElements,
  }
}

/**
 * This function creates the input fields for the queue question (within a table)
 * @param operations - the operations that were performed on the queue
 *                     (dequeue, empty are the only ones that are asked)
 * @param translations
 * @param lang
 */
export function createQueueInputFields({
  operations,
  translations,
  lang,
}: {
  operations: { [key: string]: string }[]
  translations: Translations
  lang: "en" | "de"
}) {
  // create the operations table
  let inputText = `\n| Operation | ${t(translations, lang, "result")} |\n|===|:===:|\n`
  const correctAnswers: { [key: string]: string } = {}
  const solutionDisplay: string[] = []
  let solutionIndex = 0
  let index = 0
  for (const operation of operations) {
    if (Object.prototype.hasOwnProperty.call(operation, "enqueue")) {
      inputText += `| Q.enqueue(${operation.enqueue}) | - |\n`
    }
    if (Object.prototype.hasOwnProperty.call(operation, "dequeue")) {
      solutionIndex++
      inputText += `| Q.dequeue() | {{dequeue-${index}####}} |\n`
      solutionDisplay.push(`|${solutionIndex}|Q.dequeue() | ${operation.dequeue} |\n`)
      correctAnswers[`dequeue-${index}`] = operation.dequeue
    }
    if (Object.prototype.hasOwnProperty.call(operation, "empty")) {
      solutionIndex++
      inputText += `|Q.isEmpty() | {{empty-${index}###false/true#}} |\n`
      solutionDisplay.push(`|${solutionIndex}|Q.isEmpty() | ${operation.empty} |\n`)
      correctAnswers[`empty-${index}`] = operation.empty
    }
    index++
  }

  return {
    inputText,
    solutionDisplay,
    correctAnswers,
  }
}

/**
 * Creates the question for the variant start for the queue generator
 */
export function generateVariantStart(
  lang: "de" | "en",
  random: Random,
  permalink: string,
  translations: Translations,
  wordTranslations: Translations,
) {
  const checkFormat: MultiFreeTextFormatFunction = ({ text }, fieldID) => {
    if (fieldID.includes("empty")) {
      // check if either "true" or "false"
      if (text[fieldID].trim() !== "true" && text[fieldID].trim() !== "false") {
        return { valid: false, message: t(translations, lang, "checkFormatBool") }
      }
      return { valid: true, message: "" }
    }

    // check if is a number
    if (!/^\d+$/.test(text[fieldID])) {
      return { valid: false, message: t(translations, lang, "checkFormat") }
    }
    return { valid: true, message: "" }
  }

  const feedback: MultiFreeTextFeedbackFunction = ({ text }) => {
    // renaming for better understanding
    const resultMap: { [key: string]: string } = text

    let foundError = false
    let count = 0
    for (const key in resultMap) {
      const firstSolutionPart: string = solutionDisplay[count].split("|").slice(0, 3).join("|") + "|"
      if (resultMap[key].trim() !== correctAnswers[key].trim()) {
        foundError = true
        const secondSolutionPart: string = "**" + correctAnswers[key] + "**\n"
        solutionDisplay[count] = firstSolutionPart + secondSolutionPart
      }
      count++
    }
    if (foundError) {
      return {
        correct: false,
        message: tFunction(translations, lang).t("feedback.incomplete"),
        correctAnswer: t(translations, lang, "solutionFreetext", [solutionDisplay.join("")]),
      }
    }
    return {
      correct: true,
      message: tFunction(translations, lang).t("feedback.correct"),
    }
  }

  const { startElements, queueInformationElements } = generateQueueStartElements({
    random,
    translations,
    lang,
  })
  const operations = generateOperationsQueueFreetext(startElements, random).operations
  const { inputText, solutionDisplay, correctAnswers } = createQueueInputFields({
    operations,
    lang,
    translations: wordTranslations,
  })

  const question: MultiFreeTextQuestion = {
    type: "MultiFreeTextQuestion",
    name: queueQuestion.name(lang),
    path: permalink,
    text: t(translations, lang, "freeTextInput", [queueInformationElements, inputText]),
    fillOutAll: true,
    checkFormat,
    feedback,
  }

  return { question }
}

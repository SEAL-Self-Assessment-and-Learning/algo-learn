import {
  MultiFreeTextFeedbackFunction,
  MultiFreeTextFormatFunction,
  MultiFreeTextQuestion,
  QuestionGenerator,
} from "@shared/api/QuestionGenerator.ts"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter.ts"
import { Queue } from "@shared/question-generators/StackQueue/Queue.ts"
import Random from "@shared/utils/random.ts"
import { t, tFunction, tFunctional, Translations } from "@shared/utils/translations.ts"

const translations: Translations = {
  en: {
    name: "Queues",
    description: "Perform queue operations",
    solutionFreetext: `|Index|Question|Solution|\n{{0}}`,
    performOperations: `**We perform the following operations:**{{0}}`,
    checkFormat: "Please only enter a number.",
    checkFormatBool: "Please only enter *false* or *true*",
    queueEmpty: "Currently the queue is empty.",
    queueContainsValues: `The queue currently contains the following elements:`,
    freeTextInput:
      `Consider a **Queue "{{0}}"** implemented as a fixed array. ` +
      `{{1}} **We perform the following operations:** {{2}}
    `,
  },
  de: {
    name: "Queues",
    description: "Queue-Operationen ausführen",
    solutionFreetext: `|Index|Frage|Lösung|\n{{0}}`,
    performOperations: `**Wir führen nun folgende Operationen aus:**{{0}}`,
    checkFormat: "Bitte gib nur Zahlen ein.",
    checkFormatBool: "Bitte gib nur *false* oder *true* ein.",
    queueEmpty: "Die Queue ist aktuell leer.",
    queueContainsValues: `Die Queue enthält aktuell folgende Elemente:`,
    freeTextInput:
      `Betrachte eine **Queue "{{0}}"** implementiert als fixer Array. ` +
      `{{1}} **Wir führen die folgenden Operationen aus:** {{2}}
    `,
  },
}

const wordTranslations: Translations = {
  en: {
    value: "Value",
    result: "Return value",
  },
  de: {
    value: "Wert",
    result: "Rückgabewert",
  },
}

/**
 * Function to generate the operations for the queue (FREETEXT option)
 * @param elements
 * @param random
 */
function generateOperationsQueueFreetext(elements: number[], random: Random) {
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

export const queueQuestion: QuestionGenerator = {
  id: "queue",
  name: tFunctional(translations, "name"),
  description: tFunctional(translations, "description"),
  tags: ["queue"],
  languages: ["en", "de"],
  expectedParameters: [
    {
      type: "string",
      name: "variant",
      allowedValues: ["input"],
    },
  ],

  generate: (lang = "en", parameters, seed) => {
    const random = new Random(seed)

    const permalink = serializeGeneratorCall({
      generator: queueQuestion,
      lang,
      parameters,
      seed,
    })

    const queueName = random.choice("ABCQU".split(""))
    const queueSize = random.int(4, 8)

    // dynamic does not exist in this queue code
    // increase or decrease is not possible, when there is no dynamic queue
    // and startElements not so much variation like in stack
    const startElementsAmount = random.int(0, queueSize - 1)

    const startElements: number[] = []
    let queueInformationElements: string
    if (startElementsAmount === 0) {
      queueInformationElements = t(translations, lang, "queueEmpty")
    } else {
      queueInformationElements = t(translations, lang, "queueContainsValues")
      queueInformationElements += `\n\n|Index|${t(wordTranslations, lang, "value")}|\n|---|---|\n`
      for (let i = 0; i < startElementsAmount; i++) {
        const newValue = random.int(1, 20)
        startElements.push(newValue)
        queueInformationElements += `|${i}|${newValue}|\n`
      }
      queueInformationElements += "|#div_my-5?td#||\n"
    }

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

      let correctAnswered = true
      let count = 0
      for (const key in resultMap) {
        const firstSolutionPart: string = solutionDisplay[count].split("|").slice(0, 3).join("|") + "|"
        if (resultMap[key].trim() !== correctAnswers[key]) {
          correctAnswered = false
          const secondSolutionPart: string = "**" + correctAnswers[key] + "**\n"
          solutionDisplay[count] = firstSolutionPart + secondSolutionPart
        }
        count++
      }

      if (correctAnswered) {
        return {
          correct: true,
          message: tFunction(translations, lang).t("feedback.correct"),
        }
      }
      return {
        correct: false,
        message: tFunction(translations, lang).t("feedback.incomplete"),
        correctAnswer: t(translations, lang, "solutionFreetext", [solutionDisplay.join("")]),
      }
    }

    const operationsFreeText = generateOperationsQueueFreetext(startElements, random)

    // create the operations table
    let inputText = `\n| Operation | ${t(wordTranslations, lang, "result")} |\n| --- | --- |\n`
    const correctAnswers: { [key: string]: string } = {}
    const solutionDisplay: string[] = []
    let solutionIndex = 0
    let index = 0
    for (const operation of operationsFreeText.operations) {
      if (Object.prototype.hasOwnProperty.call(operation, "enqueue")) {
        inputText += `| ${queueName}.enqueue(${operation.enqueue}) |(void function)|\n`
      }
      if (Object.prototype.hasOwnProperty.call(operation, "dequeue")) {
        inputText += `| ${queueName}.dequeue() | {{dequeue-${index}####}} |\n`
        solutionIndex++
        solutionDisplay.push(`|${solutionIndex}|${queueName}.dequeue() | ${operation.dequeue} |\n`)
        correctAnswers[`dequeue-${index}`] = operation.dequeue
      }
      if (Object.prototype.hasOwnProperty.call(operation, "empty")) {
        inputText += `|${queueName}.isEmpty() | {{empty-${index}###false/true#}} |\n`
        solutionIndex++
        solutionDisplay.push(`|${solutionIndex}|${queueName}.isEmpty() | ${operation.empty} |\n`)
        correctAnswers[`empty-${index}`] = operation.empty
      }
      index++
    }

    solutionDisplay.push("|#div_my-5?table_w-full#| |")
    inputText += `|#div_my-5?border_none?av_middle?ah_center?table_w-full#| |`

    const question: MultiFreeTextQuestion = {
      type: "MultiFreeTextQuestion",
      name: queueQuestion.name(lang),
      path: permalink,
      text: t(translations, lang, "freeTextInput", [queueName, queueInformationElements, inputText]),
      fillOutAll: true,
      checkFormat,
      feedback,
    }
    const testing = {
      correctAnswer: correctAnswers,
    }

    return { question, testing }
  },
}

import { Language } from "@shared/api/Language.ts"
import { validateParameters } from "@shared/api/Parameters.ts"
import {
  FreeTextFeedbackFunction,
  minimalMultipleChoiceFeedback,
  MultiFreeTextFormatFunction,
  Question,
  QuestionGenerator,
} from "@shared/api/QuestionGenerator.ts"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter.ts"
import { Queue } from "@shared/question-generators/StackQueue/Queue.ts"
import { parseArrayString } from "@shared/question-generators/StackQueue/StackGenerator.ts"
import Random from "@shared/utils/random.ts"
import { t, tFunction, tFunctional, Translations } from "@shared/utils/translations.ts"

const translations: Translations = {
  en: {
    name: "Queue-Implementation using an Array",
    description: "Basic questions to test the understanding of Queue",
    solutionFreetext: `|Index|Question|Solution|\n{{0}}`,
    performOperations: `**We perform the following operations:**{{0}}`,
    checkFormat: "Please only enter a number.",
    checkFormatArray: "Please only enter numbers separated by commas.",
    getQueueInfo:
      "**Note:** The method **getQueue()** returns the complete queue as it is as a string. If the queue is not full, the remaining elements are filled with -1.",
    toStringInfo:
      "**Note:** The method **toString()** only returns the part between rear and front. Every other value from the field is ignored.",
    queueEmpty: "Currently the queue is empty.",
    queueContainsValues: `The queue currently contains the following elements:`,
    multipleChoiceText:
      `Consider having a **Queue "{{0}}"**, who can store at most` +
      " ${{1}}$ " +
      `elements. 
{{2}}
       
{{3}}
    **What can we definitely say about the queue?**
    `,
    freeTextInput:
      `
    Consider having a **Queue "{{0}}"**, who can store at most` +
      " ${{1}}$ " +
      `elements. {{2}}
    **We perform the following operations:**
{{3}}
    `,
  },
  de: {
    name: "Implementierung einer Queue mit einem Array",
    description: "Basisfragen zum Testen des Verständnisses von Queues",
    solutionFreetext: `|Index|Frage|Lösung|\n{{0}}`,
    performOperations: `**Wir führen nun folgende Operationen aus:**{{0}}`,
    checkFormat: "Bitte geben Sie nur eine Zahl ein.",
    checkFormatArray: "Bitte geben Sie nur Zahlen durch Kommas getrennt ein.",
    getQueueInfo:
      "**Hinweis:** Die Methode **getQueue()** gibt die komplette Queue unverändert als String zurück. Wenn die Queue nicht voll ist, sind die restlichen Elemente mit -1 gefüllt.",
    toStringInfo:
      "**Hinweis:** Die Methode **toString()** gibt nur den Teil zwischen Rear und Front zurück. Jeder andere Wert aus dem Feld wird ignoriert.",
    queueEmpty: "Die Queue ist aktuell leer.",
    queueContainsValues: `Die Queue enthält aktuell folgende Elemente:`,
    multipleChoiceText:
      `Angenommen Sie haben einen **Queue "{{0}}"**, welche maximal` +
      " ${{1}}$ " +
      `Elemente speichern kann. 
{{2}} 
{{3}}
    **Welche Aussagen können wir nun über die Queue treffen?**`,
    freeTextInput:
      `
    Angenommen Sie haben eine **Queue "{{0}}"**, welche maximal` +
      " ${{1}}$ " +
      `Elemente speichern kann. {{2}}
    **Wir führen die folgenden Operationen aus:**
{{3}}
    `,
  },
}

// Minimum element in queue idea from here: (page 90 task 48)
// https://ae.cs.uni-frankfurt.de/teaching/20ss/+algo1/skript_ds.pdf

const answerOptionList: Translations = {
  en: {
    overFlowErrorV1: "We get an overflow error",
    overFlowErrorV2: "We insert more Elements into the Queue than it can store",
    overFlowErrorV1N: "We don't get an overflow error",
    queueFullV1: "The Queue {{0}} is full",
    queueFullV2: "We can not store more elements in the Queue {{0}}",
    queueFullV1N: "The Queue {{0}} is not full",
    queueFullV2N: "We could still store more elements in the Queue {{0}}",
    queueEmptyV1: "The Queue {{0}} is empty",
    queueEmptyV2: "There are currently no elements in the Queue {{0}}",
    queueEmptyV1N: "The Queue {{0}} is not empty",
    queueFrontV1: "The next element to dequeue in the Queue {{0}} is {{1}}",
    queueFrontV2: "Up next for dequeuing in Queue {{0}} is {{1}}.",
    queueRearV1: "The latest enqueued element of the Queue {{0}} is {{1}}",
    queueDequeueV1: "Dequeue operation on Queue {{0}} returns {{1}}",
    queueEnqueueV1: "Enqueue {{0}} to Queue {{1}} results in {{2}}",
    currentNumberOfElements: "The current number of elements in the Queue {{0}} is {{1}}",
    currentFreeElementS: "There is currently {{1}} element free in the Queue {{0}}",
    currentFreeElementP: "There are currently {{1}} elements free in the Queue {{0}}",
    minFindV1: "The minimum element in the Queue {{0}} is {{1}}",
    getQueueV1: "The field of the Queue {{0}} currently looks like: {{1}}",
    noTrans: "no",
  },
  de: {
    overFlowErrorV1: "Wir bekommen einen Overflow Fehler",
    overFlowErrorV2: "Wir fügen mehr Elemente in die Queue ein, als sie speichern kann",
    overFlowErrorV1N: "Wir bekommen keinen Overflow Fehler",
    queueFullV1: "Die Queue {{0}} ist voll",
    queueFullV2: "Wir können keine weiteren Elemente in die Queue {{0}} speichern",
    queueFullV1N: "Die Queue {{0}} ist nicht voll",
    queueFullV2N: "Wir könnten noch mehr Elemente in die Queue {{0}} speichern",
    queueEmptyV1: "Die Queue {{0}} ist leer",
    queueEmptyV2: "Aktuell sind keine Elemente in der Queue {{0}}",
    queueEmptyV1N: "Die Queue {{0}} ist nicht leer",
    queueFrontV1: "Das als nächstest zu dequeuende Element der Queue {{0}} ist {{1}}",
    queueFrontV2: "Als nächstes zum Dequeue in der Queue {{0}} ist {{1}}.",
    queueRearV1: "Das zuletzt hinzugefügte Element der Queue {{0}} ist {{1}}",
    queueDequeueV1: "Dequeue Operation auf Queue {{0}} gibt {{1}} zurück",
    queueEnqueueV1: "Enqueue {{0}} auf Queue {{1}} ergibt {{2}}",
    currentNumberOfElements: "Die aktuelle Anzahl an Elementen in der Queue {{0}} beträgt {{1}}",
    currentFreeElementS: "Es ist aktuell {{1}} Element frei in der Queue {{0}}",
    currentFreeElementP: "Es sind aktuell {{1}} Elemente frei in der Queue {{0}}",
    minFindV1: "Das Minimum-Element in der Queue {{0}} ist {{1}}",
    getQueueV1: "Das Feld der Queue {{0}} sieht aktuell so aus: {{1}}",
    noTrans: "kein",
  },
}

/**
 * Function to generate the operations for the queue (CHOICE option)
 * @param elements
 * @param queueSize
 * @param queueOverFlowError
 * @param queueName
 * @param random
 */
function generateOperationsQueue(
  elements: number[],
  queueSize: number,
  queueOverFlowError: boolean,
  queueName: string,
  random: Random,
) {
  const queue: Queue = new Queue(queueSize)
  for (const value of elements) {
    queue.queueElement(value)
  }

  const operations: string[] = []
  if (queueOverFlowError) {
    const missingElements = queueSize - queue.getCurrentNumberOfElements()
    const amountOperations = random.int(missingElements + 1, missingElements + 3)
    for (let i = 0; i < amountOperations; i++) {
      operations.push(queueName + ".enqueue(" + random.int(1, 20) + ")")
    }
    for (let i = 0; i < amountOperations - missingElements - 1; i++) {
      operations.push(queueName + ".dequeue()")
    }
    random.shuffle(operations)
  } else {
    const amountOperations = random.int(4, 8)
    for (let i = 0; i < amountOperations; i++) {
      // decide whether to enqueue or dequeue
      const enOrDe =
        queue.getCurrentNumberOfElements() === 0
          ? true
          : queue.getCurrentNumberOfElements() === queueSize
            ? false
            : random.choice([true, false])

      if (enOrDe) {
        const enqueueValue = random.int(1, 20)
        queue.queueElement(enqueueValue)
        operations.push(queueName + ".enqueue(" + enqueueValue + ")")
      } else {
        queue.dequeueElement()
        operations.push(queueName + ".dequeue()")
      }
    }
  }

  return {
    queue,
    operations,
  }
}

function generateOperationsQueueFreetext(elements: number[], queueSize: number, random: Random) {
  const queue: Queue = new Queue(queueSize)
  for (const value of elements) {
    queue.queueElement(value)
  }

  const operations: { [key: string]: string }[] = []
  const numOperations = random.int(6, 9)

  for (let i = 0; i < numOperations; i++) {
    let queueOrSize = random.weightedChoice([
      ["queue", 0.75],
      ["get", 0.25],
    ])
    if (i > 0) {
      if (
        Object.prototype.hasOwnProperty.call(operations[i - 1], "numberElements") ||
        Object.prototype.hasOwnProperty.call(operations[i - 1], "getFront")
      ) {
        queueOrSize = "queue"
      }
    }
    if (queueOrSize === "queue") {
      let enOrDe = random.choice(["enqueue", "dequeue"])
      if (queue.getCurrentNumberOfElements() === 0) {
        // only possible to enqueue
        enOrDe = "enqueue"
      } else if (queue.getCurrentNumberOfElements() === queue.getSize()) {
        // only dequeue is possible
        enOrDe = "dequeue"
      }
      // if enqueue or dequeue is chosen, add the operation
      if (enOrDe === "enqueue") {
        const enqueueValue = random.int(1, 20)
        operations.push({ enqueue: enqueueValue.toString() })
        queue.queueElement(enqueueValue)
      } else {
        const dequeueValue = queue.dequeueElement()
        operations.push({ dequeue: dequeueValue.toString() })
      }
    }
    // use operation numberElements, getRear or getFront
    else {
      const numOrRearOrFront = random.choice(queue.getCurrentNumberOfElements() > 0 ? ["numberElements", "getFront"] : ["numberElements"])
      if (numOrRearOrFront === "numberElements") {
        operations.push({ numberElements: queue.getCurrentNumberOfElements().toString() })
      } else if (numOrRearOrFront === "getFront") {
        operations.push({ getFront: queue.getFront().toString() })
      }
    }
  }

  return {
    operations,
    queue,
  }
}

/**
 * Function to generate the correct answers for the queue (CHOICE option)
 * @param queue
 * @param queueOverFlowError
 * @param queueName
 * @param random
 * @param lang
 */
function generateCorrectAnswersQueue(
  queue: Queue,
  queueOverFlowError: boolean,
  queueName: string,
  random: Random,
  lang: Language,
) {
  const answers: Set<string> = new Set<string>()
  if (queueOverFlowError) {
    answers.add(t(answerOptionList, lang, random.choice(["overFlowErrorV1", "overFlowErrorV2"])))
  } else {
    if (queue.getCurrentNumberOfElements() === queue.getSize()) {
      answers.add(t(answerOptionList, lang, random.choice(["queueFullV1", "queueFullV2"]), [queueName]))
    }
    if (queue.getCurrentNumberOfElements() === 0) {
      answers.add(
        t(answerOptionList, lang, random.choice(["queueEmptyV1", "queueEmptyV2"]), [queueName]),
      )
    } else {
      // get the front element
      // front element is the next element to get dequeued
      answers.add(
        t(answerOptionList, lang, random.choice(["queueFrontV1", "queueFrontV2"]), [
          queueName,
          queue.getFront().toString(),
        ]),
      )
      // get the rear element
      answers.add(t(answerOptionList, lang, "queueRearV1", [queueName, queue.getRear().toString()]))
      // add the answer to dequeue (same as a front element)
      answers.add(t(answerOptionList, lang, "queueDequeueV1", [queueName, queue.getFront().toString()]))
      // get the minimum element
      answers.add(t(answerOptionList, lang, "minFindV1", [queueName, queue.minFind().toString()]))
    }
    if (
      queue.getCurrentNumberOfElements() !== queue.getSize() &&
      queue.getCurrentNumberOfElements() !== 0
    ) {
      let toStringQueue: string = queue.toString()
      const enqueueValue = random.int(1, 20)
      toStringQueue += `,${enqueueValue}`
      answers.add(
        t(answerOptionList, lang, "queueEnqueueV1", [enqueueValue.toString(), queueName, toStringQueue]),
      )
      random.choice([true, false])
        ? answers.add(
            t(answerOptionList, lang, random.choice(["queueFullV1N", "queueFullV2N"]), [queueName]),
          )
        : answers.add(t(answerOptionList, lang, "queueEmptyV1N", [queueName]))
    }
    const freeElements = (queue.getSize() - queue.getCurrentNumberOfElements()).toString()
    answers.add(
      random.choice([
        t(answerOptionList, lang, "currentNumberOfElements", [
          queueName,
          queue.getCurrentNumberOfElements().toString(),
        ]),
        t(answerOptionList, lang, freeElements === "1" ? "currentFreeElementS" : "currentFreeElementP", [
          queueName,
          freeElements,
        ]),
      ]),
    )

    answers.add(t(answerOptionList, lang, "getQueueV1", [queueName, queue.getQueue()]))
  }

  const answerList: string[] = random.shuffle([...answers])
  return { answerList }
}

/**
 * Function to generate the wrong answers for the queue (CHOICE option)
 * @param queue
 * @param queueOverFlowError
 * @param queueName
 * @param random
 * @param lang
 */
function generateWrongAnswersQueue(
  queue: Queue,
  queueOverFlowError: boolean,
  queueName: string,
  random: Random,
  lang: Language,
) {
  const answers: Set<string> = new Set<string>()
  if (queueOverFlowError) {
    answers.add(t(answerOptionList, lang, "overFlowErrorV1N"))
  }

  // check if enough elements available and the two minimum elements are different value
  if (queue.getCurrentNumberOfElements() >= 2) {
    if (queue.getFront() !== queue.getFrontPlusOne()) {
      answers.add(
        t(answerOptionList, lang, random.choice(["queueFrontV1", "queueFrontV2"]), [
          queueName,
          queue.getFrontPlusOne().toString(),
        ]),
      )
    }
    if (queue.getRear() !== queue.getRearMinusOne()) {
      answers.add(
        t(answerOptionList, lang, "queueRearV1", [queueName, queue.getRearMinusOne().toString()]),
      )
    }
    if (queue.minFind() !== queue.minFindSecond()) {
      answers.add(t(answerOptionList, lang, "minFindV1", [queueName, queue.minFindSecond().toString()]))
    }

    if (queue.getCurrentNumberOfElements() !== queue.getSize()) {
      random.choice([true, false])
        ? answers.add(
            t(answerOptionList, lang, random.choice(["queueFullV1", "queueFullV2"]), [queueName]),
          )
        : answers.add(
            t(answerOptionList, lang, random.choice(["queueEmptyV1", "queueEmptyV2"]), [queueName]),
          )

      let toStringQueue: string = queue.toString()
      const enqueueValue = random.int(1, 20)
      toStringQueue += `,${enqueueValue}`
      // swap two values inside the queue
      const calcQueue = toStringQueue.split(",")

      for (let i = 0; i < 2; i++) {
        const swapIndex = random.subset(
          Array.from({ length: calcQueue.length - 1 }, (_, i) => i),
          2,
        )
        ;[calcQueue[swapIndex[0]], calcQueue[swapIndex[1]]] = [
          calcQueue[swapIndex[1]],
          calcQueue[swapIndex[0]],
        ]
        if (calcQueue.join(",") !== queue.toString() + `,${enqueueValue}`) {
          const newValue = t(answerOptionList, lang, "queueEnqueueV1", [
            enqueueValue.toString(),
            queueName,
            calcQueue.join(","),
          ])
          answers.add(newValue)
        }
      }
    }
  }

  queue.getCurrentNumberOfElements() === queue.getSize()
    ? answers.add(
        t(answerOptionList, lang, random.choice(["queueFullV1N", "queueFullV2N"]), [queueName]),
      )
    : null
  queue.getCurrentNumberOfElements() === 0
    ? answers.add(t(answerOptionList, lang, "queueEmptyV1N", [queueName]))
    : null

  const freeElements =
    queue.getCurrentNumberOfElements() === queue.getSize()
      ? queue.getSize() - queue.getCurrentNumberOfElements() + 1
      : queue.getSize() - queue.getCurrentNumberOfElements() + random.choice([-1, 1])
  answers.add(
    random.choice([
      t(answerOptionList, lang, "currentNumberOfElements", [
        queueName,
        (queue.getCurrentNumberOfElements() + random.choice([-1, 1])).toString(),
      ]),
      t(answerOptionList, lang, freeElements === 1 ? "currentFreeElementS" : "currentFreeElementP", [
        queueName,
        freeElements.toString(),
      ]),
    ]),
  )

  if (queue.getCurrentNumberOfElements() <= 1) {
    const newQueue: string[] = queue.getQueue().split(",") // getQueue -> [-1,-1,-1,x,-1] => pop possible
    newQueue.pop()
    answers.add(t(answerOptionList, lang, "getQueueV1", [queueName, newQueue.join(",")]))
    const newValue = random.int(1, 20).toString()
    newQueue.push(newValue)
    answers.add(t(answerOptionList, lang, "getQueueV1", [queueName, newQueue.join(",")]))
    if (queue.getCurrentNumberOfElements() === 0) {
      answers.add(t(answerOptionList, lang, "minFindV1", [queueName, random.int(1, 20).toString()]))
      // next to dequeue is -1
      answers.add(
        t(answerOptionList, lang, random.choice(["queueFrontV1", "queueFrontV2"]), [queueName, "-1"]),
      )
    }
  }

  if (queue.getCurrentNumberOfElements() === queue.getSize()) {
    const newQueue: string[] = queue.getQueue().split(",")
    const newValue = random.int(1, 20).toString()
    newQueue.unshift(newValue)
    answers.add(t(answerOptionList, lang, "queueEnqueueV1", [newValue, queueName, newQueue.join(",")]))
  }

  const getQueue = queue.getQueue()
  const newQueue = getQueue.split(",")
  // only swap to values which are not -1
  const swapIndex = random.subset(
    Array.from({ length: newQueue.length - 1 }, (_, i) => i),
    2,
  )
  ;[newQueue[swapIndex[0]], newQueue[swapIndex[1]]] = [newQueue[swapIndex[1]], newQueue[swapIndex[0]]]
  if (newQueue.join(",") !== getQueue) {
    answers.add(t(answerOptionList, lang, "getQueueV1", [queueName, newQueue.join(",")]))
  }

  const answerList: string[] = random.shuffle([...answers])
  return { answers: answerList }
}

export const queueQuestion: QuestionGenerator = {
  name: tFunctional(translations, "name"),
  description: tFunctional(translations, "description"),
  tags: ["queue"],
  languages: ["en", "de"],
  expectedParameters: [
    {
      type: "string",
      name: "variant",
      allowedValues: ["choice", "input"],
    },
  ],

  generate: (generatorPath, lang = "en", parameters, seed) => {
    const random = new Random(seed)

    const permalink = serializeGeneratorCall({
      generator: queueQuestion,
      lang,
      parameters,
      seed,
      generatorPath,
    })

    // throw an error if the variant is unknown
    if (!validateParameters(parameters, queueQuestion.expectedParameters)) {
      throw new Error(
        `Unknown variant ${parameters.variant.toString()}. 
                Valid variants are: ${queueQuestion.expectedParameters.join(", ")}`,
      )
    }

    const variant = parameters.variant as "choice" | "input"

    const queueName = random.choice("ABCQU".split(""))
    const queueSize = random.choice([4, 5, 6, 7, 8]) // Using only 8 values here, because it is not able to resize

    const queueOverFlowError =
      variant === "choice"
        ? random.weightedChoice([
            [true, 0.1],
            [false, 0.9],
          ])
        : false

    // dynamic does not exist in this queue code
    // increase or decrease is not possible, when there is no dynamic queue
    // and startElements not so much variation like in stack
    const startElementsAmount = queueOverFlowError
      ? random.int(queueSize - Math.ceil(queueSize * 0.5), queueSize - 1)
      : random.int(0, queueSize - 1)

    const startElements: number[] = []
    let queueInformationElements
    if (startElementsAmount === 0) {
      queueInformationElements = t(translations, lang, "queueEmpty")
    } else {
      queueInformationElements = t(translations, lang, "queueContainsValues")
      queueInformationElements += "\n\n|Index|Value|\n|---|---|\n"
      for (let i = 0; i < startElementsAmount; i++) {
        const newValue = random.int(1, 20)
        startElements.push(newValue)
        queueInformationElements += `|${i}|${newValue}|\n`
      }
      queueInformationElements += "|#div_my-5?td#||\n"
    }

    // variation between choice and input
    let question: Question
    if (variant === "choice") {
      const generatedOperations = generateOperationsQueue(
        startElements,
        queueSize,
        queueOverFlowError,
        queueName,
        random,
      )

      const correctAnswers = generateCorrectAnswersQueue(
        generatedOperations.queue,
        queueOverFlowError,
        queueName,
        random,
        lang,
      )

      const wrongAnswers = generateWrongAnswersQueue(
        generatedOperations.queue,
        queueOverFlowError,
        queueName,
        random,
        lang,
      )

      let i = 0
      let j = 0
      let allAnswers = []
      allAnswers.push(correctAnswers.answerList[i])
      i++
      while (
        allAnswers.length < 6 &&
        (i < correctAnswers.answerList.length || j < wrongAnswers.answers.length)
      ) {
        let cOf = random.choice([true, false])
        if (i >= correctAnswers.answerList.length) {
          cOf = false
        }
        if (j >= wrongAnswers.answers.length) {
          cOf = true
        }
        if (cOf) {
          allAnswers.push(correctAnswers.answerList[i])
          i++
        } else {
          allAnswers.push(wrongAnswers.answers[j])
          j++
        }
      }

      allAnswers = random.shuffle(allAnswers)

      const correctAnswerIndices = []
      for (let i = 0; i < correctAnswers.answerList.length; i++) {
        correctAnswerIndices.push(allAnswers.indexOf(correctAnswers.answerList[i]))
      }

      const operations = generatedOperations.operations
      const operationsString =
        operations.length > 0
          ? t(translations, lang, "performOperations", ["\n- " + operations.join("\n- ")])
          : ""

      question = {
        type: "MultipleChoiceQuestion",
        name: queueQuestion.name(lang),
        path: permalink,
        allowMultiple: true,
        text: t(translations, lang, "multipleChoiceText", [
          queueName,
          queueSize.toString(),
          queueInformationElements,
          operationsString,
        ]),
        answers: allAnswers,
        feedback: minimalMultipleChoiceFeedback({
          correctAnswerIndex: correctAnswerIndices,
        }),
      }
    } else {
      const checkFormat: MultiFreeTextFormatFunction = ({ text }, fieldID) => {
        if (fieldID.indexOf("toString") !== -1 || fieldID.indexOf("getQueue") !== -1) {
          // remove all whitespaces, starting "[" and ending "]"
          text = parseArrayString(text)
          // split to check if all elements are numbers
          const elements = text.split(",")
          for (let element of elements) {
            element = element.trim()
            if (element.startsWith("-")) {
              element = element.slice(1)
            }
            if (!/^\d+$/.test(element) && element !== "") {
              return { valid: false, message: t(translations, lang, "checkFormatArray") }
            }
          }
          return { valid: true, message: "" }
        }

        // check if is a number
        if (!/^\d+$/.test(text)) {
          return { valid: false, message: t(translations, lang, "checkFormat") }
        }
        return { valid: true, message: "" }
      }

      const feedback: FreeTextFeedbackFunction = ({ text }) => {
        let resultMap: { [key: string]: string } = {}
        try {
          resultMap = JSON.parse(text) as { [key: string]: string }
        } catch (e) {
          return {
            correct: false,
            message: tFunction(translations, lang).t("feedback.incomplete"),
            correctAnswer: t(translations, lang, "checkFormatJSON"),
          }
        }

        for (const key in resultMap) {
          if (resultMap[key] !== correctAnswers[key].replace("[", "").replace("]", "")) {
            return {
              correct: false,
              message: tFunction(translations, lang).t("feedback.incomplete"),
              correctAnswer: t(translations, lang, "solutionFreetext", [solutionDisplay]),
            }
          }
        }

        return {
          correct: true,
          message: tFunction(translations, lang).t("feedback.correct"),
        }
      }

      const operationsFreeText = generateOperationsQueueFreetext(startElements, queueSize, random)

      let inputText = "| Operation | Result |\n| --- | --- |\n"
      const correctAnswers: { [key: string]: string } = {}
      let solutionDisplay = ""
      let solutionIndex = 0
      let index = 0
      for (const operation of operationsFreeText.operations) {
        if (Object.prototype.hasOwnProperty.call(operation, "enqueue")) {
          inputText += `| ${queueName}.enqueue(${operation.enqueue}) |(void function)|\n`
        }
        if (Object.prototype.hasOwnProperty.call(operation, "dequeue")) {
          inputText += `| ${queueName}.dequeue() | {{dequeue-${index}####}} |\n`
          solutionIndex++
          solutionDisplay += `|${solutionIndex}|${queueName}.dequeue() | ${operation.dequeue} |\n`
          correctAnswers[`dequeue-${index}`] = operation.dequeue
        }
        if (Object.prototype.hasOwnProperty.call(operation, "numberElements")) {
          inputText += `|${queueName}.numberElements() | {{numElements-${index}####}} |\n`
          solutionIndex++
          solutionDisplay += `|${solutionIndex}|${queueName}.numberElements() | ${operation.numberElements} |\n`
          correctAnswers[`numElements-${index}`] = operation.numberElements
        }
        if (Object.prototype.hasOwnProperty.call(operation, "getFront")) {
          inputText += `| ${queueName}.peekHead() | {{getFront-${index}####}} |\n`
          solutionIndex++
          solutionDisplay += `|${solutionIndex}|${queueName}.peekHead() | ${operation.getFront} |\n`
          correctAnswers[`getFront-${index}`] = operation.getFront
        }
        index++
      }

      solutionIndex++
      const fullOrPartQueue =
        operationsFreeText.queue.getCurrentNumberOfElements() > 0
          ? random.choice(["full", "part"])
          : "full"
      if (fullOrPartQueue === "full") {
        inputText += `|${queueName}.getQueue()|{{getQueue-${index}####[2,-1,-1,1]}}|`
        solutionDisplay += `|${solutionIndex}|${queueName}.getQueue()|[${operationsFreeText.queue.getQueue()}]|\n`
        correctAnswers[`getQueue-${index}`] = operationsFreeText.queue.getQueue()
      } else {
        inputText += `|${queueName}.toString()|{{toString-${index}####[1,2,3,4]}}|`
        solutionDisplay += `|${solutionIndex}|${queueName}.toString()|[${operationsFreeText.queue.toString()}]|\n`
        correctAnswers[`toString-${index}`] = operationsFreeText.queue.toString()
      }
      solutionDisplay += "|#div_my-5?table_w-full#| |"
      inputText += `|#div_my-5?border_none?av_middle?ah_center?table_w-full#| |`

      // add the hint what toString and getQueue mean
      if (fullOrPartQueue === "full") {
        inputText += "\n" + t(translations, lang, "getQueueInfo")
      } else {
        inputText += "\n" + t(translations, lang, "toStringInfo")
      }


      question = {
        type: "MultiFreeTextQuestion",
        name: queueQuestion.name(lang),
        path: permalink,
        text: t(translations, lang, "freeTextInput", [
          queueName,
          queueSize.toString(),
          queueInformationElements,
          inputText,
        ]),
        fillOutAll: true,
        checkFormat,
        feedback,
      }
    }

    return { question }
  },
}

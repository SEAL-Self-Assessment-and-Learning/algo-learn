import {
  FreeTextFeedbackFunction,
  FreeTextFormatFunction,
  FreeTextQuestion,
  QuestionGenerator,
} from "@shared/api/QuestionGenerator.ts"
import { MaxHeap } from "@shared/question-generators/heap/maxHeap.ts"
import { MinHeap } from "@shared/question-generators/heap/minHeap.ts"
import Random from "@shared/utils/random.ts"
import { t, tFunctional, Translations } from "@shared/utils/translations.ts"

const translation: Translations = {
  en: {
    name: "Heap-Operations",
    description: "Determine the state of a heap after operations",
    taskInsert:
      "Consider having a **{{0}}-Heap**. You insert the following elements in the given order: {{1}} What is the state of the Heap after the insertions?",
    taskExtract:
      "Consider having the following **{{0}}-Heap**: {{1}} You extract the {{2}} element **{{3}}** times. What is the state of the Heap after the extractions?",
    taskBuild:
      "Consider having the following Array: {{0}} What is the result of **Build-{{1}}-Heap**?",
    checkFormat: "Please only enter Integer seperated by commas.",
  },
  de: {
    name: "Heap-Operationen",
    description: "Bestimme den Zustand eines Heaps nach Operationen",
    taskInsert:
      "Betrachte einen **{{0}}-Heap**. Du fügst die folgenden Elemente in gegebener Reihenfolge ein: {{1}} Wie sieht der Heap nach den Einfügungen aus?",
    taskExtract:
      "Betrachte den folgenden **{{0}}-Heap**: {{1}} Du extrahierst das {{2}} Element **{{3}}** mal. Wie sieht der Heap nach den Extraktionen aus?",
    taskBuild:
      "Betrachte das folgende Array: {{0}} Was ist das Ergebnis von **Build-{{1}}-Heap**?",
    checkFormat: "Bitte nur Integer durch Kommata getrennt eingeben.",
  },
}

const wordTranslations: Translations = {
  en: {
    maximal: "maximal",
    minimal: "minimal",
  },
  de: {
    maximal: "maximale",
    minimal: "minimale",
  },
}

export const HeapQuestion: QuestionGenerator = {
  name: tFunctional(translation, "name"),
  description: tFunctional(translation, "description"),
  tags: ["heap", "priority-queue"],
  languages: ["en", "de"],
  expectedParameters: [
    {
      type: "string",
      name: "variant",
      allowedValues: ["insert", "extract", "build"],
    },
  ],

  generate: (generatorPath, lang = "en", parameters, seed) => {
    const random = new Random(seed)

    const variant = parameters.variant as "insert" | "extract" | "build"

    const heapType: "Max" | "Min" = random.choice(["Max", "Min"])
    let heapSize: number = random.int(5, 9)
    const heapElements: number[] = []
    for (let i = 0; i < heapSize; i++) {
      heapElements.push(random.int(1, 20))
    }

    const checkFormat: FreeTextFormatFunction = ({ text }) => {
      if (text.trim() === "") return { valid: false }

      // 1 trim
      let cleanedText = text.trim()
      // 2 remove beginning and ending brackets
      cleanedText = cleanedText.replace(/^\[/, "").replace(/\]$/, "")

      let heapInputTable = "\n"

      // test if every input is a integer
      for (const element of cleanedText.split(",")) {
        if (!/^\d+$/.test(element) && element.trim() !== "") {
          return {
            valid: false,
            message: t(translation, lang, "checkFormat"),
          }
        }
        heapInputTable += "|" + element
      }
      heapInputTable += "|\n"
      heapInputTable += "|---".repeat(cleanedText.split(",").length) + "|\n"

      return {
        valid: true,
        message: heapInputTable,
      }
    }

    let solutionHeap: MaxHeap | MinHeap
    if (heapType === "Min") {
      solutionHeap = new MinHeap()
    } else {
      solutionHeap = new MaxHeap()
    }
    const feedback: FreeTextFeedbackFunction = ({ text }) => {
      let cleanedText = text.trim()
      cleanedText = cleanedText.replace(/^\[/, "").replace(/\]$/, "")

      const userHeap = cleanedText.split(",").map(Number)

      if (userHeap.length !== heapSize) {
        return {
          correct: false,
          correctAnswer: solutionHeap.toTableString() + "|#div_my-5#||\n",
        }
      }

      if (userHeap.toString() !== solutionHeap.toString()) {
        return {
          correct: false,
          correctAnswer: solutionHeap.toTableString(),
        }
      }

      return {
        correct: true,
      }
    }

    if (variant === "insert") {
      // build a table representing the index - value pair starting at 1
      let elementsTable = "\n"
      elementsTable += "|" + Array.from({ length: heapSize }, (_, i) => i + 1).join("|") + "|\n"
      elementsTable += "|---".repeat(heapSize) + "|\n"
      elementsTable += "|" + heapElements.join("|") + "|\n"
      elementsTable += "|#div_my-5#||\n"

      for (const element of heapElements) {
        solutionHeap.insert(element)
      }

      const question: FreeTextQuestion = {
        type: "FreeTextQuestion",
        name: HeapQuestion.name(lang),
        path: generatorPath,
        text: t(translation, lang, "taskInsert", [heapType, elementsTable]),
        checkFormat,
        feedback,
      }

      return { question }
    } else if (variant === "extract") {

      for (const element of heapElements) {
        solutionHeap.insert(element)
      }
      const elementsTable = solutionHeap.toTableString() + "|#div_my-5#||\n"

      const extractAmount = random.int(2, 3)
      heapSize -= extractAmount
      for (let i = 0; i < extractAmount; i++) {
        if (solutionHeap instanceof MinHeap) {
          solutionHeap.extractMin()
        } else {
          solutionHeap.extractMax()
        }
      }

      const question: FreeTextQuestion = {
        type: "FreeTextQuestion",
        name: HeapQuestion.name(lang),
        path: generatorPath,
        text: t(translation, lang, "taskExtract", [
          heapType,
          elementsTable,
          t(wordTranslations, lang, heapType === "Min" ? "minimal" : "maximal"),
          extractAmount.toString(),
        ]),
        checkFormat,
        feedback,
      }

      return { question }
    } else {

      const elementsTable = "\n|" + heapElements.join("|") + "|\n" + "|---".repeat(heapSize) + "|\n|#div_my-5#||\n"

      solutionHeap.build(heapElements)

      const question: FreeTextQuestion = {
        type: "FreeTextQuestion",
        name: HeapQuestion.name(lang),
        path: generatorPath,
        text: t(translation, lang, "taskBuild", [
          elementsTable,
          heapType,
        ]),
        checkFormat,
        feedback,
      }

      return { question }

    }

  },
}

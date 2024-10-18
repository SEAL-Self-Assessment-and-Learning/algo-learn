import {
  FreeTextFeedbackFunction,
  FreeTextFormatFunction,
  FreeTextQuestion,
  QuestionGenerator,
} from "@shared/api/QuestionGenerator"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter"
import { generateNeighbourOptions } from "@shared/question-generators/heap/utils/utilsGenerate"
import Random from "@shared/utils/random"
import { t, tFunctional, Translations } from "@shared/utils/translations"

const translationsHeapNeighbours: Translations = {
  en: {
    name: "Heap Neighbours",
    description: "Find the neighbours of a node in a heap.",
    taskNeighbours:
      "We consider a **Heap** implemented as array $[1,\\dots,n]$. What is the index of the **{{0}}** of the element at **index {{1}}**?",
    checkFormatPermutations: "Please enter a non-negative integer.",
  },
  de: {
    name: "Nachbarn im Heap",
    description: "Finde die Nachbarn eines Knotens in einem Heap.",
    taskNeighbours:
      "Wir betrachten einen **Heap** der als Array $[1,\\dots,n]$ implementiert ist. Was ist der Index des **{{0}}** des Elements an **Index {{1}}*?",
    checkFormatPermutations: "Bitte gib eine nicht-negative Ganzzahl ein.",
  },
}

const wordTranslations: Translations = {
  en: {
    maximal: "maximal",
    minimal: "minimal",
    parent: "parent",
    rightChild: "right child",
    leftChild: "left child",
  },
  de: {
    maximal: "maximale",
    minimal: "minimale",
    parent: "Elternknoten",
    rightChild: "rechten Kindes",
    leftChild: "linken Kindes",
  },
}

export const HeapNeighbours: QuestionGenerator = {
  id: "heapnb",
  name: tFunctional(translationsHeapNeighbours, "name"),
  description: tFunctional(translationsHeapNeighbours, "description"),
  tags: ["heap", "priority-queue"],
  languages: ["en", "de"],
  expectedParameters: [
    {
      type: "string",
      name: "variant",
      allowedValues: ["neighbour"],
    },
  ],

  generate: (lang = "en", parameters, seed) => {
    const permaLink = serializeGeneratorCall({
      generator: HeapNeighbours,
      lang,
      parameters,
      seed,
    })
    const random = new Random(seed)

    const { formula, text } = generateNeighbourOptions(random)
    const randomIndex = random.int(2, 50)
    const solution = formula(randomIndex)
    const neighbourText = text.map((word) => t(wordTranslations, lang, word)).join(" ")

    const checkFormat: FreeTextFormatFunction = ({ text }) => {
      // check if the input is an integer
      text = text.trim()
      if (text === "") return { valid: false }
      if (!/^\d+$/.test(text)) {
        return {
          valid: false,
          message: t(translationsHeapNeighbours, lang, "checkFormatPermutations"),
        }
      }
      return { valid: true }
    }

    const feedback: FreeTextFeedbackFunction = ({ text }) => {
      const cleanedText = text.trim()
      if (parseInt(cleanedText) !== solution) {
        return {
          correct: false,
          correctAnswer: solution.toString(),
        }
      }
      return { correct: true }
    }

    const question: FreeTextQuestion = {
      type: "FreeTextQuestion",
      name: HeapNeighbours.name(lang),
      path: permaLink,
      text: t(translationsHeapNeighbours, lang, "taskNeighbours", [
        neighbourText,
        randomIndex.toString(),
      ]),
      checkFormat,
      feedback,
    }
    return { question }
  },
}

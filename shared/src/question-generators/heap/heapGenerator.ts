import {
  FreeTextFeedbackFunction,
  FreeTextFormatFunction,
  FreeTextQuestion,
  minimalMultipleChoiceFeedback,
  MultipleChoiceQuestion,
  QuestionGenerator,
} from "@shared/api/QuestionGenerator.ts"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter.ts"
import { MaxHeap, MinHeap } from "@shared/question-generators/heap/heapMinMax.ts"
import {
  generateHeapsForQuestion,
  generateNeighbourOptions,
  generateOperationSequence,
} from "@shared/question-generators/heap/utils.ts"
import { permutation } from "@shared/utils/math.ts"
import Random from "@shared/utils/random.ts"
import { t, tFunctional, Translations } from "@shared/utils/translations.ts"

const translationHeapOperations: Translations = {
  en: {
    name: "Heap-Operations",
    description: "Determine the state of a heap after operations",
    taskInsert:
      "Consider having a **{{0}}-Heap**. You insert the following elements in the given order: {{1}} What is the state of the Heap after the insertions?",
    taskExtract:
      "Consider having the following **{{0}}-Heap**: {{1}} You extract the {{2}} element **{{3}}** times. What is the state of the Heap after the extractions?",
    taskBuild: "Consider having the following Array: {{0}} What is the result of **Build-{{1}}-Heap**?",
    taskCombine:
      "Let **{{0}}** be a sequence of operations, where a **number** represents **inserting** this number into the heap and $*$ represents an **Extract-{{2}}** Operation. \\[{{0}}={{1}}\\] What is the state of the Heap after all operations? Initially the heap is empty.",
    checkFormat: "Please only enter Integer seperated by commas.",
  },
  de: {
    name: "Heap-Operationen",
    description: "Bestimme den Zustand eines Heaps nach Operationen",
    taskInsert:
      "Betrachte einen **{{0}}-Heap**. Du fügst die folgenden Elemente in gegebener Reihenfolge ein: {{1}} Wie sieht der Heap nach den Einfügungen aus?",
    taskExtract:
      "Betrachte den folgenden **{{0}}-Heap**: {{1}} Du extrahierst das {{2}} Element **{{3}}** mal. Wie sieht der Heap nach den Extraktionen aus?",
    taskBuild: "Betrachte das folgende Array: {{0}} Was ist das Ergebnis von **Build-{{1}}-Heap**?",
    taskCombine:
      "Sei **{{0}}** eine Sequenz von Operationen, wobei eine **Zahl** das **Einfügen** dieser Zahl in den Heap repräsentiert und $*$ eine **Extract-{{2}}** Operation. \\[{{0}}={{1}}\\] Wie sieht der Heap nach allen Operationen aus? Der Heap ist anfangs leer.",
    checkFormat: "Bitte nur Integer durch Kommata getrennt eingeben.",
  },
}

const translationsHeapUnderstanding: Translations = {
  en: {
    name: "Heap-Understanding",
    description: "Understand the properties of heaps",
    taskPermutations:
      "Consider the following {{0}}-Heap. How many different Insert-Operations can lead to this Heap? {{1}} Number of different Insert-Operations:",
    taskCorrectness:
      "Which of the following arrays satisfy all **Heap-Properties** for a **{{0}}-Heap**?",
    taskNeighbours:
      "Consider having a random Heap with $n$ elements, where $n >> 1000$. The value at index $0$ is *null*.  What is the index of the **{{0}}** of the element at **index {{1}}** in a *Heap*?",
    checkFormatPermutations: "Please only enter an Integer.",
  },
  de: {
    name: "Heap-Verständnis",
    description: "Verstehe die Eigenschaften von Heaps",
    taskPermutations:
      "Betrachte den folgenden {{0}}-Heap. Wie viele verschiedene Einfüge-Operationen können zu diesem Heap führen? {{1}} Anzahl der verschiedenen Einfüge-Operationen:",
    taskCorrectness:
      "Welche der folgenden Arrays erfüllen alle **Heap-Eigenschaften** für einen **{{0}}-Heap**?",
    taskNeighbours:
      "Angenommen du hast einen beliebigen Heap mit $n$ Element, mit $n >> 1000$. Der Wert an index $0$ ist *null*, Was ist der Index des **{{0}}** des Elements an **Index {{1}}* in einem *Heap*?",
    checkFormatPermutations: "Bitte etwas ganzzahliges eingeben.",
  },
}

const wordTranslations: Translations = {
  en: {
    maximal: "maximal",
    minimal: "minimal",
    grandParent: "grandparent",
    parent: "parent",
    rightChild: "right child",
    leftChild: "left child",
    ofThe: "of the",
  },
  de: {
    maximal: "maximale",
    minimal: "minimale",
    grandParent: "Großelternknoten",
    parent: "Elternknoten",
    rightChild: "rechten Kindes",
    leftChild: "linken Kindes",
    ofThe: "des",
  },
}

function heapGetPermutationElements(heap: MinHeap | MaxHeap, heapElements: number[]): number {
  let numberPossiblePermutations: number = 0

  const elementsPermutations: number[][] = permutation(heapElements)
  for (const permutation of elementsPermutations) {
    const testHeap = heap instanceof MinHeap ? new MinHeap() : new MaxHeap()
    for (const element of permutation) {
      testHeap.insert(element)
    }
    if (testHeap.toString() === heap.toString()) {
      numberPossiblePermutations += 1
    }
  }

  return numberPossiblePermutations
}

export const HeapOperations: QuestionGenerator = {
  id: "heapops",
  name: tFunctional(translationHeapOperations, "name"),
  description: tFunctional(translationHeapOperations, "description"),
  tags: ["heap", "priority-queue"],
  languages: ["en", "de"],
  expectedParameters: [
    {
      type: "string",
      name: "variant",
      allowedValues: ["insert", "extract", "build", "combine"],
    },
  ],

  generate: (lang = "en", parameters, seed) => {
    const permaLink = serializeGeneratorCall({
      generator: HeapOperations,
      lang,
      parameters,
      seed,
    })

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
            message: t(translationHeapOperations, lang, "checkFormat"),
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
        name: HeapOperations.name(lang),
        path: permaLink,
        text: t(translationHeapOperations, lang, "taskInsert", [heapType, elementsTable]),
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
        name: HeapOperations.name(lang),
        path: permaLink,
        text: t(translationHeapOperations, lang, "taskExtract", [
          heapType,
          elementsTable,
          t(wordTranslations, lang, heapType === "Min" ? "minimal" : "maximal"),
          extractAmount.toString(),
        ]),
        checkFormat,
        feedback,
      }

      return { question }
    } else if (variant === "build") {
      const elementsTable =
        "\n|" + heapElements.join("|") + "|\n" + "|---".repeat(heapSize) + "|\n|#div_my-5#||\n"

      solutionHeap.build(heapElements)

      const question: FreeTextQuestion = {
        type: "FreeTextQuestion",
        name: HeapOperations.name(lang),
        path: permaLink,
        text: t(translationHeapOperations, lang, "taskBuild", [elementsTable, heapType]),
        checkFormat,
        feedback,
      }

      return { question }
    } else {
      const variableName = random.choice(["A", "B", "C", "D", "E"])

      const { sequence, heap } = generateOperationSequence(heapType, random)
      solutionHeap = heap

      const question: FreeTextQuestion = {
        type: "FreeTextQuestion",
        name: HeapOperations.name(lang),
        path: permaLink,
        text: t(translationHeapOperations, lang, "taskCombine", [variableName, sequence, heapType]),
        checkFormat,
        feedback,
      }

      return { question }
    }
  },
}

export const HeapUnderstanding: QuestionGenerator = {
  id: "heapund",
  name: tFunctional(translationsHeapUnderstanding, "name"),
  description: tFunctional(translationsHeapUnderstanding, "description"),
  tags: ["heap", "priority-queue", "proofs"],
  languages: ["en", "de"],
  expectedParameters: [
    {
      type: "string",
      name: "variant",
      allowedValues: ["correctness", "permutations", "neighbours"],
    },
  ],

  generate: (lang = "en", parameters, seed) => {
    const permaLink = serializeGeneratorCall({
      generator: HeapUnderstanding,
      lang,
      parameters,
      seed,
    })

    const random = new Random(seed)

    const variant: "correctness" | "permutations" | "proofs" = parameters.variant as
      | "correctness"
      | "permutations"
      | "proofs"

    const heapType: "Max" | "Min" = random.choice(["Max", "Min"])
    const solutionHeap: MaxHeap | MinHeap = heapType === "Min" ? new MinHeap() : new MaxHeap()

    const checkFormat: FreeTextFormatFunction = ({ text }) => {
      // check if the input is an integer
      text = text.trim()

      if (text === "") return { valid: false }

      if (!/^\d+$/.test(text)) {
        return {
          valid: false,
          message: t(translationsHeapUnderstanding, lang, "checkFormatPermutations"),
        }
      }
      return { valid: true }
    }

    let solution = -1
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

    if (variant === "permutations") {
      const heapSize = random.int(3, 5)
      // select n different numbers
      const heapElements = random.shuffle([...Array(10).keys()]).slice(1, 1 + heapSize)
      solutionHeap.build(heapElements)

      solution = heapGetPermutationElements(solutionHeap, heapElements)

      const question: FreeTextQuestion = {
        type: "FreeTextQuestion",
        name: HeapUnderstanding.name(lang),
        path: permaLink,
        text: t(translationsHeapUnderstanding, lang, "taskPermutations", [
          heapType,
          solutionHeap.toTableString() + "|#div_my-5#||\n",
        ]),
        checkFormat,
        feedback,
      }

      return { question }
    } else if (variant === "correctness") {
      const { heapStringTable, correctAnswerIndex } = generateHeapsForQuestion(heapType, random)

      const question: MultipleChoiceQuestion = {
        type: "MultipleChoiceQuestion",
        name: HeapUnderstanding.name(lang),
        path: permaLink,
        text: t(translationsHeapUnderstanding, lang, "taskCorrectness", [heapType]),
        answers: heapStringTable,
        feedback: minimalMultipleChoiceFeedback({ correctAnswerIndex }),
        allowMultiple: true,
      }

      return { question }
    } else {
      const { formula, text } = generateNeighbourOptions(random)

      const randomIndex = random.int(2, 50)
      solution = formula(randomIndex)
      const neighbourText = text.map((word) => t(wordTranslations, lang, word)).join(" ")

      const question: FreeTextQuestion = {
        type: "FreeTextQuestion",
        name: HeapUnderstanding.name(lang),
        path: permaLink,
        text: t(translationsHeapUnderstanding, lang, "taskNeighbours", [
          neighbourText,
          randomIndex.toString(),
        ]),
        checkFormat,
        feedback,
      }

      return { question }
    }
  },
}

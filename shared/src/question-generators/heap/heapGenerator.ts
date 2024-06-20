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
import Random from "@shared/utils/random.ts"
import { t, tFunctional, Translations } from "@shared/utils/translations.ts"

const translationHeapOperations: Translations = {
  en: {
    name: "Heap-Operations",
    description: "Determine the state of a Heap after operations",
    taskInsert:
      "Consider a **{{0}}-Heap**. Initally the Heap is empty. You insert the following elements in the given order: {{1}} Enter the state of the Heap after the insertions.",
    taskExtract:
      "Consider the following **{{0}}-Heap**: {{1}} You extract the {{2}} element **{{3}}** times. Enter the state of the Heap after the extractions.",
    taskBuild:
      "Consider the following Array: {{0}} Enter the state of the Heap after **Build-{{1}}-Heap** on the above array.",
    taskCombine:
      "Let **{{0}}** be a sequence of operations, where a **number** represents **inserting** this number into the **{{2}}-Heap** and $*$ represents an **Extract-{{2}}** operation. \\[{{0}}={{1}}\\] Enter the state of the Heap after all operations. Initially the Heap is empty.",
    checkFormat: "Please only enter Integer seperated by commas.",
  },
  de: {
    name: "Heap-Operationen",
    description: "Bestimme den Zustand eines Heaps nach Operationen",
    taskInsert:
      "Betrachte einen **{{0}}-Heap**. Anfänglich ist der Heap leer. Du fügst die folgenden Elemente in gegebener Reihenfolge ein: {{1}} Gib den Heap nach den Einfügungen an.",
    taskExtract:
      "Betrachte den folgenden **{{0}}-Heap**: {{1}} Du extrahierst das {{2}} Element **{{3}}** mal. Gib den Heap nach den Extraktionen an.",
    taskBuild:
      "Betrachte das folgende Array: {{0}} Gib den Heap nach **Build-{{1}}-Heap** auf dem obigen Array an.",
    taskCombine:
      "Sei **{{0}}** eine Sequenz von Operationen, wobei eine **Zahl** das **Einfügen** dieser Zahl in den **{{2}}-Heap** repräsentiert und $*$ eine **Extract-{{2}}** Operation. \\[{{0}}={{1}}\\] Gib den Heap nach allen Operationen an. Der Heap ist anfangs leer.",
    checkFormat: "Bitte nur ganze Zahlen durch Komma getrennt eingeben.",
  },
}

const translationsHeapUnderstanding: Translations = {
  en: {
    name: "Heap-Understanding",
    description: "Understand the properties of heaps",
    taskCorrectness:
      "Which of the following arrays satisfy all **Heap-Properties** for a **{{0}}-Heap**?",
    taskNeighbours:
      "Consider a random Heap with $n$ elements. The value at index $0$ is *null*. What is the index of the **{{0}}** of the element at **index {{1}}** in a *Heap*?",
    checkFormatPermutations: "Please only enter an Integer.",
  },
  de: {
    name: "Heap-Verständnis",
    description: "Verstehe die Eigenschaften von Heaps", // Improve this description
    taskCorrectness:
      "Welche der folgenden Arrays erfüllen alle **Heap-Eigenschaften** für einen **{{0}}-Heap**?",
    taskNeighbours:
      "Betrachte einen beliebigen Heap mit $n$ Element. Der Wert an index $0$ ist *null*. Was ist der Index des **{{0}}** des Elements an **Index {{1}}* in einem *Heap*?",
    checkFormatPermutations: "Bitte etwas ganzzahliges eingeben.",
  },
}

// passen diese Beschreibungen für Knoten?
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
      // remove brackets
      cleanedText = cleanedText.replace(/^\[/, "").replace(/\]$/, "")
      // remove all whitespaces
      cleanedText = cleanedText.replace(/\s/g, "")

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
      // remove brackets
      cleanedText = cleanedText.replace(/^\[/, "").replace(/\]$/, "")
      // remove every whitespace
      cleanedText = cleanedText.replace(/\s/g, "")

      // remove every empty entry
      const userHeap = cleanedText
        .split(",")
        .filter((element) => element.trim() !== "")
        .map(Number)

      if (userHeap.toString() !== solutionHeap.toString()) {
        return {
          correct: false,
          correctAnswer: solutionHeap.toTableString() + "|#div_my-5#||\n",
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
      allowedValues: ["correctness", "neighbours"],
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

    const variant: "correctness" | "proofs" = parameters.variant as "correctness" | "proofs"

    const heapType: "Max" | "Min" = random.choice(["Max", "Min"])

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

    if (variant === "correctness") {
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

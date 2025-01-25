import type {
  FreeTextQuestion,
  MultiFreeTextFeedbackFunction,
  MultiFreeTextQuestion,
  QuestionGenerator,
} from "@shared/api/QuestionGenerator"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter"
import type { Heap, MaxHeap, MinHeap } from "@shared/question-generators/heap/heapMinMax"
import { generateOperationSequence } from "@shared/question-generators/heap/utils/utilsGenerate"
import { generateHeapOperationsFoundation } from "@shared/question-generators/heap/utils/utilsOperations"
import {
  createArrayDisplayCodeBlock,
  createArrayDisplayCodeBlockUserInput,
} from "@shared/utils/arrayDisplayCodeBlock"
import Random from "@shared/utils/random"
import { t, tFunctional, type Translations } from "@shared/utils/translations"

const translationHeapOperations: Translations = {
  en: {
    name: "Heap-Operations",
    description: "Determine the state of a Heap after various operations",
    taskInsert:
      "Consider a **{{0}}-Heap**. Initially the Heap is empty. Insert the elements in the given order: \\[{{1}}\\] Enter the final state of the Heap as an array. {{2}}",
    taskExtract:
      "Consider a **{{0}}-Heap** that is given by the following array: {{1}} You call `Extract{{2}}` **{{3}}** times. Enter the final state of the Heap as an array. {{4}}",
    taskBuild:
      "(Not included at the moment) Consider the following **Array**: {{0}} Enter the state of the Heap after **Build-{{1}}-Heap** on the above array. {{2}}",
    taskCombine:
      "Consider the following sequence of operations, where a **number** represents **inserting** this number into the **{{1}}-Heap** and $*$ represents an `Extract{{1}}` operation. \\[{{0}}\\] Enter the final state of the Heap as an array. Initially the Heap is empty. {{2}}",
    checkFormat: "Please only enter Integer seperated by commas.",
  },
  de: {
    name: "Heap-Operationen",
    description: "Bestimme den Zustand eines Heaps nach unterschiedlichen Operationen",
    taskInsert:
      "Betrachte einen **{{0}}-Heap**. Anfänglich ist der Heap leer. Du fügst die folgenden Elemente in gegebener Reihenfolge ein: \\[{{1}}\\] Gib den finalen Zustand des Heaps als Array an. {{2}}",
    taskExtract:
      "Betrachte einen **{{0}}-Heap**, der durch das folgende Array gegeben ist: {{1}} Du rufst `Extract{{2}}` **{{3}}** mal auf. Gib den finalen Zustand des Heaps als Array an. {{4}}",
    taskBuild:
      "(Not included at the moment) Betrachte das folgende Array: {{0}} Gib den Heap nach **Build-{{1}}-Heap** auf dem obigen Array an. {{2}}",
    taskCombine:
      "Betrachte die folgende Sequenz von Operationen, wobei eine **Zahl** das **Einfügen** dieser Zahl in den **{{1}}-Heap** repräsentiert und $*$ eine `Extract{{1}}` Operation. \\[{{0}}\\] Gib den finalen Zustand des Heaps als Array an. Anfänglich ist der Heap leer. {{2}}",
    checkFormat: "Bitte nur ganze Zahlen durch Komma getrennt eingeben.",
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
      allowedValues: ["insert", "extract", "combine"],
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

    const variant = parameters.variant as "insert" | "extract" | "build" | "combine"

    let solutionHeap: MaxHeap | MinHeap
    const {
      heapElements,
      heapType,
      solutionHeap: solutionHeap_,
    } = generateHeapOperationsFoundation({ random })
    solutionHeap = solutionHeap_

    if (variant === "insert") {
      for (const element of heapElements) {
        solutionHeap.insert(element)
      }

      const { arrayDisplayBlock } = createArrayDisplayCodeBlockUserInput({
        numberOfInputFields: solutionHeap.getSize(),
        inputFieldCharacters: 2,
        leadValues: ["-"],
      })
      const question: MultiFreeTextQuestion = {
        type: "MultiFreeTextQuestion",
        name: HeapOperations.name(lang),
        path: permaLink,
        text: t(translationHeapOperations, lang, "taskInsert", [
          heapType,
          heapElements.toString(),
          arrayDisplayBlock,
        ]),
        feedback: getMultiFreeTextFeedback(solutionHeap),
      }
      return { question }
    } else if (variant === "extract") {
      for (const element of heapElements) {
        solutionHeap.insert(element)
      }
      const elementsTable = createArrayDisplayCodeBlock({
        array: ["-"].concat(solutionHeap.getHeap().map(String)),
      })

      const extractAmount = random.int(2, 3)
      for (let i = 0; i < extractAmount; i++) {
        solutionHeap.extract()
      }

      const { arrayDisplayBlock } = createArrayDisplayCodeBlockUserInput({
        numberOfInputFields: solutionHeap.getSize(),
        inputFieldCharacters: 2,
        leadValues: ["-"],
      })
      const question: MultiFreeTextQuestion = {
        type: "MultiFreeTextQuestion",
        name: HeapOperations.name(lang),
        path: permaLink,
        text: t(translationHeapOperations, lang, "taskExtract", [
          heapType,
          elementsTable,
          heapType,
          extractAmount.toString(),
          arrayDisplayBlock,
        ]),
        feedback: getMultiFreeTextFeedback(solutionHeap),
      }
      return { question }
    } else if (variant === "build") {
      // @deprecated variant
      const elementsTable = createArrayDisplayCodeBlock({
        array: ["-"].concat(heapElements.map(String)),
      })
      solutionHeap.build(heapElements)
      const question: FreeTextQuestion = {
        type: "FreeTextQuestion",
        name: HeapOperations.name(lang),
        path: permaLink,
        text: t(translationHeapOperations, lang, "taskBuild", [elementsTable, heapType]),
      }

      return { question }
    } else {
      const { sequence, heap } = generateOperationSequence(heapType, random)
      solutionHeap = heap

      const { arrayDisplayBlock } = createArrayDisplayCodeBlockUserInput({
        numberOfInputFields: solutionHeap.getSize(),
        inputFieldCharacters: 2,
        leadValues: ["-"],
      })
      const question: MultiFreeTextQuestion = {
        type: "MultiFreeTextQuestion",
        name: HeapOperations.name(lang),
        path: permaLink,
        text: t(translationHeapOperations, lang, "taskCombine", [sequence, heapType, arrayDisplayBlock]),
        feedback: getMultiFreeTextFeedback(solutionHeap),
      }
      return { question }
    }
  },
}

/**
 * This function returns a feedback function for all heap operation variants
 * Comparing the solution heap with the user input
 * @param solutionHeap - the solution heap
 */
function getMultiFreeTextFeedback(solutionHeap: Heap): MultiFreeTextFeedbackFunction {
  // fieldIDs = input-x (x \in [0,1,2,3...])
  return ({ text }) => {
    console.log(text)
    const heapArray = solutionHeap.getHeap()
    for (let i = 0; i < heapArray.length; i++) {
      const userFieldAnswer = parseFloat(text["input-" + i].trim())
      if (userFieldAnswer !== heapArray[i]) {
        return {
          correct: false,
          correctAnswer: createArrayDisplayCodeBlock({
            array: ["-", ...heapArray],
          }),
        }
      }
    }
    return {
      correct: true,
    }
  }
}

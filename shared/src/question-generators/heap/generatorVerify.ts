import {
  minimalMultipleChoiceFeedback,
  MultipleChoiceQuestion,
  QuestionGenerator,
} from "@shared/api/QuestionGenerator"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter"
import { generateHeapsForChoiceQuestion } from "@shared/question-generators/heap/utils/utilsGenerate"
import Random from "@shared/utils/random"
import { t, tFunctional, Translations } from "@shared/utils/translations"

const translationsHeapVerifying: Translations = {
  en: {
    name: "Heap-Verifying",
    description: "Verify basic heap properties",
    taskCorrectness:
      "Which of the following arrays satisfy all **heap properties** for a **{{0}}-Heap**?",
    taskNeighbours:
      "We consider a **Heap** implemented as array $[1,\\dots,n]$. What is the index of the **{{0}}** of the element at **index {{1}}**?",
    checkFormatPermutations: "Please only enter an integer.",
  },
  de: {
    name: "Heap-Verständnis",
    description: "Überprüfe grundlegende Heap-Eigenschaften",
    taskCorrectness:
      "Welche der folgenden Arrays erfüllen alle **Heap-Eigenschaften** für einen **{{0}}-Heap**?",
    taskNeighbours:
      "Wir betrachten einen **Heap** der als Array $[1,\\dots,n]$ implementiert ist. Was ist der Index des **{{0}}** des Elements an **Index {{1}}*?",
    checkFormatPermutations: "Bitte etwas ganzzahliges eingeben.",
  },
}

export const HeapVerifying: QuestionGenerator = {
  id: "heapverify",
  name: tFunctional(translationsHeapVerifying, "name"),
  description: tFunctional(translationsHeapVerifying, "description"),
  tags: ["heap", "priority-queue"],
  languages: ["en", "de"],
  expectedParameters: [
    {
      type: "string",
      name: "variant",
      allowedValues: ["correctness"],
    },
  ],

  generate: (lang = "en", parameters, seed) => {
    const permaLink = serializeGeneratorCall({
      generator: HeapVerifying,
      lang,
      parameters,
      seed,
    })
    const random = new Random(seed)

    const heapType: "Max" | "Min" = random.choice(["Max", "Min"])
    const { heapStringTable, correctAnswerIndex } = generateHeapsForChoiceQuestion(
      heapType,
      random,
      lang,
    )

    const question: MultipleChoiceQuestion = {
      type: "MultipleChoiceQuestion",
      name: HeapVerifying.name(lang),
      path: permaLink,
      text: t(translationsHeapVerifying, lang, "taskCorrectness", [heapType]),
      answers: heapStringTable,
      feedback: minimalMultipleChoiceFeedback({ correctAnswerIndex }),
      allowMultiple: true,
    }
    return { question }
  },
}

import {
  minimalMultipleChoiceFeedback,
  type MultipleChoiceQuestion,
  type QuestionGenerator,
} from "@shared/api/QuestionGenerator"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter"
import { generateHeapsForChoiceQuestion } from "@shared/question-generators/heap/utils/utilsGenerate"
import Random from "@shared/utils/random"
import { t, tFunctional, type Translations } from "@shared/utils/translations"

const translationsHeapVerifying: Translations = {
  en: {
    name: "Heap-Verifying",
    description: "Verify basic heap properties",
    taskCorrectness:
      "Which of the following arrays satisfy all **heap properties** for a **{{0}}-Heap**?",
  },
  de: {
    name: "Heap-Verständnis",
    description: "Überprüfe grundlegende Heap-Eigenschaften",
    taskCorrectness:
      "Welche der folgenden Arrays erfüllen alle **Heap-Eigenschaften** für einen **{{0}}-Heap**?",
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

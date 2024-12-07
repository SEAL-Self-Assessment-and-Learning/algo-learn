import { QuestionGenerator } from "@shared/api/QuestionGenerator.ts"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter.ts"
import { generateVariantSequenceChar } from "@shared/question-generators/Queue/utilsSequenceChar.ts"
import { generateVariantSequenceQueue } from "@shared/question-generators/Queue/utilsSequenceQueue.ts"
import { generateVariantStart } from "@shared/question-generators/Queue/utilsStart.ts"
import Random from "@shared/utils/random.ts"
import { tFunctional, Translations } from "@shared/utils/translations.ts"

const translations: Translations = {
  en: {
    name: "Queues",
    description: "Perform queue operations",
    solutionFreetext: `|Index|Question|Solution|\n{{0}}`,
    performOperations: `**We perform the following operations:**{{0}}`,
    checkFormat: "Please only enter a number.",
    checkFormatSeqChar: "Please only enter letters",
    checkFormatBool: "Please only enter *false* or *true*",
    queueEmpty: "Currently the queue is empty.",
    queueContainsValues: `The queue currently contains the following elements (*with the front at the lowest index*):`,
    freeTextInput: `Consider a **Queue "Q"**. ` + `{{0}} **We perform the following operations:** {{1}}`,
    sequenceQueueText: `Consider an initially empty queue on which the operations {{0}} are executed. Enter the final state of the queue. {{1}} *(The front element is at the lowest index, shift the elements to index *$0$*.)*`,
    sequenceCharText: `Let Q be a queue. Perform the following operations from left to right: A character \`i\` stands for \`Q.enqueue(i)\` and \`*\` stands for \`Q.dequeue()\`.
                    \\[\\texttt{{{0}}}\\]
                    Enter the sequence of characters that are output by the \`dequeue\` calls.`,
  },
  de: {
    name: "Queues",
    description: "Queue-Operationen ausführen",
    solutionFreetext: `|Index|Frage|Lösung|\n{{0}}`,
    performOperations: `**Wir führen nun folgende Operationen aus:**{{0}}`,
    checkFormat: "Bitte gib nur Zahlen ein.",
    checkFormatSeqChar: "Bitte gib nur Buchstaben ein.",
    checkFormatBool: "Bitte gib nur *false* oder *true* ein.",
    queueEmpty: "Die Queue ist aktuell leer.",
    queueContainsValues: `Die Queue enthält aktuell folgende Elemente (*mit dem Front-Element am niedrigsten Index*):`,
    freeTextInput:
      `Betrachte eine **Queue "Q"**. ` + `{{0}} **Wir führen die folgenden Operationen aus:** {{1}}`,
    sequenceQueueText: `Betrachte eine anfangs leere Queue, auf dem die Operationen {{0}} ausgeführt werden. Gib den finalen Zustand der Queue an. {{1}} *(Das vorderste Element ist am niedrigsten Index, verschiebe die Elemente an den index *$0$}*.)*`,
    sequenceLetterText: `Sei Q eine Queue. Führe die folgenden Operationen von links nach rechts aus: Ein Zeichen \`i\` steht hierbei für \`Q.enqueue(i)\` und \`*\` steht für \`Q.dequeue()\`.
                    \\[\\texttt{{{0}}}\\]
                    Gib die Sequenz der Zeichen an, die durch die \`dequeue\`-Aufrufe ausgegeben werden.`,
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
      allowedValues: ["start", "seqQueue", "seqLetter"],
    },
  ],

  generate: (lang = "en", parameters, seed) => {
    const permalink = serializeGeneratorCall({
      generator: queueQuestion,
      lang,
      parameters,
      seed,
    })

    const random = new Random(seed)
    const variant = parameters.variant as "start" | "seqQueue" | "seqLetter"

    if (variant === "start") {
      return generateVariantStart(lang, random, permalink, translations, wordTranslations)
    } else if (variant === "seqQueue") {
      return generateVariantSequenceQueue(lang, random, permalink, translations)
    } else {
      return generateVariantSequenceChar(lang, random, permalink, translations)
    }
  },
}

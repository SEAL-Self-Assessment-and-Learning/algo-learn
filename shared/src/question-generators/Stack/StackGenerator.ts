import type { QuestionGenerator } from "@shared/api/QuestionGenerator.ts"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter.ts"
import { generateVariantPopSeq } from "@shared/question-generators/Stack/utilsArray.ts"
import { generateVariantDetailed } from "@shared/question-generators/Stack/utilsDetailed.ts"
import { generateVariantArray } from "@shared/question-generators/Stack/utilsPopSeq.ts"
import Random from "@shared/utils/random.ts"
import { tFunctional, type Translations } from "@shared/utils/translations.ts"

const translations: Translations = {
  en: {
    name: "Stacks",
    description: "Perform stack operations",
    solutionFreetext: "|Index|Question|Solution|\n{{0}}",
    performOperations: `**We perform the following operations:**{{0}}`,
    checkFormat: "Please only enter numbers",
    checkFormatSeqLetter: "Please only enter letters",
    checkFormatBool: "Please only enter *true* or *false*",
    stackEmpty: "Currently the stack is empty.",
    stackContainsValues: `The stack contains the following elements (*with the top at the highest index*):`,
    freeTextInput: `Consider a **Stack "S"**. {{0}} **We perform the following operations:** {{1}}`,
    arrayStackText: `Consider an initially empty stack on which the operations {{0}} are executed. Enter the final state of the stack. {{1}} *(The top element is at the highest index.)*`,
    popSeqText: `Let S be a stack. Perform the following operations from left to right: A letter \`x\` stands for \`S.push(x)\` and \`*\` stands for \`S.pop()\`.
                    \\[\\texttt{{{0}}}\\]
                    Enter the sequence of letters that are output by the \`pop\` calls.`,
  },
  de: {
    name: "Stacks",
    description: "Stack-Operationen ausführen",
    solutionFreetext: "|Index|Frage|Lösung|\n{{0}}",
    performOperations: `**Wir führen folgende Operationen aus:**{{0}}`,
    checkFormat: "Bitte gib nur Zahlen ein.",
    checkFormatSeqLetter: "Bitte gib nur Buchstaben ein.",
    checkFormatBool: "Bitte gib nur *true* oder *false* ein.",
    stackEmpty: "Der Stack ist aktuell leer.",
    stackContainsValues: `Der Stack enthält folgende Elemente (*mit dem Top-Element am höchsten Index*):`,
    freeTextInput: `Betrachte einen **Stack "S"**. {{0}} **Wir führen nun folgende Operationen aus:** {{1}}`,
    arrayStackText: `Betrachte einen anfangs leeren Stapel, auf dem die Operationen {{0}} ausgeführt werden. Gib den finalen Zustand des Stapels an. {{1}} *(Das Top Element ist am höchsten Index.)*`,
    popSeqText: `Sei S ein Stapel. Führe die folgenden Operationen von links nach rechts aus: Ein Buchstabe \`x\` steht hierbei für \`S.push(x)\` und \`*\` steht für \`S.pop()\`.
                    \\[\\texttt{{{0}}}\\]
                    Gib die Sequenz der Buchstaben an, die durch die \`pop\`-Aufrufe ausgegeben werden.`,
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

export const stackQuestion: QuestionGenerator = {
  id: "stack",
  name: tFunctional(translations, "name"),
  description: tFunctional(translations, "description"),
  tags: ["stack"],
  languages: ["en", "de"],
  expectedParameters: [
    {
      type: "string",
      name: "variant",
      allowedValues: ["detailed", "array", "pop-seq"],
    },
  ],

  /**
   * Generates a new Stack question
   *
   * @param lang The language of the question
   * @param parameters The parameters for the question. In this case, none are used.
   * @param seed The seed for the random number generator
   * @returns A new MultipleChoiceQuestion question
   */
  generate: (lang = "en", parameters, seed) => {
    const random = new Random(seed)
    const variant = parameters.variant as "detailed" | "array" | "pop-seq"

    const permalink = serializeGeneratorCall({
      generator: stackQuestion,
      lang,
      parameters,
      seed,
    })

    if (variant === "detailed") {
      return generateVariantDetailed(lang, random, permalink, translations, wordTranslations)
    } else if (variant === "array") {
      return generateVariantArray(lang, random, permalink, translations)
    } else {
      return generateVariantPopSeq(lang, random, permalink, translations)
    }
  },
}

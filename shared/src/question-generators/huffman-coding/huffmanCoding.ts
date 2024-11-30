// TODO: check if the table could be to wide to be represented as possible answer (mobile)

import { QuestionGenerator } from "@shared/api/QuestionGenerator"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter"
import {
  generateChoice2Question,
  generateInput2Question,
} from "@shared/question-generators/huffman-coding/utils/utilsDict.ts"
import {
  generateChoiceQuestion,
  generateInputQuestion,
} from "@shared/question-generators/huffman-coding/utils/utilsWord.ts"
import Random from "@shared/utils/random"
import { tFunctional, Translations } from "@shared/utils/translations"

/**
 * All text displayed text goes into the translation object.
 * Include at least english and german.
 */
const translations: Translations = {
  en: {
    name: "Huffman-Coding",
    description: "Compute the Huffman-Coding of a given string",
    text: "What is a correct **Huffman encoding** of the string `{{0}}`?",
    textChoice: "What are correct **Huffman encodings** of the string `{{0}}`?",
    prompt: "What is a possible Huffman-Coding?",
    textTable: `Suppose we have the following table, which represents how often each character appears in a given string:
{{0}}
What could be a correct **Huffman-Coding** for each letter?`,
    feedbackInvalid: "Can only contain 1 and 0",
    multiInputText: `Suppose we have the following table, which represents how often each character appears in a given string:
{{0}}
Construct a correct **Huffman-Code** for the given string.
{{1}}`,
  },
  de: {
    name: "Hufmann-Codierung",
    description: "Bestimme die Huffman-Codierung eines gegebenen Strings",
    text: 'Was ist eine korrekte **Huffman-Kodierung** für den String "*{{0}}*"?',
    textChoice: 'Was sind korrekte **Huffman-Kodierungen** für den String "*{{0}}*"?',
    prompt: "Was ist eine mögliche Huffman-Kodierung?",
    textTable: `Angenommen wir habe die folgende Tabelle, welche angibt, wie oft jeder Buchstabe in einem gegebenen String vorkommt:
{{0}}
        Was wäre eine korrekte **Huffman-Codierung** für jeden Buchstaben?`,
    feedbackInvalid: "Darf nur 1 und 0 enthalten",
    multiInputText: `Betrachte die folgende Tabelle, welche angebibt, wie oft jeder Buchstabe in einem gegebenen String vorkommt:
{{0}}
Konstruiere einen korrekten **Huffman-Code** für den gegebenen String.
{{1}}`,
  },
}

export const huffmanCoding: QuestionGenerator = {
  id: "huffman",
  name: tFunctional(translations, "name"),
  description: tFunctional(translations, "description"),
  languages: ["en", "de"],
  expectedParameters: [
    {
      type: "string",
      name: "variant",
      allowedValues: ["choice", "input"],
    },
  ],

  /**
   * Generates a new question (currently only MultipleChoiceQuestion)
   * @param lang provided language
   * @param parameters the following options are possible
   *                      - choice-1: this displays a "real" word with at most 13 chars, it has a unique coding
   *                                  only the 1 and 0 can be flipped. The goal is to find the correct Huffman Coding
   *                                  of the String
   *                      - input-1:  this has the same base as choice-1, but instead of options, the user has to
   *                                  provide an input
   *                      - choice-2: Here the user does not get a word anymore (instead a table or an array), but
   *                                  here the user has to find the correct coding of the letters and do not concat
   *                                  those
   * @param seed
   */
  generate: (lang, parameters, seed) => {
    // first create a permalink for the question
    const permalink = serializeGeneratorCall({
      generator: huffmanCoding,
      lang,
      parameters,
      seed,
    })

    const random = new Random(seed)

    const variantParameter = parameters.variant as "choice" | "input"
    let variant: "choice" | "choice2" | "input" | "input2"
    if (variantParameter === "choice") {
      variant = random.choice(["choice", "choice2"])
    } else {
      variant = random.choice(["input", "input2"])
    }

    // use function from utils to generate a question for each variant
    if (variant === "choice") {
      return generateChoiceQuestion({
        random,
        translations,
        lang,
        permalink,
      })
    } else if (variant === "input") {
      return generateInputQuestion({
        random,
        translations,
        lang,
        permalink,
      })
    } else if (variant === "choice2") {
      return generateChoice2Question({
        random,
        translations,
        lang,
        permalink,
      })
    } else {
      return generateInput2Question({
        random,
        translations,
        lang,
        permalink,
      })
    }
  },
}

import type { QuestionGenerator } from "@shared/api/QuestionGenerator.ts"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter.ts"
import {
  generateReverseDouble,
  generateReverseLinear,
} from "@shared/question-generators/Hashing/utilsReverse.ts"
import Random from "@shared/utils/random.ts"
import { t, tFunctional, type Translations } from "@shared/utils/translations.ts"

const universalFunction = "h(x) = ((a \\cdot x + b) \\mod p) \\mod m \\]"
const doubleFunction =
  "\\[ f(x) = a \\cdot x \\bmod m \\] \n\n" +
  "\\[ g(x) = (m - 1) - (x \\bmod (m-1)) \\] \n\n" +
  "\\[ h_i(x) = (f(x) + i \\cdot g(x)) \\bmod m \\]"

const translations: Translations = {
  en: {
    name: "Hashing Reverse",
    description: "Find a hash function that produces a given hash table",
    text: `Given the following hash table: {{0}} We insert the values \`{{1}}\` in the given order, resulting in the following hash table: {{2}}
    Our used hash function has the form:
    {{3}} 
    Find correct values for {{4}}, such that inserting the values in the first table results in the second table. {{5}}`,
    invalidInputSize: "$m$ has to the size of the hash table.",
    linearMissing: "$a$, $b$, $p$ and $m$",
    doubleMissing: "$a$ and $m$",
  },
  de: {
    name: "Hashing Reverse",
    description: "Finde eine Hash-Funktion, die eine gegebene Hash-Tabelle erzeugt",
  },
}

export const hashingReverseGenerator: QuestionGenerator = {
  name: tFunctional(translations, "name"),
  id: "hashingrev",
  description: tFunctional(translations, "description"),
  tags: ["hashing", "reverse", "hash-function"],
  languages: ["en", "de"],
  expectedParameters: [
    {
      type: "string",
      name: "variant",
      allowedValues: ["linear", "double"],
    },
  ],

  generate(lang, parameters, seed) {
    const random = new Random(seed)

    const permalink = serializeGeneratorCall({
      generator: hashingReverseGenerator,
      lang,
      parameters,
      seed,
    })

    const variant: "linear" | "double" = parameters.variant as "linear" | "double"

    if (variant === "linear") {
      const { firstMap, secondMap, toInsert, inputFieldTable, checkFormat, feedback } =
        generateReverseLinear(random, translations, lang)
      return {
        question: {
          type: "MultiFreeTextQuestion",
          name: t(translations, lang, "name"),
          path: permalink,
          fillOutAll: true,
          text: t(translations, lang, "text", [
            firstMap,
            toInsert.toString(),
            secondMap,
            universalFunction,
            t(translations, lang, "linearMissing"),
            inputFieldTable,
          ]),
          checkFormat,
          feedback,
        },
      }
    } else {
      const { firstMap, secondMap, toInsert, inputFieldTable, checkFormat, feedback } =
        generateReverseDouble(random, translations, lang)
      return {
        question: {
          type: "MultiFreeTextQuestion",
          name: t(translations, lang, "name"),
          path: permalink,
          fillOutAll: true,
          text: t(translations, lang, "text", [
            firstMap,
            toInsert.toString(),
            secondMap,
            doubleFunction,
            t(translations, lang, "doubleMissing"),
            inputFieldTable,
          ]),
          checkFormat,
          feedback,
        },
      }
    }
  },
}

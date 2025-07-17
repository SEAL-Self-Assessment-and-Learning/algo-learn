import type { QuestionGenerator } from "@shared/api/QuestionGenerator.ts"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter.ts"
import { generateReverseLinear } from "@shared/question-generators/Hashing/utilsReverse.ts"
import Random from "@shared/utils/random.ts"
import { t, tFunctional, type Translations } from "@shared/utils/translations.ts"

const translations: Translations = {
  en: {
    name: "Hashing Reverse",
    description: "Find a hash function that produces a given hash table",
    text: `Given the following hash table: {{0}} We insert the values {{1}} in the given order, resulting in the following hash table: {{2}}
    Our used hash function has the form:
    \\[ {{3}} \\]
    Find correct values for **a**, **b** and **p**, such that inserting the values in the first table results in the second table. {{4}}`,
    universalFunction: "h(x) = ((a \\cdot x + b) \\mod p) \\mod {{0}}",
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

    let variant: "linear" | "double" = parameters.variant as "linear" | "double"
    variant = "linear"

    if (variant === "linear") {
      const { firstMap, secondMap, toInsert, inputFieldTable, size, checkFormat, feedback } =
        generateReverseLinear(random, lang)
      return {
        question: {
          type: "MultiFreeTextQuestion",
          name: t(translations, lang, "name"),
          path: permalink,
          fillOutAll: true,
          text: t(translations, lang, "text", [
            firstMap,
            "$" + toInsert.toString() + "$",
            secondMap,
            t(translations, lang, "universalFunction", [size.toString()]),
            inputFieldTable,
          ]),
          checkFormat,
          feedback,
        },
      }
    } else {
      return {
        question: {
          type: "FreeTextQuestion",
          name: t(translations, lang, "name"),
          path: permalink,
          text: t(translations, lang, "text", []),
        },
      }
    }
  },
}

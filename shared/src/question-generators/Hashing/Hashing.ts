import { QuestionGenerator } from "@shared/api/QuestionGenerator.ts"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter.ts"
import { generateQuestionLinearProbing } from "@shared/question-generators/Hashing/utils.ts"
import Random from "@shared/utils/random.ts"
import { t, tFunctional, Translations } from "@shared/utils/translations.ts"

const translations: Translations = {
  en: {
    name: "Hashing",
    description: "Correctly insert value into a hash map",
    insert: "We **insert** the following keys: {{0}}",
    delete: "and then **delete** the following keys: {{0}}",
    textLinear: `Consider a hash table (size \${{0}}$) implemented with  "Linear Probing". 
{{1}}
{{2}}
    The hash-function is: 
    {{3}} 
    How is the state of the field after the operations?`,
    bottomTextLinear: `Please enter the state of the map after the operations in the format of an Array. You can keep free entries empty or just spaces.`,
    checkFormatLinear: "Please Provide an array only with numbers, commas and spaces",
  },
  de: {
    name: "Hashing",
    description: "Füge den Wert korrekt in eine Hash-Map ein",
    insert: "Wir **fügen** die folgenden Schlüssel ein: {{0}}",
    delete: "und dann **löschen** wir die folgenden Schlüssel: {{0}}",
    textLinear: `Betrachten Sie eine Hashtabelle (Größe \${{0}}$), die mit "Linear Probing" implementiert ist.
{{1}}
{{2}}
    Die Hash-Funktion ist: 
    {{3}}
    Wie ist der Zustand des Feldes nach den Operationen?`,
    bottomTextLinear: `Bitte geben Sie den Zustand der Karte nach den Operationen im Format eines Arrays ein. Sie können freie Einträge leer lassen oder einfach Leerzeichen verwenden.`,
    checkFormatLinear: "Bitte geben Sie nur ein Array mit Zahlen, Kommas und Leerzeichen an",
  },
}

export const hashingGenerator: QuestionGenerator = {
  name: tFunctional(translations, "name"),
  id: "hashing",
  description: tFunctional(translations, "description"),
  tags: ["hashing", "hash-map", "hash-list", "hash-function"],
  languages: ["en", "de"],
  expectedParameters: [
    {
      type: "string",
      name: "variant",
      allowedValues: ["linear"], //Todo: Add linked
    },
  ],

  generate(lang, parameters, seed) {
    const random = new Random(seed)

    const permalink = serializeGeneratorCall({
      generator: hashingGenerator,
      lang,
      parameters,
      seed,
    })

    const variant = parameters.variant as "linked" | "linear"

    if (variant === "linked") {
      throw new Error("Linked Hashing is not yet implemented")
    } else {
      const {
        tableSize,
        tableSizeVariable,
        randomHashFunction,
        insertString,
        deleteString,
        checkFormat,
        feedback,
      } = generateQuestionLinearProbing(random, translations, lang)

      return {
        question: {
          type: "FreeTextQuestion",
          name: t(translations, lang, "name"),
          path: permalink,
          text: t(translations, lang, "textLinear", [
            tableSizeVariable + "=" + tableSize.toString(),
            insertString,
            deleteString,
            randomHashFunction.hashFunctionString,
          ]),
          bottomText: t(translations, lang, "bottomTextLinear"),
          placeholder: "[ ,5, ,3,...",
          feedback,
          checkFormat,
        },
      }
    }
  },
}

import { QuestionGenerator } from "@shared/api/QuestionGenerator.ts"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter.ts"
import {
  generateQuestionLinearProbing,
  generateQuestionLinkedHashing,
} from "@shared/question-generators/Hashing/utils.ts"
import Random from "@shared/utils/random.ts"
import { t, tFunctional, Translations } from "@shared/utils/translations.ts"

const translations: Translations = {
  en: {
    name: "Hashing",
    description: "Correctly insert value into a hash map",
    linearProbing: "Linear Probing",
    linkedList: "Linked List",
    Values: "Values",
    insert: "We **insert** the following keys: {{0}}",
    delete: "and then **delete** the following keys: {{0}}",
    text: `Consider a hash table (size \${{0}}$) implemented with  "{{1}}". 
{{2}}
{{3}}
    The hash-function is: 
{{4}} 
    How is the state of the field after the operations?
    {{5}}`,
    bottomTextLinear: `Please enter the state of the map after the operations in the format of an Array. You can keep free entries empty or just spaces.`,
    checkFormatLinear: "Please Provide an array only with numbers, commas and spaces",
    checkFormat: "Please enter a list of numbers",
  },
  de: {
    name: "Hashing",
    description: "Füge den Wert korrekt in eine Hash-Map ein",
    linearProbing: "Lineares Sondieren",
    linkedList: "Verkettete Liste",
    Values: "Werte",
    insert: "Wir **fügen** die folgenden Schlüssel ein: {{0}}",
    delete: "und dann **löschen** wir die folgenden Schlüssel: {{0}}",
    text: `Betrachten Sie eine Hashtabelle (Größe \${{0}}$), die mit "{{1}}" implementiert ist.
{{2}}
{{3}}
    Die Hash-Funktion ist: 
{{4}}
    Wie ist der Zustand des Feldes nach den Operationen?
{{5}}`,
    bottomTextLinear: `Bitte geben Sie den Zustand der Karte nach den Operationen im Format eines Arrays ein. Sie können freie Einträge leer lassen oder einfach Leerzeichen verwenden.`,
    checkFormatLinear: "Bitte geben Sie nur ein Array mit Zahlen, Kommas und Leerzeichen an",
    checkFormat: "Bitte gib eine Liste von Zahlen ein",
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
      allowedValues: ["linear", "linked"],
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
      const {
        tableSize,
        tableSizeVariable,
        randomHashFunction,
        insertValuesString,
        deleteValuesString,
        inputTableString,
        checkFormat,
        feedback,
      } = generateQuestionLinkedHashing(random, translations, lang)

      return {
        question: {
          type: "MultiFreeTextQuestion",
          name: t(translations, lang, "name"),
          path: permalink,
          text: t(translations, lang, "text", [
            tableSizeVariable + "=" + tableSize.toString(),
            t(translations, lang, "linkedList"),
            insertValuesString,
            deleteValuesString,
            randomHashFunction.hashFunctionString,
            inputTableString,
          ]),
          fillOutAll: false,
          bottomText: t(translations, lang, "bottomTextLinear"),
          checkFormat,
          feedback,
        },
      }
    } else {
      const {
        tableSize,
        tableSizeVariable,
        randomHashFunction,
        insertValuesString,
        deleteValuesString,
        checkFormat,
        feedback,
      } = generateQuestionLinearProbing(random, translations, lang)
      return {
        question: {
          type: "FreeTextQuestion",
          name: t(translations, lang, "name"),
          path: permalink,
          text: t(translations, lang, "text", [
            tableSizeVariable + "=" + tableSize.toString(),
            t(translations, lang, "linearProbing"),
            insertValuesString,
            deleteValuesString,
            randomHashFunction.hashFunctionString,
            "", // empty (only needed for linked)
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

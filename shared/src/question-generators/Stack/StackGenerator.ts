import {
  MultiFreeTextFeedbackFunction,
  MultiFreeTextFormatFunction,
  MultiFreeTextQuestion,
  QuestionGenerator,
} from "@shared/api/QuestionGenerator.ts"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter.ts"
import {
  createStackInputFields,
  generateOperationsFreetextStack,
  generateStackStartElements,
} from "@shared/question-generators/Stack/utils.ts"
import Random from "@shared/utils/random.ts"
import { t, tFunction, tFunctional, Translations } from "@shared/utils/translations.ts"

const translations: Translations = {
  en: {
    name: "Stacks",
    description: "Perform stack operations",
    solutionFreetext: "|Index|Question|Solution|\n{{0}}",
    performOperations: `**We perform the following operations:**{{0}}`,
    checkFormat: "Please only enter a number",
    checkFormatBool: "Please only enter *true* or *false*",
    stackEmpty: "Currently the stack is empty.",
    stackContainsValues: `The stack contains the following elements (*with the top at the highest index*):`,
    freeTextInput: `Consider a **Stack "S"**. {{0}} **We perform the following operations:** {{1}}`,
  },
  de: {
    name: "Stacks",
    description: "Stack-Operationen ausführen",
    solutionFreetext: "|Index|Frage|Lösung|\n{{0}}",
    performOperations: `**Wir führen folgende Operationen aus:**{{0}}`,
    checkFormat: "Bitte gib nur Zahlen ein.",
    checkFormatBool: "Bitte gib nur *true* oder *false* ein.",
    stackEmpty: "Der Stack ist aktuell leer.",
    stackContainsValues: `Der Stack enthält folgende Elemente (*mit dem Top-Element am höchsten Index*):`,
    freeTextInput: `Betrachte einen **Stack "S"**. {{0}} **Wir führen nun folgende Operationen aus:** {{1}}`,
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
      allowedValues: ["input"],
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

    const permalink = serializeGeneratorCall({
      generator: stackQuestion,
      lang,
      parameters,
      seed,
    })

    // TODO: same checkFormat as in QueueGenerator, future extract those into seperate file
    //       structure is inside QuickFind PR
    const checkFormat: MultiFreeTextFormatFunction = ({ text }, fieldID) => {
      // check if the text provided is for the toString question
      if (fieldID.includes("empty")) {
        // test if either false or true
        if (text[fieldID].trim() !== "true" && text[fieldID].trim() !== "false") {
          return { valid: false, message: t(translations, lang, "checkFormatBool") }
        }
        return { valid: true, message: "" }
      }
      // else check if the text only contains numbers
      if (!/^\d+$/.test(text[fieldID])) {
        return { valid: false, message: t(translations, lang, "checkFormat") }
      }
      return { valid: true, message: "" }
    }

    const feedback: MultiFreeTextFeedbackFunction = ({ text }) => {
      // renaming for better understanding
      const resultMap: { [key: string]: string } = text

      let foundError = false
      let count = 0
      for (const key in resultMap) {
        const firstSolutionPart: string = solutionDisplay[count].split("|").slice(0, 3).join("|") + "|"
        if (resultMap[key].trim() !== correctAnswers[key].trim()) {
          foundError = true
          const secondSolutionPart: string = "**" + correctAnswers[key] + "**|\n"
          solutionDisplay[count] = firstSolutionPart + secondSolutionPart
        }
        count++
      }
      if (foundError) {
        return {
          correct: false,
          message: tFunction(translations, lang).t("feedback.incomplete"),
          correctAnswer: t(translations, lang, "solutionFreetext", [
            "|:--:|:--|:--:|\n" + solutionDisplay.join(""),
          ]),
        }
      }
      return {
        correct: true,
        message: tFunction(translations, lang).t("feedback.correct"),
      }
    }

    const { stackElementsString, stackElementsValues } = generateStackStartElements({
      random,
      translations,
      lang,
    })
    const operations = generateOperationsFreetextStack(stackElementsValues, random).operations

    const { solutionDisplay, inputText, correctAnswers } = createStackInputFields({
      operations,
      lang,
      translations: wordTranslations,
    })

    const question: MultiFreeTextQuestion = {
      type: "MultiFreeTextQuestion",
      name: stackQuestion.name(lang),
      path: permalink,
      fillOutAll: true,
      text: t(translations, lang, "freeTextInput", [stackElementsString, inputText]),
      checkFormat,
      feedback,
    }
    const testing = { correctAnswer: correctAnswers }

    return { question, testing }
  },
}

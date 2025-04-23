import type {
  MultiFreeTextFeedbackFunction,
  MultiFreeTextFormatFunction,
  MultiFreeTextQuestion,
  QuestionGenerator,
} from "@shared/api/QuestionGenerator.ts"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter.ts"
import {
  createQueueInputFields,
  generateOperationsQueueFreetext,
  generateQueueStartElements,
} from "@shared/question-generators/Queue/utils.ts"
import Random from "@shared/utils/random.ts"
import { t, tFunction, tFunctional, type Translations } from "@shared/utils/translations.ts"

const translations: Translations = {
  en: {
    name: "Queues",
    description: "Perform queue operations",
    solutionFreetext: `\n|**Index**|**Question**|**Solution**|\n|===|===|===|\n{{0}}`,
    checkFormat: "Please only enter a number.",
    checkFormatBool: "Please only enter *false* or *true*",
    queueEmpty: "Currently the queue is empty.",
    queueContainsValues: `The queue currently contains the following elements (*with the front at the lowest index*):`,
    freeTextInput: `Consider a **Queue "Q"**. {{0}} **We perform the following operations:**\n\n{{1}}`,
  },
  de: {
    name: "Queues",
    description: "Queue-Operationen ausführen",
    solutionFreetext: `|**Index**|**Frage**|**Lösung**|\n|===|===|===|\n{{0}}`,
    checkFormat: "Bitte gib nur Zahlen ein.",
    checkFormatBool: "Bitte gib nur *false* oder *true* ein.",
    queueEmpty: "Die Queue ist aktuell leer.",
    queueContainsValues: `Die Queue enthält aktuell folgende Elemente (*mit dem Front-Element am niedrigsten Index*):`,
    freeTextInput: `Betrachte eine **Queue "Q"**. {{0}}\n\n**Wir führen die folgenden Operationen aus:**\n\n{{1}}`,
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
      allowedValues: ["input"],
    },
  ],

  generate: (lang = "en", parameters, seed) => {
    const random = new Random(seed)

    const permalink = serializeGeneratorCall({
      generator: queueQuestion,
      lang,
      parameters,
      seed,
    })

    // TODO: same checkFormat as in StackGenerator, future extract those into seperate file
    //       structure is inside QuickFind PR
    const checkFormat: MultiFreeTextFormatFunction = ({ text }, fieldID) => {
      if (fieldID.includes("empty")) {
        // check if either "true" or "false"
        if (
          text[fieldID].trim().toLowerCase() !== "true" &&
          text[fieldID].trim().toLowerCase() !== "false"
        ) {
          return { valid: false, message: t(translations, lang, "checkFormatBool") }
        }
        return { valid: true, message: "" }
      }

      // check if is a number
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
        if (resultMap[key].trim().toLowerCase() !== correctAnswers[key].trim()) {
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
          correctAnswer: t(translations, lang, "solutionFreetext", [solutionDisplay.join("")]),
        }
      }
      return {
        correct: true,
        message: tFunction(translations, lang).t("feedback.correct"),
      }
    }

    const { startElements, queueInformationElements } = generateQueueStartElements({
      random,
      translations,
      lang,
    })
    const operations = generateOperationsQueueFreetext(startElements, random).operations
    const { inputText, solutionDisplay, correctAnswers } = createQueueInputFields({
      operations,
      lang,
      translations: wordTranslations,
    })

    const question: MultiFreeTextQuestion = {
      type: "MultiFreeTextQuestion",
      name: queueQuestion.name(lang),
      path: permalink,
      text: t(translations, lang, "freeTextInput", [queueInformationElements, inputText]),
      fillOutAll: true,
      checkFormat,
      feedback,
    }
    const testing = {
      correctAnswer: correctAnswers,
    }

    return { question, testing }
  },
}

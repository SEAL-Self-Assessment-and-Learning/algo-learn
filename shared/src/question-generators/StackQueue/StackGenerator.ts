import {
  MultiFreeTextFeedbackFunction,
  MultiFreeTextFormatFunction,
  MultiFreeTextQuestion,
  QuestionGenerator,
} from "@shared/api/QuestionGenerator.ts"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter.ts"
import { Stack } from "@shared/question-generators/StackQueue/Stack.ts"
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
    stackContainsValues: `The stack contains the following elements:`,
    freeTextInput:
      `Consider a **Stack "{{0}}"** implemented as a dynamic array. ` +
      `{{1}} **We perform the following operations:** {{2}}`,
  },
  de: {
    name: "Stacks",
    description: "Stack-Operationen ausführen",
    solutionFreetext: "|Index|Frage|Lösung|\n{{0}}",
    performOperations: `**Wir führen folgende Operationen aus:**{{0}}`,
    checkFormat: "Bitte gib nur Zahlen ein.",
    checkFormatBool: "Bitte gib nur *true* oder *false* ein.",
    stackEmpty: "Der Stack ist aktuell leer.",
    stackContainsValues: `Der Stack enthält aktuell folgende Elemente:`,
    freeTextInput:
      `Betrachte einen **Stack "{{0}}"** implementiert als dynamisches Array. ` +
      `{{1}} **Wir führen nun folgende Operationen aus:** {{2}}`,
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

function generateOperationsFreetextStack(elements: number[], random: Random) {
  const stack: Stack = new Stack(8, true)
  // initialize the stack with the elements
  for (const value of elements) {
    stack.push(value)
  }

  let usedIsEmpty: boolean = false

  const operations: { [key: string]: string }[] = []

  const numOfOperations = random.int(7, 9)

  for (let i = 0; i < numOfOperations; i++) {
    const isEmptyOrPushPop: "empty" | "pushPop" = usedIsEmpty
      ? "pushPop"
      : random.weightedChoice(["empty", "pushPop"], [0.05, 0.95])

    if (isEmptyOrPushPop === "empty") {
      usedIsEmpty = true
      operations.push({ empty: stack.isEmpty().toString() })
    } else {
      let pushOrPop = random.weightedChoice([
        [true, 0.35],
        [false, 0.65],
      ])
      // only check if array empty, because we are in state of resizing possible
      if (stack.getCurrentPosition() === 0) pushOrPop = true
      if (pushOrPop) {
        const pushValue = random.int(1, 20)
        operations.push({ push: pushValue.toString() })
        stack.push(pushValue)
      } else {
        const topValue = stack.getTop()
        operations.push({ pop: topValue.toString() })
      }
    }
  }

  // to ensure there is at least one text field, we always add one last pop operation
  if (!stack.isEmpty()) {
    operations.push({ pop: stack.getTop().toString() })
  }

  return {
    operations,
    stack,
  }
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

    const stackName = random.choice("ABCSU".split(""))
    const stackSize = random.int(4, 8)
    // pick a number between 0 and stack size
    const stackElementsAmount = random.int(0, stackSize - 1)

    let stackElementsString: string
    const stackElementsValues = []
    if (stackElementsAmount === 0) {
      stackElementsString = t(translations, lang, "stackEmpty")
    } else {
      // create a table view of the stack
      stackElementsString = t(translations, lang, "stackContainsValues")
      for (let i = 0; i < stackElementsAmount; i++) {
        stackElementsValues.push(random.int(1, 20))
      }
      stackElementsString += `\n\n| Index | ${t(wordTranslations, lang, "value")} |\n| --- | --- |`
      for (let i = 0; i < stackElementsAmount; i++) {
        stackElementsString += `\n| ${i} | ${stackElementsValues[i]} |`
      }
      // add the new line to the table for the extra feature #div_my-5#
      stackElementsString += `\n|#div_my-5?td#| |\n`
    }

    const checkFormat: MultiFreeTextFormatFunction = ({ text }, fieldID) => {
      // check if the text provided is for the toString question
      if (correctAnswers[fieldID + "-format"] === "empty") {
        // test if either false or true
        if (text[fieldID].trim() !== "false" && text[fieldID].trim() !== "true") {
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
          const secondSolutionPart: string = "**" + correctAnswers[key] + "**\n"
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

    const generatedOperations = generateOperationsFreetextStack(stackElementsValues, random)
    const operations = generatedOperations.operations

    // Example inputfield {{test#NL#**Char: **##overlay}}
    let inputText = `\n| Operation | ${t(wordTranslations, lang, "result")} |\n| --- | --- |\n`
    const solutionDisplay: string[] = []
    let solutionIndex = 0
    const correctAnswers: { [key: string]: string } = {}
    let index = 0
    for (const operation of operations) {
      if (Object.prototype.hasOwnProperty.call(operation, "push")) {
        inputText += `|${stackName}.push(${operation.push})|(void function)|\n`
      } else {
        if (Object.prototype.hasOwnProperty.call(operation, "pop")) {
          inputText += `|${stackName}.pop()|{{input-${index}#TL###overlay}}|\n`
          solutionIndex++
          correctAnswers[`input-${index}`] = operation.pop
          correctAnswers[`input-${index}-format`] = "pop"
          solutionDisplay.push(`|${solutionIndex}|${stackName}.pop() | ${operation.pop} |\n`)
        } else if (Object.prototype.hasOwnProperty.call(operation, "empty")) {
          inputText += `|${stackName}.isEmpty()|{{input-${index}#TL##false/true#overlay}}|\n`
          solutionIndex++
          correctAnswers[`input-${index}`] = operation.empty
          correctAnswers[`input-${index}-format`] = "empty"
          solutionDisplay.push(`|${solutionIndex}|${stackName}.isEmpty() | ${operation.empty} |\n`)
        }
      }
      index++
    }

    // adding the extra feature for a div
    solutionDisplay.push("|#div_my-5?table_w-full#| |")
    inputText += `|#div_my-5?border_none?av_middle?ah_center?table_w-full#| |`

    const question: MultiFreeTextQuestion = {
      type: "MultiFreeTextQuestion",
      name: stackQuestion.name(lang),
      path: permalink,
      fillOutAll: true,
      text: t(translations, lang, "freeTextInput", [stackName, stackElementsString, inputText]),
      checkFormat,
      feedback,
    }
    const testing = { correctAnswer: correctAnswers }

    return { question, testing }
  },
}

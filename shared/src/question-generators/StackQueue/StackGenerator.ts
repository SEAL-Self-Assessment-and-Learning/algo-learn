import {
  MultiFreeTextFeedbackFunction,
  MultiFreeTextFormatFunction,
  MultiFreeTextQuestion,
  QuestionGenerator,
} from "@shared/api/QuestionGenerator"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter"
import { Stack } from "@shared/question-generators/StackQueue/Stack"
import Random from "@shared/utils/random"
import { t, tFunction, tFunctional, Translations } from "@shared/utils/translations"

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

/**
 * This functions generates the operations performed on the stack during the question
 * The user will only be asked about .pop und .isEmpty
 * @param startingElements - starting elements inside the stack
 * @param random
 */
function generateOperationsFreetextStack(startingElements: number[], random: Random) {
  const stack: Stack<number> = new Stack()

  // initialize the stack with the elements
  for (const value of startingElements) {
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
      let pushOrPop = random.bool(0.35)
      if (stack.getSize() === 0) pushOrPop = true
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

    const stackElementsAmount = random.int(0, 8)
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
      // add the new line to the table for the extra feature #div_my-5# and td for transpose definitely
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

    // Example input field {{test#NL#**Char: **##overlay}}
    let inputText = `\n| Operation | ${t(wordTranslations, lang, "result")} |\n| --- | --- |\n`
    const solutionDisplay: string[] = []
    let solutionIndex = 0
    const correctAnswers: { [key: string]: string } = {}
    let index = 0
    for (const operation of operations) {
      if (Object.prototype.hasOwnProperty.call(operation, "push")) {
        inputText += `|S.push(${operation.push})|-|\n`
      } else {
        if (Object.prototype.hasOwnProperty.call(operation, "pop")) {
          inputText += `|S.pop()|{{input-${index}#TL###overlay}}|\n`
          solutionIndex++
          correctAnswers[`input-${index}`] = operation.pop
          correctAnswers[`input-${index}-format`] = "pop"
          solutionDisplay.push(`|${solutionIndex}|S.pop() | ${operation.pop} |\n`)
        } else if (Object.prototype.hasOwnProperty.call(operation, "empty")) {
          inputText += `|S.isEmpty()|{{input-${index}#TL##false/true#overlay}}|\n`
          solutionIndex++
          correctAnswers[`input-${index}`] = operation.empty
          correctAnswers[`input-${index}-format`] = "empty"
          solutionDisplay.push(`|${solutionIndex}|S.isEmpty() | ${operation.empty} |\n`)
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
      text: t(translations, lang, "freeTextInput", [stackElementsString, inputText]),
      checkFormat,
      feedback,
    }
    const testing = { correctAnswer: correctAnswers }

    return { question, testing }
  },
}

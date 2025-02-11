import type {
  MultiFreeTextFeedbackFunction,
  MultiFreeTextFormatFunction,
  MultiFreeTextQuestion,
} from "@shared/api/QuestionGenerator.ts"
import { Stack } from "@shared/question-generators/Stack/Stack.ts"
import { stackQuestion } from "@shared/question-generators/Stack/StackGenerator.ts"
import { createArrayDisplayCodeBlock } from "@shared/utils/arrayDisplayCodeBlock.ts"
import type Random from "@shared/utils/random.ts"
import { t, tFunction, type Translations } from "@shared/utils/translations.ts"

/**
 * This functions generates the operations performed on the stack during the question
 * The user will only be asked about .pop und .isEmpty
 * @param startingElements - starting elements inside the stack
 * @param random
 */
export function generateOperationsVariantDetailed(startingElements: number[], random: Random) {
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
  }
}

/**
 * This function generates the starting elements of the stack
 * @param random .
 * @param translations .
 * @param lang .
 */
export function generateStackStartElements({
  random,
  translations,
  lang,
}: {
  random: Random
  translations: Translations
  lang: "en" | "de"
}) {
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
    stackElementsString += createArrayDisplayCodeBlock({
      array: stackElementsValues,
      lang,
    })
  }

  return { stackElementsString, stackElementsValues }
}

/**
 * This function creates the input fields for the stack question (within a table)
 * @param operations - the operations that were performed on the stack (pop, empty are the only ones that are asked)
 * @param translations .
 * @param lang .
 */
export function createStackInputFields({
  operations,
  translations,
  lang,
}: {
  operations: { [key: string]: string }[]
  translations: Translations
  lang: "en" | "de"
}) {
  // Example input field {{test#NL#**Char: **##overlay}}
  let inputText = `\n| Operation | ${t(translations, lang, "result")} |\n|===|:===:|\n`
  const solutionDisplay: string[] = []
  let solutionIndex = 0
  const correctAnswers: { [key: string]: string } = {}
  let index = 0
  for (const operation of operations) {
    if (Object.prototype.hasOwnProperty.call(operation, "push")) {
      inputText += `|S.push(${operation.push})| - |\n`
    } else {
      if (Object.prototype.hasOwnProperty.call(operation, "pop")) {
        solutionIndex++
        inputText += `|S.pop()|{{pop-${index}#TL###overlay}}|\n`
        solutionDisplay.push(`|${solutionIndex}|S.pop() | ${operation.pop} |\n`)
        correctAnswers[`pop-${index}`] = operation.pop
      } else if (Object.prototype.hasOwnProperty.call(operation, "empty")) {
        solutionIndex++
        inputText += `|S.isEmpty()|{{empty-${index}#TL##false/true#overlay}}|\n`
        solutionDisplay.push(`|${solutionIndex}|S.isEmpty() | ${operation.empty} |\n`)
        correctAnswers[`empty-${index}`] = operation.empty
      }
    }
    index++
  }

  // solutionDisplay.push("|#div_my-5?table_w-full#| |")
  // inputText += `|#div_my-5?border_none?av_middle?ah_center?table_w-full#| |`

  return { inputText, solutionDisplay, correctAnswers }
}

export function generateVariantDetailed(
  lang: "de" | "en",
  random: Random,
  permalink: string,
  translations: Translations,
  wordTranslations: Translations,
) {
  const checkFormat: MultiFreeTextFormatFunction = ({ text }, fieldID) => {
    if (fieldID.includes("empty")) {
      if (
        text[fieldID].trim().toLowerCase() !== "true" &&
        text[fieldID].trim().toLowerCase() !== "false"
      ) {
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
      if (resultMap[key].trim().toLowerCase() !== correctAnswers[key].trim()) {
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

  const { stackElementsString, stackElementsValues } = generateStackStartElements({
    random,
    translations,
    lang,
  })
  const operations = generateOperationsVariantDetailed(stackElementsValues, random).operations

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
}

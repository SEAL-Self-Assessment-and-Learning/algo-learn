import type { MultiFreeTextFeedbackFunction, MultiFreeTextQuestion } from "@shared/api/QuestionGenerator"
import { Stack } from "@shared/question-generators/Stack/Stack"
import { stackQuestion } from "@shared/question-generators/Stack/StackGenerator"
import {
  createArrayDisplayCodeBlock,
  createArrayDisplayCodeBlockUserInput,
} from "@shared/utils/arrayDisplayCodeBlock"
import type Random from "@shared/utils/random"
import { t, type Translations } from "@shared/utils/translations"

/**
 * Generates a new Stack question for the seqStack variant
 *
 * Generates a sequence of push and pop operations
 * and asks the user for the final state of the stack
 *
 * @param lang
 * @param random
 * @param permalink
 * @param translations
 */
export function generateVariantArray(
  lang: "de" | "en",
  random: Random,
  permalink: string,
  translations: Translations,
) {
  const { operations, stack } = generateOperationsVariantArray(random)
  const { arrayDisplayBlock } = createArrayDisplayCodeBlockUserInput({
    numberOfInputFields: operations.length,
    lang,
  })

  const feedback: MultiFreeTextFeedbackFunction = ({ text }) => {
    const correctAnswer = {
      correct: false,
      correctAnswer: createArrayDisplayCodeBlock({
        array: [
          ...stack.getStackAsString(),
          ...(Array(operations.length - stack.getSize()).fill("") as string[]),
        ],
        lang,
      }),
    }
    const allKeys: Set<string> = new Set<string>(Object.keys(text))
    // input-x is the form for the input fields
    for (let i = 0; i < stack.getSize(); i++) {
      allKeys.delete(`input-${i}`)
      if (text[`input-${i}`] !== stack.getStackAsString()[i]) {
        return correctAnswer
      }
    }
    // expect the rest input fields inside allKeys to be empty
    for (const restKey of allKeys) {
      if (text[restKey].trim() !== "") {
        return correctAnswer
      }
    }
    return {
      correct: true,
    }
  }

  const question: MultiFreeTextQuestion = {
    type: "MultiFreeTextQuestion",
    name: stackQuestion.name(lang),
    path: permalink,
    text: t(translations, lang, "arrayStackText", [operations.join(", "), arrayDisplayBlock]),
    feedback,
  }
  return { question }
}

/**
 * Generates a sequence of push and pop operations
 * and returns the final state of the stack
 * @param random
 */
function generateOperationsVariantArray(random: Random) {
  const amountOfOperations = random.int(6, 9)
  const stack = new Stack<number>()
  const operations = []

  for (let i = 0; i < amountOfOperations; i++) {
    let operation = random.weightedChoice(["push", "pop"], [0.7, 0.3])
    if (stack.isEmpty() || stack.getSize() === 1) operation = "push"
    if (stack.getSize() >= 7) operation = "pop"
    if (operation === "push") {
      const value = random.int(1, 30)
      stack.push(value)
      operations.push("`push(" + value + ")`")
    } else {
      stack.getTop()
      operations.push("`pop()`")
    }
  }
  return {
    operations,
    stack,
  }
}

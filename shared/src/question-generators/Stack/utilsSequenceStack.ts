import { MultiFreeTextFeedbackFunction, MultiFreeTextQuestion } from "@shared/api/QuestionGenerator.ts"
import { Stack } from "@shared/question-generators/Stack/Stack.ts"
import { stackQuestion } from "@shared/question-generators/Stack/StackGenerator.ts"
import {
  createArrayDisplayCodeBlock,
  createArrayDisplayCodeBlockUserInput,
} from "@shared/utils/arrayDisplayCodeBlock.ts"
import Random from "@shared/utils/random.ts"
import { t, Translations } from "@shared/utils/translations.ts"

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
export function generateVariantSequenceStack(
  lang: "de" | "en",
  random: Random,
  permalink: string,
  translations: Translations,
) {
  const { operations, s: stack } = generateOperationsVariantSequenceStack(random)

  const { arrayDisplayBlock } = createArrayDisplayCodeBlockUserInput({
    numberOfInputFields: stack.getSize(),
  })

  const feedback: MultiFreeTextFeedbackFunction = ({ text }) => {
    // input-x is the form for the input fields
    for (let i = 0; i < stack.getSize(); i++) {
      const value = stack.getStackAsString()[i]
      if (text[`input-${i}`] !== value) {
        return {
          correct: false,
          correctAnswer: createArrayDisplayCodeBlock({
            array: stack.getStackAsString(),
          }),
        }
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
    text: t(translations, lang, "sequenceStackText", [operations.join(", "), arrayDisplayBlock]),
    feedback,
  }
  return { question }
}

/**
 * Generates a sequence of push and pop operations
 * and returns the final state of the stack
 * @param random
 */
function generateOperationsVariantSequenceStack(random: Random) {
  const amountOfOperations = random.int(6, 9)
  const s = new Stack<number>()
  const operations = []

  for (let i = 0; i < amountOfOperations; i++) {
    let operation = random.weightedChoice(["push", "pop"], [0.7, 0.3])
    if (s.isEmpty() || s.getSize() === 1) operation = "push"
    if (s.getSize() >= 7) operation = "pop"
    if (operation === "push") {
      const value = random.int(1, 30)
      s.push(value)
      operations.push("`Push(" + value + ")`")
    } else {
      s.getTop()
      operations.push("`Pop()`")
    }
  }
  return {
    operations,
    s,
  }
}

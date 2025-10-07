import {
  minimalMultipleChoiceFeedback,
  type FreeTextFeedbackFunction,
  type FreeTextFormatFunction,
  type FreeTextQuestion,
  type MultipleChoiceQuestion,
} from "../../../api/QuestionGenerator.ts"
import type Random from "../../../utils/random.ts"
import { t, type Translations } from "../../../utils/translations.ts"
import { generateChoice1Question, generateInputChoice1Foundations } from "../generate/stringStructure.ts"
import { huffmanCoding } from "../huffmanCoding.ts"
import { insertSpaceAfterEveryXChars } from "./utils.ts"

/**
 * This function generates a multiple choice question
 * It generates a random word and multiple wrong and correct answers (amount of 4)
 * The user has to choose between those answers
 *
 * @param random - random class
 * @param translations - translations of the question text
 * @param lang - german or english
 * @param permalink .
 */
export function generateChoiceQuestion({
  random,
  translations,
  lang,
  permalink,
}: {
  random: Random
  translations: Translations
  lang: "en" | "de"
  permalink: string
}) {
  const { word, answers, correctAnswerIndexes } = generateChoice1Question(random)

  const question: MultipleChoiceQuestion = {
    type: "MultipleChoiceQuestion",
    name: huffmanCoding.name(lang),
    path: permalink,
    allowMultiple: true,
    text: t(translations, lang, "textChoice", [insertSpaceAfterEveryXChars(word, 3)]),
    answers: answers,
    feedback: minimalMultipleChoiceFeedback({ correctAnswerIndex: correctAnswerIndexes }),
  }

  return { question }
}

/**
 * This function generates a free text question
 * The user has to input the correct huffman code for a given word
 * @param random - random class
 * @param translations - translations of the question text
 * @param lang - german or english
 * @param permalink .
 */
export function generateInputQuestion({
  random,
  translations,
  lang,
  permalink,
}: {
  random: Random
  translations: Translations
  lang: "en" | "de"
  permalink: string
}) {
  const { correctAnswer, correctTree, word } = generateInputChoice1Foundations({ random })

  const checkFormat: FreeTextFormatFunction = ({ text }) => {
    if (text.trim() === "") return { valid: false }
    // iterate over each letter to check if either 0 or 1
    for (let i = 0; i < text.length; i++) {
      if (text[i] !== "0" && text[i] !== "1") {
        return {
          valid: false,
          message: t(translations, lang, "feedbackInvalid"),
        }
      }
    }
    // no format error
    return { valid: true, message: "\u2713" }
  }

  const feedback: FreeTextFeedbackFunction = ({ text: codeword }) => {
    const valid = correctTree.setLabelsByCodeword(word, codeword)

    if (valid) {
      return {
        correct: true,
      }
    }

    return {
      correct: false,
      correctAnswer: insertSpaceAfterEveryXChars(correctAnswer, 3),
    }
  }

  const question: FreeTextQuestion = {
    type: "FreeTextQuestion",
    name: huffmanCoding.name(lang),
    path: permalink,
    text: t(translations, lang, "text", [insertSpaceAfterEveryXChars(word, 3)]),
    feedback,
    checkFormat,
  }

  return {
    question,
  }
}

import {
  FreeTextFeedbackFunction,
  FreeTextFormatFunction,
  FreeTextQuestion,
  minimalMultipleChoiceFeedback,
  MultipleChoiceQuestion,
} from "@shared/api/QuestionGenerator"
import {
  generateChoice1Question,
  generateInputChoice1Foundations,
} from "@shared/question-generators/huffman-coding/generate/stringStructure"
import { huffmanCoding } from "@shared/question-generators/huffman-coding/huffmanCoding"
import { insertSpaceAfterEveryXChars } from "@shared/question-generators/huffman-coding/utils/utils"
import Random from "@shared/utils/random"
import { t, Translations } from "@shared/utils/translations"

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

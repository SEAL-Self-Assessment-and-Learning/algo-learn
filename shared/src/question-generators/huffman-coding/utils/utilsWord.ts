import {
  FreeTextFeedbackFunction,
  FreeTextFormatFunction,
  FreeTextQuestion,
  minimalMultipleChoiceFeedback,
  MultipleChoiceQuestion,
} from "@shared/api/QuestionGenerator"
import { generatePossibleAnswersChoice1 } from "@shared/question-generators/huffman-coding/generate/GenerateChoiceAnswers.ts"
import { generateString } from "@shared/question-generators/huffman-coding/generate/GenerateWords"
import { getHuffmanCodeOfWord } from "@shared/question-generators/huffman-coding/Huffman"
import { huffmanCoding } from "@shared/question-generators/huffman-coding/huffmanCoding"
import { insertSpaceAfterEveryXChars } from "@shared/question-generators/huffman-coding/utils/utils.ts"
import Random from "@shared/utils/random"
import { t, Translations } from "@shared/utils/translations"

/**
 * This function generates the foundation for input and choice question
 * It generates a random word and computes a correct answer
 * @param random
 */
function generateInputChoiceFoundations({ random }: { random: Random }) {
  const wordLength = random.weightedChoice([
    [13, 0.25],
    [12, 0.25],
    [11, 0.125],
    [10, 0.125],
    [9, 0.125],
    [8, 0.125],
  ])
  let word = generateString(wordLength, random)
  word = random.shuffle(word.split("")).join("")
  const { encodedWord: correctAnswer, huffmanTree: correctTree } = getHuffmanCodeOfWord(word)

  return { correctAnswer, correctTree, word }
}

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
  const { correctAnswer, correctTree, word } = generateInputChoiceFoundations({ random })

  // get a set of obvious wrong answers
  const answers = generatePossibleAnswersChoice1(random, correctAnswer, correctTree, word)
  answers.push(correctAnswer)

  const correctAnswerIndexes: number[] = []
  // find all the correct answers
  for (let i = 0; i < answers.length; i++) {
    if (correctTree.setLabelsByCodeword(word, answers[i])) correctAnswerIndexes.push(i)
  }

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
  const { correctAnswer, correctTree, word } = generateInputChoiceFoundations({ random })

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
        message: "t(feedback.correct)",
      }
    }

    return {
      correct: false,
      message: "t(feedback.incomplete)",
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

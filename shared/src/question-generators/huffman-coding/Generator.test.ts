import { describe, expect, test } from "vitest"
import {
  FreeTextAnswer,
  FreeTextFeedbackFunction,
  FreeTextQuestion,
  MultiFreeTextQuestion,
  MultipleChoiceQuestion,
} from "@shared/api/QuestionGenerator.ts"
import {
  createHuffmanCoding,
  huffmanCodingAlgorithm,
} from "@shared/question-generators/huffman-coding/Algorithm.ts"
import {
  convertDictToMdTable,
  huffmanCoding,
} from "@shared/question-generators/huffman-coding/huffmanCoding.ts"
import { sampleRandomSeed } from "../../utils/random"

interface TestingObjectChoice {
  question: MultipleChoiceQuestion
  testing: {
    variant: "choice" | "choice2"
    word?: string
    wordArray?: { [key: string]: number }
    correctAnswer?: string
    allAnswers: string[]
    correctAnswerIndex: number
  }
}

interface TestingObjectInput {
  question: FreeTextQuestion | MultiFreeTextQuestion
  testing: {
    variant: "input" | "input2"
    word?: string
    wordArray?: { [key: string]: number }
    feedback: FreeTextFeedbackFunction
  }
}

describe("HuffmanCodingGenerator - Correctness", () => {
  for (let i = 1; i <= 100; i++) {
    test(`${i}. random huffman coding question`, () => {
      const { question: q, testing: t } = huffmanCoding.generate(
        "", // path not relevant here
        "en", // language not relevant
        {
          variant: "choice",
        },
        sampleRandomSeed(),
      ) as TestingObjectChoice

      expect(q.type).toEqual("MultipleChoiceQuestion")
      expect(q.answers.length).toBeGreaterThanOrEqual(4)
      expect(q.answers.length).toBeLessThanOrEqual(5)

      if (t.variant === "choice") {
        expect(t.word).toBeDefined()
        expect(t.correctAnswer).toBeDefined()

        if (t.word && t.correctAnswer) {
          // remove whitespaces from word
          const word = t.word.replace(/\s/g, "")
          expect(word.length).toBeGreaterThanOrEqual(8)
          expect(word.length).toBeLessThanOrEqual(13)

          expect(t.allAnswers.indexOf(t.correctAnswer)).toEqual(t.correctAnswerIndex)
          expect(q.answers.indexOf(t.correctAnswer)).toEqual(t.correctAnswerIndex)
          expect(q.answers.indexOf(huffmanCodingAlgorithm(word).result)).toEqual(t.correctAnswerIndex)
        }
      } else if (t.variant === "choice2") {
        expect(t.wordArray).toBeDefined()

        if (t.wordArray) {
          const wordArray = t.wordArray
          expect(Object.keys(wordArray).length).toBeGreaterThanOrEqual(8)
          expect(Object.keys(wordArray).length).toBeLessThanOrEqual(11)

          const correctNode = huffmanCodingAlgorithm("", wordArray).mainNode
          const correctAnswerDict: { [key: string]: string } = createHuffmanCoding({}, correctNode, "")
          const sol = "\n" + convertDictToMdTable(correctAnswerDict) + "\n"

          expect(q.answers.indexOf(sol)).toBeGreaterThanOrEqual(t.correctAnswerIndex)
        }
      }
    })

    test(`${i}. Input random huffman coding question`, async () => {
      const { question: q, testing: t } = huffmanCoding.generate(
        "", // path not relevant here
        "en", // language not relevant
        {
          variant: "input",
        },
        sampleRandomSeed(),
      ) as TestingObjectInput

      expect(q.type === "FreeTextQuestion" || q.type === "MultiFreeTextQuestion").toBeTruthy()

      if (t.variant === "input") {
        expect(t.word).toBeDefined()

        if (t.word) {
          // remove whitespaces from word
          const word = t.word.replace(/\s/g, "")
          expect(word.length).toBeGreaterThanOrEqual(8)
          expect(word.length).toBeLessThanOrEqual(13)

          const correctAnswer: FreeTextAnswer = { text: huffmanCodingAlgorithm(word).result }
          expect((await t.feedback(correctAnswer)).correct).toBeTruthy()
          const wrongsAnswer: FreeTextAnswer = { text: correctAnswer.text + "0" }
          expect((await t.feedback(wrongsAnswer)).correct).toBeFalsy()
          expect((await t.feedback({ text: "" })).correct).toBeFalsy()
          expect((await t.feedback({ text: "a" })).correct).toBeFalsy()
        }
      } else if (t.variant === "input2") {
        expect(t.wordArray).toBeDefined()

        if (t.wordArray) {
          const correctAnswerTreeNode = huffmanCodingAlgorithm("", t.wordArray).mainNode
          const correctAnswerDict: { [key: string]: string } = createHuffmanCoding(
            {},
            correctAnswerTreeNode,
            "",
          )
          const formattedAnswerDict: { [key: string]: string } = {}
          for (const key in correctAnswerDict) {
            // add same key but with a-b-key, and corresponding value
            const newKey = "a-b-" + key
            formattedAnswerDict[newKey] = correctAnswerDict[key]
          }
          const answerDictString = JSON.stringify(formattedAnswerDict)
          const correctAnswer: FreeTextAnswer = { text: answerDictString }
          expect((await t.feedback(correctAnswer)).correct).toBeTruthy()
          const wrongsAnswer: FreeTextAnswer = { text: answerDictString + "0" }
          expect((await t.feedback(wrongsAnswer)).correct).toBeFalsy()
          expect((await t.feedback({ text: "" })).correct).toBeFalsy()
          expect((await t.feedback({ text: "a" })).correct).toBeFalsy()
        }
      }
    })
  }
})

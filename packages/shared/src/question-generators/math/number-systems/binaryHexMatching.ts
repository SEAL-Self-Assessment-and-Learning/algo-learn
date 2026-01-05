import {
  minimalMultipleChoiceFeedback,
  type MultipleChoiceQuestion,
  type QuestionGenerator,
} from "../../../api/QuestionGenerator.ts"
import { serializeGeneratorCall } from "../../../api/QuestionRouter.ts"
import Random from "../../../utils/random.ts"
import { t, tFunctional, type Translations } from "../../../utils/translations.ts"
import { toBaseString } from "./baseUtils.ts"

const translations: Translations = {
  en: {
    name: "Binary and Hex",
    description: "Match binary and hexadecimal representations.",
    binToHexText: "Which hexadecimal value equals the binary number ${{0}}_2$?",
    hexToBinText: "Which binary value equals the hexadecimal number ${{0}}_{16}$?",
  },
  de: {
    name: "Binär und Hex",
    description: "Bringe binäre und hexadezimale Darstellungen zusammen.",
    binToHexText: "Welche hexadezimale Darstellung entspricht der Binärzahl ${{0}}_2$?",
    hexToBinText: "Welche Binärdarstellung entspricht der Hexzahl ${{0}}_{16}$?",
  },
}

function generateMultipleChoiceOptions(
  random: Random,
  correctValue: number,
  bitLength: number,
  toDisplay: (value: number) => string,
): { answers: string[]; correctIndex: number } {
  const limit = 2 ** bitLength
  const seen = new Set<number>([correctValue])
  const answers: string[] = [toDisplay(correctValue)]

  while (answers.length < 4) {
    const tweak = random.choice<() => number>([
      () => (correctValue ^ (1 << random.int(0, bitLength - 1))) % limit,
      () => (correctValue + random.choice([-1, 1]) * random.int(1, 7) + limit) % limit,
      () => (correctValue + (1 << random.int(1, Math.max(1, bitLength - 2)))) % limit,
    ])
    const candidate = tweak()
    if (candidate === correctValue || seen.has(candidate)) continue
    seen.add(candidate)
    answers.push(toDisplay(candidate))
  }

  random.shuffle(answers)
  const correctIndex = answers.findIndex((a) => a === toDisplay(correctValue))
  return { answers, correctIndex }
}

export const BinaryHexMatching: QuestionGenerator = {
  id: "binhex",
  name: tFunctional(translations, "name"),
  description: tFunctional(translations, "description"),
  tags: ["math", "number systems", "conversion"],
  languages: ["en", "de"],
  license: "MIT",
  expectedParameters: [],
  generate: (lang = "en", parameters, seed) => {
    const random = new Random(seed)
    const bitLength = random.choice([8, 12, 16])
    const value = random.int(2 ** (bitLength - 1), 2 ** bitLength - 1)
    const binary = toBaseString(value, 2, bitLength)
    const hexLength = Math.ceil(bitLength / 4)
    const hex = toBaseString(value, 16, hexLength)
    const asHexAnswer = (v: number) => `$\\texttt{${toBaseString(v, 16, hexLength)}}$`
    const asBinAnswer = (v: number) => `$\\texttt{${toBaseString(v, 2, bitLength)}}$`
    const askForHex = random.bool()

    const { answers, correctIndex } = askForHex
      ? generateMultipleChoiceOptions(random, value, bitLength, asHexAnswer)
      : generateMultipleChoiceOptions(random, value, bitLength, asBinAnswer)

    const path = serializeGeneratorCall({ generator: BinaryHexMatching, lang, parameters, seed })
    const question: MultipleChoiceQuestion = {
      type: "MultipleChoiceQuestion",
      name: BinaryHexMatching.name(lang),
      path,
      text: askForHex
        ? t(translations, lang, "binToHexText", [binary])
        : t(translations, lang, "hexToBinText", [hex]),
      answers,
      feedback: minimalMultipleChoiceFeedback({ correctAnswerIndex: correctIndex }),
    }

    return {
      question,
      testing: { value, bitLength, binary, hex, askForHex, correctIndex },
    }
  },
}

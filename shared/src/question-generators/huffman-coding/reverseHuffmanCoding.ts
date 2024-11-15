import {
  MultiFreeTextFeedbackFunction,
  MultiFreeTextFormatFunction,
  MultiFreeTextQuestion,
  QuestionGenerator,
} from "@shared/api/QuestionGenerator.ts"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter.ts"
import {
  getHuffmanCodeOfTable,
  HuffmanNode,
} from "@shared/question-generators/huffman-coding/Huffman.ts"
import { checkProvidedCode } from "@shared/question-generators/huffman-coding/utils/utils.ts"
import {
  createSolutionTable,
  generateDictFoundations,
} from "@shared/question-generators/huffman-coding/utils/utilsDict.ts"
import Random from "@shared/utils/random.ts"
import { t, tFunctional, Translations } from "@shared/utils/translations.ts"

const translations: Translations = {
  en: {
    name: "Reverse Huffman-Coding",
    description: "Create a string for a given Hufman-Coding",
    text: `Consider the following prefix free code \n{{0}} 
    Find a text $T$: 
{{3}}
- where the code stated **above is optimal**
- Contains each of the letters $\\{$** {{1}} **$\\}$ at **least once**
- no two character occur with the same frequency

Provide the number of occurrences for each letter in $T$:
{{2}}
    `,
    minimalAddition: "- that is as **short** as possible",
    checkFormatInteger: "Only positive Integer values",
    ">0": " > 0",
    "<100": "< 100",
    feedbackDuplicates: "There are duplicated values in your frequencies.",
    feedbackEqu: "Your frequencies can't compute an equivalent prefix free code.",
    feedbackNotMinimal:
      "Your frequencies can compute an equivalent prefix free code, but it is **not minimal**.",
  },
  de: {
    name: "Reverse Huffman-Coding",
    description: "Erstelle einen String für einen gegebenen String",
  },
}

export const ReverseHuffmanCoding: QuestionGenerator = {
  id: "huffmanrev",
  name: tFunctional(translations, "name"),
  description: tFunctional(translations, "description"),
  languages: ["en", "de"],
  expectedParameters: [
    {
      type: "string",
      name: "variant",
      allowedValues: ["start", "minimal"],
    },
  ],

  generate: (lang, parameters, seed) => {
    const permalink = serializeGeneratorCall({
      generator: ReverseHuffmanCoding,
      lang,
      parameters,
      seed,
    })

    const variant: "start" | "minimal" = parameters.variant as "start" | "minimal"

    const random = new Random(seed)

    const numDifferentCharacters = random.int(6, 8)
    const {
      characterFrequencies,
      correctAnswerDict: originalEncoding,
      correctAnswerTreeNode: originalTreeNode,
    } = generateDictFoundations({
      random,
      numDifferentCharacters,
    })
    // fits on iPhone SE 3rd generation
    const frequencyTable = createSolutionTable(originalEncoding, ["td"])

    const charList: string[] = Object.keys(characterFrequencies)
    const numberOfInputFields =
      numDifferentCharacters - random.int(2, Math.round(numDifferentCharacters / 2))
    const indicesOfInputFields: number[] = random.subset(
      Array.from({ length: numDifferentCharacters }, (_, i) => i),
      numberOfInputFields,
    )
    const indicesNormalFields = Array.from({ length: numDifferentCharacters }, (_, i) => i).filter(
      (i) => !indicesOfInputFields.includes(i),
    )

    const mixInputCharFreqTable = createMixInputCharFreqTable({
      characterFrequencies,
      indicesOfInputFields,
      charList,
    })

    const question: MultiFreeTextQuestion = {
      type: "MultiFreeTextQuestion",
      name: ReverseHuffmanCoding.name(lang),
      path: permalink,
      text: t(translations, lang, "text", [
        frequencyTable,
        charList.join(", "),
        mixInputCharFreqTable,
        variant === "minimal" ? t(translations, lang, "minimalAddition") : "",
      ]),
      fillOutAll: true,
      checkFormat: checkIntegerInput(lang),
      feedback: getFeedback({
        variant,
        lang,
        charList,
        indicesOfInputFields,
        indicesNormalFields,
        characterFrequencies,
        originalTreeNode,
      }),
    }

    return {
      question,
    }
  },
}

function getFeedback({
  variant,
  lang,
  charList,
  indicesOfInputFields,
  indicesNormalFields,
  characterFrequencies,
  originalTreeNode,
}: {
  variant: "start" | "minimal"
  lang: "de" | "en"
  charList: string[]
  indicesOfInputFields: number[]
  indicesNormalFields: number[]
  characterFrequencies: { [_: string]: number }
  originalTreeNode: HuffmanNode
}): MultiFreeTextFeedbackFunction {
  return ({ text: userDict }) => {
    const combinedFrequencies: { [_: string]: number } = {}
    for (let i = 0; i < Object.keys(characterFrequencies).length; i++) {
      if (indicesOfInputFields.includes(i)) {
        combinedFrequencies[charList[i]] = Number.parseInt(userDict["char-" + i])
      } else {
        combinedFrequencies[charList[i]] = characterFrequencies[charList[i]]
      }
    }

    if (!feedbackDuplicatesCheck(combinedFrequencies)) {
      return { correct: false, feedbackText: t(translations, lang, "feedbackDuplicates") }
    }

    const combinedTreeNode = getHuffmanCodeOfTable(combinedFrequencies)
    const combinedEncoding = combinedTreeNode.getEncodingTable()

    const validFrequencies = checkProvidedCode(
      combinedFrequencies,
      combinedEncoding,
      originalTreeNode.getEncodingTable(),
    )

    originalTreeNode.minimizeCharFrequencies(indicesNormalFields.map((i) => charList[i]))
    const minCharacterFrequencies = originalTreeNode.getCharacterFrequencies()

    if (!validFrequencies) {
      return {
        correct: false,
        correctAnswer: createSolutionTable(
          variant === "minimal" ? minCharacterFrequencies : characterFrequencies,
        ),
        feedbackText: t(translations, lang, "feedbackEqu"),
      }
    }

    if (variant === "minimal") {
      const minimizedAmount = Object.values(minCharacterFrequencies).reduce((acc, val) => acc + val, 0)
      const userAmount = Object.values(combinedFrequencies).reduce((acc, val) => acc + val, 0)
      if (userAmount > minimizedAmount) {
        return {
          correct: false,
          correctAnswer: createSolutionTable(minCharacterFrequencies),
          feedbackText: t(translations, lang, "feedbackNotMinimal"),
        }
      }
    }

    return {
      correct: true,
    }
  }
}

function feedbackDuplicatesCheck(combinedFrequencies: { [p: string]: number }) {
  // check combined frequencies values for duplicated numbers
  const values = Object.values(combinedFrequencies)
  const uniqueValues = new Set(values)
  return values.length === uniqueValues.size
}

function checkIntegerInput(lang: "en" | "de"): MultiFreeTextFormatFunction {
  return ({ text }, fieldID) => {
    const userInput = text[fieldID].replace(/\s+/g, "")
    if (userInput === "") return { valid: false }
    if (
      Number.isNaN(Number.parseInt(userInput, 10)) ||
      Number.parseInt(userInput, 10).toString() !== userInput
    ) {
      return {
        valid: false,
        message: t(translations, lang, "checkFormatInteger"),
      }
    }
    if (Number.parseInt(userInput, 10) < 1) {
      return {
        valid: false,
        message: t(translations, lang, ">0"),
      }
    }
    if (Number.parseInt(userInput, 10) >= 100) {
      return {
        valid: false,
        message: t(translations, lang, "<100"),
      }
    }
    return { valid: true }
  }
}

function createMixInputCharFreqTable({
  characterFrequencies,
  indicesOfInputFields,
  charList,
}: {
  characterFrequencies: { [_: string]: number }
  indicesOfInputFields: number[]
  charList: string[]
}) {
  let table = `|${charList.join("|")}|`
  table += "\n|"
  charList.forEach((key, i) => {
    table += indicesOfInputFields.includes(i)
      ? `{{char-${i}#OS-2###overlay}}`
      : `**${characterFrequencies[key]}**`
    table += "|"
  })
  table += "\n|#?ah_center?av_middle?div_my-5#| |"
  return table
}

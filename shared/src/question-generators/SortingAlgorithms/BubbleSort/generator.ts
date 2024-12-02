import {
  FreeTextFeedbackFunction,
  FreeTextFormatFunction,
  FreeTextQuestion,
  QuestionGenerator,
} from "@shared/api/QuestionGenerator.ts"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter.ts"
import {
  bubbleSort,
  SortingOrder,
} from "@shared/question-generators/SortingAlgorithms/BubbleSort/bubbleAlgo.ts"
import Random from "@shared/utils/random.ts"
import { t, tFunctional, Translations } from "@shared/utils/translations.ts"

const translations: Translations = {
  en: {
    name: "Bubble sort",
    description: "Correct execute the algorithm",
    task: `Given the following list of numbers: \\[A={{0}}\\] 
    We execute the \`Bubble sort\` algorithm to sort the numbers in **{{1}}** order.
    Please enter the state of the numbers after $ {{2}} $ iterations.`,
    des: "descending",
    asc: "ascending",
    insert: "Insert:",
    format: "Please only integer from 0 to 20 seperated by comma",
    tooLong: "You provided to **many** numbers",
    tooShort: "You provided to **few** numbers",
    wrongOrder: "You have a wrong order.",
  },
  de: {},
}

export const BubbleSortGenerator: QuestionGenerator = {
  id: "bubblesort",
  name: tFunctional(translations, "name"),
  description: tFunctional(translations, "description"),
  tags: [],
  languages: ["en", "de"],
  expectedParameters: [],

  generate: (lang = "en", parameters, seed) => {
    const permalink = serializeGeneratorCall({
      generator: BubbleSortGenerator,
      lang,
      parameters,
      seed,
    })
    const random = new Random(seed)

    const amountNumbers = random.int(6, 9)
    const randomNumbers = []
    for (let i = 0; i < amountNumbers; i++) {
      randomNumbers.push(random.int(0, 20))
    }
    const sortingOrder: SortingOrder = random.choice(["des", "asc"])
    const numberRounds = random.int(2, 4)

    const randomNumbersSet: Set<number> = new Set<number>()
    randomNumbers.map((val) => randomNumbersSet.add(val))

    const question: FreeTextQuestion = {
      type: "FreeTextQuestion",
      name: BubbleSortGenerator.name(lang),
      path: permalink,
      text: t(translations, lang, "task", [
        "\\left[" + randomNumbers.join(", ") + "\\right]",
        t(translations, lang, sortingOrder),
        numberRounds.toString(),
      ]),
      placeholder: randomNumbers.slice(0, 3).join(", "),
      prompt: "$A=$",
      typingAid: Array.from(randomNumbersSet.keys()).map((val) => ({
        text: `$${val}$`,
        input: `${val}, `,
        label: `${t(translations, lang, "insert")} ${val}`,
      })),
      feedback: getFeedback(bubbleSort(randomNumbers, sortingOrder, numberRounds), lang),
      checkFormat: getCheckFormat(lang),
    }
    return { question }
  },
}

function getCheckFormat(lang: "en" | "de"): FreeTextFormatFunction {
  return ({ text }) => {
    if (text.trim() === "") {
      return {
        valid: false,
      }
    }

    const answer = text.replace(/\s+/g, "").split(",")
    const isValid = answer.every((entry) => {
      const num = parseInt(entry, 10) // Parse the string into an integer
      return (Number.isInteger(num) && num >= 0 && num <= 20) || entry === ""
    })
    return {
      valid: isValid,
      message: !isValid ? t(translations, lang, "format") : "",
    }
  }
}

function getFeedback(sortedValues: number[], lang: "en" | "de"): FreeTextFeedbackFunction {
  return ({ text }) => {
    const answer = text
      .replace(/\s+/g, "")
      .split(",")
      .filter((x) => x !== "")
    const userValues = answer.map((val) => parseInt(val, 10))

    if (userValues.length > sortedValues.length) {
      return {
        correct: false,
        feedbackText: t(translations, lang, "tooLong"),
        correctAnswer: "$[" + sortedValues.join(",") + "]$",
      }
    } else if (userValues.length < sortedValues.length) {
      return {
        correct: false,
        feedbackText: t(translations, lang, "tooShort"),
        correctAnswer: "$[" + sortedValues.join(",") + "]$",
      }
    }
    for (let i = 0; i < sortedValues.length; i++) {
      if (sortedValues[i] !== userValues[i]) {
        return {
          correct: false,
          feedbackText: t(translations, lang, "wrongOrder"),
          correctAnswer: "$[" + sortedValues.join(",") + "]$",
        }
      }
    }

    return {
      correct: true,
    }
  }
}

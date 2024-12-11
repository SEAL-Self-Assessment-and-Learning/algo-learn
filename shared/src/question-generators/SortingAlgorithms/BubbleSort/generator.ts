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
    taskOrder: `Given the following list of numbers: \\[A={{0}}\\] 
      We execute the \`Bubble sort\` algorithm to sort the numbers in **{{1}}** order.
      Please enter the state of the numbers after $ {{2}} $ iterations.`,
    taskSwap: `Given the following list of numbers: \\[A={{0}}\\] 
      We execute the \`Bubble sort\` algorithm to sort the numbers in **{{1}}** order.
      How often do elements have to be **swapped** until the numbers are sorted?`,
    alreadySorted: `If the numbers are sorted before $ {{0}}$ iterations, enter the sorted numbers.`,
    des: "descending",
    asc: "ascending",
    insert: "Insert:",
    format: "Please only integer from 0 to 20 seperated by comma",
    tooLong: "You provided to **many** numbers",
    tooShort: "You provided to **few** numbers",
    wrongOrder: "You have a wrong order.",
  },
  de: {
    name: "Bubblesort",
    description: "Führe den Algorithmus korrekt aus",
    taskOrderOrder: `Gegeben ist die folgende Liste von Zahlen: \\[A={{0}}\\]
      Wir führen den \`Bubblesort\`-Algorithmus aus, um die Zahlen in **{{1}}**-Reihenfolge zu sortieren.
      Bitte gib den Zustand der Zahlen nach $ {{2}} $ Iterationen ein.`,
    taskSwap: `Gegeben ist die folgende Liste von Zahlen: \\[A={{0}}\\]
      Wir führen den \`Bubblesort\`-Algorithmus aus, um die Zahlen in **{{1}}**-Reihenfolge zu sortieren.
      Wie oft müssen Elemente **vertauscht** werden, bis die Zahlen sortiert sind?`,
    alreadySorted: `Falls die Zahlen bereits vor $ {{0}}$ Iterationen sortiert sind, gib die sortierten Zahlen ein.`,
    des: "absteigend",
    asc: "aufsteigend",
    insert: "Einfügen:",
    format: "Bitte nur ganze Zahlen von 0 bis 20, getrennt durch Kommas",
    tooLong: "Du hast **zu viele** Zahlen angegeben.",
    tooShort: "Du hast **zu wenige** Zahlen angegeben.",
    wrongOrder: "Die Reihenfolge ist falsch.",
  },
}

export const BubbleSortGenerator: QuestionGenerator = {
  id: "bubblesort",
  name: tFunctional(translations, "name"),
  description: tFunctional(translations, "description"),
  tags: [],
  languages: ["en", "de"],
  expectedParameters: [
    {
      type: "string",
      name: "variant",
      allowedValues: ["order", "swaps"],
    },
  ],

  generate: (lang = "en", parameters, seed) => {
    const permalink = serializeGeneratorCall({
      generator: BubbleSortGenerator,
      lang,
      parameters,
      seed,
    })
    const random = new Random(seed)

    const variant: "order" | "swap" = parameters.variant as "order" | "swap"

    const { randomNumbers, sortingOrder, numberRounds, randomNumbersSet } = bubbleGeneratorBase(random)

    if (variant === "order") {
      const question: FreeTextQuestion = {
        type: "FreeTextQuestion",
        name: BubbleSortGenerator.name(lang),
        path: permalink,
        text: t(translations, lang, "taskOrder", [
          "\\left[" + randomNumbers.join(", ") + "\\right]",
          t(translations, lang, sortingOrder),
          numberRounds.toString(),
        ]),
        placeholder: randomNumbers.slice(0, 3).join(", "),
        bottomText: t(translations, lang, "alreadySorted", [numberRounds.toString()]),
        prompt: "$A=$",
        typingAid: Array.from(randomNumbersSet.keys()).map((val) => ({
          text: `$${val}$`,
          input: `${val}, `,
          label: `${t(translations, lang, "insert")} ${val}`,
        })),
        feedback: getFeedbackOrder(bubbleSort(randomNumbers, sortingOrder, numberRounds).values, lang),
        checkFormat: getCheckFormatOrder(lang),
      }
      return { question }
    } else {
      const question: FreeTextQuestion = {
        type: "FreeTextQuestion",
        name: BubbleSortGenerator.name(lang),
        path: permalink,
        text: t(translations, lang, "taskSwap", [
          "\\left[" + randomNumbers.join(", ") + "\\right]",
          t(translations, lang, sortingOrder),
        ]),
        feedback: getFeedbackSwap(bubbleSort(randomNumbers, sortingOrder).numberSwaps),
      }
      return { question }
    }
  },
}

/**
 * Generates the base for the bubble sort generator
 * @param random
 */
function bubbleGeneratorBase(random: Random) {
  const amountNumbers = random.int(6, 9)
  const randomNumbers = []
  for (let i = 0; i < amountNumbers; i++) {
    randomNumbers.push(random.int(0, 20))
  }
  const sortingOrder: SortingOrder = random.choice(["des", "asc"])
  const numberRounds = random.int(2, 4)

  const randomNumbersSet: Set<number> = new Set<number>()
  randomNumbers.map((val) => randomNumbersSet.add(val))
  return { randomNumbers, sortingOrder, numberRounds, randomNumbersSet }
}

/**
 * Feedback variant swap
 * Checks if user input is same as correct solution
 * @param correctSwaps
 */
function getFeedbackSwap(correctSwaps: number): FreeTextFeedbackFunction {
  return ({ text }) => {
    const answer = text.replace(/\s+/g, "")
    if (answer !== correctSwaps.toString()) {
      return {
        correct: false,
        correctAnswer: correctSwaps.toString(),
      }
    }
    return { correct: true }
  }
}

/**
 * Gets the format function for Bubble sort variant order.
 * It parses a list of numbers separated by commas and checks if they're integers between 0 and 20
 * @param lang
 */
function getCheckFormatOrder(lang: "en" | "de"): FreeTextFormatFunction {
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

/**
 * Feedback for variant order
 * Checks if user input and correct solution match
 * @param sortedValues
 * @param lang
 */
function getFeedbackOrder(sortedValues: number[], lang: "en" | "de"): FreeTextFeedbackFunction {
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

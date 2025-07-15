import type { Language } from "@shared/api/Language.ts"
import type {
  MultiFreeTextFeedbackFunction,
  MultiFreeTextQuestion,
  QuestionGenerator,
} from "@shared/api/QuestionGenerator"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter"
import { QuickFind } from "@shared/question-generators/unionFind/quickFind/quickFindAlgorithm"
import {
  unionOneBlockCombineNone,
  unionOneBlockCombineOne,
  unionTwoBlocksCombineNone,
  unionTwoBlocksCombineOne,
  unionTwoBlocksCombineSame,
} from "@shared/question-generators/unionFind/quickFind/utilsQF"
import {
  createArrayDisplayCodeBlock,
  createArrayDisplayCodeBlockUserInput,
} from "@shared/utils/arrayDisplayCodeBlock.ts"
import Random from "@shared/utils/random"
import { t, tFunctional, type Translations } from "@shared/utils/translations"

const translations: Translations = {
  en: {
    name: "Quick-Find",
    description: "Determine Quick-Find state after Union operation",
    task: `A state of the Quick-Find data structure is given as the following array: \n{{0}}\n We call \`Union({{1}}, {{2}})\`. Provide the resulting state. {{3}}
      We assume that the operation **Union(**$i$**,** $j$**)** always sets the value specified by **Find(**$i$**)** to the value specified by **Find(**$j$**)**.`,
  },
  de: {
    name: "Quick-Find",
    description: "Bestimme Quick-Find-Zustand nach Union-Operation",
    task: `Ein Zustand der Quick-Find Datenstruktur ist als folgendes Array gegeben: \n{{0}}\n Wir rufen \`Union({{1}}, {{2}})\` auf. Gib den Zustand an, der dadurch entsteht. {{3}}
      Wir nehmen an, dass die Operation **Union(**$i$**,** $j$**)** immer den durch **Find(**$i$**)** spezifizierten Wert auf den von **Find(**$j$**)** spezifierten Wert setzt.`,
  },
}

export const QuickFindGenerator: QuestionGenerator = {
  id: "ufqf",
  name: tFunctional(translations, "name"),
  description: tFunctional(translations, "description"),
  tags: ["union-find", "quick-find"],
  languages: ["en", "de"],
  expectedParameters: [],

  generate(lang, parameters, seed) {
    const random = new Random(seed)

    // for quickFind size of 6 or 7 is enough
    const unionSize = random.int(6, 7)

    const union = new QuickFind(unionSize)

    const unionCaseGeneration = random.weightedChoice([
      [unionTwoBlocksCombineOne, 0.35],
      [unionTwoBlocksCombineNone, 0.2],
      [unionTwoBlocksCombineSame, 0.05],
      [unionOneBlockCombineOne, 0.25],
      [unionOneBlockCombineNone, 0.15],
    ])

    const { gapField, gapOperationValues } = unionCaseGeneration({
      random,
      lang,
      union,
      unionSize,
    })

    const { arrayDisplayBlock } = createArrayDisplayCodeBlockUserInput({
      numberOfInputFields: union.getArray().length,
      lang,
    })

    const question: MultiFreeTextQuestion = {
      type: "MultiFreeTextQuestion",
      name: QuickFindGenerator.name(lang),
      path: serializeGeneratorCall({
        generator: QuickFindGenerator,
        lang,
        parameters,
        seed,
      }),
      text: t(translations, lang, "task", [
        gapField,
        gapOperationValues[0].toString(),
        gapOperationValues[1].toString(),
        arrayDisplayBlock,
      ]),
      feedback: getFeedbackFunction(union, lang),
    }

    return {
      question,
    }
  },
}

/**
 * Returns a simple feedback function to check if the user input is the same as
 * the solution union
 * @param solutionUnion - correct calculated union
 * @param lang
 */
function getFeedbackFunction(solutionUnion: QuickFind, lang: Language): MultiFreeTextFeedbackFunction {
  // fieldIds form input-x x \in [0,1,2,3...]
  return ({ text }) => {
    const solutionArray = solutionUnion.getArray()
    for (let i = 0; i < solutionArray.length; i++) {
      const userFieldAnswer = parseInt(text["input-" + i].trim())
      if (userFieldAnswer !== solutionArray[i]) {
        return {
          correct: false,
          correctAnswer: createArrayDisplayCodeBlock({
            array: solutionArray,
            lang,
          }),
        }
      }
    }
    return {
      correct: true,
    }
  }
}

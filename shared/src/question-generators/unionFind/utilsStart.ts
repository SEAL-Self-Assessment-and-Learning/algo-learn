import { MultiFreeTextFeedbackFunction, MultiFreeTextQuestion } from "@shared/api/QuestionGenerator.ts"
import { QuickFind } from "@shared/question-generators/unionFind/quickFind/algorithm.ts"
import { UnionFind } from "@shared/question-generators/unionFind/unionFind.ts"
import {
  unionOneBlockCombineNone,
  unionOneBlockCombineOne,
  unionTwoBlocksCombineNone,
  unionTwoBlocksCombineOne,
  unionTwoBlocksCombineSame,
} from "@shared/question-generators/unionFind/utils.ts"
import {
  createArrayDisplayCodeBlock,
  createArrayDisplayCodeBlockUserInput,
} from "@shared/utils/arrayDisplayCodeBlock.ts"
import Random from "@shared/utils/random.ts"
import { t, Translations } from "@shared/utils/translations.ts"

/**
 * Returns a simple feedback function to check if the user input is the same as
 * the solution union
 * @param solutionUnion - correct calculated union
 */
export function getFeedbackFunction(solutionUnion: QuickFind): MultiFreeTextFeedbackFunction {
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
          }),
        }
      }
    }
    return {
      correct: true,
    }
  }
}

export function unionFindStartQuestion({
  random,
  union,
  unionSize,
  lang,
  permalink,
  translations,
  name,
}: {
  random: Random
  union: UnionFind
  unionSize: number
  lang: "de" | "en"
  permalink: string
  translations: Translations
  name: string
}) {
  const unionCaseGeneration = random.weightedChoice([
    [unionTwoBlocksCombineOne, 0.35],
    [unionTwoBlocksCombineNone, 0.2],
    [unionTwoBlocksCombineSame, 0.05],
    [unionOneBlockCombineOne, 0.25],
    [unionOneBlockCombineNone, 0.15],
  ])

  const { gapField, gapOperationValues } = unionCaseGeneration({
    random,
    union,
    unionSize,
  })

  const { arrayDisplayBlock } = createArrayDisplayCodeBlockUserInput({
    numberOfInputFields: union.getArray().length,
  })

  const question: MultiFreeTextQuestion = {
    type: "MultiFreeTextQuestion",
    name,
    path: permalink,
    text: t(translations, lang, "task", [
      gapField,
      gapOperationValues[0].toString(),
      gapOperationValues[1].toString(),
      arrayDisplayBlock,
    ]),
    feedback: getFeedbackFunction(union),
  }
  return question
}

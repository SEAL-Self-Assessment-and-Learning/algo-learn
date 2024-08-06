import {
  FreeTextFeedbackFunction,
  FreeTextQuestion,
  QuestionGenerator,
} from "@shared/api/QuestionGenerator"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter"
import { AVLTree } from "@shared/question-generators/avl/avlDS.ts"
import { avlTreeWeightedRotations } from "@shared/question-generators/avl/utils/utils.ts"
import { generateAVLTreeDelete } from "@shared/question-generators/avl/utils/utilsDelete.ts"
import { generateAVLTreeInsert } from "@shared/question-generators/avl/utils/utilsInsert.ts"
import Random, { sampleRandomSeed } from "@shared/utils/random"
import { t, tFunctional, Translations } from "@shared/utils/translations"

const translations: Translations = {
  en: {
    name: "AVL Tree",
    description: "Operation on AVL Trees",
    insert: "Below is an AVL tree. {{0}} We call **Insert({{1}})**. Draw the AVL tree that results.",
    delete: "Below is an AVL tree. {{0}} We call **Delete({{1}})**. Draw the AVL tree that results.",
  },
  de: {
    name: "AVL-Baum",
    description: "Operationen auf AVL-Bäumen",
    insert:
      "Unten abgebildet ist ein AVL-Baum. {{0}} Wir rufen **Delete({{1}})** auf. Zeichne unten den AVL-Baum, der dadurch entsteht.",
    delete: "blu blu blu",
  },
}

export const AVLGenerator: QuestionGenerator = {
  id: "avl",
  name: tFunctional(translations, "name"),
  description: tFunctional(translations, "description"),
  tags: ["avl", "tree"],
  languages: ["en", "de"],
  expectedParameters: [
    {
      type: "string",
      name: "variant",
      allowedValues: ["insert", "delete"],
    },
  ],

  generate: (lang, parameters, seed) => {
    const feedback: FreeTextFeedbackFunction = ({ text }) => {
      if (text === "0") {
        return {
          correct: true,
          message: "t(feedback.correct)",
        }
      }

      return {
        correct: false,
        message: "t(feedback.correct)",
      }
    }

    const permalink = serializeGeneratorCall({
      generator: AVLGenerator,
      lang,
      parameters,
      seed,
    })

    const random: Random = new Random(sampleRandomSeed())

    const variant = parameters.variant as "insert" | "delete" | "combine"

    if (variant === "delete") {
      return avlDeleteQuestion(random, feedback, lang, permalink)
    }
    return avlInsertQuestion(random, feedback, lang, permalink)
  },
}

function avlDeleteQuestion(
  random: Random,
  feedback: FreeTextFeedbackFunction,
  lang: "de" | "en",
  permalink: string,
) {
  const avlTreeSize = random.int(7, 14)
  const rotationOption = random.weightedChoice(avlTreeWeightedRotations)
  const { avlTree, askValue } = generateAVLTreeDelete({
    random,
    avlTreeSize,
    rotationOption,
  })

  const avlTreeString = createQuestionLayout({
    avlTree,
  })
  avlTree.delete(askValue)
  console.log(avlTree.levelOrderAlternative())

  const question: FreeTextQuestion = {
    type: "FreeTextQuestion",
    name: AVLGenerator.name(lang),
    text: t(translations, lang, "delete", [avlTreeString, askValue.toString()]),
    path: permalink,
    feedback,
  }
  return {
    question,
  }
}

function avlInsertQuestion(
  random: Random,
  feedback: FreeTextFeedbackFunction,
  lang: "de" | "en",
  permalink: string,
) {
  const avlTreeSize = random.int(6, 13)
  const rotationOption = random.weightedChoice(avlTreeWeightedRotations)

  const { avlTree, askValue } = generateAVLTreeInsert({
    random,
    avlTreeSize,
    rotationOption,
  })

  const avlTreeString = createQuestionLayout({
    avlTree,
  })
  avlTree.insert(askValue)
  console.log(avlTree.levelOrderAlternative())

  const question: FreeTextQuestion = {
    type: "FreeTextQuestion",
    name: AVLGenerator.name(lang),
    text: t(translations, lang, "insert", [avlTreeString, askValue.toString()]),
    path: permalink,
    feedback,
  }
  return {
    question,
    avlTree,
    askValue,
  }
}

function createQuestionLayout({ avlTree }: { avlTree: AVLTree }) {
  let avlTreeString = "\n|Index:|"
  const levelOrder = avlTree.levelOrderAlternative()
  for (let i = 0; i < levelOrder.length; i++) {
    avlTreeString += (i + 1).toString() + "|"
  }
  avlTreeString += "\n" + "|---".repeat(levelOrder.length + 1) + "|\n|Value:|"
  for (let i = 0; i < levelOrder.length; i++) {
    avlTreeString += (levelOrder[i] === null ? "-" : levelOrder[i]) + "|"
  }
  avlTreeString += "|#div_my-5#||\n"

  return avlTreeString
}

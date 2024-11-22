import {
  minimalMultipleChoiceFeedback,
  MultipleChoiceQuestion,
  QuestionGenerator,
} from "@shared/api/QuestionGenerator.ts"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter.ts"
import {
  AVLTreeRotations,
  avlTreeWeightedRotations,
} from "@shared/question-generators/avl/utils/utils.ts"
import { generateAVLTreeInsert } from "@shared/question-generators/avl/utils/utilsInsert.ts"
import Random from "@shared/utils/random.ts"
import { t, tFunctional, Translations } from "@shared/utils/translations.ts"

const translations: Translations = {
  en: {
    name: "AVL-Tree Rotations",
    description: "Correctly identify AVL-Tree Rotations",
    taskChoice:
      "Given the following AVL-Tree: {{0}} We insert the value {{1}} into the tree. Which rotation is performed?",
    noneR: "No rotation",
    leftR: "Left rotation",
    rightR: "Right rotation",
    leftRightR: "Left-Right rotation",
    rightLeftR: "Right-Left rotation",
  },
  de: {
    name: "AVL-Tree Rotationen",
    description: "Identifiziere korrekte AVL-Tree Rotationen",
  },
}

export const AVLRotationGenerator: QuestionGenerator = {
  id: "avlrot",
  name: tFunctional(translations, "name"),
  description: tFunctional(translations, "description"),
  tags: ["avl", "tree"],
  languages: ["en", "de"],
  expectedParameters: [
    {
      type: "string",
      name: "variant",
      allowedValues: ["start", "reverse"],
    },
  ],

  generate: (lang, parameters, seed) => {
    const permalink = serializeGeneratorCall({
      generator: AVLRotationGenerator,
      lang,
      parameters,
      seed,
    })

    const random: Random = new Random(seed)
    const variant: "start" | "reverse" = parameters.variant as "start" | "reverse"

    if (variant === "start") {
      return avlStartQuestion(random, lang, permalink)
    }

    return avlStartQuestion(random, lang, permalink)
  },
}

function avlStartQuestion(random: Random, lang: "de" | "en", permalink: string) {
  const avlTreeSize = random.int(6, 13)
  const rotationOption = random.weightedChoice(avlTreeWeightedRotations)
  const rotationOptions = [
    t(translations, lang, "noneR"),
    t(translations, lang, "leftR"),
    t(translations, lang, "rightR"),
    t(translations, lang, "leftRightR"),
    t(translations, lang, "rightLeftR"),
  ]
  const correctAnswerIndex = getCorrectAnswerIndex(rotationOption)

  const { avlTree, askValue } = generateAVLTreeInsert({
    random,
    avlTreeSize,
    rotationOption,
  })
  const graphTree = avlTree.toRootedTree().toGraph()
  graphTree.nodeDraggable = false

  const question: MultipleChoiceQuestion = {
    type: "MultipleChoiceQuestion",
    path: permalink,
    name: AVLRotationGenerator.name(lang),
    text: t(translations, lang, "taskChoice", [graphTree.toMarkdown(), askValue.toString()]),
    answers: rotationOptions,
    feedback: minimalMultipleChoiceFeedback({ correctAnswerIndex }),
  }
  return {
    question,
  }
}

function getCorrectAnswerIndex(rotationOption: AVLTreeRotations): number {
  switch (rotationOption) {
    case "none":
      return 0
    case "left":
      return 1
    case "right":
      return 2
    case "leftRight":
      return 3
    default:
      return 4
  }
}

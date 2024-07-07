import { FreeTextQuestion, QuestionGenerator } from "@shared/api/QuestionGenerator"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter"
import { avlTreeWeightedRotations, generateAVLTreeInsert } from "@shared/question-generators/avl/utils"
import Random from "@shared/utils/random"
import { t, tFunctional, Translations } from "@shared/utils/translations"

const translations: Translations = {
  en: {
    name: "AVL Tree",
    description: "Operation on AVL Trees",
    insert: "Below is an AVL tree. {{0}} We call **Insert({{1}})**. Draw the AVL tree that results.",
    delete: "blu blu blu",
    combine: "ble ble ble",
  },
  de: {
    name: "AVL-Baum",
    description: "Operationen auf AVL-Bäumen",
    insert:
      "Unten abgebildet ist ein AVL-Baum. {{0}} Wir rufen **Insert({{1}})** und **Insert({{2}})** in dieser Reihenfolge auf. Zeichne unten den AVL-Baum, der dadurch entsteht.",
    delete: "blu blu blu",
    combine: "ble ble ble",
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
      allowedValues: ["insert", "delete", "combine"],
    },
  ],

  generate: (lang, parameters, seed) => {
    const permalink = serializeGeneratorCall({
      generator: AVLGenerator,
      lang,
      parameters,
      seed,
    })

    const random: Random = new Random(seed)

    const variant = parameters.variant as "insert" | "delete" | "combine"
    console.log(variant)

    return avlInsertQuestion(lang, random, permalink)
  },
}

function avlInsertQuestion(lang: "de" | "en", random: Random, permalink: string) {
  const avlTreeSize = random.int(6, 11)
  const rotationOption = random.weightedChoice(avlTreeWeightedRotations)

  const { avlTree, askValue } = generateAVLTreeInsert({
    random,
    avlTreeSize,
    rotationOption,
  })

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

  const question: FreeTextQuestion = {
    type: "FreeTextQuestion",
    name: AVLGenerator.name(lang),
    text: t(translations, lang, "insert", [avlTreeString, askValue]),
    path: permalink,
  }
  return {
    question,
  }
}

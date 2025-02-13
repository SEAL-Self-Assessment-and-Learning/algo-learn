import {
  minimalMultipleChoiceFeedback,
  type FreeTextQuestion,
  type MultipleChoiceQuestion,
  type QuestionGenerator,
} from "@shared/api/QuestionGenerator.ts"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter.ts"
import {
  getAVLRotationBase,
  getReverseFeedback,
  getRotationIndex,
} from "@shared/question-generators/graph-algorithms/avl/utils/rotationGen.ts"
import { generateAVLTreeInsert } from "@shared/question-generators/graph-algorithms/avl/utils/utilsInsert.ts"
import Random from "@shared/utils/random.ts"
import { t, tFunctional, type Translations } from "@shared/utils/translations.ts"

const translations: Translations = {
  en: {
    name: "AVL-Tree Rotations",
    description: "Correctly identify AVL-Tree Rotations",
    taskStart:
      "Given the following AVL-Tree: {{0}} We insert the value `{{1}}` into the tree. Which rotation is performed?",
    taskReverse:
      "Given the following AVL-Tree $A$: {{0}} We perform `A.insert(x)`. Provide a value for $x$, such that $A$ does a **{{1}}**.",
    noneR: "No rotation",
    leftR: "Left rotation",
    rightR: "Right rotation",
    leftRightR: "Left-Right rotation",
    rightLeftR: "Right-Left rotation",
  },
  de: {
    name: "AVL-Tree Rotationen",
    description: "Identifiziere korrekte AVL-Tree Rotationen",
    taskStart:
      "Gegeben ist der folgende AVL-Baum: {{0}}. Wir fügen den Wert `{{1}}` in den Baum ein. Welche Rotation wird ausgeführt?",
    taskReverse:
      "Gegeben ist der folgende AVL-Baum $A$: {{0}}. Wir führen `A.insert(x)` aus. Geben Sie einen Wert für $x$ an, sodass $A$ eine **{{1}}** ausführt.",
    noneR: "Keine Rotation",
    leftR: "Links-Drehung",
    rightR: "Rechts-Drehung",
    leftRightR: "Links-Rechts-Drehung",
    rightLeftR: "Rechts-Links-Drehung",
  },
}

/**
 * Provides an AVL Tree to the user and either ask
 * - if insert(x) which rotation is the tree performing
 * - if tree does should do rotation y, which value has to be inserted
 */
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
    } else {
      return avlReverseQuestion(random, lang, permalink)
    }
  },
}

/**
 * Creates the question for variant "reverse"
 */
function avlReverseQuestion(random: Random, lang: "de" | "en", permalink: string) {
  const { avlTreeSize, rotationOption, rotationOptions } = getAVLRotationBase(random, translations, lang)
  const { avlTree, askValue: possibleAnswer } = generateAVLTreeInsert({
    random,
    avlTreeSize,
    rotationOption,
    randNextInt: (val, random) => {
      return random.intNormal(val + 1, val + 20, val + 7, 2)
    },
  })

  const graphTree = avlTree.toRootedTree().toGraph()
  graphTree.nodeDraggable = false

  const question: FreeTextQuestion = {
    type: "FreeTextQuestion",
    path: permalink,
    name: AVLRotationGenerator.name(lang),
    text: t(translations, lang, "taskReverse", [
      graphTree.toMarkdown(),
      rotationOptions[getRotationIndex(rotationOption)],
    ]),
    prompt: "$x=$",
    feedback: getReverseFeedback(avlTree, rotationOption, possibleAnswer),
  }
  return {
    question,
  }
}

/**
 * Creates the question for variant "start"
 */
function avlStartQuestion(random: Random, lang: "de" | "en", permalink: string) {
  const { avlTreeSize, rotationOption, rotationOptions } = getAVLRotationBase(random, translations, lang)
  const correctAnswerIndex = getRotationIndex(rotationOption)

  const { avlTree, askValue } = generateAVLTreeInsert({
    random,
    avlTreeSize,
    rotationOption,
    randNextInt: (val, random) => {
      return random.intNormal(val + 1, val + 20, val + 7, 2)
    },
  })
  const graphTree = avlTree.toRootedTree().toGraph()
  graphTree.nodeDraggable = false

  const question: MultipleChoiceQuestion = {
    type: "MultipleChoiceQuestion",
    path: permalink,
    name: AVLRotationGenerator.name(lang),
    text: t(translations, lang, "taskStart", [graphTree.toMarkdown(), askValue.toString()]),
    answers: rotationOptions,
    feedback: minimalMultipleChoiceFeedback({ correctAnswerIndex }),
  }
  return {
    question,
  }
}

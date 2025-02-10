import type {
  FreeTextAnswer,
  FreeTextFormatFunction,
  FreeTextQuestion,
  QuestionGenerator,
} from "@shared/api/QuestionGenerator.ts"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter.ts"
import { RootedTree, traversalStrategies } from "@shared/utils/graph"
import { t, tFunctional, type Translations } from "@shared/utils/translations.ts"
import Random from "../../utils/random"

const translations: Translations = {
  en: {
    name: "Tree Taversal",
    description: "Compute a traversal order of the nodes in a tree.",
    param_size: "Tree size",
    text: `Given the following tree, compute **{{t}} traversal** of the nodes. {{g}}`,
    freetext_prompt: "Node order:",
    check_unknown_node: '"{{n}}" is not a node in the tree.',
    feedback_num_nodes:
      "The traversal order either does not contain all nodes or contains to many nodes.",
    feedback_order: "The traversal order is wrong from the {{i}}. node ({{n}}) onwards.",
  },
  de: {
    name: "Baum Traversierung",
    description: "Berechne eine Traversierung eine Baums.",
    param_size: "Baumgröße",
    text: `Gegeben sei der folgende Baum. Berechne **{{t}}-Traversierung**. {{g}}`,
    freetext_prompt: "Kontenreihenfolge",
    check_unknown_node: '"{{n}}" ist kein Knoten des Baums.',
    feedback_num_nodes: "Die Traversierung enthält nicht alle oder zu viele Knoten.",
    feedback_order: "Die Reihenfolge ist ab dem {{i}}. Knoten ({{n}}) nicht mehr korrekt.",
  },
}

const traversalStrategiesTranslations: Translations = {
  en: { pre: "a preorder", in: "an inorder", post: "a postorder" },
  de: { pre: "eine Preorder", in: "eine Inorder", post: "eine Postorder" },
}

function parseAnswers(text: string): string[] {
  return text
    .split(/[\s,]+/)
    .map((s) => s.trim().toUpperCase())
    .filter((s) => s !== "")
}

/**
 * This question generator generates a simple multiple choice question.
 */
export const TreeTraversal: QuestionGenerator = {
  id: "tt",
  name: tFunctional(translations, "name"),
  description: tFunctional(translations, "description"),
  tags: ["graph", "tree", "traversal", "preorder", "inorder", "postorder"],
  languages: ["en", "de"],
  license: "MIT",
  expectedParameters: [
    {
      name: "size",
      description: tFunctional(translations, "param_size"),
      type: "integer",
      min: 1,
      max: 3,
    },
  ],

  /**
   * Generates a new MultipleChoiceQuestion question.
   *
   * @generatorPath The path the generator is located on the page. Defined in settings/questionSelection.ts
   * @param lang The language of the question
   * @param parameters The parameters for the question. In this case none are used.
   * @param seed The seed for the random number generator
   * @returns A new MultipleChoiceQuestion question
   */
  generate: (lang = "en", parameters, seed) => {
    // initialize the RNG so the question can be generated again
    const random = new Random(seed)
    const size = parameters.size as number

    const depth = { min: size < 3 ? 1 : 2, max: size < 2 ? 2 : 3 }
    const degree = { min: 2, max: size < 2 ? 2 : 3 }

    const T = RootedTree.random(depth, degree, random)
    const G = T.toGraph()
    G.nodeDraggable = false

    const strategy = random.choice(traversalStrategies)

    const correctOrder = T.getTraversalOrder(strategy)

    const checkFormat: FreeTextFormatFunction = (answer: FreeTextAnswer) => {
      const order = parseAnswers(answer.text)

      for (let i = 0; i < order.length; i++) {
        if (!correctOrder.includes(order[i])) {
          return {
            valid: false,
            message: t(translations, lang, "check_unknown_node", { n: order[i] }),
          }
        }
      }

      return {
        valid: true,
        message: "",
      }
    }

    const feedback = ({ text }: { text: string }) => {
      const answer = parseAnswers(text)

      if (answer.length !== correctOrder.length) {
        return {
          correct: false,
          correctAnswer: correctOrder.join(", "),
          feedbackText: t(translations, lang, "feedback_num_nodes"),
        }
      }

      for (let i = 0; i < answer.length; i++) {
        if (answer[i] !== correctOrder[i]) {
          return {
            correct: false,
            correctAnswer: correctOrder.join(", "),
            feedbackText: t(translations, lang, "feedback_order", {
              i: (i + 1).toString(),
              n: answer[i],
            }),
          }
        }
      }

      return {
        correct: true,
      }
    }

    // generate the question object
    const question: FreeTextQuestion = {
      type: "FreeTextQuestion",
      name: TreeTraversal.name(lang),
      path: serializeGeneratorCall({
        generator: TreeTraversal,
        lang,
        parameters,
        seed,
      }),
      text: t(translations, lang, "text", {
        t: t(traversalStrategiesTranslations, lang, strategy),
        g: G.toMarkdown(),
      }),
      prompt: t(translations, lang, "freetext_prompt"),
      placeholder: "A, B, C, ...",
      checkFormat,
      feedback,
    }

    return { question }
  },
}

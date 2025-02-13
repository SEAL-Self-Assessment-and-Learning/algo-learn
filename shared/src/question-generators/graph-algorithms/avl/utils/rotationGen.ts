import type { FreeTextFeedbackFunction } from "@shared/api/QuestionGenerator.ts"
import type { AVLTree } from "@shared/question-generators/graph-algorithms/avl/avlDS.ts"
import {
  avlTreeWeightedRotations,
  type AVLTreeRotations,
} from "@shared/question-generators/graph-algorithms/avl/utils/utils.ts"
import type Random from "@shared/utils/random.ts"
import { t, type Translations } from "@shared/utils/translations.ts"

/**
 * Maps an AVL tree rotation option to its corresponding index.
 *
 * This function returns a numerical index representing the type of rotation.
 * The indices are as follows:
 * - "none" -> 0
 * - "left" -> 1
 * - "right" -> 2
 * - "leftRight" -> 3
 * - "rightLeft" -> 4
 *
 * @param {AVLTreeRotations} rotationOption - The rotation type to be mapped to an index.
 */
export function getRotationIndex(rotationOption: AVLTreeRotations): number {
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

/**
 * Generates a feedback function for validating user input against an AVL tree operation.
 *
 * @param avlTree - The AVL tree used to simulate the insertion.
 * @param desiredRotation - The expected rotation result from the insertion.
 * @param possibleAnswer - The correct answer that should produce the desired rotation.
 */
export function getReverseFeedback(
  avlTree: AVLTree,
  desiredRotation: AVLTreeRotations,
  possibleAnswer: number,
): FreeTextFeedbackFunction {
  const feedbackWrong = {
    correct: false,
    correctAnswer: possibleAnswer.toString(),
  }

  return ({ text }) => {
    const answer = text.replace(/\s/g, "")
    if (answer === "") {
      return feedbackWrong
    }
    // try to parse answer to float
    const parsedAnswer = parseFloat(answer)
    if (isNaN(parsedAnswer) || avlTree.insert(parsedAnswer) !== desiredRotation) {
      return feedbackWrong
    }
    return {
      correct: true,
    }
  }
}

/**
 * Generates base configuration for an AVL tree rotation exercise.
 *
 * @returns An object containing the following properties:
 * - `avlTreeSize` (number): A random integer between 6 and 12 representing the size of the AVL tree.
 * - `rotationOption` (string): A rotation option.
 * - `rotationOptions` (string[]): An array of translated rotation option names.
 */
export function getAVLRotationBase(random: Random, translations: Translations, lang: "en" | "de") {
  const avlTreeSize = random.int(6, 12)
  const rotationOption = random.weightedChoice(avlTreeWeightedRotations)
  const rotationOptions = [
    t(translations, lang, "noneR"),
    t(translations, lang, "leftR"),
    t(translations, lang, "rightR"),
    t(translations, lang, "leftRightR"),
    t(translations, lang, "rightLeftR"),
  ]
  return { avlTreeSize, rotationOption, rotationOptions }
}

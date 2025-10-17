import type { QuestionTopic } from "@settings/questionsSelection.ts"

/**
 * Maps question topics to their corresponding colors.
 * Code for background
 */
export const topicColorsBG: Record<QuestionTopic, string> = {
  demo: "bg-red-700 dark:bg-red-900",
  math: "bg-blue-700 dark:bg-blue-900",
  logic: "bg-purple-700 dark:bg-purple-900",
  graph: "bg-cyan-500 dark:bg-cyan-900",
  "data-structures": "bg-pink-700 dark:bg-pink-900",
  algorithms: "bg-orange-500 dark:bg-orange-900",
  pseudocode: "bg-yellow-500 dark:bg-yellow-900",
  recursion: "bg-green-500 dark:bg-green-900",
}

/**
 * Maps question topics to their corresponding border colors.
 * Code for border
 */
export const topicColorBorder: Record<QuestionTopic, string> = {
  demo: "border-red-700 dark:border-red-900",
  math: "border-blue-700 dark:border-blue-900",
  logic: "border-purple-700 dark:border-purple-900",
  graph: "border-cyan-500 dark:border-cyan-900",
  "data-structures": "border-pink-700 dark:border-pink-900",
  algorithms: "border-orange-500 dark:border-orange-900",
  pseudocode: "border-yellow-500 dark:border-yellow-900",
  recursion: "border-green-500 dark:border-green-900",
}

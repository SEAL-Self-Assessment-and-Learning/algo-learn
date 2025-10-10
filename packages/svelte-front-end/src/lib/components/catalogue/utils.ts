import type { QuestionTopic } from "@settings/questionsSelection.ts"

export const topicColorsBG: Record<QuestionTopic, string> = {
  demo: "bg-red-700 dark:bg-red-900",
  math: "bg-blue-700 dark:bg-blue-900",
  cs: "bg-green-500 dark:bg-green-900",
  logic: "bg-purple-700 dark:bg-purple-900",
  graph: "bg-cyan-500 dark:bg-cyan-900",
  "data-structures": "bg-pink-700 dark:bg-pink-900",
  algorithms: "bg-orange-500 dark:bg-orange-900",
}

export const topicColorBorder: Record<string, string> = {
  demo: "border-red-700 dark:border-red-900",
  math: "border-blue-700 dark:border-blue-900",
  cs: "border-green-500 dark:border-green-900",
  logic: "border-purple-700 dark:border-purple-900",
  graph: "border-cyan-500 dark:border-cyan-900",
  "data-structures": "border-pink-700 dark:border-pink-900",
  algorithms: "border-orange-500 dark:border-orange-900",
}

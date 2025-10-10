import type { SingleTranslation } from "@shared/utils/translations.ts"
import { collection as demos } from "./questionsSelection.demos.ts"
import { oldPathToGenerator, collection as stable } from "./questionsSelection.stable.ts"

/** The mode can be 'production', 'testing', and 'development' */
const mode: string = import.meta.env.MODE
export { oldPathToGenerator }

export const collection = mode === "production" ? stable : demos.concat(stable)

export type QuestionTopic = "demo" | "math" | "cs" | "logic" | "graph" | "data-structures" | "algorithms"
export const allQuestionTopics: QuestionTopic[] = [
  ...(mode !== "production" ? ["demo" as QuestionTopic] : []),
  "math",
  "cs",
  "logic",
  "graph",
  "data-structures",
  "algorithms",
]

export const topicNames: Record<QuestionTopic, SingleTranslation> = {
  demo: { de: "Demo", en: "Demo" },
  math: { de: "Mathematik", en: "Math" },
  cs: { de: "Informatik", en: "Computer Science" },
  logic: { de: "Logik", en: "Logic" },
  graph: { de: "Graphen", en: "Graphs" },
  "data-structures": { de: "Datenstrukturen", en: "Data Structures" },
  algorithms: { de: "Algorithmen", en: "Algorithms" },
}

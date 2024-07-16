import { RandomGraph } from "@shared/utils/graph"
import {
  minimalMultipleChoiceFeedback,
  MultipleChoiceQuestion,
  QuestionGenerator,
} from "@shared/api/QuestionGenerator.ts"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter.ts"
import Random from "../../utils/random"
import { t, tFunctional, Translations } from "@shared/utils/translations.ts"
import { ExampleQuestion } from "../example/example"

const translations: Translations = {
  en: {
    name: "Breadth-first search",
    description: "Run breadth-first search (BFS) on a graph",
    text: `Let \${{0}}$ be the following graph:

\`\`\`graph
{{1}}
\`\`\`

Suppose we start breadth-first search (BFS) at node \${{2}}$. In which order might BFS visit the nodes of graph?`,
  },
  de: {
    name: "Breitensuche",
    description: "Führe Breitensuche (BFS) auf einem Graphen aus",
    text: `Sei \${{0}}$ der folgende Graph:
    
\`\`\`graph
{{1}}
\`\`\`

Angenommen, wir starten Breitensuche (BFS) bei Knoten \${{2}}$. In welcher Reihenfolge könnte BFS die Knoten des Graphen besuchen?`,
  },
}

/**
 * This question generator generates a simple multiple choice question.
 */
export const BFS: QuestionGenerator = {
  id: "bfs",
  name: tFunctional(translations, "name"),
  description: tFunctional(translations, "description"),
  tags: ["graph", "bfs"],
  languages: ["en", "de"],
  author: "Holger Dell",
  license: "MIT",
  expectedParameters: [],

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

    const G = RandomGraph.grid(
      random,
      [4, 3],
      0.8,
      random.choice(["triangle", "square", "square-width-diagonals"]),
      random.choice(["unique", "random", null]),
      random.float(0, 1) < 0.5,
      random.float(0, 1) < 0.5,
    )

    // generate the question values
    const a = random.choice(["G"])
    const b = random.int(1, 10)
    const correctAnswer = "TODO"

    // get a set of wrong answers
    const answers = ["1", "2"]

    // add the correct answer, shuffle and find the index of the correct answer
    answers.push(`${correctAnswer}`)
    random.shuffle(answers)
    const correctAnswerIndex = answers.indexOf(`${correctAnswer}`)

    // generate the question object
    const question: MultipleChoiceQuestion = {
      type: "MultipleChoiceQuestion",
      name: BFS.name(lang),
      path: serializeGeneratorCall({
        generator: ExampleQuestion,
        lang,
        parameters,
        seed,
      }),
      text: t(translations, lang, "text", [`${a}`, G.toString(), `${b}`]),
      answers,
      feedback: minimalMultipleChoiceFeedback({ correctAnswerIndex }),
    }

    return { question }
  },
}

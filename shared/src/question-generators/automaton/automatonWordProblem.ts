import type {
  MultipleChoiceQuestion,
  QuestionGenerator} from "@shared/api/QuestionGenerator";
import {
  minimalMultipleChoiceFeedback
} from "@shared/api/QuestionGenerator"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter"
import type { Automaton } from "@shared/question-generators/automaton/automaton"
import { generateAutomaton } from "@shared/question-generators/automaton/automatonGenerator"
import Random from "@shared/utils/random"
import type { Translations } from "@shared/utils/translations";
import { t, tFunctional } from "@shared/utils/translations"

const translations: Translations = {
  en: {
    name: "Word Problem in Finite Automata",
    description: "Determine which words are accepted by the automaton.",
    question:
      "Let $\\mathcal{A}=(Q,\\Sigma,{{startnode}},F,\\delta)$ be a NFA, where $\\\\ Q = \\{ {{states}} \\}$ is the set of states, $\\\\ \\Sigma=\\{0,1\\}$ is the input alphabet, $\\\\ F = \\{ {{endstates}} \\}$ is the set of accepting states, and $\\\\ \\delta$ is the transition function given by $\\\\ {{transitions}}$. $\\\\$Select all words that are accepted by $\\mathcal{A}$.",
    prompt: "Which of the following words are accepted by $\\mathcal{A}$?",
    none: "None of the above",
  },
  de: {
    name: "Wortproblem in endlichen Automaten",
    description: "Bestimme die vom Automaten akzeptierten Wörter",
    question:
      "Sei $\\mathcal{A}=(Q,\\Sigma,{{startnode}},F,\\delta)$ ein NFA mit $\\\\ Q = \\{ {{states}} \\}$ ist die Menge der Zustände, $\\\\ \\Sigma=\\{0,1\\}$ ist das Eingabealphabet, $\\\\ F = \\{ {{endstates}} \\}$ ist die Menge der akzeptierenden Zustände und $\\\\ \\delta$ ist die Übergangsfunktion, gegeben durch $\\\\ {{transitions}}$. $\\\\$Wähle alle Wörter aus, die von $\\mathcal{A}$ akzeptiert werden.",
    prompt: "Welche der folgenden Wörter werden von $\\mathcal{A}$ akzeptiert?",
    none: "Keine der genannten Optionen",
  },
}

function generateWords(random: Random, count: number, minLength: number, maxLength: number): string[] {
  return Array.from({ length: count }, () =>
    Array.from({ length: random.int(minLength, maxLength) }, () => random.int(0, 1)).join(""),
  )
}

function isWordAccepted(automaton: Automaton, word: string): boolean {
  let currentStates = new Set<string>()
  const startNode = automaton.nodes.find((n) => n.isStart)
  if (!startNode || !startNode.label) throw new Error("No start state found.")

  currentStates.add(startNode.label)

  for (const char of word) {
    const nextStates = new Set<string>()
    for (const state of currentStates) {
      const stateIndex = automaton.nodes.findIndex((n) => n.label === state)
      if (stateIndex !== -1 && automaton.edges[stateIndex]) {
        for (const edge of automaton.edges[stateIndex]) {
          if (edge.value !== undefined && edge.value.toString() === char) {
            const targetLabel = automaton.nodes[edge.target]?.label
            if (targetLabel) nextStates.add(targetLabel)
          }
        }
      }
    }
    currentStates = nextStates
  }

  return [...currentStates].some((state) => automaton.nodes.find((n) => n.label === state)?.isEnd)
}

export const AutomatonWordQuestion: QuestionGenerator = {
  id: "nfaaccept",
  name: tFunctional(translations, "name"),
  description: tFunctional(translations, "description"),
  tags: ["automaton", "word recognition"],
  languages: ["en", "de"],
  license: "MIT",
  expectedParameters: [
    {
      name: "size",
      description: (lang) => t(translations, lang, "description"),
      type: "integer",
      min: 3,
      max: 6,
    },
  ],

  generate: (lang: "en" | "de", parameters, seed) => {
    const random = new Random(seed)
    const size = parameters.size as number

    const automaton = generateAutomaton(random, size, 0.6, 0.3)

    // generate options
    const words = generateWords(random, 6, 2, 6)
    const acceptedWords = words.filter((word) => isWordAccepted(automaton, word))

    const answers = words.map((word) => ({
      key: word,
      element: word,
      correct: acceptedWords.includes(word),
    }))

    const noneOfTheAbove = t(translations, lang, "none")
    answers.push({
      key: noneOfTheAbove,
      element: noneOfTheAbove,
      correct: acceptedWords.length === 0, // correct iff no other option is correct
    })

    // format transitions
    const transitions = automaton.edges
      .flatMap((row, sourceIndex) =>
        row.map(
          (edge) =>
            `\\delta(${automaton.nodes[sourceIndex]?.label}, ${edge.value}) = ${automaton.nodes[edge.target]?.label}`,
        ),
      )
      .join(", \\\\")

    const question: MultipleChoiceQuestion = {
      type: "MultipleChoiceQuestion",
      name: AutomatonWordQuestion.name(lang),
      path: serializeGeneratorCall({ generator: AutomatonWordQuestion, lang, parameters, seed }),
      allowMultiple: true,
      text: t(translations, lang, "question", {
        startnode: "q_0",
        states: automaton.nodes.map((n) => n.label).join(", "),
        endstates: automaton.nodes
          .filter((n) => n.isEnd)
          .map((n) => n.label)
          .join(", "),
        transitions,
      }),
      answers: answers.map(({ element }) => element),
      feedback: minimalMultipleChoiceFeedback({
        correctAnswerIndex: answers
          .map((answer, index) => (answer.correct ? index : -1))
          .filter((index) => index !== -1),
      }),
    }

    return { question }
  },
}

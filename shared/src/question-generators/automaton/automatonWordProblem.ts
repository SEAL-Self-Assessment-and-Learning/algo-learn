import {
  minimalMultipleChoiceFeedback,
  type MultipleChoiceQuestion,
  type QuestionGenerator,
} from "@shared/api/QuestionGenerator"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter"
import type { Automaton } from "@shared/question-generators/automaton/automaton"
import { generateDFA, generateNFA } from "@shared/question-generators/automaton/automatonGenerator"
import Random from "@shared/utils/random"
import { t, tFunctional, type Translations } from "@shared/utils/translations"

const translations: Translations = {
  en: {
    name: "Word Problem in Finite Automata",
    description: "Determine which words are accepted by the automaton.",
    question:
      "Let $\\mathcal{A}=(Q,\\Sigma,{{startnodes}},F,\\delta)$ be a {{type}}, where $\\\\ Q = \\{ {{states}} \\}$ is the set of states, $\\\\ \\Sigma=\\{ {{alphabet}} \\}$ is the input alphabet, $\\\\ F = \\{ {{endstates}} \\}$ is the set of accepting states, and $\\\\ \\delta$ is the transition function given by $\\\\ {{transitions}}$. $\\\\$Select all words that are accepted by $\\mathcal{A}$.",
    prompt: "Which of the following words are accepted by $\\mathcal{A}$?",
    none: "None of the above",
  },
  de: {
    name: "Wortproblem in endlichen Automaten",
    description: "Bestimme die vom Automaten akzeptierten Wörter.",
    question:
      "Sei $\\mathcal{A}=(Q,\\Sigma,{{startnodes}},F,\\delta)$ ein {{type}}, wobei $\\\\ Q = \\{ {{states}} \\}$ die Menge der Zustände ist, $\\\\ \\Sigma=\\{ {{alphabet}} \\}$ das Eingabealphabet ist, $\\\\ F = \\{ {{endstates}} \\}$ die Menge der akzeptierenden Zustände ist und $\\\\ \\delta$ die Übergangsfunktion ist, gegeben durch $\\\\ {{transitions}}$. $\\\\$Wähle alle Wörter aus, die von $\\mathcal{A}$ akzeptiert werden.",
    prompt: "Welche der folgenden Wörter werden von $\\mathcal{A}$ akzeptiert?",
    none: "Keine der genannten Optionen",
  },
}

/**
 * Generates random words from the given alphabet.
 */
function generateWords(
  random: Random,
  count: number,
  minLength: number,
  maxLength: number,
  alphabet: string[],
): string[] {
  return Array.from({ length: count }, () =>
    Array.from({ length: random.int(minLength, maxLength) }, () => random.choice(alphabet)).join(""),
  )
}

/**
 * Simulates the automaton to determine whether a word is accepted.
 */
function isWordAccepted(automaton: Automaton, word: string): boolean {
  let currentStates = new Set<string>()
  const startNodes = automaton.nodes
    .filter((n) => n.isStart && n.label !== undefined)
    .map((n) => n.label as string) // Ensure no undefined values

  if (startNodes.length === 0) throw new Error("No start states found.")

  startNodes.forEach((state) => currentStates.add(state))

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

/**
 * Question Generator for the Automaton Word Problem (NFA and DFA Variants).
 */
export const AutomatonWordQuestion: QuestionGenerator = {
  id: "automatonaccept",
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
    {
      name: "type",
      description: (lang) =>
        lang === "en" ? "Type of automaton (NFA or DFA)." : "Typ des Automaten (NFA oder DFA).",
      type: "string",
      allowedValues: ["NFA", "DFA"],
    },
  ],

  generate: (lang: "en" | "de", parameters, seed) => {
    const random = new Random(seed)
    const size = parameters.size as number
    const type = parameters.type as "NFA" | "DFA"
    const alphabet = ["0", "1"]

    const automaton =
      type === "NFA"
        ? generateNFA(random, size, alphabet, 0.5, 0.2, 0.1, 0.3, true)
        : generateDFA(random, size, alphabet, 0.2, true)

    // generate options
    const words = generateWords(random, 6, 2, 6, alphabet)
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
        row.map((edge) => {
          const input = edge.value === undefined ? "\\varepsilon" : edge.value
          return `\\delta(${automaton.nodes[sourceIndex]?.label}, ${input}) = ${automaton.nodes[edge.target]?.label}`
        }),
      )
      .join(", \\\\")

    const question: MultipleChoiceQuestion = {
      type: "MultipleChoiceQuestion",
      name: AutomatonWordQuestion.name(lang),
      path: serializeGeneratorCall({ generator: AutomatonWordQuestion, lang, parameters, seed }),
      allowMultiple: true,
      text: t(translations, lang, "question", {
        type,
        startnodes: automaton.nodes
          .filter((n) => n.isStart)
          .map((n) => n.label)
          .join(", "),
        states: automaton.nodes.map((n) => n.label).join(", "),
        endstates: automaton.nodes
          .filter((n) => n.isEnd)
          .map((n) => n.label)
          .join(", "),
        alphabet: alphabet.join(", "),
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

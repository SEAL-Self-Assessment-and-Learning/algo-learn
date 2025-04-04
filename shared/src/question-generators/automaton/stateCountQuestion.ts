import type { FreeTextQuestion, QuestionGenerator } from "@shared/api/QuestionGenerator"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter"
import Random from "@shared/utils/random"
import { t, tFunctional, type Translations } from "@shared/utils/translations"
import { generateDFA, generateNFA } from "./automatonGenerator"
import { convertNFAtoDFA, minimizeDFA } from "./automatonUtil"

const translations: Translations = {
  en: {
    name: "Minimal DFA State Count",
    description: "Determine how many states the minimal DFA has.",
    questionNFA:
      "Let $\\mathcal{A}=(Q,\\Sigma,{{startnodes}},F,\\delta)$ be a NFA, where $\\\\ Q = \\{ {{states}} \\}$ is the set of states, $\\\\ F = \\{ {{endstates}} \\}$ is the set of accepting states, and $\\\\ \\delta$ is the transition function given by  $\\\\ {{transitions}}$. $\\\\$How many states does the minimal DFA equivalent to $\\mathcal{A}$ have?",
    questionDFA:
      "Let $\\mathcal{A}=(Q,\\Sigma,{{startnodes}},F,\\delta)$ be a DFA, where $\\\\ Q = \\{ {{states}} \\}$ is the set of states, $\\\\ F = \\{ {{endstates}} \\}$ is the set of accepting states, and $\\\\ \\delta$ is the transition function given by $\\\\ {{transitions}}$. $\\\\$How many states does the minimal DFA equivalent to $\\mathcal{A}$ have?",
    prompt: "Number of states:",
  },
  de: {
    name: "Minimale DFA Zustandsanzahl",
    description: "Bestimme wie viele Zustände der minimale DFA hat.",
    questionNFA:
      "Sei $\\mathcal{A}=(Q,\\Sigma,{{startnodes}},F,\\delta)$ ein NFA mit $\\\\ Q = \\{ {{states}} \\}$ die Menge der Zustände, $\\\\ F = \\{ {{endstates}} \\}$ die Menge der akzeptierenden Zustände und $\\\\ \\delta$ ist die Übergangsfunktion gegeben durch $\\\\ {{transitions}}$. $\\\\$Wie viele Zustände hat der minimale DFA, der äquivalent zu $\\mathcal{A}$ ist?",
    questionDFA:
      "Sei $\\mathcal{A}=(Q,\\Sigma,{{startnodes}},F,\\delta)$ ein DFA mit $\\\\ Q = \\{ {{states}} \\}$ die Menge der Zustände, $\\\\ F = \\{ {{endstates}} \\}$ die Menge der akzeptierenden Zustände und $\\\\ \\delta$ ist die Übergangsfunktion gegeben durch $\\\\ {{transitions}}$. $\\\\$Wie viele Zustände hat der minimale DFA, der äquivalent zu $\\mathcal{A}$ ist?",
    prompt: "Anzahl Zustände:",
  },
}

export const MinimalDFAStateCount: QuestionGenerator = {
  id: "dfa_minstatecount",
  name: tFunctional(translations, "name"),
  description: tFunctional(translations, "description"),
  license: "MIT",
  tags: ["dfa", "nfa", "minimization"],
  languages: ["en", "de"],
  expectedParameters: [
    {
      name: "type",
      type: "string",
      allowedValues: ["NFA", "DFA"],
      description: (lang) => (lang === "en" ? "Type of automaton" : "Typ des Automaten"),
    },
    {
      name: "size",
      type: "integer",
      min: 3,
      max: 6,
      description: (lang) => t(translations, lang, "description"),
    },
  ],

  generate(lang, parameters, seed) {
    const random = new Random(seed)
    const type = parameters.type as "NFA" | "DFA"
    const size = parameters.size as number
    const alphabet = ["0", "1"]

    const original =
      type === "NFA"
        ? generateNFA(random, size, alphabet, 0.5, 0.2, 0.1, 0.3, true)
        : generateDFA(random, size, alphabet, 0.2, true)

    const dfa = type === "NFA" ? convertNFAtoDFA(original, alphabet) : original
    const minimized = minimizeDFA(dfa, alphabet)
    const stateCount = minimized.nodes.length

    const transitions = original.edges
      .flatMap((row, i) =>
        row.map((edge) => {
          const label = edge.value === undefined ? "\\varepsilon" : edge.value.toString()
          return `\\delta(${original.nodes[i].label}, ${label}) = ${original.nodes[edge.target]?.label}`
        }),
      )
      .join(", \\\\")

    const text = t(translations, lang, type === "NFA" ? "questionNFA" : "questionDFA", {
      startnodes: original
        .getStartNodes()
        .map((n) => n.label)
        .join(", "),
      states: original.nodes.map((n) => n.label).join(", "),
      endstates: original.nodes
        .filter((n) => n.isEnd)
        .map((n) => n.label)
        .join(", "),
      transitions,
    })

    const path = serializeGeneratorCall({ generator: MinimalDFAStateCount, lang, parameters, seed })

    const question: FreeTextQuestion = {
      type: "FreeTextQuestion",
      name: MinimalDFAStateCount.name(lang),
      path,
      text,
      prompt: t(translations, lang, "prompt"),
      feedback({ text }) {
        const n = parseInt(text.trim())
        return {
          correct: n === stateCount,
          correctAnswer: stateCount.toString(),
        }
      },
      checkFormat({ text }) {
        const val = parseInt(text.trim())
        return {
          valid: !Number.isNaN(val),
          message: val.toString(),
        }
      },
    }

    return { question }
  },
}

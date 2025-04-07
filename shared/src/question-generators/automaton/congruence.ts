import type { QuestionGenerator, MultipleChoiceQuestion } from "@shared/api/QuestionGenerator"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter"
import { t, tFunctional, type Translations } from "@shared/utils/translations"
import Random from "@shared/utils/random"
import { generateNFA } from "./generate/automatonGenerator"
import { convertNFAtoDFA, minimizeDFA, generateWords } from "./generate/automatonUtil"
import { minimalMultipleChoiceFeedback } from "@shared/api/QuestionGenerator"
import type { Automaton } from "./generate/automaton"

const translations: Translations = {
  en: {
    name: "Congruence of Words",
    description: "Determine if two words are congruent with respect to L(A).",
    question:
      "Let $\\mathcal{A}=(Q,\\Sigma,\\{ {{startnodes}} \\},F,\\delta)$ be a NFA, where $\\\\ Q = \\{ {{states}} \\}$ is the set of states, $\\\\ \\Sigma=\\{ {{alphabet}} \\}$ is the input alphabet, $\\\\ F = \\{ {{endstates}} \\}$ is the set of accepting states, and $\\\\ \\delta$ is the transition function given by $\\\\ {{transitions}}$. $\\\\$Let $s = {{w1}}\\in\\Sigma^*$ and $t = {{w2}}\\in\\Sigma^*$. Are these words {{variantLabel}}?",
    yesMyhill: "Yes, $s \\mathrel{R_{L(A)}} t$",
    noMyhill: "No, $s \\not\\mathrel{R_{L(A)}} t$",
    yesMonoid: "Yes, $s \\equiv_{L(A)} t$",
    noMonoid: "No, $s \\not\\equiv_{L(A)} t$",
    variantMyhill: "equivalent under the Myhill-Nerode congruence $\\mathrel{R_{L(A)}}$ (i.e., $\\forall x \\in \\Sigma^*: sx \\in L(A) \\Leftrightarrow tx \\in L(A)$)",
    variantMonoid: "syntactically congruent with respect to $L(\\mathcal{A})$ (i.e., $\\forall x,y \\in \\Sigma^*: xsy \\in L(A) \\Leftrightarrow xty \\in L(A)$)",
  },
  de: {
    name: "Kongruenz von Wörtern",
    description: "Bestimme, ob zwei Wörter bzgl. L(A) kongruent sind.",
    question:
      "Sei $\\mathcal{A}=(Q,\\Sigma,\\{ {{startnodes}} \\},F,\\delta)$ ein NFA, wobei $\\\\ Q = \\{ {{states}} \\}$ die Menge der Zustände ist, $\\\\ \\Sigma=\\{ {{alphabet}} \\}$ das Eingabealphabet ist, $\\\\ F = \\{ {{endstates}} \\}$ die Menge der akzeptierenden Zustände ist, und $\\\\ \\delta$ ist die Übergangsfunktion: $\\\\ {{transitions}}$. $\\\\$Seien $s = {{w1}}\\in\\Sigma^*$ und $t = {{w2}}\\in\\Sigma^*$. Sind diese Wörter{{variantLabel}}?",
    yesMyhill: "Ja, $s \\mathrel{R_{L(A)}} t$",
    noMyhill: "Nein, $s \\not\\mathrel{R_{L(A)}} t$",
    yesMonoid: "Ja, $s \\equiv_{L(A)} t$",
    noMonoid: "Nein, $s \\not\\equiv_{L(A)} t$",
    variantMyhill: "äquivalent unter der Myhill-Nerode-Kongruenz $\\mathrel{R_{L(A)}}$ (d.h. $\\forall x \\in \\Sigma^*: sx \\in L(A) \\Leftrightarrow tx \\in L(A)$)",
    variantMonoid: "syntaktisch kongruent bzgl. $L(\\mathcal{A})$ (d.h. $\\forall x,y \\in \\Sigma^*: xsy \\in L(A) \\Leftrightarrow xty \\in L(A)$)",
  },
}

// simulate word from arbitrary state
function simulateFrom(dfa: Automaton, start: string, word: string): string | undefined {
  let current = start
  for (const symbol of word) {
    const node = dfa.nodes.find((n) => n.label === current)
    if (!node) return undefined
    const edge = dfa.getOutgoingEdges(node).find((e) => e.value?.toString() === symbol)
    if (!edge) return undefined
    current = dfa.nodes[edge.target]?.label ?? ""
  }
  return current
}

// checks if w1 and w2 behave the same from a given state
function behavesSameFromState(dfa: Automaton, state: string, w1: string, w2: string): boolean {
  return simulateFrom(dfa, state, w1) === simulateFrom(dfa, state, w2)
}

export const Congruence: QuestionGenerator = {
  id: "congruence",
  name: tFunctional(translations, "name"),
  description: tFunctional(translations, "description"),
  license: "MIT",
  tags: ["dfa", "nfa", "equivalence", "myhill-nerode", "syntactic monoid"],
  languages: ["en", "de"],
  expectedParameters: [
    {
      name: "size",
      type: "integer",
      min: 3,
      max: 6,
      description: (lang) => t(translations, lang, "description"),
    },
    {
      name: "variant",
      type: "string",
      allowedValues: ["myhill-nerode", "syntactic-monoid"],
      description: (lang) =>
        lang === "en" ? "Viewpoint for equivalence" : "Perspektive der Äquivalenz",
    },
  ],

  generate(lang, parameters, seed) {
    const random = new Random(seed)
    const size = parameters.size as number
    const variant = parameters.variant as "myhill-nerode" | "syntactic-monoid"
    const alphabet = ["0", "1"]

    const nfa = generateNFA(random, size, alphabet, 0.5, 0.2, 0.1, 0.3, true)
    const dfa = minimizeDFA(convertNFAtoDFA(nfa, alphabet), alphabet)

    const [w1, w2] = generateWords(random, 2, 2, 4, alphabet)

    const transitions = nfa.edges
      .flatMap((row, i) =>
        row.map((edge) => {
          const label = edge.value === undefined ? "\\varepsilon" : edge.value.toString()
          return `\\delta(${nfa.nodes[i].label}, ${label}) = ${nfa.nodes[edge.target]?.label}`
        }),
      )
      .join(", \\\\ ")
    
        const correct =
      variant === "myhill-nerode"
        ? behavesSameFromState(dfa, dfa.getStartNodes()[0]?.label ?? "", w1, w2)
        : dfa.nodes.every((n) => behavesSameFromState(dfa, n.label!, w1, w2))

    const text = t(translations, lang, "question", {
      startnodes: nfa.getStartNodes().map((n) => n.label).join(", "),
      states: nfa.nodes.map((n) => n.label).join(", "),
      endstates: nfa.getEndNodes().map((n) => n.label).join(", "),
      alphabet: alphabet.join(", "),
      transitions,
      w1,
      w2,
      variantLabel: t(translations, lang, variant === "myhill-nerode" ? "variantMyhill" : "variantMonoid"),
    })

    const answers = [
      {
        key: "yes",
        element: t(translations, lang, variant === "myhill-nerode" ? "yesMyhill" : "yesMonoid"),
        correct,
      },
      {
        key: "no",
        element: t(translations, lang, variant === "myhill-nerode" ? "noMyhill" : "noMonoid"),
        correct: !correct,
      },
    ]

    const question: MultipleChoiceQuestion = {
      type: "MultipleChoiceQuestion",
      name: Congruence.name(lang),
      path: serializeGeneratorCall({ generator: Congruence, lang, parameters, seed }),
      text,
      allowMultiple: false,
      answers: answers.map((a) => a.element),
      feedback: minimalMultipleChoiceFeedback({
        correctAnswerIndex: answers.findIndex((a) => a.correct),
      }),
    }

    return { question }
  },
}
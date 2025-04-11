import type {
  MultipleChoiceFeedbackFunction,
  MultipleChoiceQuestion,
  QuestionGenerator,
} from "@shared/api/QuestionGenerator"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter"
import Random from "@shared/utils/random"
import { t, tFunctional, type Translations } from "@shared/utils/translations"
import type { Automaton } from "./generate/automaton"
import { generateNFA } from "./generate/automatonGenerator"
import { convertNFAtoDFA, generateWords, minimizeDFA } from "./generate/automatonUtil"

const translations: Translations = {
  en: {
    name: "Congruence of Words",
    description: "Determine if two words are congruent with respect to L(A).",
    question:
      "Let $\\mathcal{A}=(Q,\\Sigma,\\{ {{startnodes}} \\},F,\\delta)$ be a NFA, where test$\\\\$" +
      "$Q = \\{ {{states}} \\}$ is the set of states, $\\\\$" +
      "$\\Sigma=\\{ {{alphabet}} \\}$ is the input alphabet, $\\\\$" +
      "$F = \\{ {{endstates}} \\}$ is the set of accepting states, and $\\\\$" +
      "$\\delta$ is the transition function given by $\\\\ {{transitions}}$. $\\\\$" +
      "Let ${{word1}}\\in\\Sigma^*$ and ${{word2}}\\in\\Sigma^*$. $\\\\$" +
      "Are these words {{variantLabel}}?",
    yesMyhill: "Yes, ${{word1}} \\mathrel{R_{L(A)}} {{word2}}$",
    noMyhill: "No, ${{word1}} \\not\\mathrel{R_{L(A)}} {{word2}}$",
    yesMonoid: "Yes, ${{word1}} \\equiv_{L(A)} {{word2}}$",
    noMonoid: "No, ${{word1}} \\not\\equiv_{L(A)} {{word2}}$",
    variantMyhill:
      "equivalent under the Myhill-Nerode congruence $\\mathrel{R_{L(A)}}$ $\\\\$" +
      "(i.e., $\\forall x \\in \\Sigma^*: {{word1}}x \\in L(A) \\Leftrightarrow {{word2}}x \\in L(A)$)",
    variantMonoid:
      "syntactically congruent with respect to $L(\\mathcal{A})$ $\\\\$" +
      "(i.e., $\\forall x,y \\in \\Sigma^*: x{{word1}}y \\in L(A) \\Leftrightarrow x{{word2}}y \\in L(A)$)",
  },
  de: {
    name: "Kongruenz von Wörtern",
    description: "Bestimme, ob zwei Wörter bzgl. L(A) kongruent sind.",
    question:
      "Sei $\\mathcal{A}=(Q,\\Sigma,\\{ {{startnodes}} \\},F,\\delta)$ ein NFA, wobei $\\\\$" +
      "$Q = \\{ {{states}} \\}$ die Menge der Zustände ist, $\\\\$" +
      "$\\Sigma=\\{ {{alphabet}} \\}$ das Eingabealphabet ist, $\\\\$" +
      "$F = \\{ {{endstates}} \\}$ die Menge der akzeptierenden Zustände ist, und $\\\\$" +
      "$\\delta$ ist die Übergangsfunktion: $\\\\ {{transitions}}$. $\\\\$" +
      "Seien ${{word1}}\\in\\Sigma^*$ und ${{word2}}\\in\\Sigma^*$. $\\\\$" +
      "Sind diese Wörter{{variantLabel}}?",
    yesMyhill: "Ja, ${{word1}} \\mathrel{R_{L(A)}} {{word2}}$",
    noMyhill: "Nein, ${{word1}} \\not\\mathrel{R_{L(A)}} {{word2}}$",
    yesMonoid: "Ja, ${{word1}} \\equiv_{L(A)} {{word2}}$",
    noMonoid: "Nein, ${{word1}} \\not\\equiv_{L(A)} {{word2}}$",
    variantMyhill:
      "äquivalent unter der Myhill-Nerode-Kongruenz $\\mathrel{R_{L(A)}}$ $\\\\$" +
      "(d.h. $\\forall x \\in \\Sigma^*: {{word1}}x \\in L(A) \\Leftrightarrow {{word2}}x \\in L(A)$)",
    variantMonoid:
      "syntaktisch kongruent bzgl. $L(\\mathcal{A})$ $\\\\$" +
      "(d.h. $\\forall x,y \\in \\Sigma^*: x{{word1}}y \\in L(A) \\Leftrightarrow x{{word2}}y \\in L(A)$)",
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

// checks if words behave the same from a given state
function behavesSameFromState(dfa: Automaton, state: string, word1: string, word2: string): boolean {
  return simulateFrom(dfa, state, word1) === simulateFrom(dfa, state, word2)
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

    const nfa = generateNFA(random, size, alphabet, 0.5, 0.2, 0, 0.3, true)
    const dfa = minimizeDFA(convertNFAtoDFA(nfa, alphabet), alphabet)

    const [word1, word2] = generateWords(random, 2, 2, 4, alphabet)

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
        ? behavesSameFromState(dfa, dfa.getStartNodes()[0]?.label ?? "", word1, word2)
        : dfa.nodes.every((n) => behavesSameFromState(dfa, n.label!, word1, word2))

    const text = t(translations, lang, "question", {
      startnodes: nfa
        .getStartNodes()
        .map((n) => n.label)
        .join(", "),
      states: nfa.nodes.map((n) => n.label).join(", "),
      endstates: nfa
        .getEndNodes()
        .map((n) => n.label)
        .join(", "),
      alphabet: alphabet.join(", "),
      transitions,
      word1,
      word2,
      variantLabel: t(
        translations,
        lang,
        variant === "myhill-nerode" ? "variantMyhill" : "variantMonoid",
        {
          word1,
          word2,
        },
      ),
    })

    const answers = [
      {
        key: "yes",
        element: t(translations, lang, variant === "myhill-nerode" ? "yesMyhill" : "yesMonoid", {
          word1,
          word2,
        }),
        correct,
      },
      {
        key: "no",
        element: t(translations, lang, variant === "myhill-nerode" ? "noMyhill" : "noMonoid", {
          word1,
          word2,
        }),
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
      feedback: getCongruenceFeedbackFunction(
        variant,
        dfa,
        word1,
        word2,
        alphabet,
        answers.findIndex((a) => a.correct),
        lang,
      ),
    }

    return { question }
  },
}

function getCongruenceFeedbackFunction(
  variant: "myhill-nerode" | "syntactic-monoid",
  dfa: Automaton,
  word1: string,
  word2: string,
  alphabet: string[],
  correctIndex: number,
  lang: "en" | "de",
): MultipleChoiceFeedbackFunction {
  return ({ choice }) => {
    const selectedIndex = choice[0]
    const correct = selectedIndex === correctIndex

    const start = dfa.getStartNodes()[0]?.label ?? ""
    const accepting = dfa
      .getEndNodes()
      .map((n) => `${n.label}`)
      .join(", ")
    const states = dfa.nodes.map((n) => `${n.label}`).join(", ")

    const definition = [
      lang === "de"
        ? `Sei $\\mathcal{A}' = (Q', \\Sigma, \\delta', ${start}, F')$ der minimierte DEA mit`
        : `Let $\\mathcal{A}' = (Q', \\Sigma, \\delta', ${start}, F')$ be the minimized DFA, where`,
      `$Q' = \\{ ${states} \\}$,`,
      `$F' = \\{ ${accepting} \\}$,`,
      lang === "de"
        ? "und der Übergangsfunktion $\\delta'$:"
        : "and the transition function $\\delta'$ is given by:",
      `| $q \\in Q'$ | ${alphabet.map((a) => `$${a}$`).join(" | ")} |`,
      `|------------|${alphabet.map(() => "------").join("|")}|`,
      ...dfa.nodes.map((node) => {
        const row = [node.label!]
        for (const a of alphabet) {
          const edge = dfa.getOutgoingEdges(node).find((e) => e.value?.toString() === a)
          const target = edge ? `${dfa.nodes[edge.target]?.label ?? "∅"}` : "∅"
          row.push(target)
        }
        return `| $${row.join("$ | $")}$ |`
      }),
    ]

    const traceRows: string[] = []
    let allSame = true

    const statesToTrace =
      variant === "myhill-nerode"
        ? dfa
            .getStartNodes()
            .map((n) => n.label!)
            .slice(0, 1)
        : dfa.nodes.map((n) => n.label!)

    for (const from of statesToTrace) {
      const trace1 = simulateFrom(dfa, from, word1) ?? "∅"
      const trace2 = simulateFrom(dfa, from, word2) ?? "∅"
      if (trace1 !== trace2) allSame = false
      traceRows.push(`| $${from}$ | $${trace1}$ | $${trace2}$ |`)
    }

    const traceBlock = [
      variant === "myhill-nerode"
        ? lang === "de"
          ? `Anwendung von $${word1}$ und $${word2}$ auf den Startzustand $${start}$:`
          : `Trace of $${word1}$ and $${word2}$ from the start state $${start}$:`
        : lang === "de"
          ? `Anwendung von $${word1}$ und $${word2}$ auf alle Zustände:`
          : `Trace of $${word1}$ and $${word2}$ from all states:`,

      `| $q \\in Q'$ | $\\delta'(q, ${word1})$ | $\\delta'(q, ${word2})$ |`,
      "|------------|----------------------|----------------------|",

      ...traceRows,

      allSame
        ? variant === "myhill-nerode"
          ? lang === "de"
            ? "Da sich beide Wörter vom Startzustand aus im minimalen DEA gleich verhalten, sind sie **Myhill-Nerode-äquivalent**."
            : "Since both words behave the same from the start state in the minimal DFA, they are **Myhill-Nerode equivalent**."
          : lang === "de"
            ? "Da sich beide Wörter von allen Zuständen aus im minimalen DEA gleich verhalten, sind sie **syntaktisch kongruent**."
            : "Since both words behave the same from all states in the minimal DFA, they are **syntactically congruent**."
        : variant === "myhill-nerode"
          ? lang === "de"
            ? "Da sich die Wörter vom Startzustand aus im minimalen DEA unterschiedlich verhalten, sind sie **nicht Myhill-Nerode-äquivalent**."
            : "Since the words behave differently from the start state in the minimal DFA, they are **not Myhill-Nerode equivalent**."
          : lang === "de"
            ? "Da sich die Wörter von mindestens einem Zustand im minimalen DEA unterschiedlich verhalten, sind sie **nicht syntaktisch kongruent**."
            : "Since the words behave differently from at least one state in the minimal DFA, they are **not syntactically congruent**.",
    ]

    return {
      correct,
      correctChoice: [correctIndex],
      feedbackText: [...definition, ...traceBlock].join("\n"),
    }
  }
}

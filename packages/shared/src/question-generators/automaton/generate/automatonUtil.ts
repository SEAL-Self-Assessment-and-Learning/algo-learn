import type { Language } from "@shared/api/Language"
import type Random from "@shared/utils/random"
import { Automaton, type AutomatonNode } from "./automaton"

/**
 * Converts NFA to equivalent DFA using powerset construction.
 */
export function convertNFAtoDFA(nfa: Automaton, alphabet: string[] = ["0", "1"]): Automaton {
  const stateMap = new Map<string, number>()
  const dfaNodes: AutomatonNode[] = []
  const dfaEdges: Automaton["edges"] = []
  const queue: string[][] = []

  const startStates = nfa
    .getStartNodes()
    .map((n) => n.label)
    .filter((l): l is string => !!l)
  const startKey = startStates.sort().join(",")

  stateMap.set(startKey, 0)
  dfaNodes.push({
    label: `q_0`,
    isStart: true,
    isEnd: startStates.some((s) => nfa.getEndNodes().some((n) => n.label === s)),
    coords: { x: 0, y: 0 },
  })
  dfaEdges.push([])
  queue.push(startStates)

  while (queue.length > 0) {
    const current = queue.shift()!
    const currentKey = current.sort().join(",")
    const currentIndex = stateMap.get(currentKey)!

    for (const symbol of alphabet) {
      const reachable = new Set<string>()

      for (const stateLabel of current) {
        const nodeIndex = nfa.nodes.findIndex((n) => n.label === stateLabel)
        if (nodeIndex !== -1) {
          for (const edge of nfa.edges[nodeIndex]) {
            if (edge.value?.toString() === symbol) {
              const targetLabel = nfa.nodes[edge.target]?.label
              if (targetLabel) reachable.add(targetLabel)
            }
          }
        }
      }

      const targetStates = Array.from(reachable).sort()
      const targetKey = targetStates.join(",")
      if (!stateMap.has(targetKey)) {
        const newIndex = dfaNodes.length
        stateMap.set(targetKey, newIndex)
        dfaNodes.push({
          label: `q_${newIndex}`,
          isStart: false,
          isEnd: targetStates.some((s) => nfa.getEndNodes().some((n) => n.label === s)),
          coords: { x: newIndex % 5, y: Math.floor(newIndex / 5) },
        })
        dfaEdges.push([])
        queue.push(targetStates)
      }

      const targetIndex = stateMap.get(targetKey)!
      dfaEdges[currentIndex].push({
        source: currentIndex,
        target: targetIndex,
        value: parseInt(symbol),
      })
    }
  }

  return new Automaton(dfaNodes, dfaEdges, true, true)
}

/**
 * Obtain minimal DFA using partition refinement.
 */
export function minimizeDFA(dfa: Automaton, alphabet: string[]): Automaton {
  const states = dfa.nodes.map((node) => node.label!)
  const isAccepting = new Set(dfa.nodes.filter((n) => n.isEnd).map((n) => n.label!))

  // initial partition: accepting vs non-accepting
  let partitions: Set<string>[] = [
    new Set(states.filter((s) => isAccepting.has(s))),
    new Set(states.filter((s) => !isAccepting.has(s))),
  ].filter((s) => s.size > 0)

  let changed = true
  while (changed) {
    changed = false
    const newPartitions: Set<string>[] = []

    for (const group of partitions) {
      const splits: Map<string, Set<string>> = new Map()

      for (const state of group) {
        const signature = alphabet
          .map((symbol) => {
            const target = getTargetState(dfa, state, symbol)
            const index = partitions.findIndex((p) => p.has(target ?? ""))
            return index
          })
          .join(",")

        if (!splits.has(signature)) splits.set(signature, new Set())
        splits.get(signature)!.add(state)
      }

      for (const split of splits.values()) {
        newPartitions.push(split)
      }

      if (splits.size > 1) changed = true
    }

    partitions = newPartitions
  }

  // construct minimal DFA
  const newNodes = partitions.map((group, i) => {
    const repr = [...group][0]
    const old = dfa.nodes.find((n) => n.label === repr)!
    return {
      label: `q_${i}`,
      coords: old.coords,
      isStart: group.has(dfa.getStartNodes()[0]?.label ?? ""),
      isEnd: [...group].some((s) => isAccepting.has(s)),
    } satisfies AutomatonNode
  })

  const newEdges = newNodes.map((_, i) => {
    const group = partitions[i]
    const repr = [...group][0]
    return alphabet.map((symbol) => {
      const target = getTargetState(dfa, repr, symbol)
      const targetGroup = partitions.findIndex((p) => p.has(target ?? ""))
      return {
        source: i,
        target: targetGroup,
        value: parseInt(symbol),
      }
    })
  })

  return new Automaton(newNodes, newEdges, true, true)
}

function getTargetState(dfa: Automaton, fromLabel: string, input: string): string | undefined {
  const fromIndex = dfa.nodes.findIndex((n) => n.label === fromLabel)
  const edges = dfa.edges[fromIndex] ?? []
  const target = edges.find((e) => e.value?.toString() === input)
  return dfa.nodes[target?.target ?? -1]?.label
}

/**
 * Generates random words from the given alphabet.
 */
export function generateWords(
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
export function isWordAccepted(automaton: Automaton, word: string): boolean {
  let currentStates = new Set<string>()
  const startNodes = automaton.nodes
    .filter((n) => n.isStart && n.label !== undefined)
    .map((n) => n.label as string)

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

export function writeAutomatonDefinition(
  lang: Language,
  automaton: Automaton,
  alphabet: string[],
  asTable: boolean = false,
): string {
  const states = automaton.nodes.map((n) => n.label ?? "").join(", ")
  const startNodes = automaton.getStartNodes().map((n) => n.label ?? "")
  const endStates = automaton
    .getEndNodes()
    .map((n) => n.label ?? "")
    .join(", ")

  const isDFA = automaton.isDFA ?? false

  let intro: string
  let sLine: string | null = null

  if (isDFA) {
    const startState = startNodes[0] ?? "q_0"
    intro =
      lang === "de"
        ? `Sei $\\mathcal{A}=(Q,\\Sigma,${startState},F,\\delta)$ ein DEA, wobei $\\\\$`
        : `Let $\\mathcal{A}=(Q,\\Sigma,${startState},F,\\delta)$ be a DFA, where $\\\\$`
  } else {
    intro =
      lang === "de"
        ? `Sei $\\mathcal{A}=(Q,\\Sigma,S,F,\\delta)$ ein NEA, wobei $\\\\$`
        : `Let $\\mathcal{A}=(Q,\\Sigma,S,F,\\delta)$ be a NFA, where $\\\\$`

    sLine =
      lang === "de"
        ? `$S = \\{${startNodes.join(", ")}\\}$ ist die Menge der Startzustände`
        : `$S = \\{${startNodes.join(", ")}\\}$ is the set of start states`
  }

  const qLine =
    lang === "de"
      ? `$Q = \\{${states}\\}$ ist die Zustandsmenge`
      : `$Q = \\{${states}\\}$ is the set of states`

  const sigmaLine =
    lang === "de"
      ? `$\\Sigma = \\{${alphabet.join(", ")}\\}$ ist das Eingabealphabet`
      : `$\\Sigma = \\{${alphabet.join(", ")}\\}$ is the input alphabet`

  const fLine =
    lang === "de"
      ? `$F = \\{${endStates}\\}$ ist die Menge der akzeptierenden Zustände`
      : `$F = \\{${endStates}\\}$ is the set of accepting states`

  let deltaLine: string

  if (asTable) {
    const tableRows = automaton.nodes.map((node) => {
      const cells = alphabet.map((symbol) => {
        const edge = automaton.getOutgoingEdges(node).find((e) => e.value?.toString() === symbol)
        return edge ? `$${automaton.nodes[edge.target]?.label ?? "∅"}$` : "$∅$"
      })
      return `| $${node.label}$ | ${cells.join(" | ")} |`
    })

    deltaLine = [
      lang === "de"
        ? "und $\\delta$ ist über die folgende Übergangstabelle definiert:"
        : "and $\\delta$ is defined by the following transition table:",
      `| $q$ | ${alphabet.map((a) => `$${a}$`).join(" | ")} |`,
      `|${Array(alphabet.length + 1)
        .fill("---")
        .join("|")}|`,
      ...tableRows,
    ].join("\n")
  } else {
    const transitions = automaton.nodes
      .flatMap((fromNode, i) =>
        (automaton.edges[i] ?? []).map((edge) => {
          const symbol = edge.value === undefined ? "\\varepsilon" : edge.value.toString()
          const from = fromNode.label ?? `q_${i}`
          const to = automaton.nodes[edge.target]?.label ?? `q_${edge.target}`
          return `\\delta(${from}, ${symbol}) = ${to}`
        }),
      )
      .map((t) => `$${t}$`)
      .join(", $\\\\$ ")

    deltaLine =
      lang === "de"
        ? `und $\\delta$ ist gegeben durch: $\\\\$ ${transitions}`
        : `and $\\delta$ is given as: $\\\\$ ${transitions}`
  }

  return [intro, qLine, sigmaLine, fLine, ...(sLine ? [sLine] : []), deltaLine].join(" $\\\\$ ")
}

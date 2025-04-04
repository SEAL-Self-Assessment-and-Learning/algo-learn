import { Automaton, type AutomatonNode } from "./automaton"

/**
 * Converts NFA to equivalent DFA using powerset construction.
 */
export function convertNFAtoDFA(nfa: Automaton, alphabet: string[] = ["0", "1"]): Automaton {
  const stateMap = new Map<string, number>() // maps state set key to index in DFA
  const dfaNodes: AutomatonNode[] = []
  const dfaEdges: Automaton["edges"] = []
  const queue: string[][] = []

  const startStates = nfa.getStartNodes().map((n) => n.label).filter((l): l is string => !!l)
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
    const isAccepting = new Set(
      dfa.nodes.filter((n) => n.isEnd).map((n) => n.label!)
    )
  
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
  
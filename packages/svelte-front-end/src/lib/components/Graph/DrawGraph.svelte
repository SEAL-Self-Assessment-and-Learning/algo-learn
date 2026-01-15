<script lang="ts">
  import Edge from "$lib/components/Graph/Edge.svelte"
  import Node from "$lib/components/Graph/Node.svelte"
  import type { Graph } from "@shared/utils/graph.ts"

  type GraphElementStateType = { selected: boolean; group: null | number }
  type Point = { x: number; y: number }
  type AutomatonRole = { isStart: boolean; isEnd: boolean }

  interface Props {
    maxWidth: number
    maxHeight: number
    graph: Graph
  }
  const { maxWidth, maxHeight, graph }: Props = $props()
  let svgRef: SVGSVGElement | null = null
  const coordinateScale = 60
  const nodeScale = 20
  // limited by the number of colors we have. See tailwind --color-group-0,...,--color-group-7.
  const maxGroups = 8

  const baseMargin = 0.9

  function deriveAutomatonRoles(nodes: typeof graph.nodes): AutomatonRole[] {
    return nodes.map((n) => {
      const group = n.group ?? -1
      return {
        isStart: group === 0 || group === 2,
        isEnd: group === 0 || group === 1,
      }
    })
  }

  function uniqueUndirectedEdges(edges: typeof graph.edges): [number, number][] {
    const seen: Record<string, boolean> = {}
    const result: [number, number][] = []

    edges.forEach((outgoing) => {
      outgoing.forEach((e) => {
        if (e.source === e.target) return
        const a = Math.min(e.source, e.target)
        const b = Math.max(e.source, e.target)
        const key = `${a}-${b}`
        if (!seen[key]) {
          seen[key] = true
          result.push([a, b])
        }
      })
    })

    return result
  }

  function cross(o: Point, a: Point, b: Point) {
    return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x)
  }

  function segmentsCross(p1: Point, p2: Point, p3: Point, p4: Point) {
    // shared endpoints do not count as crossings
    if (p1 === p3 || p1 === p4 || p2 === p3 || p2 === p4) return false
    const d1 = cross(p1, p2, p3)
    const d2 = cross(p1, p2, p4)
    const d3 = cross(p3, p4, p1)
    const d4 = cross(p3, p4, p2)
    return d1 * d2 < 0 && d3 * d4 < 0
  }

  function orderScore(order: number[], edges: [number, number][]): number {
    const n = order.length
    const angleStep = (2 * Math.PI) / n

    const positions: Point[] = order.map((_, idx) => {
      const angle = angleStep * idx
      return { x: Math.cos(angle), y: Math.sin(angle) }
    })

    const indexOf: number[] = []
    order.forEach((node, idx) => (indexOf[node] = idx))

    let crossings = 0
    for (let i = 0; i < edges.length; i++) {
      const [a, b] = edges[i]
      const pa = positions[indexOf[a] ?? 0]
      const pb = positions[indexOf[b] ?? 0]
      for (let j = i + 1; j < edges.length; j++) {
        const [c, d] = edges[j]
        const pc = positions[indexOf[c] ?? 0]
        const pd = positions[indexOf[d] ?? 0]
        if (segmentsCross(pa, pb, pc, pd)) crossings += 1
      }
    }

    const lengthPenalty = edges.reduce((acc, [a, b]) => {
      const pa = positions[indexOf[a] ?? 0]
      const pb = positions[indexOf[b] ?? 0]
      return acc + Math.hypot(pa.x - pb.x, pa.y - pb.y)
    }, 0)

    return crossings * 1000 + lengthPenalty * 10
  }

  function findBestCircularOrder(nodeCount: number, edges: [number, number][]): number[] {
    const nodes = Array.from({ length: nodeCount }, (_, i) => i)
    if (nodeCount <= 1) return nodes

    // Fix first node to cut rotational symmetry
    const [first, ...rest] = nodes
    let bestOrder = nodes
    let bestScore = Number.POSITIVE_INFINITY

    function backtrack(prefix: number[], remaining: number[]) {
      if (remaining.length === 0) {
        const candidate = [first, ...prefix]
        const score = orderScore(candidate, edges)
        if (score < bestScore) {
          bestScore = score
          bestOrder = candidate
        }
        return
      }

      for (let i = 0; i < remaining.length; i++) {
        const next = remaining[i]
        const restCandidates = [...remaining.slice(0, i), ...remaining.slice(i + 1)]
        backtrack([...prefix, next], restCandidates)
      }
    }

    if (nodeCount <= 7) {
      backtrack([], rest)
      return bestOrder
    }

    // fallback: heuristic greedy + a few random swaps
    bestOrder = nodes
    bestScore = orderScore(bestOrder, edges)
    for (let iter = 0; iter < 150; iter++) {
      const a = Math.floor(Math.random() * nodeCount)
      const b = Math.floor(Math.random() * nodeCount)
      if (a === b) continue
      const candidate = [...bestOrder]
      ;[candidate[a], candidate[b]] = [candidate[b], candidate[a]]
      const score = orderScore(candidate, edges)
      if (score < bestScore) {
        bestOrder = candidate
        bestScore = score
      }
    }

    return bestOrder
  }

  function computeLayoutCoords(
    nodes: typeof graph.nodes,
    edges: typeof graph.edges,
    isAutomaton: boolean,
  ) {
    if (!isAutomaton || nodes.length === 0) {
      return nodes.map((u) => ({ ...u.coords }))
    }

    const undirectedEdges = uniqueUndirectedEdges(edges)
    const order = findBestCircularOrder(nodes.length, undirectedEdges)

    const radius = Math.max(2.8, nodes.length * 1.4)
    const startIndex = nodes.findIndex((n) => (n.group ?? -1) === 0 || (n.group ?? -1) === 2)
    const anchorIndex = startIndex === -1 ? order[0] : startIndex
    const anchorPos = order.indexOf(anchorIndex)
    const angleOffset = Math.PI - ((2 * Math.PI) / nodes.length) * anchorPos

    const coords: Point[] = Array(nodes.length)
    order.forEach((nodeId, idx) => {
      const angle = angleOffset + ((2 * Math.PI) / nodes.length) * idx
      coords[nodeId] = { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius }
    })

    return coords
  }

  function getBounds(coords: Point[]) {
    if (coords.length === 0)
      return { minX: 0, maxX: 0, minY: 0, maxY: 0, width: 0, height: 0, centerX: 0, centerY: 0 }

    let minX = coords[0].x
    let maxX = coords[0].x
    let minY = coords[0].y
    let maxY = coords[0].y

    coords.forEach((p) => {
      minX = Math.min(minX, p.x)
      maxX = Math.max(maxX, p.x)
      minY = Math.min(minY, p.y)
      maxY = Math.max(maxY, p.y)
    })

    const width = maxX - minX
    const height = maxY - minY
    return {
      minX,
      maxX,
      minY,
      maxY,
      width,
      height,
      centerX: (minX + maxX) / 2,
      centerY: (minY + maxY) / 2,
    }
  }

  const edgeListFlat = graph.edges
    .flat()
    .filter(graph.directed ? () => true : (e) => e.source < e.target)

  let currentlyDragged = $state<null | number>(null)

  const isAutomatonGraph = $derived(
    graph.directed &&
      graph.nodes.length > 0 &&
      graph.nodes.length <= 8 &&
      graph.nodes.every((n) => /^q_\d+$/.test(n.label ?? "")),
  )

  const automatonRoles = $derived(deriveAutomatonRoles(graph.nodes))

  const layoutCoords = $derived(
    computeLayoutCoords(graph.nodes, graph.edges, isAutomatonGraph).map((p) => ({ x: p.x, y: p.y })),
  )

  let nodePositions = $derived(
    layoutCoords.map((p) => ({
      x: p.x * coordinateScale,
      y: p.y * coordinateScale,
    })),
  )

  let nodeStates = $derived<GraphElementStateType[]>(
    graph.nodes.map((u) => {
      return {
        selected: false,
        group: isAutomatonGraph ? null : (u.group ?? null),
      }
    }),
  )

  let edgeStates = $derived<GraphElementStateType[]>(
    edgeListFlat.map((e) => {
      return {
        selected: false,
        group: e.group ?? null,
      }
    }),
  )

  function handleSetDragged(i: number) {
    if (currentlyDragged === null) {
      currentlyDragged = i
    }
  }

  function handleClick(i: number) {
    if (graph.nodeClickType === "select") {
      nodeStates = nodeStates.map((s, idx) => (idx === i ? { ...s, selected: !s.selected } : s))
    } else if (graph.nodeClickType === "group") {
      const max = Math.min(graph.nodeGroupMax ?? maxGroups, maxGroups) - 1
      nodeStates = nodeStates.map((s, idx) => {
        if (idx !== i) return s
        const next = s.group === max ? null : s.group === null ? 0 : s.group + 1
        return { ...s, group: next }
      })
      console.log(nodeStates[i])
    }
  }

  const bounds = $derived(getBounds(layoutCoords))
  const hasStartNode = $derived(automatonRoles.some((r) => r.isStart))
  const startPadding = $derived(hasStartNode && isAutomatonGraph ? 1.1 : 0)

  const viewBox = $derived(
    (() => {
      const minViewBox = { width: 100, height: 100 }
      let x = (bounds.minX - baseMargin - startPadding) * coordinateScale
      let y = (bounds.minY - baseMargin) * coordinateScale
      let width = (bounds.width + 2 * baseMargin + startPadding) * coordinateScale
      let height = (bounds.height + 2 * baseMargin) * coordinateScale

      if (width < minViewBox.width) {
        x -= (minViewBox.width - width) * 0.5
        width = minViewBox.width
      }

      if (height < minViewBox.height) {
        y -= (minViewBox.height - height) * 0.5
        height = minViewBox.height
      }

      return { x, y, width, height }
    })(),
  )

  const viewBoxAspectRatio = $derived(Math.min(maxHeight / maxWidth, viewBox.height / viewBox.width))

  const loopAngles = $derived(
    layoutCoords.map((p) => Math.atan2(p.y - bounds.centerY, p.x - bounds.centerX) || -Math.PI / 2),
  )

  function clamp01(t: number) {
    return Math.max(0, Math.min(1, t))
  }

  function pointToSegmentDistSq(p: Point, a: Point, b: Point) {
    const abx = b.x - a.x
    const aby = b.y - a.y
    const apx = p.x - a.x
    const apy = p.y - a.y
    const denom = abx * abx + aby * aby
    const t = denom === 0 ? 0 : clamp01((apx * abx + apy * aby) / denom)
    const cx = a.x + abx * t
    const cy = a.y + aby * t
    const dx = p.x - cx
    const dy = p.y - cy
    return dx * dx + dy * dy
  }

  function segmentsIntersect(a: Point, b: Point, c: Point, d: Point) {
    function ccw(p: Point, q: Point, r: Point) {
      return (r.y - p.y) * (q.x - p.x) > (q.y - p.y) * (r.x - p.x)
    }

    return ccw(a, c, d) !== ccw(b, c, d) && ccw(a, b, c) !== ccw(a, b, d)
  }

  function segmentDistance(a: Point, b: Point, c: Point, d: Point) {
    if (segmentsIntersect(a, b, c, d)) return 0
    return Math.sqrt(
      Math.min(
        pointToSegmentDistSq(a, c, d),
        pointToSegmentDistSq(b, c, d),
        pointToSegmentDistSq(c, a, b),
        pointToSegmentDistSq(d, a, b),
      ),
    )
  }

  function arrowSegment(nodePos: Point, angle: number) {
    const arrowOffset = nodeScale * 4.2
    const arrowLength = nodeScale * 3
    const cosA = Math.cos(angle)
    const sinA = Math.sin(angle)

    const base: Point = {
      x: nodePos.x + cosA * -arrowOffset,
      y: nodePos.y + sinA * -arrowOffset,
    }

    const tip: Point = {
      x: base.x + cosA * arrowLength,
      y: base.y + sinA * arrowLength,
    }

    return { base, tip }
  }

  const startArrowAngles = $derived(
    nodePositions.map((pos) => {
      if (!pos) return Math.PI

      const candidates = 144
      let bestAngle = Math.PI
      let bestScore = -Infinity

      for (let i = 0; i < candidates; i++) {
        const angle = (2 * Math.PI * i) / candidates
        const { base, tip } = arrowSegment(pos, angle)

        let minDist = Infinity
        edgeListFlat.forEach((e) => {
          const p1 = nodePositions[e.source]
          const p2 = nodePositions[e.target]
          if (!p1 || !p2) return
          if (e.source === e.target) return // ignore self loops, already handled visually
          const dist = segmentDistance(base, tip, p1, p2)
          if (dist < minDist) minDist = dist
        })

        // small bias toward pointing outward from graph center
        const outward = Math.atan2(pos.y - bounds.centerY, pos.x - bounds.centerX)
        const bias = Math.cos(angle - outward) * 4

        const score = minDist + bias
        if (score > bestScore) {
          bestScore = score
          bestAngle = angle
        }
      }

      return bestAngle
    }),
  )

  function updateDraggedNode(clientX: number, clientY: number) {
    if (currentlyDragged === null || !svgRef) return

    const pt = svgRef.createSVGPoint()
    pt.x = clientX
    pt.y = clientY
    const svgPos = pt.matrixTransform(svgRef.getScreenCTM()?.inverse())

    const nodeRadius = nodeScale
    const minX = viewBox.x - (viewBox.width - maxWidth) * 100
    const maxX = viewBox.x + viewBox.width + (viewBox.width - maxWidth) * 100
    const minY = viewBox.y + nodeRadius
    const maxY = viewBox.y + viewBox.height - nodeRadius

    const constrainedX = Math.max(minX, Math.min(maxX, svgPos.x))
    const constrainedY = Math.max(minY, Math.min(maxY, svgPos.y))

    nodePositions[currentlyDragged].x = constrainedX
    nodePositions[currentlyDragged].y = constrainedY
    nodePositions = [...nodePositions]
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<svg
  bind:this={svgRef}
  width={maxWidth}
  height={viewBox.height / viewBox.width > 1 && viewBox.height < maxHeight
    ? viewBox.height * 0.75
    : maxWidth * viewBoxAspectRatio}
  viewBox={`${viewBox.x} ${viewBox.y - 10} ${viewBox.width} ${viewBox.height + 20}`}
  class="bg-secondary mx-auto h-auto max-w-full touch-none overscroll-x-none rounded-2xl"
  onmousemove={(e) => updateDraggedNode(e.clientX, e.clientY)}
  onmouseup={() => {
    if (currentlyDragged !== null) {
      currentlyDragged = null
    }
  }}
  ontouchmove={(e) => {
    // Always prevent default when a node is being dragged
    if (currentlyDragged !== null) {
      e.preventDefault()
      e.stopPropagation()
      updateDraggedNode(e.touches[0].clientX, e.touches[0].clientY)
    }
  }}
  ontouchend={(e) => {
    e.preventDefault()
    e.stopPropagation()
    if (currentlyDragged !== null) {
      currentlyDragged = null
    }
  }}
  ontouchcancel={(e) => {
    e.preventDefault()
    if (currentlyDragged !== null) {
      currentlyDragged = null
    }
  }}
>
  <g>
    {#each edgeListFlat as e, i (i)}
      <Edge
        u={nodePositions[e.source]}
        v={nodePositions[e.target]}
        weight={e.value}
        directed={graph.directed}
        clickable={graph.edgeClickType !== "none"}
        state={edgeStates[i]}
        nodeRadius={nodeScale}
        loopAngle={loopAngles[e.source]}
        onClickCallback={() => {
          if (graph.edgeClickType === "select") {
            edgeStates[i].selected = !edgeStates[i].selected
            edgeStates = [...edgeStates]
          } else if (graph.edgeClickType === "group") {
            edgeStates[i].group =
              edgeStates[i].group === Math.min(graph.edgeGroupMax ?? maxGroups, maxGroups) - 1
                ? null
                : edgeStates[i].group === null
                  ? 0
                  : edgeStates[i].group + 1
            edgeStates = [...edgeStates]
          }
        }}
      />
    {/each}
  </g>
  <g>
    {#each graph.nodes as u, i (i)}
      <Node
        pos={nodePositions[i]}
        setDragged={graph.nodeDraggable ? () => handleSetDragged(i) : undefined}
        size={nodeScale}
        label={u.label ?? ""}
        clickable={graph.nodeClickType !== "none"}
        nodeState={nodeStates[i]}
        role={automatonRoles[i]}
        showRoleIndicators={isAutomatonGraph}
        renderAsLatex={isAutomatonGraph}
        startArrowAngle={startArrowAngles[i]}
        onClickCallback={() => handleClick(i)}
      />
    {/each}
  </g>
</svg>

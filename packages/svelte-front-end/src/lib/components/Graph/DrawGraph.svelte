<script lang="ts">
  import Node from "$lib/components/Graph/Node.svelte"
  import type { Graph } from "@shared/utils/graph.ts"

  type GraphElementStateType = { selected: boolean; group: null | number }

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

  let currentlyDragged = $state<null | number>(null)

  let nodePositions = $state(
    graph.nodes.map((u) => {
      return {
        x: u.coords.x * coordinateScale,
        y: u.coords.y * coordinateScale,
      }
    }),
  )
  let nodeStates = $state<GraphElementStateType[]>(
    graph.nodes.map((u) => {
      return {
        selected: false,
        group: u.group ?? null,
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

  const dimensions = graph.getDimensions()
  const margin = 0.7
  const viewBox = {
    x: (dimensions.minX - margin) * coordinateScale,
    y: (dimensions.minY - margin) * coordinateScale,
    width: (dimensions.width + 2 * margin) * coordinateScale,
    height: (dimensions.height + 2 * margin) * coordinateScale,
  }

  const minViewBox = { width: 100, height: 100 }
  if (viewBox.width < minViewBox.width) {
    viewBox.x -= (minViewBox.width - viewBox.width) * 0.5
    viewBox.width = minViewBox.width
  }

  if (viewBox.height < minViewBox.height) {
    viewBox.y -= (minViewBox.height - viewBox.height) * 0.5
    viewBox.height = minViewBox.height
  }

  const viewBoxAspectRatio = Math.min(maxHeight / maxWidth, viewBox.height / viewBox.width)

  function updateDraggedNode(clientX: number, clientY: number) {
    if (currentlyDragged === null || !svgRef) return

    const pt = svgRef.createSVGPoint()
    pt.x = clientX
    pt.y = clientY
    const svgPos = pt.matrixTransform(svgRef.getScreenCTM()?.inverse())

    const nodeRadius = nodeScale
    const minX = viewBox.x - (viewBox.width - maxWidth) / 2
    const maxX = viewBox.x + viewBox.width + (viewBox.width - maxWidth) / 2
    const minY = viewBox.y + nodeRadius
    const maxY = viewBox.y + viewBox.height - nodeRadius

    const constrainedX = Math.max(minX, Math.min(maxX, svgPos.x))
    const constrainedY = Math.max(minY, Math.min(maxY, svgPos.y))

    nodePositions[currentlyDragged].x = constrainedX
    nodePositions[currentlyDragged].y = constrainedY
    nodePositions = [...nodePositions] // reassign to trigger Svelte reactivity
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
>
  <g>
    {#each graph.nodes as u, i (i)}
      <Node
        pos={nodePositions[i]}
        setDragged={graph.nodeDraggable ? () => handleSetDragged(i) : undefined}
        size={nodeScale}
        label={u.label ?? ""}
        clickable={graph.nodeClickType !== "none"}
        nodeState={nodeStates[i]}
        onClickCallback={() => handleClick(i)}
      />
    {/each}
  </g>
</svg>

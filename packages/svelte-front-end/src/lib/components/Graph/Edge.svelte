<script lang="ts">
  type GraphElementStateType = { selected: boolean; group: null | number }

  interface Props {
    u: { x: number; y: number }
    v: { x: number; y: number }
    weight?: number
    directed?: boolean
    clickable?: boolean
    state: GraphElementStateType
    onClickCallback?: () => void
    nodeRadius?: number
    loopAngle?: number
  }

  const {
    u,
    v,
    weight,
    directed = false,
    clickable = false,
    state,
    onClickCallback = () => {},
    nodeRadius = 20,
    loopAngle,
  }: Props = $props()

  function getVectorLength(x: number, y: number) {
    return Math.sqrt(x * x + y * y)
  }

  function getNormalVec(u: { x: number; y: number }, v: { x: number; y: number }) {
    const orthVec = {
      x: v.y - u.y,
      y: u.x - v.x,
    }
    const len = getVectorLength(orthVec.x, orthVec.y)
    if (len === 0) return { x: 0, y: -1 }
    return {
      x: orthVec.x / len,
      y: orthVec.y / len,
    }
  }

  let edgeStyle = $derived(
    `stroke-${
      state.selected ? "cg-4" : state.group !== null ? `cg-${state.group}` : "primary"
    }${clickable ? " cursor-pointer" : ""}`,
  )

  const labelFill = $derived(
    state.selected || state.group !== null ? `fill-cg-${state.group ?? 4}` : "fill-primary",
  )

  let normalVec = $derived(getNormalVec(u, v))
  let center = $derived({ x: (u.x + v.x) / 2, y: (u.y + v.y) / 2 })

  const isSelfLoop = $derived(u === v || (u.x === v.x && u.y === v.y))

  // Arrow computations for non-loop directed edges
  let curveHandle = $derived(
    !isSelfLoop && directed
      ? { x: center.x + normalVec.x * nodeRadius * 2.4, y: center.y + normalVec.y * nodeRadius * 2.4 }
      : null,
  )

  let arrowDirUnit = $derived(
    !isSelfLoop && directed
      ? (() => {
          const dir = { x: v.x - curveHandle!.x, y: v.y - curveHandle!.y }
          const len = getVectorLength(dir.x, dir.y)
          return { x: dir.x / Math.max(len, 1e-6), y: dir.y / Math.max(len, 1e-6) }
        })()
      : null,
  )

  const directedEndPoint = $derived(
    !isSelfLoop && directed && arrowDirUnit
      ? {
          x: v.x - arrowDirUnit.x * (nodeRadius + 8),
          y: v.y - arrowDirUnit.y * (nodeRadius + 8),
        }
      : null,
  )

  const directedArrowAngle = $derived(
    !isSelfLoop && directed && curveHandle
      ? Math.atan2(v.y - curveHandle.y, v.x - curveHandle.x) * (180 / Math.PI)
      : 0,
  )

  const weightLabel = $derived(weight === undefined ? null : weight === -1 ? "ε" : `${weight}`)

  const loopBaseAngle = $derived(loopAngle ?? -Math.PI / 8)
  const loopRadius = $derived(nodeRadius * 4)
  const loopGap = $derived(nodeRadius * 0.5)
  const loopStartAngle = $derived(loopBaseAngle - 0.4)
  const loopEndAngle = $derived(loopBaseAngle + 0.4)
  const loopStart = $derived({
    x: u.x + Math.cos(loopStartAngle) * (nodeRadius + loopGap),
    y: u.y + Math.sin(loopStartAngle) * (nodeRadius + loopGap),
  })
  const loopEnd = $derived({
    x: u.x + Math.cos(loopEndAngle) * (nodeRadius + loopGap),
    y: u.y + Math.sin(loopEndAngle) * (nodeRadius + loopGap),
  })
  const loopControl1 = $derived({
    x: u.x + Math.cos(loopBaseAngle - 0.5) * loopRadius,
    y: u.y + Math.sin(loopBaseAngle - 0.5) * loopRadius,
  })
  const loopControl2 = $derived({
    x: u.x + Math.cos(loopBaseAngle + 0.5) * loopRadius,
    y: u.y + Math.sin(loopBaseAngle + 0.5) * loopRadius,
  })
  const loopTangent = $derived({
    x: loopEnd.x - loopControl2.x,
    y: loopEnd.y - loopControl2.y,
  })

  const loopArrowAngle = $derived(Math.atan2(loopTangent.y, loopTangent.x))

  const weightOffset = $derived(
    isSelfLoop ? nodeRadius * 0 : directed ? nodeRadius * 2.5 : nodeRadius * 2,
  )
  const weightPos = $derived(
    isSelfLoop
      ? {
          x: u.x + Math.cos(loopBaseAngle) * (loopRadius + nodeRadius * 0),
          y: u.y + Math.sin(loopBaseAngle) * (loopRadius + nodeRadius * 0),
        }
      : {
          x: center.x + normalVec.x * weightOffset,
          y: center.y + normalVec.y * weightOffset,
        },
  )
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<g>
  {#if isSelfLoop}
    <path
      class={edgeStyle}
      stroke-width="4"
      fill="none"
      d={`M ${loopStart.x} ${loopStart.y} C ${loopControl1.x} ${loopControl1.y}, ${loopControl2.x} ${loopControl2.y}, ${loopEnd.x} ${loopEnd.y}`}
      onclick={onClickCallback}
    />

    <path
      d="M 2 0 L -4 -2 L -4 2 Z"
      class={`fill-${state.selected ? "cg-4" : state.group !== null ? `cg-${state.group}` : "primary"}`}
      transform={`
        translate(${loopEnd.x}, ${loopEnd.y})
        rotate(${(loopArrowAngle * 180) / Math.PI})
        scale(3)
      `}
    />
  {:else if directed}
    <!-- Curved path from u to v with offset to prevent overlap with node -->
    <path
      class={edgeStyle}
      stroke-width="4"
      fill="none"
      d={`M ${u.x} ${u.y} Q ${curveHandle!.x} ${curveHandle!.y}, ${directedEndPoint!.x} ${directedEndPoint!.y}`}
      onclick={onClickCallback}
    />

    <!-- Arrowhead at the tip -->
    <path
      d="M0,0 V4 L4,2 Z"
      class={`fill-${state.selected ? "cg-4" : state.group !== null ? `cg-${state.group}` : "primary"}`}
      transform={`translate(${v.x},${v.y}) scale(4,4) rotate(${directedArrowAngle},0,0) translate(-9.7,-1.9)`}
    />
  {:else}
    <!-- Undirected straight edge -->
    <line
      class={edgeStyle}
      stroke-width="4"
      x1={u.x}
      y1={u.y}
      x2={v.x}
      y2={v.y}
      onclick={onClickCallback}
    />
  {/if}

  {#if weightLabel !== null}
    <!-- Edge weight label -->
    <text
      class={`select-none ${labelFill}`}
      text-anchor="middle"
      dominant-baseline="central"
      x={weightPos.x}
      y={weightPos.y}
      font-size="1.5em"
    >
      {weightLabel}
    </text>
  {/if}
</g>

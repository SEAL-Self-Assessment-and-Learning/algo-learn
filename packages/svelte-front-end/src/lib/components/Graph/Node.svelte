<script lang="ts">
  import TeX from "$lib/components/TeX.svelte"

  type GraphElementStateType = { selected: boolean; group: null | number }
  type NodeRole = { isStart: boolean; isEnd: boolean }

  interface Props {
    pos: { x: number; y: number }
    setDragged?: () => void
    size: number
    label?: string
    clickable?: boolean
    nodeState: GraphElementStateType
    onClickCallback: () => void
    role?: NodeRole
    showRoleIndicators?: boolean
    renderAsLatex?: boolean
    startArrowAngle?: number
  }

  const {
    pos,
    setDragged,
    size,
    label,
    clickable = false,
    nodeState,
    onClickCallback,
    role = { isStart: false, isEnd: false },
    showRoleIndicators = false,
    renderAsLatex = true,
    startArrowAngle,
  }: Props = $props()

  let baseFillClass = $derived(
    nodeState.selected
      ? "fill-cg-4"
      : nodeState.group !== null && !showRoleIndicators
        ? `fill-cg-${nodeState.group}`
        : "fill-primary",
  )
  let hoverFillClass = $derived(clickable ? "" : "group-hover:fill-goethe")

  const dragAreaSize = size * (showRoleIndicators && role.isStart ? 2.6 : 2)

  const shouldRenderLatex = $derived(
    renderAsLatex || /[\\_^{}]/.test(label ?? "") || /\\/.test(label ?? ""),
  )

  const latexBox = $derived(size * 2.2)
  const startArrowOffset = $derived(size * 4.2)
  const startArrowLength = $derived(size * 3)
  const startArrowAngleDeg = $derived((startArrowAngle ?? Math.PI) * (180 / Math.PI))

  let startX = 0
  let startY = 0
  let dragging = false

  function handlePointerDown(e: PointerEvent) {
    startX = e.clientX
    startY = e.clientY
    dragging = false

    // Capture moves globally so we detect drags outside the circle
    window.addEventListener("pointermove", handlePointerMove)
    window.addEventListener("pointerup", handlePointerUp)
  }

  function handlePointerMove(e: PointerEvent) {
    const dx = e.clientX - startX
    const dy = e.clientY - startY
    if (!dragging && Math.sqrt(dx * dx + dy * dy) > 5) {
      dragging = true
      if (setDragged) setDragged()
    }
  }

  function handlePointerUp() {
    window.removeEventListener("pointermove", handlePointerMove)
    window.removeEventListener("pointerup", handlePointerUp)

    if (!dragging) {
      // It was a tap/click
      onClickCallback()
    }
  }
</script>

<g
  class="group outline-none"
  transform={`translate(${pos.x},${pos.y})`}
  role="button"
  tabindex="0"
  onpointerdown={handlePointerDown}
  onpointerup={handlePointerUp}
>
  <!-- Invisible larger circle for easier dragging -->
  <circle r={dragAreaSize} fill="transparent" stroke="none" class={clickable ? "cursor-pointer" : ""} />

  {#if showRoleIndicators && role.isStart}
    <!-- Start arrow rotated into the best free angle -->
    <g transform={`rotate(${startArrowAngleDeg})`}>
      <g transform={`translate(${-startArrowOffset}, 0)`}>
        <path
          d={`M 0 0 L ${startArrowLength - 12} 0`}
          class="stroke-primary"
          stroke-width="4"
          stroke-linecap="round"
          fill="none"
        />

        <path
          d="M 0 0 L -4 -2 L -4 2 Z"
          class="fill-primary"
          transform={`
            translate(${startArrowLength}, 0)
            scale(3)
          `}
        />
      </g>
    </g>
  {/if}

  <!-- Visible node circle -->
  <circle class={`${baseFillClass} ${hoverFillClass} stroke-secondary`} r={size} stroke-width="4" />

  {#if showRoleIndicators && role.isEnd}
    <circle
      r={size + 3}
      class="stroke-secondary pointer-events-none fill-none dark:stroke-white/80"
      stroke-width="2"
    />
  {/if}

  {#if label !== undefined && label !== ""}
    {#if shouldRenderLatex}
      <foreignObject
        x={-latexBox / 2}
        y={-latexBox / 2}
        width={latexBox}
        height={latexBox}
        class="pointer-events-none select-none"
      >
        <div
          class={`flex h-full items-center justify-center text-[16px] leading-tight ${!nodeState.selected && nodeState.group === null ? "text-primary-foreground fill-current" : ""}`}
        >
          <TeX expr={label} displayMode={false} />
        </div>
      </foreignObject>
    {:else}
      <text
        text-anchor="middle"
        dominant-baseline="central"
        class={`pointer-events-none select-none ${!nodeState.selected && nodeState.group === null ? "fill-primary-foreground" : ""}`}
        font-size="1.5em"
      >
        {label}
      </text>
    {/if}
  {/if}
</g>

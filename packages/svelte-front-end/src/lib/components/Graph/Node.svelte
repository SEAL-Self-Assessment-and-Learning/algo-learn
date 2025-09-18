<script lang="ts">
  type GraphElementStateType = { selected: boolean; group: null | number }

  interface Props {
    pos: { x: number; y: number }
    setDragged?: () => void
    size: number
    label?: string
    clickable?: boolean
    nodeState: GraphElementStateType
    onClickCallback: () => void
  }

  const { pos, setDragged, size, label, clickable = false, nodeState, onClickCallback }: Props = $props()

  // Todo: fix the cg-colors
  let baseFillClass = $derived(
    nodeState.selected
      ? "fill-cg-4"
      : nodeState.group !== null
        ? `fill-cg-${nodeState.group}`
        : "fill-primary",
  )
  // Todo: Fix the accent color (org: group-hover:fill-accent)
  let hoverFillClass = $derived(clickable ? "" : "group-hover:fill-goethe")

  // Make the drag area 2x bigger than the visible node
  const dragAreaSize = size * 2

  function handleMouseDown(e: MouseEvent) {
    // Prevent focusing on mouse down so the browser focus ring doesn't appear while dragging.
    e.preventDefault()
    if (setDragged) setDragged()
  }

  function handleTouchStart(e: TouchEvent) {
    if (setDragged) {
      e.preventDefault()
      setDragged()
    }
  }
</script>

<!--Todo: Touchstart and keydown still show some issues in the IDE?? -->

<!-- svelte-ignore a11y_click_events_have_key_events -->

<g
  class="group"
  transform={`translate(${pos.x},${pos.y})`}
  role="button"
  tabindex="0"
  onmousedown={handleMouseDown}
  ontouchstart={handleTouchStart}
  onclick={onClickCallback}
>
  <!-- Invisible larger circle for easier dragging -->
  <circle r={dragAreaSize} fill="transparent" stroke="none" class={clickable ? "cursor-pointer" : ""} />

  <!-- Visible node circle -->
  <circle class={`${baseFillClass} ${hoverFillClass} stroke-secondary`} r={size} stroke-width="6" />

  {#if label !== undefined && label !== ""}
    <text
      text-anchor="middle"
      dominant-baseline="central"
      class={`pointer-events-none select-none ${!nodeState.selected && nodeState.group === null ? "fill-primary-foreground" : ""}`}
      font-size="1.5em"
    >
      {label}
    </text>
  {/if}
</g>

<script lang="ts">
  import { Tooltip } from "bits-ui"
  import type { Snippet } from "svelte"

  type Props = Tooltip.RootProps & {
    trigger: Snippet
    rootProps?: Tooltip.RootProps
    triggerProps?: Tooltip.TriggerProps
    contentProps?: Tooltip.ContentProps
  }

  let {
    open = $bindable(false),
    trigger,
    children,
    rootProps = {},
    triggerProps = {},
    contentProps = {},
  }: Props = $props()
</script>

<Tooltip.Root delayDuration={50} disableHoverableContent={true} bind:open {...rootProps}>
  <Tooltip.Trigger {...triggerProps}>
    {@render trigger()}
  </Tooltip.Trigger>
  <Tooltip.Portal>
    <Tooltip.Content {...contentProps}>
      <div
        class="border-dark-10 bg-background shadow-popover z-0 flex items-center justify-center rounded-md border p-3 text-sm font-medium outline-hidden"
      >
        {@render children?.()}
      </div>
    </Tooltip.Content>
  </Tooltip.Portal>
</Tooltip.Root>

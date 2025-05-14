<script lang="ts">
  import { cn } from "$lib/utils.js"
  import { AlertDialog as AlertDialogPrimitive, type WithoutChild } from "bits-ui"
  import AlertDialogOverlay from "./alert-dialog-overlay.svelte"

  let {
    ref = $bindable(null),
    class: className,
    portalProps,
    ...restProps
  }: WithoutChild<AlertDialogPrimitive.ContentProps> & {
    portalProps?: AlertDialogPrimitive.PortalProps
  } = $props()
</script>

<AlertDialogPrimitive.Portal {...portalProps}>
  <AlertDialogOverlay />
  <AlertDialogPrimitive.Content
    bind:ref
    class={cn(
      "rounded-card-lg bg-background shadow-popover data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 border p-7 outline-hidden sm:max-w-lg md:w-full",
      className,
    )}
    {...restProps}
  />
</AlertDialogPrimitive.Portal>

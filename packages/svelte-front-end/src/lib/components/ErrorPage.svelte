<script lang="ts">
  import { goto } from "$app/navigation"
  import { base } from "$app/paths"
  import { getLanguage } from "$lib/utils/langState.svelte.ts"
  import type { Language } from "@shared/api/Language.ts"

  interface Props {
    mg: string
    reset: () => void
  }
  const { mg, reset }: Props = $props()
  const lang: Language = $derived(getLanguage())
</script>

<div class="flex h-svh flex-col items-center justify-center text-center">
  <div class="max-w-xl rounded-lg bg-red-200 p-5 shadow-lg">
    <p class="text-md mb-10 text-red-900">An error occurred: {mg}</p>
    <button
      class="text-md rounded-md bg-red-900 px-5 py-2 text-white transition hover:cursor-pointer hover:bg-red-950"
      onclick={() => {
        reset()
        goto(`${base}/${lang}`)
      }}
    >
      Go to Start Page
    </button>
  </div>
</div>

<script lang="ts">
  import { getLanguage } from "$lib/utils/langState.svelte.ts"
  import Catalogue from "@/lib/components/catalogue/catalogue.svelte"

  const lang = $derived(getLanguage())
</script>

<Catalogue {lang} />

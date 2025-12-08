<script lang="ts">
  import Catalogue from "$lib/components/catalogue/Catalogue.svelte"
  import { getLanguage } from "$lib/utils/langState.svelte.ts"

  const lang = $derived(getLanguage())
</script>

<Catalogue {lang} />

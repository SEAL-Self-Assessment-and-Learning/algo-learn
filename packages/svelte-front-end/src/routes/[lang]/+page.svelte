<script lang="ts">
  import Catalogue from "@/lib/components/catalogue/catalogue.svelte"

  const { data } = $props()
</script>

<Catalogue lang={data.lang} />

<script lang="ts">
  import { format } from "@shared/utils/format"
  import Markdown from "@/lib/components/markdown.svelte"

  const props = $props()
  const { t } = $derived(props.data)
</script>

<h1>{t("Legal.label")}</h1>
<p>{t("Legal.text")}</p>
<p>
  <Markdown md={format(t("Legal.detailed.text"), ["https://tcs.uni-frankfurt.de/legal"])} />
</p>
<h2>{t("Legal.authors.label")}</h2>
<p>
  <Markdown
    md={format(t("Legal.authors.text"), [
      "https://holgerdell.com/",
      "https://github.com/goethe-tcs/algo-learn/",
    ])}
  />
</p>

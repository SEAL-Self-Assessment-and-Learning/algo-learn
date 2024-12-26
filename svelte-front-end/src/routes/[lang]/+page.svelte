<script>
  import { collection } from "@settings/questionsSelection"
  import QuestionGeneratorCard from "@/lib/components/questionGeneratorCard.svelte"

  const { data } = $props()
</script>

<h1>Welcome to SvelteKit</h1>
<p>
  Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation
</p>
<p>The svelte port of Algo-Learn is not yet feature complete.</p>
<QuestionGeneratorCard
  showAllVariants={false}
  generator={collection[0].contents[0]}
  lang={data.lang}
  t={data.t}
/>

<script lang="ts">
  import ErrorPage from "$lib/components/ErrorPage.svelte"
  import Loading from "$lib/components/Loading.svelte"
  import QuestionComponent from "$lib/components/QuestionComponent.svelte"
  import type { Result } from "$lib/components/types.ts"
  import { getLanguage } from "$lib/utils/langState.svelte.ts"
  import type { Language } from "@shared/api/Language.ts"
  import type { Parameters } from "@shared/api/Parameters"
  import type { QuestionGenerator } from "@shared/api/QuestionGenerator.ts"

  interface Props {
    generator: QuestionGenerator
    parameters: Parameters
    seed: string
    onResult: ((result: Result) => void) | undefined
    regenerate: () => void
  }
  const { generator, parameters, seed, onResult, regenerate }: Props = $props()
  const lang: Language = $derived(getLanguage())
  const question = $derived(fetchQuestion())
  async function fetchQuestion() {
    return generator.generate(lang, parameters, seed)
  }
</script>

{#await question}
  <Loading />
{:then question}
  <!-- Todo: Missing useFormat() -->
  {#key question}
    <QuestionComponent question={question.question} {onResult} {regenerate} />
  {/key}
{:catch err}
  <ErrorPage mg={err.message} reset={regenerate} />
{/await}

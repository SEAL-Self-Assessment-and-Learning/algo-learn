<script lang="ts">
  import Loading from "$lib/components/Loading.svelte"
  import QuestionComponent from "$lib/components/QuestionComponent.svelte"
  import type { Result } from "$lib/components/types.ts"
  import type { Language } from "@shared/api/Language.ts"
  import type { Parameters } from "@shared/api/Parameters"
  import type { QuestionGenerator } from "@shared/api/QuestionGenerator.ts"
  import { createQuery } from "@tanstack/svelte-query"

  interface Props {
    generator: QuestionGenerator
    parameters: Parameters
    seed: string
    onResult: ((result: Result) => void) | undefined
    lang: Language
  }
  const { generator, parameters, seed, onResult, lang }: Props = $props()

  const queryKey = [generator, lang, parameters, seed]
  const questionQuery = createQuery({
    queryKey,
    queryFn: async () => generator.generate(lang, parameters, seed),
  })
</script>

{#if $questionQuery.isError}
  {$questionQuery.error}
{:else if $questionQuery.isLoading || !$questionQuery.isSuccess}
  <Loading {lang} />
{:else}
  <!-- Todo: Missing useFormat() -->
  <QuestionComponent question={$questionQuery.data.question} {onResult} {lang} />
{/if}

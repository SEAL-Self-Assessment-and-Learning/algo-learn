<script lang="ts">
  import { resolve } from "$app/paths"
  import { Button } from "$lib/components/ui/button/index.js"
  import { getLanguage } from "$lib/utils/langState.svelte.ts"
  import type { Language } from "@shared/api/Language.js"
  import { allParameterCombinations, serializeParameters } from "@shared/api/Parameters.js"
  import type { QuestionGenerator } from "@shared/api/QuestionGenerator.ts"
  import { serializeGeneratorCall } from "@shared/api/QuestionRouter.js"

  interface Props {
    gSelected: {
      slug: string
      name: Readonly<Partial<Record<Language, string>>>
      contents: QuestionGenerator[]
    }
    showAllVariants: Record<string, boolean>
  }
  const { gSelected, showAllVariants }: Props = $props()
  const lang: Language = $derived(getLanguage())
</script>

<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
  {#each gSelected.contents as generator (generator.name)}
    <a href={resolve(`/${lang}/${generator.id}`)}>
      <div
        class="group block h-full rounded-md border border-gray-300 bg-white p-4 transition-all hover:scale-[1.02] hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
      >
        <!-- Topic name -->
        <h3 class="font-semibold text-gray-800 transition-colors dark:text-gray-100">
          {generator.name(lang)}
        </h3>

        {#if generator.description}
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {generator.description(lang)}
          </p>
        {/if}

        {#if showAllVariants[gSelected.slug]}
          {#if generator.expectedParameters.length > 0}
            <div class="mt-2 flex flex-wrap gap-2">
              {#each allParameterCombinations(generator.expectedParameters) as parameters (parameters)}
                {@const path = serializeGeneratorCall({ lang, generator, parameters })}
                {@const params = serializeParameters(parameters, generator.expectedParameters)}
                {#if params}
                  <Button size="xsm" variant="outline" href={resolve(`/${path}`)}>
                    {params}
                  </Button>
                {/if}
              {/each}
            </div>
          {/if}
        {/if}
      </div>
    </a>
  {/each}
</div>

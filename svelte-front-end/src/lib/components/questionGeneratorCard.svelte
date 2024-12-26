<script lang="ts">
  import * as Card from "$lib/components/ui/card/index.js"
  import type { Language } from "@shared/api/Language"
  import { allParameterCombinations, serializeParameters } from "@shared/api/Parameters"
  import { type QuestionGenerator } from "@shared/api/QuestionGenerator"
  import { serializeGeneratorCall } from "@shared/api/QuestionRouter"
  import Button from "./ui/button/button.svelte"

  type Props = {
    generator: QuestionGenerator
    showAllVariants?: boolean
    showDescription?: boolean
    class?: string
    t: (key: string) => string
    lang: Language
  }
  const {
    generator,
    showAllVariants = true,
    showDescription = true,
    class: class_,
    t,
    lang,
  }: Props = $props()
</script>

<Card.Root class={class_}>
  <Card.Header class="m-0 p-3">
    <Card.Title class="text-base">{generator.name(lang)}</Card.Title>
    {#if showDescription && generator.description}
      <Card.Description>
        {generator.description(lang)}
      </Card.Description>
    {/if}
  </Card.Header>
  <Card.Footer class="m-0 flex flex-wrap items-center gap-2 p-3">
    <Button
      size="sm"
      href={`/${lang}/practice/${generator.id}`}
      class="no-underline"
      variant="rightAnswer"
    >
      {t("Catalogue.practice")}
      ›
    </Button>
    {#if showAllVariants}
      {#each allParameterCombinations(generator.expectedParameters) as parameters}
        {@const path = serializeGeneratorCall({ lang, generator, parameters })}
        {@const params = serializeParameters(parameters, generator.expectedParameters)}
        {#if params}
          <a href={`/${path}`}> {params}</a>
        {/if}
      {/each}
    {/if}
  </Card.Footer>
</Card.Root>

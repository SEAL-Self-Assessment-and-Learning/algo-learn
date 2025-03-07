<script lang="ts">
  import type { Result } from "$lib/components/types.ts"
  import type { Question } from "@shared/api/QuestionGenerator.ts"

  interface Props {
    question: Question
    onResult?: (result: Result) => void
    regenerate?: () => void
  }
  const { question }: Props = $props()
</script>

{#if question.type === "MultipleChoiceQuestion"}
  {question.text}
{:else if question.type === "FreeTextQuestion"}
  {question.text}
{:else if question.type === "MultiFreeTextQuestion"}
  {question.text}
{:else}
  <b>Unsupported question type.</b>
{/if}

<script lang="ts">
  import ExerciseMultipleChoice from "$lib/components/ExerciseMultipleChoice.svelte"
  import ExerciseMultiTextInput from "$lib/components/ExerciseMultiTextInput.svelte"
  import ExerciseTextInput from "$lib/components/ExerciseTextInput.svelte"
  import type { Result } from "$lib/components/types.ts"
  import type { Language } from "@shared/api/Language.ts"
  import type { Question } from "@shared/api/QuestionGenerator.ts"

  interface Props {
    question: Question
    onResult?: (result: Result) => void
    regenerate?: () => void
    lang: Language
  }
  const { question, onResult, regenerate, lang }: Props = $props()
</script>

{#if question.type === "MultipleChoiceQuestion"}
  <ExerciseMultipleChoice {question} permalink={question.path} {onResult} {regenerate} {lang} />
{:else if question.type === "FreeTextQuestion"}
  <ExerciseTextInput {question} permalink={question.path} {onResult} {regenerate} {lang} />
{:else if question.type === "MultiFreeTextQuestion"}
  <ExerciseMultiTextInput {question} permalink={question.path} {onResult} {regenerate} {lang} />
{:else}
  <b>Unsupported question type.</b>
{/if}

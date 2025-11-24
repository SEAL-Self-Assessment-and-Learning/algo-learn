<script lang="ts">
  import MatchingExercise from "$lib/components/DnD/MatchingExercise.svelte"
  import type { SlotItem } from "$lib/components/DnD/MatchingSlot.svelte"
  import InteractWithQuestion from "$lib/components/InteractWithQuestion.svelte"
  import Markdown from "$lib/components/markdown/markdown.svelte"
  import type { MODE, Result } from "$lib/components/types.ts"
  import { playSound } from "$lib/sound.svelte.ts"
  import type { MultipleChoiceFeedback, MultipleChoiceQuestion } from "@shared/api/QuestionGenerator.ts"

  interface Props {
    question: MultipleChoiceQuestion
    permalink?: string
    onResult?: (result: Result, finished: boolean) => void
    regenerate?: () => void
  }

  const { question, permalink, onResult, regenerate }: Props = $props()

  const questionState: {
    mode: MODE
    choice: number[]
    feedbackObject?: MultipleChoiceFeedback
  } = $state({
    mode: question.fillOutAll ? "invalid" : "draft",
    choice: Array(question.answers.length).fill(-1),
  })

  const disabled = $derived(questionState.mode === "correct" || questionState.mode === "incorrect")

  // handle fillOutAll mode
  function onModeChange(newMode: MODE) {
    // if already correct/incorrect, don't revert mode
    if (questionState.mode === "correct" || questionState.mode === "incorrect") return
    // otherwise update
    if (question.fillOutAll) {
      questionState.mode = newMode
    }
  }

  // handle submit
  function handleClick(finished: boolean) {
    if (question.feedback && questionState.mode === "draft") {
      void Promise.resolve(question.feedback({ choice: questionState.choice })).then(
        (feedbackObject) => {
          const mode: MODE = feedbackObject.correct ? "correct" : "incorrect"
          playSound(mode === "correct" ? "pass" : "fail")
          questionState.feedbackObject = feedbackObject
          questionState.mode = mode
        },
      )
    } else if (["correct", "incorrect"].includes(questionState.mode)) {
      onResult?.(questionState.mode as Result, finished)
    }
  }

  // handle drag/drop changes
  function onChange(slots: (SlotItem | null)[]) {
    questionState.choice = slots.map((s) => (s ? Number(s.id) : -1))
  }

  function onModeChangeFromChild(newMode: MODE) {
    if (question.fillOutAll) {
      questionState.mode = newMode
    }
  }
</script>

<InteractWithQuestion
  {permalink}
  name={question.name}
  {regenerate}
  footerMode={questionState.mode}
  footerMessage={footerMsg}
  handleFooterClick={handleClick}
>
  <Markdown md={question.text ?? ""} />

  <MatchingExercise
    pairs={(question.fixedItems ?? []).map((f, i) => ({
      id: `${i}`,
      fixed: f,
      answerId: questionState.choice[i] >= 0 ? `${questionState.choice[i]}` : null,
      correctness: questionState.feedbackObject?.rowCorrectness?.[i] ?? null,
    }))}
    answers={question.answers.map((a, i) => ({
      id: `${i}`,
      content: a,
    }))}
    {disabled}
    {onChange}
    {onModeChange}
    columns={question.columns}
  />
</InteractWithQuestion>

{#snippet footerMsg()}
  <b class="text-lg">
    {#if questionState.mode === "correct"}
      Correct!
    {:else if questionState.mode === "incorrect"}
      Incorrect.
    {:else if questionState.mode === "invalid"}
      Fill All.
    {:else}
      That's okay!
    {/if}
  </b>
{/snippet}

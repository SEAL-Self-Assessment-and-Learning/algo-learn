<script lang="ts">
  import Markdown from "$lib/components/markdown.svelte"
  import type { TextFieldState } from "$lib/components/types.ts"
  import { inputClass } from "$lib/components/ui/input/cnInput.js"
  import FeedbackComp from "$lib/components/ui/MultiInput/FeedbackComp.svelte"
  import { cn } from "$lib/utils.ts"
  import { getExtraStyles } from "$lib/utils/MultiTextInput.ts"
  import { getContext } from "svelte"

  interface Props {
    id: string
  }
  const { id }: Props = $props()

  const textFieldStateValues: () => { [p: string]: TextFieldState } = $derived(
    getContext("textFieldStateValues"),
  )
  const {
    feedbackVariation,
    focus,
    feedback,
    type,
    placeholder,
    prompt,
    invalid,
    disabled,
    setText,
    text,
  } = $derived(textFieldStateValues()[id])

  let firstInputRef: HTMLInputElement | null = $state(null)
  // Todo: Check if a changing parameter is needed in tsx it's [id]
  $effect(() => {
    if (firstInputRef && focus) {
      firstInputRef.focus({ preventScroll: true })
    }
  })

  const handleChange = (e: Event) => {
    if (setText) {
      if (
        type === "TTABLE" &&
        (e.target as HTMLInputElement).value !== "0" &&
        (e.target as HTMLInputElement).value !== "1"
      ) {
        setText("")
      } else {
        setText((e.target as HTMLInputElement).value)
      }
    }
  }

  const inputBorderColor: string = $derived(invalid ? "border-red-500 focus:border-red-500" : "")
  const { spacing, additionalClassnames, fieldWidth } = $derived(getExtraStyles(type, feedbackVariation))
  let isInputFocused: boolean = $state(false)
  function setIsInputFocused(v: boolean) {
    isInputFocused = v
  }
</script>

{#if feedbackVariation === "below"}
  <div>
    {@render spacingSnippet()}
    <div class="flex flex-col">
      <div class="flex flex-row items-center">
        {@render promptSnippet()}
        <div class={`relative flex h-full ${fieldWidth ? "" : "w-full"} items-center justify-center`}>
          <input
            class={`${cn(inputClass, inputBorderColor, additionalClassnames)}`}
            bind:this={firstInputRef}
            {disabled}
            value={text || ""}
            oninput={handleChange}
            maxlength={type === "TTABLE" ? 1 : undefined}
            onfocus={() => setIsInputFocused(true)}
            onblur={() => setIsInputFocused(false)}
            type="text"
            style={fieldWidth ? `width: ${fieldWidth}ch` : undefined}
            placeholder={placeholder || ""}
          />
        </div>
      </div>
      <FeedbackComp
        formatFeedback={feedback ? feedback : ""}
        {invalid}
        type={feedbackVariation === "below" ? "below" : "overlay"}
      />
    </div>
    {@render spacingSnippet()}
  </div>
{:else}
  <div>
    {@render spacingSnippet()}
    <div class="flex flex-row items-center">
      {@render promptSnippet()}
      <div class={`relative flex h-full ${fieldWidth ? "" : "w-full"} items-center justify-center`}>
        <input
          class={`${cn(inputClass, inputBorderColor, additionalClassnames)}`}
          bind:this={firstInputRef}
          {disabled}
          value={text || ""}
          oninput={handleChange}
          maxlength={type === "TTABLE" ? 1 : undefined}
          onfocus={() => setIsInputFocused(true)}
          onblur={() => setIsInputFocused(false)}
          type="text"
          style={fieldWidth ? `width: ${fieldWidth}ch` : undefined}
          placeholder={placeholder || ""}
        />
        {#if isInputFocused && feedback && text}
          <FeedbackComp
            formatFeedback={feedback ? feedback : ""}
            {invalid}
            type={feedbackVariation === "below" ? "below" : "overlay"}
          />
        {/if}
      </div>
    </div>
    {@render spacingSnippet()}
  </div>
{/if}

{#snippet spacingSnippet()}
  {#if spacing}
    <br />
  {/if}
{/snippet}

{#snippet promptSnippet()}
  {#if prompt}
    <div class={`mr-2 whitespace-nowrap`}>
      <Markdown md={prompt} />
    </div>
  {/if}
{/snippet}

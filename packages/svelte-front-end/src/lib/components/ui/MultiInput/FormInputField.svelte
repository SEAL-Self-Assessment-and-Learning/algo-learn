<script lang="ts">
  import Markdown from "$lib/components/markdown/markdown.svelte"
  import type { TextFieldState } from "$lib/components/types.ts"
  import InputFieldIcon from "$lib/components/ui/MultiInput/InputFieldIcon.svelte"
  import { indicatorColor, inputClass } from "$lib/components/ui/MultiInput/inputUtils.ts"
  import MyTooltip from "$lib/components/ui/MyTooltip.svelte"
  import { cn } from "$lib/utils.ts"
  import { getExtraStyles } from "$lib/utils/MultiTextInput.ts"
  import { Tooltip } from "bits-ui"
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
    mode,
  } = $derived(textFieldStateValues()[id])

  let firstInputRef: HTMLInputElement | null = $state(null)
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

  const inputBorderColor: string = $derived(invalid ? "border-yellow-500 focus:border-yellow-500" : "")
  const { spacing, additionalClassnames, fieldWidth } = $derived(getExtraStyles(type, feedbackVariation))
</script>

<!-- Get the feedback text directly via: -->
<!-- feedback ? feedback : "" -->

{@render spacingSnippet()}
<div class="flex flex-row items-center">
  {@render promptSnippet()}
  <div class={`relative flex h-full ${fieldWidth ? "" : "w-full"} items-center justify-center`}>
    <input
      class={`${cn(inputClass, inputBorderColor, additionalClassnames)}`}
      bind:this={firstInputRef}
      pattern={type === "TTABLE" ? "[01]" : undefined}
      {disabled}
      value={text || ""}
      oninput={handleChange}
      onbeforeinput={(e) => {
        if (type === "TTABLE") {
          const inputEvent = e as InputEvent
          const nextValue = inputEvent.data ?? ""
          if (nextValue && nextValue !== "0" && nextValue !== "1") {
            e.preventDefault()
          }
        }
      }}
      maxlength={type === "TTABLE" ? 1 : undefined}
      type="text"
      style={fieldWidth ? `width: ${fieldWidth}ch` : undefined}
      placeholder={placeholder || ""}
    />

    {#if mode !== "initial" && mode !== "submitted"}
      <span
        class={`absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full ${indicatorColor[mode as "draft" | "correct" | "incorrect" | "invalid"]} text-[10px] font-bold text-white`}
      >
        {#if feedback !== ""}
          <Tooltip.Provider>
            <MyTooltip
              contentProps={{
                side: "top",
                sideOffset: 5,
                class: "max-w-xs whitespace-pre-wrap break-words",
              }}
            >
              {#snippet trigger()}
                <div class="cursor-pointer p-2">
                  <InputFieldIcon {mode} />
                </div>
              {/snippet}
              {feedback}
            </MyTooltip>
          </Tooltip.Provider>
        {:else}
          <InputFieldIcon {mode} />
        {/if}
      </span>
    {/if}
  </div>
</div>
{@render spacingSnippet()}

{#snippet spacingSnippet()}
  {#if spacing}
    <br />
  {/if}
{/snippet}

{#snippet promptSnippet()}
  {#if prompt}
    <div class="mr-2 whitespace-nowrap">
      <Markdown md={prompt} />
    </div>
  {/if}
{/snippet}

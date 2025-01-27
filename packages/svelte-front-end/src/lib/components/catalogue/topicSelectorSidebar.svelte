<script lang="ts">
  import * as Card from "$lib/components/ui/card/index.js"
  import { cn } from "$lib/utils.js"
  import type { HTMLAttributes } from "svelte/elements"
  import { collection } from "@settings/questionsSelection"
  import type { Language } from "@shared/api/Language"
  import { tFunction } from "@shared/utils/translations"
  import { globalTranslations } from "../../translation"
  import Button from "../ui/button/button.svelte"
  import Checkbox from "../ui/checkbox/checkbox.svelte"
  import Label from "../ui/label/label.svelte"

  /**
   * A sidebar that allows the user to select a topic and whether to show all variants of a question generator
   * @param selectedGroup The currently selected group
   * @param setSelectedGroup A function to set the selected group
   * @param showAllVariants Whether to show all variants of a question generator
   * @param setShowAllVariants A function to set whether to show all variants of a question generator
   * @param lang The current language
   */
  interface Props extends HTMLAttributes<HTMLDivElement> {
    selectedGroup: string | null
    setSelectedGroup: (s: string) => void
    showAllVariants: boolean
    setShowAllVariants: (b: boolean) => void
    lang: Language
  }

  const { selectedGroup, setSelectedGroup, showAllVariants, setShowAllVariants, lang, ...rest }: Props =
    $props()

  const { t } = $derived(tFunction(globalTranslations, lang))
</script>

<Card.Root {...rest} class={cn("bg-secondary text-secondary-foreground border-0", rest.class)}>
  <Card.Header>
    <Card.Title>{t("Catalogue.topic")}</Card.Title>
    <Card.Description>{t("Catalogue.choose.desc")}</Card.Description>
  </Card.Header>
  <Card.Content class="flex flex-col flex-wrap gap-1">
    {#each collection as g}
      <Button
        onclick={() => setSelectedGroup(g.slug)}
        variant={selectedGroup === g.slug ? "default" : "ghost"}
        class="justify-start"
      >
        {g.name[lang]}
      </Button>
    {/each}
    {#if selectedGroup}
      <div class="mt-4 ml-2 flex gap-2">
        <Checkbox
          id="terms1"
          checked={showAllVariants}
          onCheckedChange={(b) => setShowAllVariants(b === true)}
        />
        <Label for="terms1">{t("Catalogue.showVariants")}</Label>
      </div>
    {/if}
  </Card.Content>
</Card.Root>

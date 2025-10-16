<script lang="ts">
  import { resolve } from "$app/paths"
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js"
  import { getLanguage, setLanguage } from "$lib/utils/langState.svelte.ts"
  import Settings from "@lucide/svelte/icons/settings"
  import type { Language } from "@shared/api/Language"
  import { tFunction } from "@shared/utils/translations"
  import { getMuted, setMuted } from "../sound.svelte.js"
  import { availableThemes, getTheme, setTheme } from "../theme.svelte.js"
  import { globalTranslations, NATIVE_NAME, SUPPORTED_LANGUAGES } from "../translation"
  import FeedbackDialog from "./feedbackDialog.svelte"
  import SealLogo from "./logo/seal-logo-text-horizontal-white.svg"
  import Button from "./ui/button/button.svelte"

  const lang: Language = $derived(getLanguage())
  const { t } = $derived(tFunction([globalTranslations], lang))
  function setLang(s: string) {
    setLanguage(s as Language)
  }
</script>

<header
  class="dark bg-goethe text-goethe-foreground flex flex-none flex-wrap place-items-center justify-between gap-1 p-2"
>
  {@render logo()}
  <div class="grow"></div>
  <FeedbackDialog />
  {@render settingsMenu()}
</header>

{#snippet logo()}
  <Button variant="ghost" href={resolve("/")} class="flex items-center gap-2 px-2 text-3xl font-thin">
    <img src={SealLogo} alt="Logo" class="h-10" />
  </Button>
{/snippet}

{#snippet settingsMenu()}
  <DropdownMenu.Root>
    <DropdownMenu.Trigger>
      {#snippet child({ props })}
        <Button variant="ghost" size="icon" aria-label={t("menu.settings")} {...props}>
          <Settings class="h-4 w-4" />
        </Button>
      {/snippet}
    </DropdownMenu.Trigger>
    <DropdownMenu.Content class="w-56">
      <DropdownMenu.Label>{t("menu.language")}</DropdownMenu.Label>
      <DropdownMenu.RadioGroup value={lang} onValueChange={(s) => setLang(s)}>
        {#each SUPPORTED_LANGUAGES as lng (lng)}
          <DropdownMenu.RadioItem value={lng} closeOnSelect={false}>
            {NATIVE_NAME[lng]}
          </DropdownMenu.RadioItem>
        {/each}
      </DropdownMenu.RadioGroup>
      <DropdownMenu.Separator />
      <DropdownMenu.Label>{t("menu.sound")}</DropdownMenu.Label>
      <DropdownMenu.RadioGroup
        value={getMuted() ? "off" : "on"}
        onValueChange={(s) => setMuted(s === "off")}
      >
        <DropdownMenu.RadioItem value="on" closeOnSelect={false}>
          {t("on")}
        </DropdownMenu.RadioItem>
        <DropdownMenu.RadioItem value="off" closeOnSelect={false}>
          {t("off")}
        </DropdownMenu.RadioItem>
      </DropdownMenu.RadioGroup>
      <DropdownMenu.Separator />
      <DropdownMenu.Label>{t("menu.theme")}</DropdownMenu.Label>
      <DropdownMenu.RadioGroup value={getTheme()} onValueChange={setTheme}>
        {#each availableThemes as thm (thm)}
          <DropdownMenu.RadioItem value={thm} closeOnSelect={false}>
            {t("theme." + thm)}
          </DropdownMenu.RadioItem>
        {/each}
      </DropdownMenu.RadioGroup>
    </DropdownMenu.Content>
  </DropdownMenu.Root>
{/snippet}

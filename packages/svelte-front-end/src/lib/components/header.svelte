<script lang="ts">
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js"
  import { getLanguage, setLanguage } from "$lib/utils/langState.svelte.ts"
  import FileKey2 from "lucide-svelte/icons/file-key-2"
  import GitCommitHorizontal from "lucide-svelte/icons/git-commit-horizontal"
  import Home from "lucide-svelte/icons/home"
  import Info from "lucide-svelte/icons/info"
  import MoreVertical from "lucide-svelte/icons/more-vertical"
  import Settings from "lucide-svelte/icons/settings"
  import WifiOff from "lucide-svelte/icons/wifi-off"
  import type { Language } from "@shared/api/Language"
  import { tFunction } from "@shared/utils/translations"
  import { VERSION } from "../config"
  import { getMuted, setMuted } from "../sound.svelte"
  import { availableThemes, getTheme, setTheme } from "../theme.svelte"
  import { globalTranslations, NATIVE_NAME, SUPPORTED_LANGUAGES } from "../translation"
  import FeedbackDialog from "./feedbackDialog.svelte"
  import Button from "./ui/button/button.svelte"

  const lang: Language = $derived(getLanguage())
  const { t } = $derived(tFunction([globalTranslations], lang))
  function setLang(s: string) {
    setLanguage(s as Language)
  }
</script>

<header
  class="bg-goethe text-goethe-foreground flex flex-none flex-wrap place-items-center justify-between gap-1 border-b-2 p-2"
>
  <div class="grow">
    {@render logo()}
  </div>
  <FeedbackDialog />
  {@render settingsMenu()}
  {@render navigationMenu()}
</header>

{#snippet logo()}
  <Button href="/" variant="link" class="inline text-2xl text-inherit">
    algo learn <span class="font-mono text-sm text-yellow-200">alpha</span>
  </Button>
{/snippet}

{#snippet settingsMenu()}
  <DropdownMenu.Root>
    <DropdownMenu.Trigger>
      {#snippet child({ props })}
        <Button
          variant="ghost"
          size="icon"
          class="hover:bg-primary hover:text-primary-foreground bg-inherit"
          aria-label={t("menu.settings")}
          {...props}
        >
          <Settings class="h-4 w-4" />
        </Button>
      {/snippet}
    </DropdownMenu.Trigger>
    <DropdownMenu.Content class="w-56">
      <DropdownMenu.Label>{t("menu.language")}</DropdownMenu.Label>
      <DropdownMenu.RadioGroup value={lang} onValueChange={(s) => setLang(s)}>
        {#each SUPPORTED_LANGUAGES as lng}
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
        {#each availableThemes as thm}
          <DropdownMenu.RadioItem value={thm} closeOnSelect={false}>
            {t("theme." + thm)}
          </DropdownMenu.RadioItem>
        {/each}
      </DropdownMenu.RadioGroup>
    </DropdownMenu.Content>
  </DropdownMenu.Root>
{/snippet}

{#snippet navigationMenu()}
  <DropdownMenu.Root>
    <DropdownMenu.Trigger>
      {#snippet child({ props })}
        <Button
          variant="ghost"
          size="icon"
          class="hover:bg-primary hover:text-primary-foreground bg-inherit"
          aria-label={t("menu")}
          {...props}
        >
          <MoreVertical class="h-4 w-4" />
        </Button>
      {/snippet}
    </DropdownMenu.Trigger>
    <DropdownMenu.Content>
      <DropdownMenu.Label>{t("menu")}</DropdownMenu.Label>
      <DropdownMenu.Separator /><DropdownMenu.Group>
        <DropdownMenu.Item>
          {#snippet child({ props })}
            <a href={`/${lang}`} class="flex items-center" {...props}>
              <Home class="mr-2 h-4 w-4" />
              {t("Home")}
            </a>
          {/snippet}
        </DropdownMenu.Item>
        <DropdownMenu.Item>
          {#snippet child({ props })}
            <a href={`/${lang}/about`} class="flex items-center" {...props}>
              <Info class="mr-2 h-4 w-4" />
              {t("About.label")}
            </a>
          {/snippet}
        </DropdownMenu.Item>
        <DropdownMenu.Item>
          {#snippet child({ props })}
            <a href={`/${lang}/legal`} class="flex items-center" {...props}>
              <FileKey2 class="mr-2 h-4 w-4" />
              {t("Legal.label")}
            </a>
          {/snippet}
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        {#if (VERSION as string) === "local build"}
          <DropdownMenu.Item>
            {#snippet child({ props })}
              <div class="flex items-center" {...props}>
                <WifiOff class="mr-2 h-4 w-4" />
                {`${t("Version")}: ${VERSION}`}
              </div>
            {/snippet}
          </DropdownMenu.Item>
        {:else}
          <DropdownMenu.Item>
            {#snippet child({ props })}
              <a
                href={`https://github.com/holgerdell/algo-learn/commit/${VERSION}`}
                class="flex items-center"
                {...props}
              >
                <GitCommitHorizontal class="mr-2 h-4 w-4" />
                {`${t("Version")}: ${VERSION}`}
              </a>
            {/snippet}
          </DropdownMenu.Item>
        {/if}
      </DropdownMenu.Group>
    </DropdownMenu.Content>
  </DropdownMenu.Root>
{/snippet}

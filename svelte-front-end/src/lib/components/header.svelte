<script lang="ts">
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js"
  import {
    FileKey2,
    GitCommitHorizontal,
    Home,
    Info,
    MoreVertical,
    Settings,
    WifiOff,
  } from "lucide-svelte"
  import type { Language } from "@shared/api/Language"
  import { tFunction, type Translations } from "@shared/utils/translations"
  import { redirect } from "@sveltejs/kit"
  import { VERSION } from "../config"
  import { getMuted, setMuted } from "../sound.svelte"
  import { availableThemes, getTheme, setTheme } from "../theme.svelte"
  import { NATIVE_NAME, SUPPORTED_LANGUAGES } from "../translation"
  import Button from "./ui/button/button.svelte"

  const translations: Translations = {
    de: {
      on: "An",
      off: "Aus",
      menu: "Menü",
      "menu.settings": "Einstellungen",
      "menu.language": "Sprache",
      "menu.sound": "Ton",
      "menu.theme": "Design",
      "theme.system": "System",
      "theme.dark": "dunkel",
      "theme.light": "hell",
    },
    en: {
      on: "On",
      off: "Off",
      menu: "Menu",
      "menu.settings": "Settings",
      "menu.language": "Language",
      "menu.sound": "Sound",
      "menu.theme": "Theme",
      "theme.system": "system",
      "theme.dark": "dark",
      "theme.light": "light",
    },
  }

  const lang = "en"
  const { t } = $derived(tFunction(translations, lang))
  const setLang = (s: Language) => {
    redirect(307, lang)
  }
</script>

<header
  class="flex flex-none flex-wrap place-items-center justify-between gap-1 border-b-2 bg-goethe p-2 text-goethe-foreground"
>
  <div class="flex-grow">
    <Button href="/" variant="link" class="inline text-2xl text-inherit">
      algo learn <span class="font-mono text-sm text-yellow-200">alpha</span>
    </Button>
  </div>
  <DropdownMenu.Root>
    <DropdownMenu.Trigger>
      <Button
        variant="ghost"
        size="icon"
        class="bg-inherit hover:bg-primary hover:text-primary-foreground"
        aria-label={t("menu.settings")}
      >
        <Settings class="h-4 w-4" />
      </Button>
    </DropdownMenu.Trigger>
    <DropdownMenu.Content class="w-56">
      <DropdownMenu.Label>{t("menu.language")}</DropdownMenu.Label>
      <DropdownMenu.RadioGroup value={lang} onValueChange={(s) => setLang(s as Language)}>
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
  <DropdownMenu.Root>
    <DropdownMenu.Trigger>
      <Button
        variant="ghost"
        size="icon"
        class="bg-inherit hover:bg-primary hover:text-primary-foreground"
        aria-label={t("menu")}
      >
        <MoreVertical class="h-4 w-4" />
      </Button>
    </DropdownMenu.Trigger>
    <DropdownMenu.Content>
      <DropdownMenu.Label>Menu</DropdownMenu.Label>
      <DropdownMenu.Separator /><DropdownMenu.Group>
        <DropdownMenu.Item>
          <a href={`/${lang}/`} class="flex items-center">
            <Home class="mr-2 h-4 w-4" />
            {t("Home")}
          </a>
        </DropdownMenu.Item>
        <DropdownMenu.Item>
          <a href={`/${lang}/about`} class="flex items-center">
            <Info class="mr-2 h-4 w-4" />
            {t("About.label")}
          </a>
        </DropdownMenu.Item>
        <DropdownMenu.Item>
          <a href={`/${lang}/legal`} class="flex items-center">
            <FileKey2 class="mr-2 h-4 w-4" />
            {t("Legal.label")}
          </a>
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        {#if (VERSION as string) === "local build"}
          <DropdownMenu.Item>
            <div class="flex items-center">
              <WifiOff class="mr-2 h-4 w-4" />
              {`${t("Version")}: ${VERSION}`}
            </div>
          </DropdownMenu.Item>
        {:else}
          <DropdownMenu.Item>
            <a
              href={`https://github.com/holgerdell/algo-learn/commit/${VERSION}`}
              class="flex items-center"
            >
              <GitCommitHorizontal class="mr-2 h-4 w-4" />
              {`${t("Version")}: ${VERSION}`}
            </a>
          </DropdownMenu.Item>
        {/if}
      </DropdownMenu.Group>
    </DropdownMenu.Content>
  </DropdownMenu.Root>
</header>

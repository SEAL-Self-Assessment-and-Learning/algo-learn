<script lang="ts">
  import { resolve } from "$app/paths"
  import { getLanguage } from "$lib/utils/langState.svelte.ts"
  import type { Language } from "@shared/api/Language"
  import { tFunction } from "@shared/utils/translations.ts"
  import { globalTranslations } from "../translation"
  import SealLogo from "./logo/seal-logo-white.svg"

  const lang: Language = $derived(getLanguage())
  const { t } = $derived(tFunction([globalTranslations], lang))
</script>

<footer class="bg-goethe mt-auto">
  <div class="mx-auto w-full max-w-screen-xl px-7 py-4">
    <div class="flex flex-wrap items-center justify-between">
      <!-- Logo + Name -->
      <div class="mb-1 flex items-center space-x-3 rtl:space-x-reverse">
        <img src={SealLogo} class="h-8 brightness-0 invert filter" alt="SEAL Logo" />
        <span class="mr-4 self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
          Self Assessment and Learning
        </span>
      </div>

      <!-- Navigation Links -->
      <ul class="mb-1 flex flex-wrap items-center text-sm font-medium text-gray-500 dark:text-gray-400">
        <li>
          <a href={resolve(`/${lang}/about`)} class="me-4 hover:underline">{t("About.label")}</a>
        </li>
        <li>
          <a href={resolve(`/${lang}/legal`)} class="me-4 hover:underline">{t("Legal.label")}</a>
        </li>
        <li>
          <a
            href="https://github.com/SEAL-Self-Assessment-and-Learning/algo-learn"
            class="me-4 hover:underline">GitHub</a
          >
        </li>
      </ul>
    </div>
  </div>
</footer>

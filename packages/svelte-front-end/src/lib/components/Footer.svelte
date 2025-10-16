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

<footer class="bg-goethe mt-auto rounded-md shadow-sm">
  <div class="mx-auto flex w-full max-w-screen-xl flex-col items-center p-4 text-center">
    <!-- Navigation links -->
    <ul class="mb-6 flex flex-wrap justify-center text-sm font-medium text-gray-500 dark:text-gray-400">
      <li>
        <a href={resolve(`/${lang}`)} class="me-4 hover:underline">
          {t("Home")}
        </a>
      </li>
      <li>
        <a href={resolve(`/${lang}/about`)} class="me-4 hover:underline">
          {t("About.label")}
        </a>
      </li>
      <li>
        <a href={resolve(`/${lang}/legal`)} class="me-4 hover:underline">
          {t("Legal.label")}
        </a>
      </li>
      <li>
        <a
          href="https://github.com/SEAL-Self-Assessment-and-Learning/algo-learn"
          class="hover:underline"
        >
          GitHub
        </a>
      </li>
    </ul>

    <img src={SealLogo} class="h-8 brightness-0 invert filter" alt="SEAL Logo" />
    <span class="text-2xl font-semibold whitespace-nowrap dark:text-white">
      Self Assessment and Learning
    </span>
  </div>
</footer>

<script lang="ts">
  import CenteredDivs from "$lib/components/centeredDivs.svelte"
  import Markdown from "$lib/components/markdown/markdown.svelte"
  import { Button } from "$lib/components/ui/button"
  import { getLanguage } from "$lib/utils/langState.svelte.ts"
  import { SiSvelte } from "@icons-pack/svelte-simple-icons"
  import Duolingo from "@icons-pack/svelte-simple-icons/icons/SiDuolingo"
  import Github from "@icons-pack/svelte-simple-icons/icons/SiGithub"
  import ArrowUp from "@lucide/svelte/icons/arrow-up"
  import type { Language } from "@shared/api/Language.ts"
  import { tFunction } from "@shared/utils/translations"
  import { globalTranslations } from "@/lib/translation"
  import ABCAeffchen from "@/routes/[lang]/about/images/ABCAeffchenGitHub.jpeg"
  import AlexSchickedanz from "@/routes/[lang]/about/images/AlexSchickedanz.jpg"
  import FabianStiewe from "@/routes/[lang]/about/images/FabianStiewe.jpg"
  import FabianStw from "@/routes/[lang]/about/images/FabianStwGitHub.jpeg"
  import GoetheLogo from "@/routes/[lang]/about/images/GoetheTCS.svg"
  import HolgerDell from "@/routes/[lang]/about/images/HolgerDell.jpg"
  import JanetteWelker from "@/routes/[lang]/about/images/JanetteWelker.png"

  const lang: Language = $derived(getLanguage())
  const { t } = $derived(tFunction(globalTranslations, lang))

  const team = [
    { name: "Holger Dell", role: "Professor", image: HolgerDell, link: "https://holgerdell.com/" },
    {
      name: "Alex Schickedanz",
      role: "Postdoc",
      image: AlexSchickedanz,
      link: "https://ae.cs.uni-frankfurt.de/staff/alex_schickedanz.html",
    },
    {
      name: "Janette Welker",
      role: "Scientific Staff",
      image: JanetteWelker,
      link: "https://github.com/welkerje",
    },
    {
      name: "Fabian Stiewe",
      role: "Student Assistant",
      image: FabianStiewe,
      link: "https://github.com/Fabianstw",
    },
  ]

  const contris = [
    { name: "holgerdell", image: HolgerDell, link: "https://github.com/holgerdell" },
    { name: "Fabianstw", image: FabianStw, link: "https://github.com/Fabianstw" },
    {
      name: "AbcAeffchen",
      image: ABCAeffchen,
      link: "https://ae.cs.uni-frankfurt.de/staff/alex_schickedanz.html",
    },
    { name: "nico-miarka", link: "https://github.com/nico-miarka" },
    { name: "rpbwp", link: "https://github.com/rpbwp" },
    { name: "welkerje", link: "https://github.com/welkerje" },
  ]

  const sealGitHub = "https://github.com/SEAL-Self-Assessment-and-Learning/algo-learn"
</script>

<CenteredDivs variant="horizontal">
  <section id="About">
    {@render about()}
    {@render activeLearning()}
    {@render inspiration()}
  </section>
  <section id="Development">
    {@render development()}
    {@render openSource()}
    {@render teamMembers()}
    {@render contributors()}
  </section>
  <div class="my-4">
    {@render dsep()}
  </div>
  <div class="my-4">
    {@render backToTop()}
  </div>
</CenteredDivs>

{#snippet about()}
  <div class="pl-2 text-4xl font-extrabold">
    {t("About.label")}
  </div>
  {@render sep()}
  <div class="mb-4 px-2 leading-relaxed dark:text-gray-200">
    {t("About.text")}
  </div>
{/snippet}

{#snippet activeLearning()}
  <div class="pt-3 pb-1 pl-2 text-2xl font-bold">
    {t("About.activeLearning.label")}
  </div>
  <div class="mb-4 px-2 leading-relaxed dark:text-gray-200">
    {t("About.activeLearning.text")}
  </div>
{/snippet}

{#snippet inspiration()}
  <div class="pt-3 pb-1 pl-2 text-2xl font-bold">
    {t("About.inspiration.label")}
  </div>
  <p class="mb-4 px-2 leading-relaxed dark:text-gray-200">
    <Markdown md={t("About.inspiration.text")}>
      {#snippet child0()}<div class="inline-block pl-1 align-middle"><Duolingo /></div>{/snippet}
    </Markdown>
  </p>
{/snippet}

{#snippet development()}
  <div class="pt-8 pl-2 text-4xl font-extrabold">
    {t("About.development.label")}
  </div>
  {@render sep()}
  <div class="mb-4 px-2 leading-relaxed dark:text-gray-200">
    <Markdown md={t("About.development.text")} />
  </div>
{/snippet}

{#snippet openSource()}
  <div class="pt-3 pb-1 pl-2 text-2xl font-bold">
    {t("About.opensource.label")}
  </div>
  <p class="mb-4 px-2 leading-relaxed dark:text-gray-200">
    <Markdown md={t("About.opensource.text")}>
      {#snippet child0()}<div class="inline-block pl-1 align-middle">
          <SiSvelte />
        </div>{/snippet}
      {#snippet child1()}<div class="inline-block pl-1 align-middle"><Github /></div>{/snippet}
    </Markdown>
  </p>
{/snippet}

{#snippet teamMembers()}
  <div class="flex justify-center py-5 pl-2 text-2xl font-bold">Team</div>
  <div class="flex flex-wrap justify-center gap-6 pb-3">
    {#each team as member (member)}
      <div
        role="button"
        tabindex="0"
        onclick={() => window.open(member.link, "_blank")}
        onkeydown={(e) => (e.key === "Enter" || e.key === " ") && window.open(member.link, "_blank")}
        class="flex h-24 w-64 flex-row items-center rounded-xl bg-white shadow-lg transition-shadow duration-300 hover:cursor-pointer hover:shadow-xl dark:bg-gray-800 dark:shadow-zinc-900"
        aria-label={`Open ${member.name}'s profile`}
      >
        <img
          class={`h-24 w-24 rounded-xl ${member.image ? "" : "bg-goethe"}`}
          src={member.image ? member.image : GoetheLogo}
          alt={member.name}
        />
        <div class="mx-4">
          <div class="text-xl font-bold text-gray-800 dark:text-white">{member.name}</div>
          <div class="text-sm text-gray-500 dark:text-gray-400">{member.role}</div>
        </div>
      </div>
    {/each}
  </div>
{/snippet}

{#snippet contributors()}
  <div class="flex flex-row justify-center gap-2 py-5 pl-2 text-2xl font-bold">
    <div
      role="button"
      tabindex="0"
      onclick={() => window.open(sealGitHub, "_blank")}
      onkeydown={(e) => (e.key === "Enter" || e.key === " ") && window.open(sealGitHub, "_blank")}
      aria-label="SEAL GitHub"
      class="mt-0.5"
    >
      <Github />
    </div>
    Contributors
  </div>
  <div class="flex flex-wrap justify-center gap-6">
    {#each contris as contributor (contributor)}
      <div
        role="button"
        tabindex="0"
        onclick={() => window.open(contributor.link, "_blank")}
        onkeydown={(e) =>
          (e.key === "Enter" || e.key === " ") && window.open(contributor.link, "_blank")}
        aria-label={`Open ${contributor.name}'s profile`}
        class="flex flex-col items-center rounded-md bg-gray-100 p-1 transition-transform duration-200 hover:scale-102 hover:cursor-pointer dark:bg-gray-800"
      >
        <img
          class={`h-12 w-12 rounded-full ${contributor.image ? "" : "bg-goethe"}`}
          src={contributor.image ? contributor.image : GoetheLogo}
          alt={contributor.name}
        />
        <span class="mt-2 text-sm text-gray-500 dark:text-gray-400">{contributor.name}</span>
      </div>
    {/each}
  </div>
{/snippet}

{#snippet backToTop()}
  <div class="flex justify-center">
    <Button variant="outline" onclick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
      <ArrowUp />
    </Button>
  </div>
{/snippet}

{#snippet dsep()}
  <div class="flex flex-col items-center">
    <hr class="mt-2 w-full border-t-2 border-gray-300 dark:border-gray-700" />
    <hr class="mt-0.5 mb-2 w-full border-t-2 border-gray-300 dark:border-gray-700" />
  </div>
{/snippet}

{#snippet sep()}
  <div class="flex flex-col items-center">
    <hr class="my-4 w-full border-t-2 border-gray-300 dark:border-gray-700" />
  </div>
{/snippet}

<script lang="ts">
  import { base } from "$app/paths"
  import { page } from "$app/state"
  import type { Result } from "$lib/components/types.ts"
  import { Button } from "$lib/components/ui/button"
  import ViewSingleQuestion from "$lib/components/ViewSingleQuestion.svelte"
  import { globalTranslations } from "$lib/translation.ts"
  import { getLanguage } from "$lib/utils/langState.svelte.ts"
  import { collection } from "@settings/questionsSelection.ts"
  import { allParameterCombinations, type Parameters } from "@shared/api/Parameters.ts"
  import type { QuestionGenerator } from "@shared/api/QuestionGenerator.ts"
  import { deserializePath } from "@shared/api/QuestionRouter.ts"
  import Random, { sampleRandomSeed } from "@shared/utils/random.ts"
  import { tFunction } from "@shared/utils/translations.ts"
  import CenteredDivs from "@/lib/components/centeredDivs.svelte"

  const great = {
    en: [
      "Perfect!",
      "Outstanding work!",
      "Fantastic job!",
      "You're a quiz whiz!",
      "Excellent performance!",
      "Impressive results!",
      "Great work!",
      "Amazing job!",
      "Incredible performance!",
      "Brilliant work!",
      "Superb job!",
    ],
    de: [
      "Perfekt!",
      "Hervorragende Arbeit!",
      "Fantastische Arbeit!",
      "Du bist ein Quiz-Meister!",
      "Ausgezeichnete Leistung!",
      "Beeindruckende Ergebnisse!",
      "Großartige Arbeit!",
      "Erstaunliche Arbeit!",
      "Unglaubliche Leistung!",
      "Brillante Arbeit!",
      "Hervorragende Arbeit!",
    ],
  }
  const good = {
    en: [
      "Nice job, keep it up!",
      "You're on the right track!",
      "Solid effort, keep practicing!",
      "You're improving with each try!",
      "Well done, but there's always room for improvement!",
      "Good job!",
      "Great effort!",
      "Well played!",
      "Impressive improvement!",
      "You're getting there!",
    ],
    de: [
      "Gute Arbeit, weiter so!",
      "Du bist auf dem richtigen Weg!",
      "Solide Anstrengung, weiter üben!",
      "Du verbesserst dich mit jedem Versuch!",
      "Gut gemacht, aber es gibt immer Raum für Verbesserungen!",
      "Gute Arbeit!",
      "Große Anstrengung!",
      "Gut gespielt!",
      "Beeindruckende Verbesserung!",
      "Du kommst näher!",
    ],
  }
  const meh = {
    en: [
      "You'll do better next time!",
      "Not bad, keep working at it!",
      "You're making progress, keep going!",
      "Keep practicing, you'll get there!",
      "Don't give up, you're improving!",
      "A little more effort and you'll see better results!",
      "You must try again to succeed!",
      "Keep it up!",
      "Stay focused!",
      "Keep pushing!",
      "You're improving!",
      "You're getting better!",
    ],
    de: [
      "Beim nächsten Mal wirst du es besser machen!",
      "Nicht schlecht, weiter so!",
      "Du machst Fortschritte, bleib dran!",
      "Übe weiter, du wirst es schaffen!",
      "Gib nicht auf, du verbesserst dich!",
      "Ein wenig mehr Anstrengung und du wirst bessere Ergebnisse sehen!",
      "Du musst es erneut versuchen, um erfolgreich zu sein!",
      "Weiter so!",
      "Bleib fokussiert!",
      "Bleib dran!",
      "Du verbesserst dich!",
      "Du wirst besser!",
    ],
  }

  const lang = $derived(getLanguage())
  const { t } = $derived(tFunction([globalTranslations], lang))
  const path =
    page.params.lang +
    "/" +
    page.params.generatorId +
    (page.params.params ? "/" + page.params.params : "")
  const deserializedPath = deserializePath({
    collection,
    path,
    expectLang: true,
  })

  // Note: This sometimes throws an error, but still loads everything correctly?
  // What is producing the error, and what is the error?
  if (!deserializedPath) throw new Error("Parsing the url went wrong!")

  const generator = deserializedPath.generator

  const generatorCalls: {
    generator: QuestionGenerator
    parameters: Parameters
  }[] = []

  const questionState = $state({
    numCorrect: 0,
    numIncorrect: 0,
    aborted: false,
  })

  const random = new Random(`${sampleRandomSeed()}`)
  random.shuffle(generatorCalls)

  let sessionSeed = $state(sampleRandomSeed())
  function nextSeed() {
    sessionSeed = deserializedPath!.seed ? deserializedPath!.seed : sampleRandomSeed()
  }
  const currSeed = $derived(deserializedPath.seed ? deserializedPath.seed : sessionSeed)
  let status: "running" | "finished" | "aborted" = $state("running")

  function updateStatus(finished: boolean) {
    status = questionState.aborted ? "aborted" : finished ? "finished" : "running"
  }

  function updateCallList() {
    if (status === "running") {
      if (generatorCalls.length === questionState.numCorrect + questionState.numIncorrect) {
        if (deserializedPath!.parameters) {
          generatorCalls.push({
            generator,
            parameters: deserializedPath!.parameters,
          })
        } else {
          random.shuffle(allParameterCombinations(generator.expectedParameters)).map((parameters) => {
            generatorCalls.push({
              generator,
              parameters,
            })
          })
        }
      }
    }
  }
  updateCallList()

  const msgList = $derived(
    questionState.numIncorrect == 0
      ? great
      : questionState.numCorrect / (questionState.numCorrect + questionState.numIncorrect) >= 0.75
        ? good
        : meh,
  )
  const msg = $derived(random.choice(msgList[getLanguage()]))

  const handleResult = (result: Result, finished: boolean) => {
    if (result === "correct") {
      questionState.numCorrect += 1
      updateStatus(finished)
    } else if (result === "incorrect") {
      questionState.numIncorrect += 1
      updateStatus(finished)
    } else if (result === "abort" || result === "timeout") {
      questionState.aborted = true
    }
    nextSeed()
    updateCallList()
  }

  const currObj = $derived(generatorCalls[questionState.numCorrect + questionState.numIncorrect])
</script>

{#if status === "aborted"}
  <CenteredDivs variant="screen">
    <div class="w-full rounded-xl bg-black/10 p-16 dark:bg-black/20">
      <div class="font-serif text-red-500 italic">{t("quiz-session-aborted")}</div>
      <Button variant="rightAnswer" class="mt-12 ml-auto block max-w-max">
        <a href={`${base}/${getLanguage()}`}>
          {t("Continue")}
        </a>
      </Button>
    </div>
  </CenteredDivs>
{:else if status === "running"}
  <ViewSingleQuestion
    generator={currObj.generator}
    parameters={currObj.parameters}
    seed={currSeed}
    onResult={handleResult}
    regenerate={nextSeed}
  />
{:else}
  <CenteredDivs variant="screen">
    <div class="w-full rounded-xl bg-black/10 p-16 dark:bg-black/20">
      <div class="font-serif italic">{msg}</div>
      <Button variant="rightAnswer" class="mt-12 ml-auto block max-w-max">
        <a href={`${base}/${getLanguage()}`}>
          {t("Continue")}
        </a>
      </Button>
    </div>
  </CenteredDivs>
{/if}

<svelte:window
  onkeydown={(e) => {
    if (e.key === "Enter") {
      if (status !== "running") {
        window.location.href = `${base}/${getLanguage()}`
      }
    }
  }}
/>

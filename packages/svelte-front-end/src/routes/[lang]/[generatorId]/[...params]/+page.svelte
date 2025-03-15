<script lang="ts">
  import { base } from "$app/paths"
  import type { Result } from "$lib/components/types.ts"
  import { Button } from "$lib/components/ui/button"
  import ViewSingleQuestion from "$lib/components/ViewSingleQuestion.svelte"
  import { globalTranslations } from "$lib/translation.ts"
  import { getLanguage } from "$lib/utils/langState.svelte.ts"
  import { collection } from "@react-front-end/listOfQuestions.ts"
  import {
    allParameterCombinations,
    deserializeParameters,
    type Parameters,
  } from "@shared/api/Parameters.ts"
  import type { QuestionGenerator } from "@shared/api/QuestionGenerator.ts"
  import { deserializePath } from "@shared/api/QuestionRouter.ts"
  import Random, { sampleRandomSeed } from "@shared/utils/random.ts"
  import { tFunction } from "@shared/utils/translations.ts"
  import CenteredDivs from "@/lib/components/centeredDivs.svelte"
  import type { PageProps } from "./$types"

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

  const { data }: PageProps = $props()
  const generatorId = data.generatorId
  const parametersPath = data.params
  const sessionSeed = sampleRandomSeed()
  const { t } = $derived(tFunction([globalTranslations], getLanguage()))

  const gen = deserializePath({
    collection,
    path: `${getLanguage()}/${generatorId}/${parametersPath}`,
    expectLang: true,
  })
  if (!gen) throw new Error("Parsing the url went wrong!")

  const generator = gen.generator

  let generatorCalls: {
    generator: QuestionGenerator
    parameters: Parameters
  }[] = []
  if (parametersPath) {
    const parameters = deserializeParameters(parametersPath, generator.expectedParameters)
    generatorCalls.push({
      generator,
      parameters,
    })
  } else {
    allParameterCombinations(generator.expectedParameters).map((parameters) => {
      generatorCalls.push({
        generator,
        parameters,
      })
    })
  }

  const questionState = $state({
    numCorrect: 0,
    numIncorrect: 0,
    aborted: false,
  })

  const random = new Random(`${sessionSeed}${questionState.numCorrect + questionState.numIncorrect}`)

  random.shuffle(generatorCalls)

  const currSeed = $state(random.base36string(7))
  const currObj = $derived(generatorCalls[questionState.numCorrect + questionState.numIncorrect])
  let status: "running" | "finished" | "aborted" = $state("running")

  function updateStatus() {
    status = questionState.aborted
      ? "aborted"
      : generatorCalls.length === questionState.numCorrect + questionState.numIncorrect
        ? "finished"
        : "running"
  }

  const msgList =
    questionState.numIncorrect == 0
      ? great
      : questionState.numCorrect / (questionState.numCorrect + questionState.numIncorrect) >= 0.75
        ? good
        : meh
  const msg = random.choice(msgList[getLanguage()])

  const handleResult = (result: Result) => {
    if (result === "correct") {
      questionState.numCorrect += 1
      updateStatus()
    } else if (result === "incorrect") {
      questionState.numIncorrect += 1
      updateStatus()
    } else if (result === "abort" || result === "timeout") {
      questionState.aborted = true
    }
  }
</script>

{#if status === "aborted"}
  <!-- Todo: Improve this design -->
  <CenteredDivs variant="screen">
    {t("quiz-session-aborted")}
    <Button variant="rightAnswer">
      <a href={`${base}/${getLanguage()}`}>
        {t("Continue")}
      </a>
    </Button>
  </CenteredDivs>
{:else if status === "running"}
  <!-- Something with language -->
  <ViewSingleQuestion
    generator={currObj.generator}
    parameters={currObj.parameters}
    seed={currSeed}
    onResult={handleResult}
  />
{:else}
  <!-- Todo: Improve this design -->
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

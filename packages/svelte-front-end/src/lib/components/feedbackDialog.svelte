<script lang="ts">
  import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js"
  import * as Card from "$lib/components/ui/card/index.js"
  import { globalTranslations } from "$lib/translation.ts"
  import { getLanguage } from "$lib/utils/langState.svelte.ts"
  import Github from "@icons-pack/svelte-simple-icons/icons/SiGithub"
  import Mail from "@lucide/svelte/icons/mail"
  import MessageSquareText from "@lucide/svelte/icons/message-square-text"
  import type { Language } from "@shared/api/Language.ts"
  import { tFunction } from "@shared/utils/translations"
  import { Button } from "./ui/button"

  const lang: Language = $derived(getLanguage())
  const { t } = $derived(tFunction(globalTranslations, lang))
  let alertOpen = $state(false)

  const openMail = () => {
    const SEALMAIL = "seal@ae.cs.uni-frankfurt.de"
    window.location.href = `mailto:${SEALMAIL}?subject=${t("About.mail.feedback.Subject")}&body=${t("About.mail.feedback.Body")}`
    alertOpen = false
  }
  const openGithubIssue = () => {
    window.open("https://github.com/SEAL-Self-Assessment-and-Learning/algo-learn/issues")
    alertOpen = false
  }
</script>

<AlertDialog.Root bind:open={alertOpen}>
  <AlertDialog.Trigger>
    {#snippet child({ props })}
      <Button variant="ghost" size="icon" {...props}>
        <MessageSquareText class="h-4 w-4" />
      </Button>
    {/snippet}
  </AlertDialog.Trigger>
  <AlertDialog.Portal>
    <AlertDialog.Overlay>
      <AlertDialog.Content class="min-w-fit">
        <AlertDialog.Header>
          <AlertDialog.Title>{t("About.valueFeedback")}</AlertDialog.Title>
          <AlertDialog.Description>
            <div class="flex flex-col space-y-4">
              <Card.Root class="w-full cursor-pointer" onclick={openMail}>
                <Card.Header>
                  <Card.Title>
                    <Mail class="mr-2 inline w-6 align-top" />
                    {t("About.suggestImprovement")}
                  </Card.Title>
                </Card.Header>
                <Card.Content>{t("About.suggestImprovement.text")}</Card.Content>
              </Card.Root>
              <Card.Root class="w-full cursor-pointer" onclick={openGithubIssue}>
                <Card.Header>
                  <Card.Title>
                    <div class="mr-2 inline-block w-6 align-top"><Github /></div>
                    {t("About.reportBug")}
                  </Card.Title>
                </Card.Header>
                <Card.Content>{t("About.reportBug.text")}</Card.Content>
                <Card.Footer>
                  <div class="text-sm text-gray-400">{t("About.reportBug.unsure")}</div>
                </Card.Footer>
              </Card.Root>
            </div>
          </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
          <AlertDialog.Action class="flex items-center" onclick={openMail}>
            <Mail class="mr-2 w-2" />
            {t("About.contactMail")}
          </AlertDialog.Action>
          <AlertDialog.Action class="flex items-center" onclick={openGithubIssue}>
            <div class="mr-2 w-2"><Github /></div>
            {t("About.openIssue")}
          </AlertDialog.Action>
          <AlertDialog.Cancel class="m-1" onclick={() => (alertOpen = false)}>
            {t("About.cancel")}
          </AlertDialog.Cancel>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog.Overlay>
  </AlertDialog.Portal>
</AlertDialog.Root>

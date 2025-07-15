import { FileKey2, GitCommitHorizontal, Home, Info, MoreVertical, Settings, WifiOff } from "lucide-react"
import { useEffect, useState } from "react"
import { AiFillGithub } from "react-icons/ai"
import { CiMail } from "react-icons/ci"
import { VscFeedback } from "react-icons/vsc"
import { Link, Outlet } from "react-router-dom"
import type { Language } from "@shared/api/Language"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog.tsx"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card.tsx"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { YScroll } from "@/components/YScroll"
import { VERSION } from "@/config"
import { useSound } from "@/hooks/useSound"
import { availableThemes, useTheme, type Themes } from "@/hooks/useTheme"
import { NATIVE_NAME, SUPPORTED_LANGUAGES, useTranslation } from "@/hooks/useTranslation"

const SEALMAIL = "seal@ae.cs.uni-frankfurt.de"

export default function Root() {
  return (
    <YScroll>
      <div className="flex h-screen flex-col">
        <GlobalHeader />
        <Outlet />
      </div>
    </YScroll>
  )
}

function AlertFeedbackComp() {
  const { t } = useTranslation()
  const [alertOpen, setAlertOpen] = useState(false)

  const mailTo = `mailto:${SEALMAIL}?subject=${t("About.mail.feedback.Subject")}&body=${t("About.mail.feedback.Body")}`

  const openMail = () => {
    window.location.href = mailTo
    setAlertOpen(false)
  }
  const openGithubIssue = () => {
    window.open("https://github.com/SEAL-Self-Assessment-and-Learning/algo-learn/issues")
    setAlertOpen(false)
  }

  return (
    <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="bg-inherit hover:bg-primary hover:text-primary-foreground"
        >
          <VscFeedback className={`h-4 w-4`} />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("About.valueFeedback")}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="flex flex-col space-y-4">
              <Card className="w-full cursor-pointer" onClick={openMail}>
                <CardHeader>
                  <CardTitle>
                    <CiMail className="mr-2 inline align-top" />
                    {t("About.suggestImprovement")}
                  </CardTitle>
                </CardHeader>
                <CardContent>{t("About.suggestImprovement.text")}</CardContent>
              </Card>
              <Card className="w-full cursor-pointer" onClick={openGithubIssue}>
                <CardHeader>
                  <CardTitle>
                    <AiFillGithub className="mr-2 inline align-top" />
                    {t("About.reportBug")}
                  </CardTitle>
                </CardHeader>
                <CardContent>{t("About.reportBug.text")}</CardContent>
                <CardFooter>
                  <div className="text-sm text-gray-400">{t("About.reportBug.unsure")}</div>
                </CardFooter>
              </Card>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction className="flex items-center" onClick={openMail}>
            <CiMail className={`mr-2`} />
            {t("About.contactMail")}
          </AlertDialogAction>
          <AlertDialogAction className="flex items-center" onClick={openGithubIssue}>
            <AiFillGithub className={`mr-2`} />
            {t("About.openIssue")}
          </AlertDialogAction>
          <AlertDialogCancel className={`m-1`} onClick={() => setAlertOpen(false)}>
            {t("About.cancel")}
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function GlobalHeader() {
  const { t, lang, setLang } = useTranslation()
  const { muted, setMuted } = useSound()
  const { theme, userTheme, setUserTheme } = useTheme()

  useEffect(() => {
    document.body.className = theme
  }, [theme])

  return (
    <header className="flex flex-none flex-wrap place-items-center justify-between gap-1 border-b-2 bg-goethe p-2 text-goethe-foreground">
      <div className="flex-grow">
        <Button asChild variant="link" className="inline text-2xl text-inherit">
          <Link to="/">
            algo learn <span className="font-mono text-sm text-yellow-200">alpha</span>
          </Link>
        </Button>
      </div>
      <AlertFeedbackComp />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="bg-inherit hover:bg-primary hover:text-primary-foreground"
            aria-label={t("menu.settings")}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>{t("menu.language")}</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={lang} onValueChange={(s) => setLang(s as Language)}>
            {SUPPORTED_LANGUAGES.map((lng) => (
              <DropdownMenuRadioItem key={lng} value={lng} onSelect={(e) => e.preventDefault()}>
                {NATIVE_NAME[lng]}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>{t("menu.sound")}</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={muted ? "off" : "on"}
            onValueChange={(s) => setMuted(s === "off")}
          >
            <DropdownMenuRadioItem value="on" onSelect={(e) => e.preventDefault()}>
              {t("on")}
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="off" onSelect={(e) => e.preventDefault()}>
              {t("off")}
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>{t("menu.theme")}</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={userTheme} onValueChange={(s) => setUserTheme(s as Themes)}>
            {availableThemes.map((thm) => (
              <DropdownMenuRadioItem key={thm} value={thm} onSelect={(e) => e.preventDefault()}>
                {t("theme." + thm)}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="bg-inherit hover:bg-primary hover:text-primary-foreground"
            aria-label={t("menu")}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Menu</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link to={`/${lang}/`}>
                <Home className="mr-2 h-4 w-4" /> {t("Home")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to={`/${lang}/about`}>
                <Info className="mr-2 h-4 w-4" /> {t("About.label")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to={`/${lang}/legal`}>
                <FileKey2 className="mr-2 h-4 w-4" /> {t("Legal.label")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {(VERSION as string) === "local build" ? (
              <DropdownMenuItem>
                <WifiOff className="mr-2 h-4 w-4" />
                {`${t("Version")}: ${VERSION}`}
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem asChild>
                <Link to={`https://github.com/holgerdell/algo-learn/commit/${VERSION}`}>
                  <GitCommitHorizontal className="mr-2 h-4 w-4" /> {`${t("Version")}: ${VERSION}`}
                </Link>
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}

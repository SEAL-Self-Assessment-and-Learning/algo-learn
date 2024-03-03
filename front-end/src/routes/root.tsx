import { useEffect } from "react"
import { Link, Outlet } from "react-router-dom"
import {
  FileKey2,
  GitCommitHorizontal,
  Home,
  Info,
  MoreVertical,
  Settings,
  WifiOff,
} from "lucide-react"

import { VERSION } from "@/config"
import { useSound } from "@/hooks/useSound"
import { availableThemes, useTheme } from "@/hooks/useTheme"
import {
  NATIVE_NAME,
  SUPPORTED_LANGUAGES,
  useTranslation,
} from "@/hooks/useTranslation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Language } from "@shared/api/Language"
import { YScroll } from "@/components/YScroll"

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

function GlobalHeader() {
  const { t, lang, setLang } = useTranslation()
  const { muted, setMuted } = useSound()
  const { theme, userTheme, setUserTheme } = useTheme()

  useEffect(() => {
    document.body.className = theme
  }, [theme])

  return (
    <header className="flex flex-none flex-wrap place-items-center justify-between gap-1 border-b-2 bg-goethe p-2 text-goethe-foreground">
      <div className="flex-grow text-2xl">
        <Link to="/">
          algo learn{" "}
          <span className="font-mono text-sm text-yellow-200">alpha</span>
        </Link>
      </div>
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
          <DropdownMenuRadioGroup
            value={lang}
            onValueChange={(s) => setLang(s as Language)}
          >
            {SUPPORTED_LANGUAGES.map((lng) => (
              <DropdownMenuRadioItem
                key={lng}
                value={lng}
                onSelect={(e) => e.preventDefault()}
              >
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
            <DropdownMenuRadioItem
              value="on"
              onSelect={(e) => e.preventDefault()}
            >
              {t("on")}
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem
              value="off"
              onSelect={(e) => e.preventDefault()}
            >
              {t("off")}
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>{t("menu.theme")}</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={userTheme}
            onValueChange={(s) => setUserTheme(s)}
          >
            {availableThemes.map((thm) => (
              <DropdownMenuRadioItem
                key={thm}
                value={thm}
                onSelect={(e) => e.preventDefault()}
              >
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
                <Link
                  to={`https://github.com/holgerdell/algo-learn/commit/${VERSION}`}
                >
                  <GitCommitHorizontal className="mr-2 h-4 w-4" />{" "}
                  {`${t("Version")}: ${VERSION}`}
                </Link>
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}

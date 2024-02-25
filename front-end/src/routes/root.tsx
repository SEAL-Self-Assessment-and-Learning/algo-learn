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

export default function Root() {
  return (
    <div className="flex h-screen flex-col overflow-x-scroll">
      <GlobalHeader />
      <Outlet />
    </div>
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
    <header className="flex flex-none flex-wrap place-items-center justify-between gap-1 bg-primary p-2 text-primary-foreground">
      <div className="flex-grow text-2xl">
        <Link to="/" className="unstyled no-underline">
          algo learn{" "}
          <span className="font-mono text-sm text-yellow-500 dark:text-yellow-800">
            alpha
          </span>
        </Link>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="bg-inherit">
            <Settings className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Language</DropdownMenuLabel>
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
          <DropdownMenuLabel>Sound</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={muted ? "off" : "on"}
            onValueChange={(s) => setMuted(s === "off")}
          >
            <DropdownMenuRadioItem
              value="on"
              onSelect={(e) => e.preventDefault()}
            >
              on
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem
              value="off"
              onSelect={(e) => e.preventDefault()}
            >
              off
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Theme</DropdownMenuLabel>
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
          <Button variant="ghost" size="icon" className="bg-inherit">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Menu</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <Button asChild variant="link">
                <Link to={`/${lang}/`}>
                  <Home className="mr-2 h-4 w-4" /> {t("Home")}
                </Link>
              </Button>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Button asChild variant="link">
                <Link to={`/${lang}/about`}>
                  <Info className="mr-2 h-4 w-4" /> {t("About.label")}
                </Link>
              </Button>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Button asChild variant="link">
                <Link to={`/${lang}/legal`}>
                  <FileKey2 className="mr-2 h-4 w-4" /> {t("Legal.label")}
                </Link>
              </Button>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              {(VERSION as string) === "local build" ? (
                <Button variant="link">
                  <WifiOff className="mr-2 h-4 w-4" />
                  {`${t("Version")}: ${VERSION}`}
                </Button>
              ) : (
                <Button asChild variant="link">
                  <Link
                    to={`https://github.com/holgerdell/algo-learn/commit/${VERSION}`}
                  >
                    <GitCommitHorizontal className="mr-2 h-4 w-4" />{" "}
                    {`${t("Version")}: ${VERSION}`}
                  </Link>
                </Button>
              )}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}

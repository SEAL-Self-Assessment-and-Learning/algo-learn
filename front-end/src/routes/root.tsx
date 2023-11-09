import { ReactNode, useEffect } from "react"
import { FaVolumeMute, FaVolumeUp } from "react-icons/fa"
import { FiFileText, FiHome, FiInfo, FiSun } from "react-icons/fi"
import { GiHamburgerMenu } from "react-icons/gi"
import { MdDarkMode } from "react-icons/md"
import { TbGitCommit } from "react-icons/tb"
import { Link, Outlet, useLocation } from "react-router-dom"

import { VERSION } from "../config"
import { useSound } from "../hooks/useSound"
import { availableThemes, LIGHT, useTheme } from "../hooks/useTheme"
import {
  NATIVE_NAME,
  SUPPORTED_LANGUAGES,
  useTranslation,
} from "../hooks/useTranslation"

export default function Root() {
  return (
    <div className="flex h-screen flex-col overflow-x-scroll selection:bg-goethe-50 dark:bg-black dark:text-white dark:selection:bg-goethe-700">
      <GlobalHeader />
      <Outlet />
    </div>
  )
}

function GlobalHeader() {
  const { t, lang, setLang, nextLang } = useTranslation()
  const location = useLocation()
  // const navigate = useNavigate()
  const { muted, toggleMuted } = useSound()
  const { theme, userTheme, toggleTheme, setUserTheme } = useTheme()
  useEffect(() => {
    document.body.className = theme
  }, [theme])

  const mainMenuItems = [
    {
      label: t("Home"),
      to: `/${lang}/`,
      icon: <FiHome />,
    },
    {
      label: t("About.label"),
      to: `/${lang}/about`,
      icon: <FiInfo />,
    },
    {
      label: t("Legal.label"),
      to: `/${lang}/legal`,
      icon: <FiFileText />,
    },
    {
      label: `${t("Version")}: ${VERSION}`,
      to:
        (VERSION as string) !== "local build"
          ? `https://github.com/holgerdell/algo-learn/commit/${VERSION}`
          : undefined,
      icon: <TbGitCommit />,
    },
  ]

  return (
    <header className="dark flex flex-none flex-wrap place-items-center justify-between bg-goethe-500 p-2 text-white dark:bg-goethe-700">
      <div className="flex-grow text-2xl">
        <Link to="/" className="unstyled no-underline">
          algo learn{" "}
          <span className="font-mono text-sm text-yellow-300">alpha</span>
        </Link>
      </div>
      <div className="flex">
        <TopbarItem
          icon={muted ? <FaVolumeMute /> : <FaVolumeUp />}
          onClick={toggleMuted}
        />
        <TopbarItem
          icon={theme === LIGHT ? <FiSun /> : <MdDarkMode />}
          onClick={toggleTheme}
        >
          <div className="w-28">
            {availableThemes.map((thm) => (
              <button
                key={thm}
                className={`block w-full p-2 dark:hover:bg-goethe-500/50 ${
                  userTheme == thm ? "font-bold" : ""
                }`}
                type="button"
                onClick={() => setUserTheme(thm)}
              >
                {t("theme." + thm)}
              </button>
            ))}
          </div>
        </TopbarItem>
        <TopbarItem
          icon={<span className="font-mono text-sm">{lang}</span>}
          onClick={nextLang}
        >
          <div className="w-28">
            {SUPPORTED_LANGUAGES.map((lng) => (
              <button
                key={lng}
                className={`block w-full p-2 dark:hover:bg-goethe-500/50 ${
                  lang === lng ? "font-bold" : ""
                }`}
                type="button"
                onClick={() => setLang(lng)}
              >
                {NATIVE_NAME[lng]}
              </button>
            ))}
          </div>
        </TopbarItem>
        <TopbarItem icon={<GiHamburgerMenu />}>
          {mainMenuItems.map(({ label, to, icon }) => (
            <Link
              key={label}
              to={to ?? ""}
              className="unstyled w-full no-underline"
            >
              <div
                className={`flex items-center justify-center gap-2 p-2 hover:bg-goethe-500/50 ${
                  location.pathname === to ? "font-bold" : ""
                }`}
              >
                {icon}
                {icon && label ? " " : ""}
                {label}
              </div>
            </Link>
          ))}
        </TopbarItem>
      </div>
    </header>
  )
}

/**
 * A topbar item is a clickable element that can be used to navigate to a page
 * or to trigger an action.
 *
 * @param onClick The function to be called when the item is clicked.
 * @param icon The icon to be displayed.
 * @param text The text to be displayed.
 * @param children The children to be displayed in the item's dropdown menu.
 * @param topbar Whether the item is displayed in the topbar or in the sidebar.
 * @returns A topbar item.
 */
function TopbarItem({
  onClick,
  icon,
  text,
  children,
  topbar = true,
}: {
  onClick?: () => void
  icon: ReactNode
  text?: ReactNode
  children?: ReactNode
  topbar?: boolean
}) {
  return (
    <div
      className={`group relative flex flex-col place-content-stretch ${
        topbar
          ? "hover:bg-goethe-900"
          : "hover:bg-amber-200 dark:hover:bg-amber-800"
      }`}
    >
      <button
        type="button"
        onClick={onClick}
        className={`flex h-10 ${onClick ? "cursor-pointer" : ""} items-center`}
      >
        <div className="px-3">{icon}</div>
        {text != undefined && (
          <div className="hidden h-full flex-1 cursor-pointer items-center pr-3 md:flex">
            {text}
          </div>
        )}
      </button>
      {children != undefined && (
        <div
          className={`absolute ${
            topbar ? "right-0 top-full text-center" : "left-full top-0"
          } z-50 hidden min-h-full w-max flex-col place-items-center bg-inherit p-2 focus:outline-none group-hover:flex`}
        >
          {children}
        </div>
      )}
    </div>
  )
}

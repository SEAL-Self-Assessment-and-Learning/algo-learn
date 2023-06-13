import { ReactNode, useEffect } from "react"
import { FaVolumeMute, FaVolumeUp } from "react-icons/fa"
import { FiFileText, FiHome, FiInfo, FiSun } from "react-icons/fi"
import { GiHamburgerMenu } from "react-icons/gi"
import { MdDarkMode } from "react-icons/md"
import { TbGitCommit } from "react-icons/tb"
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"

import { VERSION } from "../config"
import { useSound } from "../hooks/useSound"
import { availableThemes, LIGHT, useTheme } from "../hooks/useTheme"
import { useTranslation } from "../hooks/useTranslation"

export default function Root() {
  return (
    <div className="flex h-screen flex-col overflow-x-scroll dark:bg-black dark:text-white">
      <GlobalHeader />
      <Outlet />
    </div>
  )
}

function GlobalHeader() {
  const { t, i18n } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const { muted, toggleMuted } = useSound()
  const lngs = ["en", "de"]
  const nativeName: Record<string, string> = {
    en: "English",
    de: "Deutsch",
  }
  function setLanguage(newLang: string) {
    // replace the language prefix in the URL
    const newPath = location.pathname.replace(
      new RegExp("^/" + i18n.resolvedLanguage + "/"),
      "/" + newLang + "/"
    )
    void i18n.changeLanguage(newLang)
    navigate(newPath)
  }
  function nextLanguage() {
    const currentLngIndex = lngs.indexOf(i18n.resolvedLanguage)
    const nextLngIndex = (currentLngIndex + 1) % lngs.length
    const nextLng = lngs[nextLngIndex]
    setLanguage(nextLng)
  }
  const { theme, userTheme, toggleTheme, setUserTheme } = useTheme()
  useEffect(() => {
    document.body.className = theme
  }, [theme])

  const mainMenuItems = [
    {
      label: t("Home"),
      to: "/",
      icon: <FiHome />,
    },
    {
      label: t("About.label"),
      to: "/about",
      icon: <FiInfo />,
    },
    {
      label: t("Legal.label"),
      to: "/legal",
      icon: <FiFileText />,
    },
    {
      label: `${t("Version")}: ${VERSION}`,
      to: VERSION
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
          icon={
            <span className="font-mono text-sm">{i18n.resolvedLanguage}</span>
          }
          onClick={nextLanguage}
        >
          <div className="w-28">
            {lngs.map((lng) => (
              <button
                key={lng}
                className={`block w-full p-2 dark:hover:bg-goethe-500/50 ${
                  i18n.resolvedLanguage === lng ? "font-bold" : ""
                }`}
                type="button"
                onClick={() => setLanguage(lng)}
              >
                {nativeName[lng] ?? "error"}
              </button>
            ))}
          </div>
        </TopbarItem>
        <TopbarItem icon={<GiHamburgerMenu />}>
          {mainMenuItems.map(({ label, to, icon }) => (
            <Link
              key={to}
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

// function AppHeader({ toggleSidebar }: { toggleSidebar: () => void }) {
//   return (
//     <header className="flex flex-none flex-row place-items-center bg-slate-100 p-0 dark:bg-slate-900">
//       <a
//         className="select-none p-3 hover:bg-amber-200 dark:hover:bg-amber-800"
//         onClick={toggleSidebar}
//       >
//         <GiHamburgerMenu />
//       </a>
//       <div className="pl-2">
//         <h2 className="font-bold">My activity</h2>
//       </div>
//     </header>
//   )
// }

// function Sidebar(props: PropsWithChildren) {
//   return <nav className="flex-none sm:static" {...props} />
// }

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

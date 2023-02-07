import PropTypes from "prop-types"
import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { FiSun } from "react-icons/fi"
import { GiHamburgerMenu } from "react-icons/gi"
import { MdDarkMode } from "react-icons/md"
import { Link, Outlet, useNavigate } from "react-router-dom"
import { availableThemes, LIGHT, useTheme } from "../utils/colorscheme"

function TextRadio({ children, isSelected, selectWith }) {
  return isSelected ? (
    <b>{children}</b>
  ) : (
    <Link onClick={selectWith}>{children}</Link>
  )
}
TextRadio.propTypes = {
  children: PropTypes.node.isRequired,
  isSelected: PropTypes.bool.isRequired,
  selectWith: PropTypes.func.isRequired,
}

export default function Root() {
  const [theme, userTheme, toggleTheme, setUserTheme] = useTheme()
  useEffect(() => {
    document.body.className = theme
  }, [theme])

  // const skillData = useSkills()

  // const [sidebar, setSidebar] = useLocalStorageState("sidebar", {
  //   defaultValue: true,
  // })
  //
  // const { t } = useTranslation()
  //
  // const sidebarNode = !sidebar ? null : (
  //   <Sidebar>
  //     <SidebarItem text={t("Help")} icon={<FiHelpCircle />}>
  //       {t("helpButtonText")}
  //     </SidebarItem>
  //     <SidebarItem text={t("sidebar sum")}>
  //       <Link to="/asymptotics/sum">Link</Link>
  //     </SidebarItem>
  //     <SidebarItem text={t("sidebar sort")}>
  //       <Link to="/asymptotics/sort">Link</Link>
  //     </SidebarItem>
  //   </Sidebar>
  // )

  return (
    <div className="max-w-screen min-h-screen overflow-x-hidden bg-slate-200 text-black dark:bg-slate-800 dark:text-white">
      <div className="flex h-screen flex-col">
        <GlobalHeader
          theme={theme}
          userTheme={userTheme}
          toggleTheme={toggleTheme}
          setUserTheme={setUserTheme}
        />
        {/* <AppHeader
          sidebar={sidebar}
          toggleSidebar={() => setSidebar(!sidebar)}
        /> */}
        <div className="relative flex flex-1">
          {/* {sidebarNode} */}
          <main className="flex-1 p-3">
            <Outlet />
          </main>
          {/* <Footer /> */}
        </div>
      </div>
    </div>
  )
}

function GlobalHeader({ theme, userTheme, toggleTheme, setUserTheme }) {
  const { t, i18n } = useTranslation()
  const lngs = {
    en: { nativeName: "English" },
    de: { nativeName: "Deutsch" },
  }
  function nextLanguage() {
    const lngsArray = Object.keys(lngs)
    const currentLngIndex = Object.keys(lngs).indexOf(i18n.resolvedLanguage)
    const nextLngIndex = (currentLngIndex + 1) % lngsArray.length
    const nextLng = lngsArray[nextLngIndex]
    i18n.changeLanguage(nextLng)
  }
  const navigate = useNavigate()

  return (
    <header className="dark flex flex-none place-items-center  justify-between bg-goethe-500 p-2 text-white dark:bg-goethe-700">
      <div className="flex-grow text-2xl">
        <Link to="/" className="no-underline">
          algo learn{" "}
          <span className="font-mono text-sm text-yellow-300">alpha</span>
        </Link>
      </div>
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
          {Object.keys(lngs).map((lng) => (
            <button
              key={lng}
              className={`block w-full p-2 dark:hover:bg-goethe-500/50 ${
                i18n.resolvedLanguage === lng ? "font-bold" : ""
              }`}
              type="button"
              onClick={() => i18n.changeLanguage(lng)}
            >
              {lngs[lng].nativeName}
            </button>
          ))}
        </div>
      </TopbarItem>
      <TopbarItem icon="?" onClick={() => navigate("/about")}>
        <Link to="/about" className="w-full no-underline">
          <div className="block p-2 hover:bg-goethe-500/50">{t("about")}</div>
        </Link>
        <Link to="/legal" className="no-underline">
          <div className="block p-2 hover:bg-goethe-500/50">
            {t("imprint-and-privacy")}
          </div>
        </Link>
      </TopbarItem>
    </header>
  )
}
GlobalHeader.propTypes = {
  theme: PropTypes.string.isRequired,
  userTheme: PropTypes.string.isRequired,
  toggleTheme: PropTypes.func.isRequired,
  setUserTheme: PropTypes.func.isRequired,
}

function AppHeader({ toggleSidebar }) {
  return (
    <header className="flex flex-none flex-row place-items-center bg-slate-100 p-0 dark:bg-slate-900">
      <a
        className="select-none p-3 hover:bg-amber-200 dark:hover:bg-amber-800"
        onClick={toggleSidebar}
      >
        <GiHamburgerMenu />
      </a>
      <div className="pl-2">
        <h2 className="font-bold">My activity</h2>
      </div>
    </header>
  )
}
AppHeader.propTypes = {
  toggleSidebar: PropTypes.func.isRequired,
}

function Sidebar(props) {
  return <nav className="flex-none sm:static">{props.children}</nav>
}
Sidebar.propTypes = {
  children: PropTypes.node,
}

function SidebarItem({ onClick, icon, text, children, topbar = false }) {
  const hoverColor = topbar
    ? "hover:bg-goethe-900"
    : "hover:bg-amber-200 dark:hover:bg-amber-800"
  return (
    <div
      className={`group relative flex flex-col place-content-stretch ${hoverColor}`}
    >
      <button
        onClick={onClick}
        className="flex h-10 cursor-pointer place-content-center place-items-center"
      >
        <div className="px-3">{icon}</div>
        {text != undefined && (
          <div className="hidden h-full flex-1 cursor-pointer items-center pr-3 md:flex">
            {text}
          </div>
        )}
      </button>
      <div
        className={`absolute ${
          topbar ? "top-full right-0 text-center" : "top-0 left-full"
        } z-50 hidden min-h-full w-max flex-col place-items-center bg-inherit p-2 focus:outline-none group-hover:flex`}
      >
        {children}
      </div>
    </div>
  )
}
SidebarItem.propTypes = {
  onClick: PropTypes.func,
  icon: PropTypes.node,
  text: PropTypes.string,
  children: PropTypes.node,
  topbar: PropTypes.bool,
}

function TopbarItem(props) {
  return <SidebarItem {...props} topbar />
}

// function Footer() {
//   const { t } = useTranslation()
//   return (
//     <div className="fixed right-2 bottom-2 text-right text-xs">
//       {/* <Link to="/legal">{t("imprint-and-privacy")}</Link> */}
//     </div>
//   )
// }

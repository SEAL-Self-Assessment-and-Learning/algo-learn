import { useEffect, useState } from "react"
import useLocalStorageState from "use-local-storage-state"

export const LIGHT = "light"
export const DARK = "dark"
export const OSDEFAULT = "OS default"
export const availableThemes = [LIGHT, DARK, OSDEFAULT]

export function useOSdefaultTheme() {
  const [OSdefaultTheme, setOSdefaultTheme] = useState(
    window.matchMedia("(prefers-color-scheme: dark)").matches ? DARK : LIGHT
  )
  useEffect(() => {
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (e) => e.matches && setOSdefaultTheme(DARK))
    window
      .matchMedia("(prefers-color-scheme: light)")
      .addEventListener("change", (e) => e.matches && setOSdefaultTheme(LIGHT))
  }, [OSdefaultTheme])
  return OSdefaultTheme
}

export function useTheme() {
  const [userTheme, setUserTheme] = useLocalStorageState("theme", {
    defaultValue: OSDEFAULT,
  })
  const OSdefaultTheme = useOSdefaultTheme()
  const theme = userTheme == OSDEFAULT ? OSdefaultTheme : userTheme
  const toggleTheme = () => {
    if (theme === LIGHT) {
      setUserTheme(DARK)
    } else {
      setUserTheme(LIGHT)
    }
  }
  return {theme, userTheme, toggleTheme, setUserTheme}
}

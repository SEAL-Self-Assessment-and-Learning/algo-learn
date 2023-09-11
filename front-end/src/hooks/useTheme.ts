import { useEffect, useState } from "react"
import useLocalStorageState from "use-local-storage-state"

export const LIGHT = "light"
export const DARK = "dark"
export const OSDEFAULT = "OS default"
export const availableThemes = [LIGHT, DARK, OSDEFAULT]

/**
 * A hook that returns the value of the operating system's default color scheme.
 *
 * @returns The value of the operating system's default color scheme. This will
 *   be either `LIGHT` or `DARK`.
 */
export function useOSdefaultTheme() {
  const [OSdefaultTheme, setOSdefaultTheme] = useState(
    window.matchMedia("(prefers-color-scheme: dark)").matches ? DARK : LIGHT,
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

/**
 * A hook for managing the theme.
 *
 * @returns An object containing the current effective theme, the user's
 *   selected theme, and functions to set and toggle the user's selected theme.
 */
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
  return { theme, userTheme, toggleTheme, setUserTheme }
}

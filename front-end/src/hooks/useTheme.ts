import { useEffect, useState } from "react"
import useLocalStorageState from "use-local-storage-state"

export const LIGHT = "light"
export const DARK = "dark"
export const SYSTEM = "system"
export type Themes = typeof LIGHT | typeof DARK | typeof SYSTEM
export const availableThemes = [LIGHT, DARK, SYSTEM]

/**
 * A hook that returns the value of the operating system's default color scheme.
 *
 * @returns The value of the operating system's default color scheme. This will
 *   be either `LIGHT` or `DARK`.
 */
export function useOSDefaultTheme() {
  const [osDefaultTheme, setOSDefaultTheme] = useState<typeof LIGHT | typeof DARK>(
    window.matchMedia("(prefers-color-scheme: dark)").matches ? DARK : LIGHT,
  )
  const setDark = (e: MediaQueryListEvent) => e.matches && setOSDefaultTheme(DARK)
  const setLight = (e: MediaQueryListEvent) => e.matches && setOSDefaultTheme(LIGHT)
  useEffect(() => {
    const darkMediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const lightMediaQuery = window.matchMedia("(prefers-color-scheme: light)")
    darkMediaQuery.addEventListener("change", setDark)
    lightMediaQuery.addEventListener("change", setLight)
    return () => {
      darkMediaQuery.removeEventListener("change", setDark)
      lightMediaQuery.removeEventListener("change", setLight)
    }
  }, [osDefaultTheme])
  return osDefaultTheme
}

/**
 * A hook for managing the theme.
 *
 * @returns An object containing the current effective theme, the user's
 *   selected theme, and functions to set and toggle the user's selected theme.
 */
export function useTheme() {
  const [userTheme, setUserTheme] = useLocalStorageState<Themes>("theme", {
    defaultValue: SYSTEM,
  })
  const osDefaultTheme = useOSDefaultTheme()
  const theme = userTheme === LIGHT ? LIGHT : userTheme === DARK ? DARK : osDefaultTheme
  const toggleTheme = () => {
    if (theme === LIGHT) {
      setUserTheme(DARK)
    } else {
      setUserTheme(LIGHT)
    }
  }
  return { theme, userTheme, toggleTheme, setUserTheme }
}

import { useEffect, useState } from "react"
import useLocalStorageState from "use-local-storage-state"

export const LIGHT = "light"
export const DARK = "dark"
export const OS_DEFAULT = "OS default"
export type Themes = typeof LIGHT | typeof DARK | typeof OS_DEFAULT
export const availableThemes = [LIGHT, DARK, OS_DEFAULT]

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
  useEffect(() => {
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (e) => e.matches && setOSDefaultTheme(DARK))
    window
      .matchMedia("(prefers-color-scheme: light)")
      .addEventListener("change", (e) => e.matches && setOSDefaultTheme(LIGHT))
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
    defaultValue: OS_DEFAULT,
  })
  const osDefaultTheme = useOSDefaultTheme()
  const theme = userTheme == OS_DEFAULT ? osDefaultTheme : userTheme
  const toggleTheme = () => {
    if (theme === LIGHT) {
      setUserTheme(DARK)
    } else {
      setUserTheme(LIGHT)
    }
  }
  return { theme, userTheme, toggleTheme, setUserTheme }
}

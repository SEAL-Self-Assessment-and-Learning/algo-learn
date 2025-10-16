import { browser } from "$app/environment"
import { persisted } from "./persisted.svelte"

export const LIGHT = "light"
export const DARK = "dark"
export const SYSTEM = "system"
export type Themes = typeof LIGHT | typeof DARK | typeof SYSTEM
export const availableThemes = [LIGHT, DARK, SYSTEM]

let systemTheme: typeof LIGHT | typeof DARK = $state(LIGHT)

const localStorageTheme = persisted<Themes>("theme", SYSTEM, { onChange: syncTheme })

export function derivedTheme() {
  const x = localStorageTheme.get()
  if (x === LIGHT) return LIGHT
  if (x === DARK) return DARK
  return systemTheme
}

export function getTheme() {
  const x = localStorageTheme.get()
  if (x === LIGHT) return LIGHT
  if (x === DARK) return DARK
  return SYSTEM
}

export function setTheme(newTheme: string) {
  if (availableThemes.includes(newTheme)) localStorageTheme.set(newTheme as Themes)
}

export function toggleTheme() {
  setTheme(derivedTheme() === LIGHT ? DARK : LIGHT)
}

function syncTheme() {
  if (!browser) return
  document.documentElement.classList.remove(derivedTheme() === LIGHT ? "dark" : "light")
  document.documentElement.classList.add(derivedTheme())
  document.documentElement.style.colorScheme = derivedTheme()
}

if (browser) {
  const prefersDARK = "(prefers-color-scheme: dark)"
  const prefersLIGHT = "(prefers-color-scheme: light)"
  if (window.matchMedia(prefersDARK).matches) {
    systemTheme = DARK
  }

  function listener(e: MediaQueryListEvent) {
    if (!e.matches) return
    if (e.media === prefersDARK) systemTheme = DARK
    else if (e.media === prefersLIGHT) systemTheme = LIGHT
    syncTheme()
  }

  window.matchMedia(prefersDARK).addEventListener("change", listener)
  window.matchMedia(prefersLIGHT).addEventListener("change", listener)
  syncTheme()
}

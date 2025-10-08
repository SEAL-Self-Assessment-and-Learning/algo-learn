import { browser } from "$app/environment"

/**
 * Create a reactive store that persists its value in localStorage.
 * @param key - The key to use in localStorage.
 * @param defaultValue - The default value to use if the key is not set.
 * @param syncTabs
 * @param onChange
 */
export function persisted<T extends string>(
  key: string,
  defaultValue: T,
  { syncTabs = true, onChange }: { syncTabs?: boolean; onChange?: () => void } = {},
) {
  let value = $state(defaultValue)
  const set = (newValue: T) => {
    value = newValue
    if (browser) localStorage.setItem(key, newValue as string)
    if (onChange) onChange()
  }
  if (syncTabs && browser) {
    value = (localStorage.getItem(key) as T) ?? defaultValue
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key !== key) return
      value = (event.newValue as T) ?? defaultValue
      if (onChange) onChange()
    }
    window.addEventListener("storage", handleStorageChange)
  }
  return { get: () => value, set } as const
}

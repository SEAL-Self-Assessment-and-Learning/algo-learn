import useLocalStorageState from "use-local-storage-state"

/**
 * A hook to enable debug mode and set debug options.
 *
 * @returns An object containing the current mute state, functions to set and
 *   toggle the mute state, and a function to play a sound.
 */
export function useDebug() {
  const [debug, setDebug] = useLocalStorageState("debug", {
    defaultValue: false,
    storageSync: false,
  })
  const toggleDebug = () => {
    setDebug(!debug)
  }
  return { debug, setDebug, toggleDebug }
}

export function useFormat() {
  const D = useDebug()
  const [format, setFormat] = useLocalStorageState("debugFormat", {
    defaultValue: "react" as "react" | "latex" | "json",
    storageSync: true,
  })
  return { ...D, format: D.debug ? format : "react", setFormat }
}

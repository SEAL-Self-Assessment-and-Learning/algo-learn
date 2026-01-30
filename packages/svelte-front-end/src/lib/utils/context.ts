import { getContext, setContext } from "svelte"

/**
 * Creates a type-safe context pair.
 * The getter throws if no parent component provided the context.
 */
export function createContext<T>(): [() => T, (context: T) => T] {
  const key = Symbol()
  const get = () => {
    const context = getContext<T>(key)
    if (context === undefined) {
      throw new Error("Context not found. Ensure a parent component called set.")
    }
    return context
  }
  const set = (context: T) => {
    setContext<T>(key, context)
    return context
  }
  return [get, set]
}

import { useState } from "react"

export function useHistoryState<T>(
  key: string,
  initialValue: T,
): [T, (t: T) => void] {
  const [rawState, rawSetState] = useState<T>(
    (history.state?.[key] ?? initialValue) as T,
  )
  function setState(value: T) {
    history.replaceState(
      {
        ...history.state,
        [key]: value,
      },
      "",
    )
    rawSetState(value)
  }
  return [rawState, setState]
}

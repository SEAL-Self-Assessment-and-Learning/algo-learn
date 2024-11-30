import { useEffect } from "react"

export type Props = {
  [key in keyof WindowEventMap]?: EventListenerOrEventListenerObject
}

/**
 * A hook that gives access to global DOM events.
 *
 * @example
 *   useGlobalDOMEvents({
 *   keyup(ev: KeyboardEvent) {
 *   if (ev.key === "Escape") {
 *   onClose()
 *   }
 *   })
 *
 * @param props An object with keys that are event names and values that are
 *   event listeners.
 */
export default function useGlobalDOMEvents(props: Props) {
  useEffect(() => {
    for (const [key, func] of Object.entries(props)) {
      // eslint-disable-next-line @eslint-react/web-api/no-leaked-event-listener
      window.addEventListener(key, func, false)
    }
    return () => {
      for (const [key, func] of Object.entries(props)) {
        window.removeEventListener(key, func, false)
      }
    }
  }, [props])
}

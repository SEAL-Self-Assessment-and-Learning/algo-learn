import { ReactNode, useEffect, useLayoutEffect } from "react"
import { useHistoryState } from "@/hooks/useHistoryState"

/**
 * A component that saves and restores the scroll position when navigating
 * between pages. Especially useful for the back button.
 * @param children The children to render
 */
export function YScroll({ children }: { children: ReactNode }) {
  const [scrollY, setScrollY] = useHistoryState("scrollY", window.scrollY)
  useLayoutEffect(() => window.scrollTo(0, scrollY), [scrollY])
  useEffect(() => {
    const scrolled = () => setScrollY(window.scrollY)
    window.addEventListener("scrollend", scrolled, { passive: true })
    return () => window.removeEventListener("scrollend", scrolled)
  }, [setScrollY])
  return <>{children}</>
}

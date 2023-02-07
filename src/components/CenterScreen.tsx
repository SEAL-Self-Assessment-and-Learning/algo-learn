import { ReactNode } from "react"

/**
 * Used as a direct child of <main>, this component will horizontally and vertically center its children on the screen
 */
export function CenterScreen({
  children,
  className = "",
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={`m-auto flex h-full max-w-xl place-items-center p-8 text-xl ${className}`}
    >
      {children}
    </div>
  )
}

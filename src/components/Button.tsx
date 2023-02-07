import { ReactNode } from "react"
import { Link, To } from "react-router-dom"

export function Button({
  children,
  color,
  to,
  onClick,
  className = "",
}: {
  children?: ReactNode
  color?: string
  to?: To
  onClick?: () => void
  className?: string
}) {
  let bg = ""
  switch (color ?? "disabled") {
    case "disabled":
      bg = "bg-gray-400 dark:bg-slate-600"
      break
    case "green":
      bg = "text-green-50 bg-green-900 dark:text-green-900 dark:bg-green-200"
      break
    case "red":
      bg = "text-red-50 bg-red-900 dark:text-red-900 dark:bg-red-100"
      break
    case "gray":
      bg = "text-gray-50 bg-gray-900 dark:text-gray-900 dark:bg-gray-200"
      break
    case "slate":
      bg = "text-slate-50 bg-slate-900 dark:text-slate-900 dark:bg-slate-200"
      break
    case "blue":
      bg = "text-blue-50 bg-blue-900 dark:text-blue-900 dark:bg-blue-200"
      break
    case "goethe":
      bg =
        "text-goethe-50 bg-goethe-900 dark:text-goethe-900 dark:bg-goethe-200"
      break
    case "cyan":
      bg = "text-cyan-50 bg-cyan-900 dark:text-cyan-900 dark:bg-cyan-200"
      break
    case "orange":
      bg =
        "text-orange-50 bg-orange-900 dark:text-orange-900 dark:bg-orange-200"
      break
  }
  return (
    <Link
      to={to ?? ""}
      onClick={onClick}
      className={`block max-w-max bg-inherit no-underline hover:bg-inherit dark:hover:bg-inherit ${className}`}
    >
      <button
        type="button"
        className={`flex max-w-max place-items-center rounded-lg px-5 py-2 text-center font-bold text-white shadow-lg  dark:text-black ${bg}`}
      >
        {children}
      </button>
    </Link>
  )
}

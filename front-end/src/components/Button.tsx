import { ReactNode } from "react"
import { Link, To } from "react-router-dom"

const colorClassMap = {
  disabled: "bg-gray-400 dark:bg-slate-500 dark:text-gray-800",
  green:
    "text-green-50 bg-green-900 hover:bg-green-800 dark:text-green-900 dark:bg-green-300 hover:dark:bg-green-200",
  red: "text-red-50 bg-red-900 hover:bg-red-800 dark:text-red-900 dark:bg-red-100 hover:dark:bg-red-50",
  gray: "text-gray-50 bg-gray-900 hover:bg-gray-800 dark:text-gray-900 dark:bg-gray-200 hover:dark:bg-gray-100",
  slate:
    "text-slate-50 bg-slate-900 hover:bg-slate-800 dark:text-slate-900 dark:bg-slate-200 hover:dark:bg-slate-100",
  blue: "text-blue-50 bg-blue-900 hover:bg-blue-800 dark:text-blue-900 dark:bg-blue-200 hover:dark:bg-blue-100",
  goethe:
    "text-goethe-50 bg-goethe-900 hover:bg-goethe-800 dark:text-goethe-900 dark:bg-goethe-200 hover:dark:bg-goethe-100",
  cyan: "text-cyan-50 bg-cyan-900 hover:bg-cyan-800 dark:text-cyan-900 dark:bg-cyan-300 hover:dark:bg-cyan-200",
  orange:
    "text-orange-50 bg-orange-900 dark:text-orange-900 dark:bg-orange-200 hover:dark:bg-organge-100",
}

/**
 * Button is a button that can be used to navigate to a different page or to
 * perform an action.
 *
 * @param props
 * @param props.children The content of the button.
 * @param props.color The color of the button. Defaults to "disabled".
 * @param props.to The URL to navigate to when the button is clicked. If this is
 *   set, the button will be rendered as a link.
 * @param props.onClick The function to call when the button is clicked. If this
 *   is set, the button will be rendered as a button.
 * @param props.className Additional classes to apply to the button.
 * @param props.disabled Whether the button should be disabled.
 */
export function Button({
  children,
  color = "disabled",
  to,
  onClick,
  className = "",
  disabled = false,
}: {
  children?: ReactNode
  color?: keyof typeof colorClassMap
  to?: To
  onClick?: () => void
  className?: string
  disabled?: boolean
}) {
  className = `btn text-white dark:text-black ${colorClassMap[color]} ${className}`
  if (disabled || (!to && !onClick)) {
    return (
      <button type="button" disabled className={className}>
        {children}
      </button>
    )
  } else if (to) {
    return (
      <Link to={to} onClick={onClick} className={className}>
        {children}
      </Link>
    )
  }
  return (
    <button type="button" onClick={onClick} className={className}>
      {children}
    </button>
  )
}

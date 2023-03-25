import { CircularProgressbarWithChildren } from "react-circular-progressbar"
import "react-circular-progressbar/dist/styles.css"

/**
 * Display a strength meter / progress bar
 *
 * @param {Object} props
 * @param {number} props.strength A number between 0 and 1
 * @param {string} props.tooltip A tooltip to display on hover
 */
export function StrengthMeterCircular({
  strength,
  tooltip,
}: {
  strength: number
  tooltip?: string
}) {
  const strengthRounded = strength < 0.01 ? 0 : Math.ceil(strength * 4)
  const present = <div className={`inline-block h-4 w-4 bg-green-500`}></div>
  const absent = <div className={`inline-block h-4 w-4 bg-slate-500`}></div>
  return (
    <CircularProgressbarWithChildren value={strength} maxValue={1}>
      Sort<br />
      {`${Math.round(strength * 100)}%`}
    </CircularProgressbarWithChildren>
  )

  let bar = <></>
  for (let i = 0; i <= 3; i++) {
    bar = (
      <>
        {bar}
        {i < strengthRounded ? present : absent}
      </>
    )
  }
  bar = <div className="flex h-4 gap-2 text-left">{bar}</div>
  if (tooltip) {
    bar = (
      <button
        aria-label={tooltip}
        data-microtip-position="right"
        data-microtip-size="large"
        role="tooltip"
        className="cursor-default"
        type="button"
      >
        {bar}
      </button>
    )
  }
  return bar
}

/**
 * Display a strength meter / progress bar
 *
 * @param {Object} props
 * @param {number} props.strength A number between 0 and 1
 * @param {string} props.tooltip A tooltip to display on hover
 */
export function StrengthMeter({
  strength,
  tooltip,
}: {
  strength: number
  tooltip?: string
}) {
  const strengthRounded = strength < 0.01 ? 0 : Math.ceil(strength * 4)
  const present = <div className={`inline-block h-4 w-4 bg-green-500`}></div>
  const absent = <div className={`inline-block h-4 w-4 bg-slate-500`}></div>
  let bar = <></>
  for (let i = 0; i <= 3; i++) {
    bar = (
      <>
        {bar}
        {i < strengthRounded ? present : absent}
      </>
    )
  }
  bar = <div className="flex h-4 gap-2 text-left">{bar}</div>
  if (tooltip) {
    bar = (
      <button
        aria-label={tooltip}
        data-microtip-position="right"
        data-microtip-size="large"
        role="tooltip"
        className="cursor-default"
        type="button"
      >
        {bar}
      </button>
    )
  }
  return bar
}

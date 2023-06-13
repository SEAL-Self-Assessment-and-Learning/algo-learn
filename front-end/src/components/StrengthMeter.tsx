import { CircularProgressbarWithChildren } from "react-circular-progressbar"

import "react-circular-progressbar/dist/styles.css"

import { Tooltip } from "react-tooltip"

import "react-tooltip/dist/react-tooltip.css"

import { useTranslation } from "../hooks/useTranslation"

/**
 * Display a strength meter / progress bar
 *
 * @param props
 * @param props.strength A number between 0 and 1
 * @param props.tooltip A tooltip to display on hover
 */
export function StrengthMeterCircular({ strength }: { strength: number }) {
  const { t } = useTranslation()

  return (
    <CircularProgressbarWithChildren value={strength} maxValue={1}>
      {t("StrengthMeter.sort")}
      <br />
      {`${Math.round(strength * 100)}%`}
    </CircularProgressbarWithChildren>
  )
}

/**
 * Display a strength meter / progress bar
 *
 * @param props
 * @param props.id A unique ID for the meter
 * @param props.strength A number between 0 and 1
 * @param props.tooltip A tooltip to display on hover
 */
export function StrengthMeter({
  id,
  strength,
  steps = 4,
  tooltip,
}: {
  id: string
  strength: number
  steps?: number
  tooltip?: string
}) {
  const strengthRounded = strength < 0.01 ? 0 : Math.ceil(strength * steps)
  const bar = <ProgressBar done={strengthRounded} total={steps} />
  if (tooltip) {
    return (
      <>
        <div id={`strength-meter-${id}`}>{bar}</div>
        <Tooltip anchorSelect={`#strength-meter-${id}`} place="right">
          {tooltip}
        </Tooltip>
      </>
    )
  } else {
    return bar
  }
}

export function ProgressBar({
  done = 0,
  doing = 0,
  total,
}: {
  done?: number
  doing?: number
  total?: number
}) {
  total ??= done + doing
  const doneDiv = <div className={`inline-block h-4 w-4 bg-green-500`}></div>
  const doingDiv = <div className={`inline-block h-4 w-4 bg-orange-500`}></div>
  const restDiv = <div className={`inline-block h-4 w-4 bg-slate-500`}></div>
  let bar = <></>
  for (let i = 0; i < total; i++) {
    bar = (
      <>
        {bar}
        {i < done ? doneDiv : i < done + doing ? doingDiv : restDiv}
      </>
    )
  }
  return <div className="flex h-4 gap-2 text-left">{bar}</div>
}

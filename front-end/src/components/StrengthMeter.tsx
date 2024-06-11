import { CircularProgressbarWithChildren } from "react-circular-progressbar"
import "react-circular-progressbar/dist/styles.css"
import { FaRegStar, FaStar, FaStarHalfAlt } from "react-icons/fa"
import { min } from "@shared/utils/math"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
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
  strength,
  steps = 3,
  children,
}: {
  strength: number
  steps?: number
  children?: React.ReactNode
}) {
  let strengthRounded = Math.round(strength * steps)
  if (strength < 0.05) strengthRounded = 0
  if (strength > 0.95) strengthRounded = steps
  if (strength <= 0.95) strengthRounded = min(strengthRounded, steps - 1)
  const bar = <ProgressBar done={strengthRounded} total={steps} />
  if (children) {
    return (
      <div>
        <Tooltip placement="right">
          <TooltipTrigger>{bar}</TooltipTrigger>
          <TooltipContent>{children}</TooltipContent>
        </Tooltip>
      </div>
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
  const doneDiv = <FaStar />
  const doingDiv = <FaStarHalfAlt />
  const restDiv = <FaRegStar />
  const bar = []
  for (let i = 0; i < total; i++) {
    bar.push(<>{i < done ? doneDiv : i < done + doing ? doingDiv : restDiv}</>)
  }
  return <div className="flex">{bar}</div>
}

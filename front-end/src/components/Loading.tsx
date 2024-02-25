import { useTranslation } from "../hooks/useTranslation"
import { HorizontallyCenteredDiv } from "./CenteredDivs"

export default function Loading() {
  const { t } = useTranslation()
  return (
    <HorizontallyCenteredDiv className="flex flex-col gap-4">
      <h1>{t("loading")}...</h1>
    </HorizontallyCenteredDiv>
  )
}

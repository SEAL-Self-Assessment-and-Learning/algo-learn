import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { HorizontallyCenteredDiv } from "../components/CenteredDivs"

export function Legal() {
  const { t } = useTranslation()
  return (
    <HorizontallyCenteredDiv>
      <h1>{t("Imprint-and-Privacy")}</h1>
      <p className="my-5">{t("note-data-never-leaves-your-browser")}</p>
      <p className="my-5">
        {t("for-detailed-imprint-and-privacy-information-see-this-page")}
        <Link
          to="https://tcs.uni-frankfurt.de/legal"
          className="block max-w-max"
        >
          https://tcs.uni-frankfurt.de/legal
        </Link>
      </p>
      <h2>Authors</h2>
      <p>
        Written by <a href="https://holgerdell.com">Holger Dell</a> (2023), the
        source code is available on{" "}
        <a href="https://github.com/holgerdell/algo-learn/">github</a>.
      </p>
    </HorizontallyCenteredDiv>
  )
}

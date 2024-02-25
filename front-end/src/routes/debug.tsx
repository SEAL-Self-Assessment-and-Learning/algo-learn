import { Translations } from "../../../shared/src/utils/translations"
import { HorizontallyCenteredDiv } from "../components/CenteredDivs"
import { useDebug, useFormat } from "../hooks/useDebug"
import { useTranslation } from "../hooks/useTranslation"

const tr: Translations = {
  en: {
    title: "Debug",
    description: "Here you can enable or disable some debug features.",
    debugMode: "Debug mode",
    selectDisplay: "Select display format",
    enabled: "Enabled",
    disabled: "Disabled",
  },
  de: {
    title: "Debug",
    description:
      "Hier kannst du einige Debug-Funktionen aktivieren oder deaktivieren.",
    debugMode: "Debug-Modus",
    selectDisplay: "Anzeigeformat auswählen",
    enabled: "Aktiviert",
    disabled: "Deaktiviert",
  },
}

export function Debug() {
  const { t } = useTranslation(tr)
  const { debug, setDebug } = useDebug()
  const { format, setFormat } = useFormat()
  return (
    <HorizontallyCenteredDiv className="prose">
      <h1>{t("title")}</h1>
      <p>{t("description")}</p>
      <form action="" className="mt-4 flex select-none flex-col gap-4">
        <fieldset className="flex flex-wrap place-items-start justify-start">
          <legend>{t("debugMode")}:</legend>

          <input
            type="radio"
            checked={debug}
            onChange={(e) => e.target.checked && setDebug(true)}
            id="debug-checkbox"
            className="m-2 block"
          ></input>
          <label className="block" htmlFor="debug-checkbox">
            {t("enabled")}
          </label>

          <input
            type="radio"
            checked={!debug}
            onChange={(e) => e.target.checked && setDebug(false)}
            id="no-debug-checkbox"
            className="m-2"
          ></input>
          <label htmlFor="no-debug-checkbox">{t("disabled")}</label>
        </fieldset>
        <fieldset className="flex flex-wrap place-items-start justify-start">
          <legend>{t("selectDisplay")}:</legend>

          <input
            type="radio"
            checked={format === "react"}
            onChange={(e) => e.target.checked && setFormat("react")}
            id="react-checkbox"
            className="m-2"
            disabled={!debug}
          />
          <label className="" htmlFor="react-checkbox">
            React
          </label>

          <input
            type="radio"
            checked={format === "latex"}
            onChange={(e) => e.target.checked && setFormat("latex")}
            id="latex-checkbox"
            className="m-2"
            disabled={!debug}
          />
          <label htmlFor="latex-checkbox">LaTeX</label>

          <input
            type="radio"
            checked={format === "json"}
            onChange={(e) => e.target.checked && setFormat("json")}
            id="json-checkbox"
            className="m-2"
            disabled={!debug}
          />
          <label htmlFor="json-checkbox">JSON</label>
        </fieldset>
      </form>
    </HorizontallyCenteredDiv>
  )
}

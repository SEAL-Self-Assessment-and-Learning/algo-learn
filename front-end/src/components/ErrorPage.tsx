import { isRouteErrorResponse, useRouteError } from "react-router-dom"
import { useTranslation } from "../hooks/useTranslation"

/** ErrorPage is a page that is displayed when an unexpected error occurs. */
export default function ErrorPage() {
  const { t } = useTranslation()

  const error = useRouteError()
  return (
    <div id="error-page" className="mx-auto grid h-screen max-w-md place-items-center text-center">
      <div className="flex flex-col gap-5">
        <h1 className="text-7xl font-bold">{t("Errors.oops")}</h1>
        <p>{t("Errors.sorry")}</p>
        <p className="text-gray-500">
          <i>
            {isRouteErrorResponse(error) ? (
              <>
                {error.status} {error.statusText}
                <br />
                {error.data}
              </>
            ) : (
              error instanceof Error && error.message
            )}
          </i>
        </p>
      </div>
    </div>
  )
}

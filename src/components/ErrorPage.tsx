import { isRouteErrorResponse, useRouteError } from "react-router-dom"

/** ErrorPage is a page that is displayed when an unexpected error occurs. */
export default function ErrorPage() {
  const error = useRouteError()
  return (
    <div
      id="error-page"
      className="mx-auto grid h-screen max-w-md place-items-center text-center"
    >
      <div className="flex flex-col gap-5">
        <h1 className="text-7xl font-bold">Oops!</h1>
        <p>Sorry, an unexpected error has occurred.</p>
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

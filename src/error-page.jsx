import { useRouteError } from "react-router-dom"

export default function ErrorPage() {
  const error = useRouteError()
  console.error(error)

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
            {error.status} {error.statusText || error.message}
            <br />
            {error.data}
          </i>
        </p>
      </div>
    </div>
  )
}

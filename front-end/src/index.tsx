import "./tailwind.css"
import "@fontsource/noto-sans/400-italic.css"
import "@fontsource/noto-sans/400.css"
import "@fontsource/noto-sans/700-italic.css"
import "@fontsource/noto-sans/700.css"

import { StrictMode } from "react"
import ReactDOM from "react-dom/client"
import {
  createBrowserRouter,
  redirect,
  RouterProvider,
  useParams,
} from "react-router-dom"

import {
  allParameterCombinations,
  serializeParameters,
} from "../../shared/src/api/Parameters"
import { sampleRandomSeed } from "../../shared/src/utils/random"
import ErrorPage from "./components/ErrorPage"
import { QuizSession } from "./components/QuizSession"
import { BASENAME } from "./config"
import { allQuestionGeneratorRoutes } from "./listOfQuestions"
import { About } from "./routes/about"
import { Legal } from "./routes/legal"
import { LearningProgress } from "./routes/progress"
import Root from "./routes/root"
import { TestSimpleMC } from "./routes/test"
import { ViewSingleQuestion } from "./routes/ViewSingleQuestion"

/**
 * Redirects to the same URL but with a language prefix; uses the browser's
 * default language.
 *
 * @param props
 * @param props.request The request to redirect
 */
function redirectLang({ request }: { request: Request }) {
  let lng = window.navigator.language
  if (lng.startsWith("de")) {
    lng = "de"
  } else {
    lng = "en"
  }
  let path = new URL(request.url).pathname
  if (BASENAME !== undefined) {
    if (!path.startsWith(BASENAME)) throw new Error("Unexpected path: " + path)
    path = path.slice(BASENAME.length)
  }
  return redirect("/" + lng + path)
}

const routes = []
for (const questionGeneratorRoute of allQuestionGeneratorRoutes) {
  const { path, generator } = questionGeneratorRoute
  for (const parameters of allParameterCombinations(
    generator.expectedParameters
  )) {
    const parametersPath = serializeParameters(
      parameters,
      generator.expectedParameters
    )
    const route = path + (parametersPath ? "/" + parametersPath : "")
    routes.push({
      path: route,
      loader: () => redirect(sampleRandomSeed()),
    })
    const Element = () => {
      const { seed } = useParams()
      return (
        <ViewSingleQuestion
          generator={generator}
          parameters={parameters}
          seed={seed ?? ""}
        />
      )
    }
    routes.push({
      path: route + "/:seed",
      loader: redirectLang,
    })
    for (const lang of ["en", "de"]) {
      routes.push({
        path: lang + "/" + route + "/:seed",
        element: <Element />,
      })
    }
  }
}

for (const { index, path, element } of [
  { index: true, element: <LearningProgress /> },
  { path: "legal", element: <Legal /> },
  { path: "about", element: <About /> },
  { path: "test", element: <TestSimpleMC /> },
  { path: "practice/*", element: <QuizSession mode="practice" /> },
  { path: "exam/*", element: <QuizSession mode="exam" /> },
]) {
  routes.push({
    index,
    path,
    loader: redirectLang,
  })
  routes.push({
    index,
    path: ":lang/" + (path ?? ""),
    element,
  })
}

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Root />,
      errorElement: <ErrorPage />,
      children: routes,
    },
  ],
  {
    basename: BASENAME,
  }
)

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)

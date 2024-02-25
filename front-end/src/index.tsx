import "./tailwind.css"

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
import { Catalogue } from "./routes/catalogue"
import Root from "./routes/root"
import { TestSimpleMC } from "./routes/test"
import { ViewSingleQuestion } from "./routes/ViewSingleQuestion"
import { DEFAULT_LANGUAGE } from "./hooks/useTranslation"
import { Debug } from "./routes/debug"

const routes = []
for (const { path, generator } of allQuestionGeneratorRoutes) {
  for (const parameters of allParameterCombinations(
    generator.expectedParameters,
  )) {
    const parametersPath = serializeParameters(
      parameters,
      generator.expectedParameters,
    )
    const route = path + (parametersPath ? "/" + parametersPath : "")
    const Element = () => {
      const { seed } = useParams()
      return (
        <ViewSingleQuestion
          generator={generator}
          generatorPath={path}
          parameters={parameters}
          seed={seed ?? ""}
        />
      )
    }
    routes.push({
      path: ":lang/" + route,
      loader: () => redirect(sampleRandomSeed()),
    })
    routes.push({
      path: ":lang/" + route + "/:seed",
      element: <Element />,
    })
  }
}

routes.push({
  path: `:lang`,
  element: <Catalogue />,
})
routes.push({
  path: `:lang/legal`,
  element: <Legal />,
})
routes.push({
  path: `:lang/about`,
  element: <About />,
})
routes.push({
  path: `:lang/debug`,
  element: <Debug />,
})
routes.push({
  path: `:lang/test`,
  element: <TestSimpleMC />,
})
routes.push({
  path: `:lang/practice/*`,
  element: <QuizSession mode="practice" />,
})
routes.push({
  path: `:lang/exam/*`,
  element: <QuizSession mode="exam" />,
})
routes.push({
  index: true,
  loader: () => redirect(`/${DEFAULT_LANGUAGE}`),
})

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
  },
)

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)

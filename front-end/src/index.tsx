import { StrictMode } from "react"
import ReactDOM from "react-dom/client"
import { createBrowserRouter, redirect, RouterProvider, useParams } from "react-router-dom"
import { allParameterCombinations } from "../../shared/src/api/Parameters"
import { sampleRandomSeed } from "../../shared/src/utils/random"
import ErrorPage from "./components/ErrorPage"
import { QuizSession } from "./components/QuizSession"
import { BASENAME } from "./config"
import { DEFAULT_LANGUAGE } from "./hooks/useTranslation"
import { About } from "./routes/about"
import { Catalogue } from "./routes/catalogue"
import { Debug } from "./routes/debug"
import { Legal } from "./routes/legal"
import Root from "./routes/root"
import { TestSimpleMC } from "./routes/test"
import { ViewSingleQuestion } from "./routes/ViewSingleQuestion"
import "./tailwind.css"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter"
import { collection } from "./listOfQuestions"

const routes = []
for (const generator of collection.flatMap((x) => x.contents)) {
  for (const parameters of allParameterCombinations(generator.expectedParameters)) {
    const route = serializeGeneratorCall({ generator, parameters })
    const Element = () => {
      const { seed } = useParams()
      return <ViewSingleQuestion generator={generator} parameters={parameters} seed={seed ?? ""} />
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
  path: `:lang/practice/:id/*`,
  element: <QuizSession mode="practice" />,
})
routes.push({
  path: `:lang/exam/:id/*`,
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

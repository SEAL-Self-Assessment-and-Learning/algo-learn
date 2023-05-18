import "@fontsource/noto-sans/400-italic.css"
import "@fontsource/noto-sans/400.css"
import "@fontsource/noto-sans/700-italic.css"
import "@fontsource/noto-sans/700.css"
import { StrictMode } from "react"
import ReactDOM from "react-dom/client"
import { createBrowserRouter, redirect, RouterProvider } from "react-router-dom"
import ErrorPage from "./components/ErrorPage"
import { pathOfQuestionVariant, questions, ALL_SKILLS } from "./hooks/useSkills"
import { LearningProgress } from "./routes/progress"
import Root from "./routes/root"

import { QuizSession } from "./components/QuizSession"
import "./i18n"
import { About } from "./routes/about"
import { ViewSingleQuestion } from "./routes/ViewSingleQuestion"
import { Legal } from "./routes/legal"
import "./tailwind.css"
import Random from "./utils/random"
import { BASENAME } from "./config"
import { TestSimpleMC } from "./routes/test/TestSimpleMC"

const routes = []
for (const question of questions) {
  const { name: path, variants } = question
  console.assert(
    variants.length > 0,
    "Every question requires at least one variant."
  )
  routes.push({
    path: `${path}`,
    loader: () => redirect(variants[0]),
  })
}
for (const qv of ALL_SKILLS) {
  routes.push(
    {
      path: pathOfQuestionVariant(qv),
      loader: () => redirect(new Random(Math.random()).base36string(7)),
    },
    {
      path: `${pathOfQuestionVariant(qv)}/:seed`,
      element: <ViewSingleQuestion qv={qv} />,
    }
  )
}

const partialPaths = new Set<string>()
for (const qv of ALL_SKILLS) {
  const partialPath = pathOfQuestionVariant(qv)
    .split("/")
    .slice(0, -1)
    .join("/")
  partialPaths.add(partialPath)
}

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Root />,
      errorElement: <ErrorPage />,
      children: [
        { index: true, element: <LearningProgress /> },
        { path: "legal", element: <Legal /> },
        { path: "about", element: <About /> },
        { path: "test", element: <TestSimpleMC /> },
        { path: "practice/*", element: <QuizSession mode="practice" /> },
        { path: "exam/*", element: <QuizSession mode="exam" /> },
        ...routes,
      ],
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

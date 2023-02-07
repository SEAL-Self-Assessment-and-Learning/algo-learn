import "@fontsource/noto-sans/400-italic.css"
import "@fontsource/noto-sans/400.css"
import "@fontsource/noto-sans/700-italic.css"
import "@fontsource/noto-sans/700.css"
import { StrictMode } from "react"
import ReactDOM from "react-dom/client"
import { createBrowserRouter, redirect, RouterProvider } from "react-router-dom"
import ErrorPage from "./error-page"
import { questions } from "./questions"
import { LearningProgress } from "./routes/progress"
import Root from "./routes/root"

import { QuizSession } from "./components/QuizSession"
import "./i18n"
import { About } from "./routes/about"
import { RouteToQuestion } from "./routes/asymptotics"
import { Legal } from "./routes/legal"
import "./tailwind.css"
import { genSeed } from "./utils/genseed"

let routes = []
for (const q of questions) {
  const { path, variants } = q
  console.assert(
    variants.length > 0,
    "Every question requires at least one variant."
  )
  routes.push(
    {
      path: `${path}`,
      loader: () => redirect(variants[0]),
    },
    {
      path: `${path}/:variant`,
      loader: () => redirect(genSeed(7)),
    },
    {
      path: `${path}/:variant/:seed`,
      loader: ({ params }) => ({ ...params, path }),
      element: <RouteToQuestion Question={q} />,
    }
  )
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
        { path: "practice", element: <QuizSession /> },
        { path: "examine", element: <QuizSession practiceMode={false} /> },
        ...routes,
      ],
    },
  ],
  {
    basename:
      window.location.hostname === "tcs.uni-frankfurt.de" ? "/algo-learn" : "",
  }
)

ReactDOM.createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)

import { Link } from "react-router-dom"

import { HorizontallyCenteredDiv } from "../components/CenteredDivs"
import { useTranslation } from "../hooks/useTranslation"

import "react-tooltip/dist/react-tooltip.css"

import {
  deserializePath,
  serializeGeneratorCall,
} from "../../../shared/src/api/QuestionRouter"
import {
  allQuestionGeneratorRoutes,
  generatorSetBelowPath as generatorCallsBelowPath,
  skillGroups,
} from "../listOfQuestions"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { badgeVariants } from "@/components/ui/badge"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card"

export function Catalogue() {
  const { t, lang } = useTranslation()
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [showAllVariants, setShowAllVariants] = useState(false)

  return (
    <HorizontallyCenteredDiv>
      <h1 className="text-4xl font-bold">{t("Catalogue")}</h1>
      <div>{t("Catalogue.desc")}</div>
      <Card className="my-8 w-fit bg-secondary text-secondary-foreground">
        <CardHeader>
          <CardTitle>{t("Catalogue.topic")}</CardTitle>
          <CardDescription>{t("Catalogue.choose.desc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap justify-start gap-4">
            {skillGroups.map((g) => (
              <Button
                key={g}
                onClick={() => setSelectedGroup(g)}
                variant={selectedGroup === g ? "default" : "outline"}
              >
                {t("skill." + g)}
              </Button>
            ))}
          </div>
          {selectedGroup && (
            <div className="items-top mt-6 flex space-x-2 font-medium">
              <Checkbox
                id="terms1"
                onCheckedChange={(b) => setShowAllVariants(b === true)}
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="terms1"
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {t("Catalogue.showVariants")}
                </label>
              </div>
            </div>
          )}
        </CardContent>
        {/* <CardFooter>
    <p>Card Footer</p>
  </CardFooter> */}
      </Card>
      {selectedGroup && (
        <>
          <h2 className="font-bold">{t("Catalogue.selectExercise")}</h2>
          <ol className="my-4">
            {generatorsInGroup(selectedGroup).map((x) => (
              <li
                key={x?.generatorPath}
                className="list-item list-inside list-decimal"
              >
                <div className="inline-flex items-center gap-2">
                  <Button asChild variant="link">
                    <Link to={`/${lang}/practice/${x?.generatorPath}`}>
                      {x?.generator.name(lang)}
                    </Link>
                  </Button>
                  {showAllVariants &&
                    x &&
                    variantsOfGenerator(x.generatorPath).map((y) => (
                      <Link
                        key={y.path}
                        to={`/${lang}/practice/${y.path}`}
                        className={badgeVariants({ variant: "secondary" })}
                      >
                        {y.subPath}
                      </Link>
                    ))}
                </div>
              </li>
            ))}
          </ol>
        </>
      )}
    </HorizontallyCenteredDiv>
  )
}

function generatorsInGroup(group: string) {
  return removeDuplicates(
    generatorCallsBelowPath(group).map((x) =>
      serializeGeneratorCall({ ...x, parameters: undefined }),
    ),
  ).map((x) => deserializePath({ routes: allQuestionGeneratorRoutes, path: x }))
}

function variantsOfGenerator(generatorPath: string) {
  return generatorCallsBelowPath(generatorPath).map((x) => {
    const path = serializeGeneratorCall(x)
    return {
      path,
      subPath: path.slice(generatorPath.length + 1),
    }
  })
}

function removeDuplicates(arr: string[]): string[] {
  return [...new Set(arr)]
}

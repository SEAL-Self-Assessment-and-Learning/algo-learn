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
  CardFooter,
} from "@/components/ui/card"
import { QuestionGenerator } from "@shared/api/QuestionGenerator"
import { ChevronRight } from "lucide-react"

export function Catalogue() {
  const { t } = useTranslation()
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [showAllVariants, setShowAllVariants] = useState(false)

  return (
    <HorizontallyCenteredDiv>
      <h1 className="text-4xl font-bold">{t("Catalogue")}</h1>
      <p>{t("Catalogue.desc")}</p>
      <TopicSelectorCard
        selectedGroup={selectedGroup}
        setSelectedGroup={setSelectedGroup}
        showAllVariants={showAllVariants}
        setShowAllVariants={setShowAllVariants}
      />
      {selectedGroup && (
        <>
          <h2 className="mt-16 text-xl font-bold">
            {t("Catalogue.selectExercise")}
          </h2>
          {generatorsInGroup(selectedGroup).map(
            (x) =>
              x && (
                <QuestionGeneratorCard
                  key={x.generatorPath}
                  generatorPath={x.generatorPath}
                  generator={x.generator}
                  showAllVariants={showAllVariants}
                />
              ),
          )}
        </>
      )}
    </HorizontallyCenteredDiv>
  )
}

/**
 * A card that allows the user to select a topic and whether to show all variants of a question generator
 * @param selectedGroup The currently selected group
 * @param setSelectedGroup A function to set the selected group
 * @param showAllVariants Whether to show all variants of a question generator
 * @param setShowAllVariants A function to set whether to show all variants of a question generator
 */
function TopicSelectorCard({
  selectedGroup,
  setSelectedGroup,
  showAllVariants,
  setShowAllVariants,
}: {
  selectedGroup: string | null
  setSelectedGroup: (s: string) => void
  showAllVariants: boolean
  setShowAllVariants: (b: boolean) => void
}) {
  const { t } = useTranslation()
  return (
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
              checked={showAllVariants}
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
  )
}

/**
 * A card that displays a question generator as well as buttons to practice it and its variants
 * @param generatorPath The path of the generator
 * @param generator The generator
 * @param showAllVariants Whether to show all variants of a question generator
 */
function QuestionGeneratorCard({
  generatorPath,
  generator,
  showAllVariants,
  showDescription = true,
}: {
  generatorPath: string
  generator: QuestionGenerator
  showAllVariants: boolean
  showDescription?: boolean
}) {
  const { t, lang } = useTranslation()
  return (
    <Card className="my-8 w-fit p-0">
      <CardHeader className="m-0 p-3">
        <CardTitle className="text-base">{generator.name(lang)}</CardTitle>
        {showDescription && generator.description && (
          <CardDescription>{generator.description(lang)}</CardDescription>
        )}
      </CardHeader>
      <CardFooter className="m-0 flex items-center gap-2 p-3">
        <Button asChild variant="secondary" size="sm">
          <Link to={`/${lang}/practice/${generatorPath}`}>
            {t("Catalogue.practice")} <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
        {showAllVariants &&
          variantsOfGenerator(generatorPath).map((y) => (
            <Link
              key={y.path}
              to={`/${lang}/practice/${y.path}`}
              className={badgeVariants({ variant: "secondary" })}
            >
              {y.subPath}
            </Link>
          ))}
      </CardFooter>
    </Card>
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

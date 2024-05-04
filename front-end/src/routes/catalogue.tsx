import { ChevronRight } from "lucide-react"
import { HTMLAttributes } from "react"
import { Link } from "react-router-dom"
import { QuestionGenerator } from "@shared/api/QuestionGenerator"
import { badgeVariants } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useHistoryState } from "@/hooks/useHistoryState"
import { cn } from "@/lib/utils"
import { deserializePath, serializeGeneratorCall } from "../../../shared/src/api/QuestionRouter"
import { useTranslation } from "../hooks/useTranslation"
import {
  allQuestionGeneratorRoutes,
  generatorSetBelowPath as generatorCallsBelowPath,
  skillGroups,
} from "../listOfQuestions"

export function Catalogue() {
  const [selectedGroup, setSelectedGroup] = useHistoryState<string | null>("selectedGroup", null)
  const [showAllVariants, setShowAllVariants] = useHistoryState("showAllVariants", false)

  return (
    <div className="mx-auto flex w-full max-w-screen-md flex-col items-start justify-center gap-6 p-6 sm:flex-row">
      <TopicSelectorSidebar
        selectedGroup={selectedGroup}
        setSelectedGroup={setSelectedGroup}
        showAllVariants={showAllVariants}
        setShowAllVariants={setShowAllVariants}
        className="mx-auto sm:mx-0"
      />
      <div className="w-full">
        {selectedGroup && (
          <div className="flex flex-col gap-6">
            {generatorsInGroup(selectedGroup).map(
              (x) =>
                x && (
                  <QuestionGeneratorCard
                    key={x.generatorPath}
                    generatorPath={x.generatorPath}
                    generator={x.generator}
                    showAllVariants={showAllVariants}
                    className="w-full"
                  />
                ),
            )}
          </div>
        )}
      </div>
    </div>
  )
}

interface TopicSelectorProps extends HTMLAttributes<HTMLDivElement> {
  selectedGroup: string | null
  setSelectedGroup: (s: string) => void
  showAllVariants: boolean
  setShowAllVariants: (b: boolean) => void
}

/**
 * A sidebar that allows the user to select a topic and whether to show all variants of a question generator
 * @param selectedGroup The currently selected group
 * @param setSelectedGroup A function to set the selected group
 * @param showAllVariants Whether to show all variants of a question generator
 * @param setShowAllVariants A function to set whether to show all variants of a question generator
 */
function TopicSelectorSidebar({
  className,
  selectedGroup,
  setSelectedGroup,
  showAllVariants,
  setShowAllVariants,
}: TopicSelectorProps) {
  const { t } = useTranslation()
  return (
    <Card className={cn("border-0 bg-secondary text-secondary-foreground", className)}>
      <CardHeader>
        <CardTitle>{t("Catalogue.topic")}</CardTitle>
        <CardDescription>{t("Catalogue.choose.desc")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col flex-wrap gap-1">
        {skillGroups.map((g) => (
          <Button
            key={g}
            onClick={() => setSelectedGroup(g)}
            variant={selectedGroup === g ? "default" : "ghost"}
            className="justify-start"
          >
            {t("skill." + g)}
          </Button>
        ))}
        {selectedGroup && (
          <div className="ml-2 mt-4 flex gap-2">
            <Checkbox
              id="terms1"
              checked={showAllVariants}
              onCheckedChange={(b) => setShowAllVariants(b === true)}
            />
            <Label htmlFor="terms1">{t("Catalogue.showVariants")}</Label>
          </div>
        )}
      </CardContent>
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
  className,
}: {
  generatorPath: string
  generator: QuestionGenerator
  showAllVariants: boolean
  showDescription?: boolean
  className?: string
}) {
  const { t, lang } = useTranslation()
  return (
    <Card className={cn("border-4", className)}>
      <CardHeader className="m-0 p-3">
        <CardTitle className="text-base">{generator.name(lang)}</CardTitle>
        {showDescription && generator.description && (
          <CardDescription>{generator.description(lang)}</CardDescription>
        )}
      </CardHeader>
      <CardFooter className="m-0 flex flex-wrap items-center gap-2 p-3">
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
    generatorCallsBelowPath(group).map((x) => serializeGeneratorCall({ ...x, parameters: undefined })),
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

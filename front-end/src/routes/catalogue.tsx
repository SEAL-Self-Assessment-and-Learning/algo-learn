import { ChevronRight } from "lucide-react"
import { HTMLAttributes } from "react"
import { FaLock, FaRegStar, FaStar } from "react-icons/fa"
import { Link } from "react-router-dom"
import { allParameterCombinations, serializeParameters } from "@shared/api/Parameters"
import { QuestionGenerator } from "@shared/api/QuestionGenerator"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { useHistoryState } from "@/hooks/useHistoryState"
import { useLearningAnalytics } from "@/hooks/useLearningAnalytics"
import { cn } from "@/lib/utils"
import { howLongSince } from "@/utils/howLongSince"
import { useTranslation } from "../hooks/useTranslation"
import { collection } from "../listOfQuestions"

export function Catalogue() {
  const [selectedGroup, setSelectedGroup] = useHistoryState<string | null>("selectedGroup", null)
  // const [showAllVariants, setShowAllVariants] = useHistoryState("showAllVariants", false)

  return (
    <div className="mx-auto flex w-full max-w-screen-md flex-col items-start justify-center gap-6 p-6 sm:flex-row">
      <TopicSelectorSidebar
        selectedGroup={selectedGroup}
        setSelectedGroup={setSelectedGroup}
        // showAllVariants={showAllVariants}
        // setShowAllVariants={setShowAllVariants}
        className="mx-auto sm:mx-0"
      />
      <div className="w-full">
        {selectedGroup && (
          <div className="flex flex-col gap-6">
            {collection
              .find((e) => e.slug === selectedGroup)
              ?.contents.map(
                (x) => x && <QuestionGeneratorCard key={x.id} generator={x} className="w-full" />,
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
  showAllVariants?: boolean
  setShowAllVariants?: (b: boolean) => void
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
  // showAllVariants,
  // setShowAllVariants,
}: TopicSelectorProps) {
  const { t, lang } = useTranslation()
  return (
    <Card className={cn("border-0 bg-secondary text-secondary-foreground", className)}>
      <CardHeader>
        <CardTitle>{t("Catalogue.topic")}</CardTitle>
        <CardDescription>{t("Catalogue.choose.desc")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col flex-wrap gap-1">
        {collection.map((g) => (
          <Button
            key={g.slug}
            onClick={() => setSelectedGroup(g.slug)}
            variant={selectedGroup === g.slug ? "default" : "ghost"}
            className="justify-start"
          >
            {g.name[lang]}
          </Button>
        ))}
        {/* {selectedGroup && (
          <div className="ml-2 mt-4 flex gap-2">
            <Checkbox
              id="terms1"
              checked={showAllVariants}
              onCheckedChange={(b) => setShowAllVariants && setShowAllVariants(b === true)}
            />
            <Label htmlFor="terms1">{t("Catalogue.showVariants")}</Label>
          </div>
        )} */}
      </CardContent>
    </Card>
  )
}

/**
 * A card that displays a question generator as well as buttons to practice it and its variants
 * @param generator The generator
 * @param showAllVariants Whether to show all variants of a question generator
 */
function QuestionGeneratorCard({
  generator,
  showDescription = true,
  className,
}: {
  generator: QuestionGenerator
  showDescription?: boolean
  className?: string
}) {
  const { t, lang } = useTranslation()
  const { featureMap } = useLearningAnalytics()
  return (
    <Card className={cn("flex border-4 ", className)}>
      <div className="flex-1">
        <CardHeader className="m-0 p-3">
          <CardTitle className="text-base">{generator.name(lang)}</CardTitle>
          {showDescription && generator.description && (
            <CardDescription>{generator.description(lang)}</CardDescription>
          )}
        </CardHeader>
        <CardFooter className="m-0 flex flex-wrap items-center gap-2 p-3">
          <Button asChild variant="secondary" size="sm">
            <Link to={`/${lang}/practice/${generator.id}`}>
              {t("Catalogue.practice")} <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
          {/* {showAllVariants &&
            allParameterCombinations(generator).map((parameters) => {
              const path = serializeGeneratorCall({ lang, generator, parameters })
              const params = serializeParameters(parameters, generator.expectedParameters)
              if (!params) return null
              return (
                <Link key={path} to={`/${path}`} className={badgeVariants({ variant: "secondary" })}>
                  {" "}
                  {params}
                </Link>
              )
            })} */}
        </CardFooter>
      </div>
      <div className="flex p-3 text-primary">
        {allParameterCombinations(generator).map((parameters) => {
          const path = serializeGeneratorCall({ generator, parameters })
          const params = serializeParameters(parameters, generator.expectedParameters)
          const Icon = {
            mastered: <FaStar />,
            decaying: (
              <div className="text-opacity-70">
                <FaStar />
              </div>
            ),
            learning: <FaRegStar />,
            locked: <FaLock />,
          }[featureMap[path].phase]
          return (
            <Link key={path} to={`/${lang}/practice/${path}`}>
              <HoverCard openDelay={0} closeDelay={100}>
                <HoverCardTrigger>{Icon}</HoverCardTrigger>
                <HoverCardContent className="flex w-fit flex-col border-none bg-secondary text-secondary-foreground">
                  <div>
                    <b>{generator.name(lang)}</b>
                  </div>
                  <div>
                    {t("question-variant")}: <b>{params}</b>
                  </div>
                  <div>
                    {t("Status")}: {t("phase-" + featureMap[path].phase)}
                  </div>
                  <div>
                    {t("last-attempt")}: {howLongSince(featureMap[path].lastInteraction, lang)}
                  </div>
                </HoverCardContent>
              </HoverCard>
            </Link>
          )
        })}
        {/* <StrengthMeter strength={summaryStrength[generator.id]}>
          {t("learningProgress")}: <b>{Math.round(100 * summaryStrength[generator.id])}%</b>
        </StrengthMeter> */}
      </div>
    </Card>
  )
}

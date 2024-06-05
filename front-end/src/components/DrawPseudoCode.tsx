import { ReactElement, useEffect, useRef, useState } from "react"
import { IoColorPaletteOutline } from "react-icons/io5"
import { MdContentCopy } from "react-icons/md"
import { TbListNumbers } from "react-icons/tb"
import { PseudoCode } from "@shared/utils/pseudoCodeUtils.ts"
import { Markdown } from "@/components/Markdown.tsx"
import { Toaster } from "@/components/ui/toaster"
import { Toggle } from "@/components/ui/toggle.tsx"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/components/ui/use-toast"
import { pseudoCodeToString } from "@/utils/parsePseudoCode.ts"

/*
Could use this for coloring the pseudocode
https://www.w3schools.com/tags/ref_colornames.asp
*/
export const keyWordsColor = "DodgerBlue"
export const functionColor = "DarkCyan"
export const variableColor = "IndianRed"
export const controlFlowColor = "SeaGreen"
export const printStatementColor = "Orange"

export function DrawPseudoCode({ displayCode }: { displayCode: string }): ReactElement {
  const pseudoCodeStringParse: PseudoCode = JSON.parse(displayCode) as PseudoCode

  const { pseudoCodeString, pseudoCodeStringColor, pseudoCodeStringLatex } =
    pseudoCodeToString(pseudoCodeStringParse)

  const numCodeLines = pseudoCodeString.length

  const { toast } = useToast()

  const preHeight = useRef<HTMLDivElement>(null)
  const [maxHeight, setMaxHeight] = useState(0)
  const [toggleStateLines, setToggleStateLines] = useState(true)
  const [toggleStateColor, setToggleStateColor] = useState(true)

  const [isTextVisible, setIsTextVisible] = useState(true)

  useEffect(() => {
    if (preHeight.current) {
      const newHeight = preHeight.current.offsetHeight
      if (newHeight > maxHeight) {
        setMaxHeight(newHeight)
      }
      preHeight.current.style.minHeight = `${maxHeight}px`
    }
  }, [toggleStateLines, toggleStateColor, maxHeight])

  const handleToggleClickLines = () => {
    setToggleStateLines(!toggleStateLines)
    setIsTextVisible(false)
    setTimeout(() => {
      setIsTextVisible(true)
    }, 70)
  }

  const handleToggleClickColor = () => {
    setToggleStateColor(!toggleStateColor)
    setIsTextVisible(false)
    setTimeout(() => {
      setIsTextVisible(true)
    }, 70)
  }

  const handleClickCopyIcon: () => void = () => {
    ;(async () => {
      await navigator.clipboard.writeText(
        pseudoCodeStringLatex.filter((codeLine) => codeLine.trim() !== "").join("\n"),
      )
      toast({
        description: "Copied code as LaTeX to clipboard.",
      })
    })().catch((error) => {
      console.error("Error in handleClickCopyIcon:", error)
      toast({
        variant: "destructive",
        description: "There has been an error copying the code.",
      })
    })
  }

  return (
    <div className="my-5">
      <div className="relative">
        <div
          ref={preHeight}
          className="overflow-hidden rounded-lg border border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
        >
          <div className="whitespace-nowrap">
            <pre
              className={`overflow-x-auto whitespace-pre py-3 pl-5 pr-10 font-mono leading-normal text-gray-900 dark:text-gray-100 ${toggleStateColor ? "hidden" : ""}`}
            >
              {createCodeJSX(pseudoCodeString, isTextVisible, toggleStateLines, numCodeLines)}
            </pre>
            <pre
              className={`overflow-x-auto whitespace-pre py-3 pl-5 pr-10 font-mono leading-normal text-gray-900 dark:text-gray-100 ${toggleStateColor ? "" : "hidden"}`}
            >
              {createCodeJSX(pseudoCodeStringColor, isTextVisible, toggleStateLines, numCodeLines)}
            </pre>
          </div>
        </div>
        <div className="absolute right-1 top-1 flex flex-col items-center space-y-1 rounded-lg dark:border-gray-700 dark:bg-gray-800">
          <Toaster />
            <Tooltip placement={`right`}>
              <TooltipTrigger asChild>
                <div>
                  <Toggle size="sm" pressed={toggleStateLines} onPressedChange={handleToggleClickLines}>
                    <TbListNumbers />
                  </Toggle>
                </div>
              </TooltipTrigger>
              <TooltipContent>Show line numbers</TooltipContent>
            </Tooltip>
            <Tooltip placement={`right`}>
              <TooltipTrigger asChild>
                <div>
                  <Toggle size="sm" pressed={toggleStateColor} onPressedChange={handleToggleClickColor}>
                    <IoColorPaletteOutline />
                  </Toggle>
                </div>
              </TooltipTrigger>
              <TooltipContent>Add syntax highlighting</TooltipContent>
            </Tooltip>
            <Tooltip placement={`right`}>
              <TooltipTrigger asChild>
                <div
                  onClick={handleClickCopyIcon}
                  className={`inline-flex h-8 items-center justify-center rounded-md px-2.5 text-sm font-medium ring-offset-background transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground`}
                >
                  <MdContentCopy className="h-4 w-4" />
                </div>
              </TooltipTrigger>
              <TooltipContent>Copy code as LaTeX</TooltipContent>
            </Tooltip>
        </div>
      </div>
    </div>
  )
}

function createCodeJSX(
  currentCode: string[],
  isTextVisible: boolean,
  toggleStateLines: boolean,
  numCodeLines: number,
) {
  return (
    <>
      {currentCode.map((cd, index) => (
        <div key={index}>
          {toggleStateLines && (
            <span
              className={`select-none text-right ${numCodeLines > 9 ? "min-w-10" : "min-w-8"} inline-block pr-1 ${isTextVisible ? "" : "hidden"}`}
            >
              {index + 1}:
            </span>
          )}
          <Markdown
            md={
              isTextVisible ? `${" ".repeat(getAmountLeadingWhiteSpaces(cd))}$${adding015EM(cd)}$` : " "
            }
          />
        </div>
      ))}
    </>
  )
}

/**
 * Adds 0.15em to each line
 *
 * Otherwise the lines are too close to each other
 * For example:
 * 1: \\frac{m}{5}
 * 2: \\frac{m}{5}
 * Those nearly touch
 *
 * @param code
 */
function adding015EM(code: string): string {
  return `${code} \\\\[0.15em]`
}

function getAmountLeadingWhiteSpaces(text: string): number {
  let count = 0
  for (let i = 0; i < text.length; i++) {
    if (text[i] === " ") {
      count++
    } else {
      break
    }
  }
  return count
}

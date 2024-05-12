import { ReactElement, useState } from "react"
import { IoColorPaletteOutline } from "react-icons/io5"
import { MdContentCopy } from "react-icons/md"
import { TbListNumbers } from "react-icons/tb"
import { Markdown } from "@/components/Markdown.tsx"
import { Toaster } from "@/components/ui/toaster"
import { Toggle } from "@/components/ui/toggle.tsx"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/components/ui/use-toast"

export function PseudoCode({ lines }: { lines: string[] }): ReactElement {
  // fist filter all the empty lines
  lines = lines.filter((line) => line.trim() !== "")

  // split the lines into two arrays of lines code[...] color[...] (for coloring)
  // separator is ## ## ## ## ##
  const code = []
  const color = []
  let codeBool = true
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === "## ## ## ## ##") {
      codeBool = false
      continue
    }
    if (codeBool) {
      code.push(lines[i])
    } else {
      color.push(lines[i])
    }
  }
  const codeLines = code.length

  const { toast } = useToast()

  const [toggleStateLines, setToggleStateLines] = useState(true)
  const [toggleStateColor, setToggleStateColor] = useState(true)

  const [isTextVisible, setIsTextVisible] = useState(true)

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
        lines
          .filter((line) => line.trim() !== "")
          .map((line, index) => {
            return `${index + 1}: ${" ".repeat(getAmountLeadingWhiteSpaces(line)) + line}`
          })
          .join("\n"),
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
        <div className="overflow-hidden rounded-lg border border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
          <div style={{ whiteSpace: "nowrap", overflowX: "auto" }}>
            <pre className="overflow-x-auto whitespace-pre py-3 pl-5 pr-10 font-mono leading-7 text-gray-900 dark:text-gray-100">
              {(toggleStateColor ? color : code).map((cd, index) => (
                <div key={index}>
                  <Markdown
                    md={
                      isTextVisible
                        ? `${toggleStateLines ? createLineNumbers({ index, codeLines }) : ""} ${" ".repeat(getAmountLeadingWhiteSpaces(cd))}$${cd}$`
                        : " "
                    }
                  />
                </div>
              ))}
            </pre>
          </div>
        </div>
        <div className="absolute right-1 top-1 flex flex-col items-center space-y-1 rounded-lg dark:border-gray-700 dark:bg-gray-800">
          <Toaster />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Toggle size="sm" pressed={toggleStateLines} onPressedChange={handleToggleClickLines}>
                    <TbListNumbers />
                  </Toggle>
                </div>
              </TooltipTrigger>
              <TooltipContent>Show line numbers</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Toggle size="sm" pressed={toggleStateColor} onPressedChange={handleToggleClickColor}>
                    <IoColorPaletteOutline />
                  </Toggle>
                </div>
              </TooltipTrigger>
              <TooltipContent>Add syntax highlighting</TooltipContent>
            </Tooltip>
            <Tooltip>
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
          </TooltipProvider>
        </div>
      </div>
    </div>
  )
}

function createLineNumbers({ index, codeLines }: { index: number; codeLines: number }) {
  let codeLine = ""
  if (codeLines > 0) {
    codeLine = `${index + 1 >= 10 ? "" : " "}$${index + 1}:$ `
  }
  return `${codeLine}`
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

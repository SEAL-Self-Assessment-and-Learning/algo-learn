import { ReactElement } from "react"
import { IoColorPaletteOutline } from "react-icons/io5"
import { MdContentCopy } from "react-icons/md"
import { TbListNumbers } from "react-icons/tb"
import { Markdown } from "@/components/Markdown.tsx"
import { Toaster } from "@/components/ui/toaster"
import { Toggle } from "@/components/ui/toggle.tsx"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/components/ui/use-toast"

export function PseudoCode({ lines }: { lines: string[] }): ReactElement {
  const { toast } = useToast()

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
        <div className="absolute right-0 top-0 flex flex-col items-center space-y-1">
          <Toaster />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Toggle size="sm" className="mr-1">
                  <TbListNumbers />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent>Show line numbers</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Toggle size="sm" className="mr-1">
                  <IoColorPaletteOutline />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent>Add syntax highlighting</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <button
                  onClick={handleClickCopyIcon}
                  className={`inline-flex h-8 items-center justify-center rounded-md px-2.5 text-sm font-medium ring-offset-background transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground`}
                >
                  <MdContentCopy className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Copy code as LaTeX</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="overflow-hidden rounded-lg border border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
          <pre className="whitespace-pre-wrap break-words py-3 pl-5 pr-10 font-mono leading-relaxed text-gray-900 dark:text-gray-100">
            {lines
              .filter((line) => line.trim() !== "")
              .map((line, index) => (
                <div key={index}>
                  <Markdown
                    md={`$${index + 1}:$ ${" ".repeat(getAmountLeadingWhiteSpaces(line)) + "$" + line + " $"}`}
                  />
                </div>
              ))}
          </pre>
        </div>
      </div>
    </div>
  )
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

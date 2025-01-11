import Fuse from "fuse.js"
import { Option, program } from "@commander-js/extra-typings"
import { collection as globalCollection } from "@settings/questionsSelection"
import type { Parameters } from "@shared/api/Parameters"
import { questionToJSON } from "@shared/api/QuestionGenerator"
import { sampleRandomSeed } from "@shared/utils/random"
import { questionToTex } from "@shared/utils/toLatex"

const Reset = "\x1b[0m"
const Bright = "\x1b[1m"
const Dim = "\x1b[2m"
// const Underscore = "\x1b[4m"
// const Blink = "\x1b[5m"
// const Reverse = "\x1b[7m"
// const Hidden = "\x1b[8m"

const languageOption = new Option("-l, --language <language>", "Language to use")
  .default("en")
  .choices(["en", "de"])

const formatOption = new Option("-f, --format <format>", "Format to use")
  .default("json")
  .choices(["md", "tex", "json"])

program.description(
  `${Bright}Algo-Learn CLI.${Reset}
This command line interface can be used to generate questions in Markdown or LaTeX code.

Example usage:
${Bright}$ bun run src/main.ts list${Reset}
${Bright}$ bun run src/main.ts list-collections${Reset}
${Bright}$ bun run src/main.ts generate stack --parameters '{"variant":"input"}' --format tex --preamble${Reset}`,
)

program
  .command("list-collections")
  .description("list all available collections")
  .addOption(languageOption)
  .action((options) => {
    for (const c of globalCollection) {
      console.log(c.slug, `${Dim}${c.name[options.language]}${Reset}`)
    }
  })

program
  .command("list [collection]")
  .description("list all generators in a collection, or all generators if no collection is given")
  .addOption(languageOption)
  .action((collection, options) => {
    for (const c of globalCollection) {
      if (collection === undefined || c.slug === collection) {
        for (const q of c.contents) {
          console.log(q.id, `${Dim}${q.name(options.language)}${Reset}`)
        }
      }
    }
  })

program
  .command("generate <id>")
  .description("generate a question using the generator with the given id")
  .addOption(languageOption)
  .addOption(formatOption)
  .option("--preamble", "Include preamble (LaTeX only)")
  .option("-p, --parameters [parameters]", "Parameters for the generator, in JSON format")
  .option("-s, --seed <seed>", "Seed for random number generator")
  // .option("--latex", "Do not use LaTeX for the question text")
  .action(async (id, options) => {
    const seed = options.seed ?? sampleRandomSeed()
    const parameters =
      typeof options.parameters === "string" ? (JSON.parse(options.parameters) as Parameters) : {}
    const allQuestions = globalCollection.flatMap((c) => c.contents)
    const q = allQuestions.find((x) => x.id === id)

    if (q === undefined) {
      console.log(`Unknown generator: ${Bright}${id}${Reset}`)
      const fuse = new Fuse(allQuestions.map((x) => x.id))
      const result = fuse.search(id)
      if (result.length > 0) {
        console.log(`Perhaps you meant: ${Bright}${result[0].item}${Reset}`)
      }
      process.exit(1)
    }

    if (q.expectedParameters.length > 0 && Object.keys(parameters).length === 0) {
      console.log(
        "This generator requires parameters, but none were given.\nThe following parameters are required:",
      )
      const exampleParameters: Record<string, string | number | boolean> = {}
      for (const p of q.expectedParameters) {
        if (p.type === "string") {
          console.log(`  ${p.name}:`, p.allowedValues)
          exampleParameters[p.name] = p.allowedValues[0]
        } else if (p.type === "integer") {
          console.log(`  ${p.name}: ${p.min} ≤ x ≤ ${p.max}`)
          exampleParameters[p.name] = p.min
        } else {
          console.log(`  ${p.name}: ${p.type}`)
          exampleParameters[p.name] = true
        }
        if (p.description?.(options.language)) {
          console.log(`  ${Dim}${p.description(options.language)}${Reset}`)
        }
      }

      console.log(
        `Example: ${Bright}bun run src/main.ts generate ${id} --parameters '${JSON.stringify(
          exampleParameters,
        )}'${Reset}`,
      )
      process.exit(1)
    }
    const p = await q.generate(options.language, parameters, seed)

    if (options.format === "tex") {
      if (options.preamble) {
        console.log(`\\documentclass{article}
\\usepackage{listings,xifthen,hyperref}
\\newcounter{exercisenumber}
\\renewcommand{\\theexercisenumber}{\\arabic{exercisenumber}}
  \\NewDocumentEnvironment{exercise}{O{} O{}}{%
    \\begin{trivlist}\\phantomsection\\refstepcounter{exercisenumber}%
    \\item[\\hskip\\labelsep\\bfseries\\smash{\\llap{\\small#2\\normalsize\\ }Exercise~\\theexercisenumber}]%
      \\ifthenelse{\\isempty{#1}}{}{(\\bfseries #1).}
      \\normalfont}{\\end{trivlist}}
\\begin{document}\n\n`)
      }
      console.log(questionToTex(p.question).trim())
      if (options.preamble) {
        console.log(`\n\n\\end{document}`)
      }
    } else if (options.format === "json") {
      console.log(questionToJSON(p.question))
    } else if (options.format === "md") {
      console.log("Path:", `${Bright}${p.question.path}${Reset}`)
      console.log("Name:", `${Bright}${p.question.name}${Reset}`)
      console.log("Type:", `${Bright}${p.question.type}${Reset}`)
      if (!p.question.text) return
      console.log()
      let markdown = p.question.text
      if (p.question.type === "MultipleChoiceQuestion") {
        markdown += "\n\n"
        for (const a of p.question.answers) {
          markdown += `- ${a}\n`
        }
      }
      console.log(markdown)
    }
  })

program.parse()

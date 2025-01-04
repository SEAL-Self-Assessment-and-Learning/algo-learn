import {
  minimalMultipleChoiceFeedback,
  type MultipleChoiceQuestion,
  type QuestionGenerator,
} from "@shared/api/QuestionGenerator.ts"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter.ts"
import { variableNames } from "@shared/question-generators/propositional-logic/utils.ts"
import { Literal } from "@shared/utils/propositionalLogic/propositionalLogic.ts"
import {
  getDisjunctionTermsLevel,
  isDisjunctionInDTL,
  type DisjunctionTerm,
  type DisjunctionTerms,
  type DisjunctionTermsLevel,
} from "@shared/utils/propositionalLogic/resolution.ts"
import Random from "@shared/utils/random.ts"
import { t, tFunctional, type Translations } from "@shared/utils/translations.ts"

const translations: Translations = {
  en: {
    name: "Resolution",
    description: "Resolve clauses to prove logical consistency.",
    text: `Given the following set of disjunction terms: 
    \\[ K \\coloneqq \\bigl\\{ {{0}} \\bigr\\} \\]
    Which of the following disjunction terms can be reached with **at most** $ {{1}} $ step(s)?`,
  },
  de: {},
}

export const Resolution: QuestionGenerator = {
  id: "resolution",
  name: tFunctional(translations, "name"),
  description: tFunctional(translations, "description"),
  tags: [
    "resolution",
    "boolean logic",
    "propositional logic",
    "propositional calculus",
    "satisfiability",
  ],
  license: "MIT",
  languages: ["en", "de"],
  expectedParameters: [
    {
      name: "rounds",
      description: tFunctional(translations, "size"),
      type: "integer",
      min: 1,
      max: 3,
    },
    {
      name: "size",
      description: tFunctional(translations, "size"),
      type: "integer",
      min: 3,
      max: 5,
    },
  ],

  generate: (lang = "en", parameters, seed) => {
    const permalink = serializeGeneratorCall({
      generator: Resolution,
      lang,
      parameters,
      seed,
    })
    const random = new Random(seed)

    const rounds = (parameters.rounds ?? 2) as number
    const numVars = (parameters.size ?? 4) as number
    const varNames = random.choice(variableNames).slice(0, numVars)
    let disjunctionTerms = generateDisjunctionTerms({ random, varNames })
    let dtl: Literal[][][] = getDisjunctionTermsLevel(disjunctionTerms, rounds)
    do {
      disjunctionTerms = generateDisjunctionTerms({ random, varNames })
      dtl = getDisjunctionTermsLevel(disjunctionTerms, rounds)
    } while (dtl[1].length < 2)

    const correctAnswers = getCorrectOptions(random, dtl)
    const falseAnswers = generateFalseOptions(random, dtl, varNames, 6 - correctAnswers.length)
    const combinedAnswers = random.shuffle([...correctAnswers, ...falseAnswers])
    const correctAnswerIndex = correctAnswers.map((x) => combinedAnswers.indexOf(x))

    const question: MultipleChoiceQuestion = {
      type: "MultipleChoiceQuestion",
      path: permalink,
      name: Resolution.name(lang),
      allowMultiple: true,
      text: t(translations, lang, "text", [disjunctionTermsLatex(disjunctionTerms), rounds.toString()]),
      answers: combinedAnswers,
      feedback: minimalMultipleChoiceFeedback({ correctAnswerIndex }),
    }

    return { question }
  },
}

/**
 * Generates a list of false options based on the given DTL structure.
 * @param random
 * @param dtl The original DTL structure (a 3D array of literals).
 * @param varNames A list of variable names to use when generating false options.
 *                 dtl is using the same variable names.
 * @param amount The number of false options to generate.
 * @returns An array of false options formatted as LaTeX strings.
 */
function generateFalseOptions(
  random: Random,
  dtl: DisjunctionTermsLevel,
  varNames: string[],
  amount: number,
): string[] {
  const falseAnswers: Set<string> = new Set<string>()
  const dtlCopy = cloneDTL(dtl)

  while (falseAnswers.size < amount) {
    const randomLevel = selectRandomLevel(random, dtlCopy)
    const randomDisjunctionTerm = selectRandomDisjunctionTerm(random, dtlCopy[randomLevel])
    modifyDisjunctionTerm(random, randomDisjunctionTerm, varNames)
    if (!isDisjunctionInDTL(dtl, randomDisjunctionTerm)) {
      const latexRepresentation = `$${disjunctionTermsLatex([randomDisjunctionTerm])}$`
      falseAnswers.add(latexRepresentation)
    }
  }

  return Array.from(falseAnswers)
}

/**
 * Creates a deep copy of the DTL structure.
 * @param dtl The original DTL structure.
 */
function cloneDTL(dtl: DisjunctionTermsLevel): DisjunctionTermsLevel {
  return dtl.map((level) => level.map((disjunctionTerm) => disjunctionTerm.slice()))
}

/**
 * Selects a random level from the DTL structure, excluding the first level and empty levels.
 * @param random
 * @param dtlCopy A copy of the DTL structure.
 * @returns The index of a selected level.
 */
function selectRandomLevel(random: Random, dtlCopy: DisjunctionTermsLevel): number {
  const validLevels = Array.from({ length: dtlCopy.length }, (_, i) => i).filter(
    (levelIndex) => levelIndex !== 0 && dtlCopy[levelIndex].length > 0,
  )
  return random.choice(validLevels)
}

/**
 * Selects a random disjunction term from a given level in the DTL structure.
 * @param random
 * @param level A level in the DTL structure.
 * @returns A selected disjunction term.
 */
function selectRandomDisjunctionTerm(random: Random, level: DisjunctionTerms): DisjunctionTerm {
  const randomIndex = random.int(0, level.length - 1)
  return level[randomIndex]
}

/**
 * Modifies a disjunction term by either adding or removing a variable.
 * @param random
 * @param disjunctionTerm The disjunctionTerm to modify.
 * @param varNames A list of variable names to use when adding variables.
 */
function modifyDisjunctionTerm(
  random: Random,
  disjunctionTerm: DisjunctionTerm,
  varNames: string[],
): void {
  const shouldAddVariable = determineAddOrRemove(random, disjunctionTerm, varNames)
  if (shouldAddVariable) {
    disjunctionAddVariable(random, disjunctionTerm, varNames)
  } else {
    const removeIndex = random.int(0, disjunctionTerm.length - 1)
    disjunctionTerm.splice(removeIndex, 1)
  }
}

/**
 * Adds a new variable to a disjunction term.
 * No duplicate variables appear.
 * @param random
 * @param disjunctionTerm The disjunctionTerm to modify.
 * @param varNames A list of variable names to use when adding variables.
 */
function disjunctionAddVariable(
  random: Random,
  disjunctionTerm: DisjunctionTerm,
  varNames: string[],
): void {
  const newVarName = random.choice(
    varNames.filter(
      (varName) => disjunctionTerm.filter((literal) => literal.name === varName).length <= 1,
    ),
  )
  let negated = random.bool()
  if (disjunctionTerm.some((literal) => literal.name === newVarName)) {
    negated = !disjunctionTerm.find((literal) => literal.name === newVarName)!.negated
  }
  disjunctionTerm.push(new Literal(newVarName, negated))
}

/**
 * Determines whether to add or remove a variable from a disjunctionTerm.
 * @param random
 * @param disjunctionTerm The disjunctionTerm to modify.
 * @param varNames A list of variable names to use when adding variables.
 * @returns True if a variable should be added, false otherwise.
 */
function determineAddOrRemove(
  random: Random,
  disjunctionTerm: DisjunctionTerm,
  varNames: string[],
): boolean {
  if (disjunctionTerm.length >= varNames.length * 2 - 1) return false
  if (disjunctionTerm.length <= 0) return true
  return random.bool()
}

/**
 * Generates a random subset of correct options based on the given DTL structure.
 * @param random
 * @param dtl
 */
function getCorrectOptions(random: Random, dtl: Literal[][][]): string[] {
  const correctAnswers: Set<string> = new Set<string>()
  if (isDisjunctionInDTL(dtl, [])) {
    correctAnswers.add("$\\{\\}$")
  }
  for (let i = dtl.length - 1; i > 0; i--) {
    for (let _ = 0; _ < dtl[i].length; _++) {
      correctAnswers.add("$" + disjunctionTermsLatex([random.choice(dtl[i])]) + "$")
    }
    if (correctAnswers.size > 4) {
      break
    }
  }
  return random.subset(Array.from(correctAnswers), random.int(1, Math.min(correctAnswers.size, 5)))
}

/**
 * Generates a list of unique disjunction terms, where each term is a list of literals.
 * @param random
 * @param varNames A list of variable names to use for generating literals.
 */
function generateDisjunctionTerms({
  random,
  varNames,
}: {
  random: Random
  varNames: string[]
}): Literal[][] {
  const numTerms = random.int(4, 6) // Number of disjunction terms to generate.
  const disjunctionTerms: Literal[][] = []
  const uniqueTerms: Set<string> = new Set<string>()

  while (disjunctionTerms.length < numTerms) {
    const literals = generateUniqueLiteralSet(random, varNames, uniqueTerms)
    disjunctionTerms.push(literals)
  }

  return disjunctionTerms
}

/**
 * Generates a unique set of literals for a single disjunction term.
 * Ensures the set is unique across all previously generated terms.
 * @param random
 * @param varNames A list of variable names to use for generating literals.
 * @param uniqueTerms A set of JSON strings representing already generated terms.
 */
function generateUniqueLiteralSet(
  random: Random,
  varNames: string[],
  uniqueTerms: Set<string>,
): Literal[] {
  const termSize = random.int(1, varNames.length) // Random size for the disjunction term.
  const selectedVars = generateUniqueVariables(random, varNames, termSize)

  const literals = Array.from(selectedVars)
    .sort()
    .map((varName) => new Literal(varName, random.bool()))

  const literalString = JSON.stringify(literals)
  if (!uniqueTerms.has(literalString)) {
    uniqueTerms.add(literalString)
    return literals
  }

  return generateUniqueLiteralSet(random, varNames, uniqueTerms)
}

/**
 * Selects a unique set of variables for a disjunction term.
 * @param random
 * @param varNames A list of variable names to choose from.
 * @param count The number of variables to select.
 */
function generateUniqueVariables(random: Random, varNames: string[], count: number): Set<string> {
  const selectedVars = new Set<string>()
  while (selectedVars.size < count) {
    const randomVar = varNames[random.int(0, varNames.length - 1)]
    selectedVars.add(randomVar)
  }
  return selectedVars
}

/**
 * Converts a list of disjunction terms to a KaTeX string.
 * Maps each term into a set and this into a bigger set.
 * Sorts the variable names for each term.
 * @param disjunctionTerms
 */
function disjunctionTermsLatex(disjunctionTerms: Literal[][]): string {
  return disjunctionTerms
    .map((term) => {
      const literals = term
        .sort()
        .map((literal) => (literal.negated ? `\\neg ${literal.name}` : literal.name))
        .join(", ")
      return `\\{${literals}\\}`
    })
    .join(", ")
}

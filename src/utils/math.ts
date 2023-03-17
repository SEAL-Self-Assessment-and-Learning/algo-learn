import {
  addDependencies,
  ConfigOptions,
  create,
  divideDependencies,
  formatDependencies,
  FractionDependencies,
  log,
  multiplyDependencies,
  parseDependencies,
  powDependencies,
  simplifyDependencies,
  subtractDependencies,
} from "mathjs"

const config = {
  number: "Fraction",
} as ConfigOptions

// Create just the functions we need
const math = create(
  {
    addDependencies,
    divideDependencies,
    formatDependencies,
    FractionDependencies,
    multiplyDependencies,
    parseDependencies,
    powDependencies,
    simplifyDependencies,
    subtractDependencies,
  },
  config
)

interface Func {
  (arg:any): any //a call signature
  toTex?: string //express of function in object literal
}

const customFunctions = {
  log: ( (a: number, b: number = 2) => log(a) / log(b)) as Func,
}
customFunctions.log.toTex = "\\mathrm{${name}}\\left(${args}\\right)"
math.import(customFunctions)

export default math

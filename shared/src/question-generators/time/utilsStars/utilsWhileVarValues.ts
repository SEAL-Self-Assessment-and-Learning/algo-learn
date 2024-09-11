import {
  allWhileCases,
  BoundsOptions,
  getCompare,
  WhileCompareOptions,
  WhileOrderOptions,
} from "@shared/question-generators/time/utils.ts"
import Random from "@shared/utils/random.ts"

function computeOptionXPlus(
  variableOrder: "xy" | "yx" | "xn",
  random: Random,
  compareOption: "==" | "<" | ">" | "<=" | ">=",
  firstVariableValue: number,
  secondVariableValue: number,
  endValue: number,
) {
  variableOrder = random.choice(["xy", "yx", "xn"])
  if (variableOrder === "xy" || variableOrder == "yx") {
    if (variableOrder == "xy") {
      // case x increases, so needs to be smaller than y (x+c <= y)
      compareOption = getCompare(random, "<")
    } else {
      compareOption = getCompare(random, ">")
    }
    if (compareOption === "==") {
      firstVariableValue = random.int(4, 8)
      secondVariableValue = firstVariableValue
    } else {
      firstVariableValue = random.int(0, 2)
      secondVariableValue = random.int(7, 10)
    }
  } else {
    // same for xn (x+y <= n)
    compareOption = getCompare(random, "<")
    if (compareOption === "==") {
      firstVariableValue = random.int(4, 8)
      endValue = firstVariableValue
    } else {
      firstVariableValue = random.int(0, 2)
      endValue = random.int(7, 10)
    }
  }
  return { variableOrder, compareOption, firstVariableValue, secondVariableValue, endValue }
}

function computeOptionXMultxPlusX(
  variableOrder: "xy" | "yx" | "xn",
  random: Random,
  compareOption: "==" | "<" | ">" | "<=" | ">=",
  firstVariableValue: number,
  secondVariableValue: number,
  endValue: number,
) {
  // xMult and xPlusX have the same logic
  variableOrder = random.choice(["xy", "yx", "xn"])
  if (variableOrder === "xy" || variableOrder === "yx") {
    if (variableOrder === "xy") {
      // cases y is static and x increase to x needs to be smaller than y
      // c*x <= y or x+x <= y
      compareOption = getCompare(random, "<")
    } else {
      compareOption = getCompare(random, ">")
    }
    if (compareOption === "==") {
      firstVariableValue = random.int(4, 8)
      secondVariableValue = firstVariableValue
    } else {
      firstVariableValue = random.int(1, 2) // needs to be at least 1, because 0*c = 0
      secondVariableValue = random.int(7, 10)
    }
  } else {
    // same as above (x*c <=n or x+x <= n)
    compareOption = getCompare(random, "<")
    if (compareOption === "==") {
      firstVariableValue = random.int(4, 8)
      endValue = firstVariableValue
    } else {
      firstVariableValue = random.int(1, 2)
      endValue = random.int(7, 10)
    }
  }
  return { variableOrder, compareOption, firstVariableValue, secondVariableValue, endValue }
}

function computeOptionxSquare(
  variableOrder: "xy" | "yx" | "xn",
  random: Random,
  compareOption: "==" | "<" | ">" | "<=" | ">=",
  firstVariableValue: number,
  secondVariableValue: number,
  endValue: number,
) {
  variableOrder = random.choice(["xy", "yx", "xn"])
  if (variableOrder === "xy" || variableOrder === "yx") {
    if (variableOrder === "xy") {
      // x increases, so it needs to be smaller than (because y is static)
      // x*x <= y
      compareOption = getCompare(random, "<")
    } else {
      compareOption = getCompare(random, ">")
    }
    if (compareOption === "==") {
      firstVariableValue = random.int(4, 8)
      secondVariableValue = firstVariableValue
    } else {
      firstVariableValue = random.int(2, 3) // needs to be at least 2, because 0*0 = 0 and 1*1 = 1
      secondVariableValue = random.int(10, 13) // so at least two iteration if we don't have an end manipulation
    }
  } else {
    // same as above (x*x <= n)
    compareOption = getCompare(random, "<")
    if (compareOption === "==") {
      firstVariableValue = random.int(4, 8)
      endValue = firstVariableValue
    } else {
      firstVariableValue = random.int(2, 3)
      endValue = random.int(10, 13) // at least two iterations (s.a.)
    }
  }
  return { variableOrder, compareOption, firstVariableValue, secondVariableValue, endValue }
}

function computeOptionxMinus(
  variableOrder: "xy" | "yx" | "xn",
  random: Random,
  compareOption: "==" | "<" | ">" | "<=" | ">=",
  firstVariableValue: number,
  secondVariableValue: number,
  endValue: number,
) {
  variableOrder = random.choice(["xy", "yx", "xn"])
  if (variableOrder === "xy" || variableOrder === "yx") {
    if (variableOrder === "xy") {
      // x decreases, so it needs to be larger than y, because y is still static
      // x-c >= y
      compareOption = getCompare(random, ">")
    } else {
      compareOption = getCompare(random, "<")
    }
    if (compareOption === "==") {
      firstVariableValue = random.int(4, 8)
      secondVariableValue = firstVariableValue
    } else {
      // numbers don't matter with enough subtraction x-c -> -inf
      firstVariableValue = random.int(7, 10)
      secondVariableValue = random.int(0, 2)
    }
  } else {
    // same as above (x-c >= n)
    compareOption = getCompare(random, ">")
    if (compareOption === "==") {
      firstVariableValue = random.int(4, 8)
      endValue = firstVariableValue
    } else {
      firstVariableValue = random.int(7, 10)
      endValue = random.int(0, 2)
    }
  }
  return { variableOrder, compareOption, firstVariableValue, secondVariableValue, endValue }
}

function computeOptionxDivXLog(
  variableOrder: "xy" | "yx" | "xn",
  random: Random,
  compareOption: "==" | "<" | ">" | "<=" | ">=",
  firstVariableValue: number,
  secondVariableValue: number,
  endValue: number,
) {
  variableOrder = random.choice(["xy", "yx", "xn"])
  if (variableOrder === "xy" || variableOrder === "yx") {
    if (variableOrder === "xy") {
      // x decreases, so it needs to be larger than y, because y is still static
      // x/c >= y or log2(x) >= y
      compareOption = getCompare(random, ">")
    } else {
      compareOption = getCompare(random, "<")
    }
    if (compareOption === "==") {
      firstVariableValue = random.int(4, 8)
      secondVariableValue = firstVariableValue
    } else {
      // numbers do matter but with enough division x/c -> 0
      // and log2(x) -> 0
      // so the compare variable should be at least 1 because x/c >= 0 will always be true
      firstVariableValue = random.int(8, 12)
      secondVariableValue = random.int(1, 3)
    }
  } else {
    // same as above
    // x/c >= n or log2(x) >= n
    compareOption = getCompare(random, ">")
    if (compareOption === "==") {
      firstVariableValue = random.int(4, 8)
      endValue = firstVariableValue
    } else {
      firstVariableValue = random.int(8, 12)
      // be at least on, because x/c >= 0 will always be true
      endValue = random.int(1, 3)
    }
  }
  return { variableOrder, compareOption, firstVariableValue, secondVariableValue, endValue }
}

function computeOptionxPlusY(
  variableOrder: "xy" | "yx" | "xn",
  compareOption: "==" | "<" | ">" | "<=" | ">=",
  random: Random,
  firstVariableValue: number,
  secondVariableValue: number,
  endValue: number,
) {
  // only xn makes sense
  // x+y <= y will be false after one iteration
  variableOrder = "xn"
  // because x increases and n is static x+y<=n
  compareOption = getCompare(random, "<")
  if (compareOption === "==") {
    firstVariableValue = random.int(4, 8)
    secondVariableValue = random.int(1, 2)
    endValue = firstVariableValue
  } else {
    // x start does not matter (but should be smaller than n)
    firstVariableValue = random.int(0, 2)
    // y should be at least 1 (I have set it to 2-3, so we don't get x+1 ...)
    secondVariableValue = random.int(2, 3)
    endValue = random.int(9, 12)
  }
  return { variableOrder, compareOption, firstVariableValue, secondVariableValue, endValue }
}

function computeOptionxMultY(
  variableOrder: "xy" | "yx" | "xn",
  compareOption: "==" | "<" | ">" | "<=" | ">=",
  random: Random,
  firstVariableValue: number,
  secondVariableValue: number,
  endValue: number,
) {
  // only xn makes sense
  // because x*y <= y will be false after one iteration
  variableOrder = "xn"
  // because x increases and n is static (x*y<=n)
  compareOption = getCompare(random, "<")
  if (compareOption === "==") {
    firstVariableValue = random.int(4, 8)
    secondVariableValue = random.int(2, 3)
    endValue = firstVariableValue
  } else {
    // x needs to start at least at 1 (because 0*c = 0)
    firstVariableValue = random.int(1, 2)
    // y should be at least 2 (because x*1=x) will be endless loop
    secondVariableValue = random.int(2, 3)
    endValue = random.int(8, 12)
  }
  return { variableOrder, compareOption, firstVariableValue, secondVariableValue, endValue }
}

function computeOptionxDivY(
  variableOrder: "xy" | "yx" | "xn",
  random: Random,
  compareOption: "==" | "<" | ">" | "<=" | ">=",
  firstVariableValue: number,
  secondVariableValue: number,
  endValue: number,
) {
  variableOrder = random.choice(["xy", "yx", "xn"])
  if (variableOrder === "xy" || variableOrder === "yx") {
    if (variableOrder == "xy") {
      // x decreases, so it needs to be larger than y, because y is still static
      // x/y >= y (example 10/2 >= 2)
      compareOption = getCompare(random, ">")
    } else {
      compareOption = getCompare(random, "<")
    }
    if (compareOption === "==") {
      firstVariableValue = random.int(4, 8)
      secondVariableValue = firstVariableValue
    } else {
      // x needs to be greater than y, y at least 2 (because x/1=x) will be endless loop
      firstVariableValue = random.int(8, 12)
      secondVariableValue = random.int(2, 3)
    }
  } else {
    // same as above
    // x/y >= n
    compareOption = getCompare(random, ">")
    if (compareOption === "==") {
      firstVariableValue = random.int(4, 8)
      secondVariableValue = random.int(2, 3)
      endValue = firstVariableValue
    } else {
      firstVariableValue = random.int(8, 12)
      // at least two, to have a sensible division
      secondVariableValue = random.int(2, 3)
      // at least 1, because x/y >= 0 will always be true
      endValue = random.int(1, 3)
    }
  }
  return { variableOrder, compareOption, firstVariableValue, secondVariableValue, endValue }
}

function computeOptionxMinusYxMinusYPlus(
  variableOrder: "xy" | "yx" | "xn",
  random: Random,
  whileCaseOption: string,
  compareOption: "==" | "<" | ">" | "<=" | ">=",
  firstVariableValue: number,
  secondVariableValue: number,
  endValue: number,
) {
  // case xMinusY (y is static, and we decrease x by y) all three make
  // case xMinusYPlus (y increases with addition, and we decrease x with subtraction)
  variableOrder = random.choice(whileCaseOption === "xMinusY" ? ["xy", "yx", "xn"] : ["xy", "yx"])
  if (variableOrder === "xy" || variableOrder === "yx") {
    if (variableOrder == "xy") {
      // in both cases x decreases (the one case y is either static or increases)
      // so x-y >= y or x-c >= y-c
      compareOption = getCompare(random, ">")
    } else {
      compareOption = getCompare(random, "<")
    }
    if (compareOption === "==") {
      firstVariableValue = random.int(4, 8)
      secondVariableValue = firstVariableValue
    } else {
      // x > y (y at least 1) otherwise x-y = x
      firstVariableValue = random.int(7, 10) + (whileCaseOption === "xMinusYPlus" ? 3 : 0) // add 3 so we get more iterations
      secondVariableValue = random.int(1, 3)
    }
  } else {
    // so x-y >= n
    compareOption = getCompare(random, ">")
    if (compareOption === "==") {
      firstVariableValue = random.int(4, 8)
      secondVariableValue = random.int(1, 3)
      endValue = firstVariableValue
    } else {
      // x > n and y at least 1
      firstVariableValue = random.int(7, 10)
      secondVariableValue = random.int(1, 3)
      endValue = random.int(1, 3)
    }
  }
  return { variableOrder, compareOption, firstVariableValue, secondVariableValue, endValue }
}

function computeOptionxMinusYMultxDivYPlusxDivYMult(
  variableOrder: "xy" | "yx" | "xn",
  random: Random,
  compareOption: "==" | "<" | ">" | "<=" | ">=",
  firstVariableValue: number,
  secondVariableValue: number,
  whileCaseOption: string,
  endValue: number,
) {
  variableOrder = random.choice(["xy", "yx", "xn"])
  if (variableOrder === "xy" || variableOrder === "yx") {
    if (variableOrder == "xy") {
      // in all three cases x decreases and y increases
      // so x > y
      compareOption = getCompare(random, ">")
    } else {
      compareOption = getCompare(random, "<")
    }
    if (compareOption === "==") {
      firstVariableValue = random.int(4, 8)
      secondVariableValue = firstVariableValue
    } else {
      // x starts higher than y
      // case xDiv add 3 for more iterations
      firstVariableValue = random.int(7, 10) + (whileCaseOption.indexOf("xDiv") !== -1 ? 3 : 0)
      // cases YMult -> startVar2 at least 1
      secondVariableValue = random.int(0, 2) + (whileCaseOption.indexOf("Mult") !== -1 ? 1 : 0)
    }
  } else {
    // x decreases -> x >= n
    compareOption = getCompare(random, ">")
    if (compareOption === "==") {
      firstVariableValue = random.int(4, 8)
      secondVariableValue = random.int(1, 3)
      endValue = firstVariableValue
    } else {
      // case xDiv add 3 for more iterations
      firstVariableValue = random.int(7, 10) + (whileCaseOption.indexOf("xDiv") !== -1 ? 3 : 0)
      // case yMult value at least 1 for sensible multiplication
      secondVariableValue = random.int(0, 2) + (whileCaseOption.indexOf("Mult") !== -1 ? 1 : 0)
      // case xDiv endValue at least 1 cause x/c >= 0 always true
      endValue = random.int(0, 2) + (whileCaseOption.indexOf("Div") !== -1 ? 1 : 0)
    }
  }
  return { variableOrder, compareOption, firstVariableValue, secondVariableValue, endValue }
}

function computeOptionxMinusYYPlus(
  variableOrder: "xy" | "yx" | "xn",
  random: Random,
  compareOption: "==" | "<" | ">" | "<=" | ">=",
  firstVariableValue: number,
  secondVariableValue: number,
  endValue: number,
) {
  variableOrder = random.choice(["xy", "yx", "xn"])
  if (variableOrder === "xy" || variableOrder === "yx") {
    if (variableOrder == "xy") {
      // x decreases by y and y increases by c
      // x-y >= y+c
      compareOption = getCompare(random, ">")
    } else {
      compareOption = getCompare(random, "<")
    }
    if (compareOption === "==") {
      firstVariableValue = random.int(5, 15)
      secondVariableValue = firstVariableValue
    } else {
      // high start value for more iterations
      firstVariableValue = random.int(15, 20)
      // doesn't matter where it starts
      secondVariableValue = random.int(0, 2)
    }
  } else {
    // x-y >= n with y+c
    compareOption = getCompare(random, ">")
    if (compareOption === "==") {
      firstVariableValue = random.int(5, 15)
      secondVariableValue = random.weightedChoice([
        [0, 0.8],
        [1, 0.2],
      ]) // so we maybe get an iteration at the while even though ==
      endValue = firstVariableValue
    } else {
      firstVariableValue = random.int(15, 20)
      secondVariableValue = random.int(0, 2)
      // because of subtraction x-y -> -inf
      endValue = random.int(0, 3)
    }
  }
  return { variableOrder, compareOption, firstVariableValue, secondVariableValue, endValue }
}

function computeOptionbothPlusbothMult(
  endManipulation: BoundsOptions,
  variableOrder: "xy" | "yx" | "xn",
  random: Random,
  compareOption: "==" | "<" | ">" | "<=" | ">=",
  firstVariableValue: number,
  secondVariableValue: number,
  whileCaseOption: string,
) {
  // not endManipulation, because the runtime could be too long
  // x=9, y=1
  // while x*x or 3*x < y
  //  x = x+3
  //  y = y+4
  // this example takes quite a while to finish
  endManipulation = "none"
  variableOrder = random.choice(["xy", "yx"])
  // x should increase slower, so it starts higher
  if (variableOrder === "xy" || variableOrder === "yx") {
    if (variableOrder == "xy") {
      compareOption = getCompare(random, ">")
    } else {
      compareOption = getCompare(random, "<")
    }
    if (compareOption === "==") {
      firstVariableValue = random.int(4, 8)
      secondVariableValue = firstVariableValue
    } else {
      // x starts higher than
      firstVariableValue = random.int(7, 10)
      // if Mult, y at least 1 otherwise doesn't matter
      secondVariableValue = random.int(0, 2) + (whileCaseOption === "bothMult" ? 1 : 0)
    }
  }
  return { endManipulation, variableOrder, compareOption, firstVariableValue, secondVariableValue }
}

function computeOptionBothMinus(
  endManipulation: BoundsOptions,
  variableOrder: "xy" | "yx" | "xn",
  random: Random,
  compareOption: "==" | "<" | ">" | "<=" | ">=",
  firstVariableValue: number,
  secondVariableValue: number,
) {
  endManipulation = "none"
  variableOrder = random.choice(["xy", "yx"])
  if (variableOrder === "xy" || variableOrder === "yx") {
    if (variableOrder == "xy") {
      // x decreases faster, so it starts higher
      compareOption = getCompare(random, ">")
    } else {
      compareOption = getCompare(random, "<")
    }
    if (compareOption === "==") {
      firstVariableValue = random.int(4, 8)
      secondVariableValue = firstVariableValue
    } else {
      // values are not important here
      firstVariableValue = random.int(7, 10)
      secondVariableValue = random.int(0, 2)
    }
  }
  return { endManipulation, variableOrder, compareOption, firstVariableValue, secondVariableValue }
}

export function computeStartEndVarsWhile(random: Random) {
  const whileCaseOption = random.choice(allWhileCases)

  let firstVariableValue: number = -10
  let secondVariableValue: number = -10
  let endValue: number = -10
  let compareOption: WhileCompareOptions = "<"
  let variableOrder: WhileOrderOptions = "xn"

  const endManipulationOptions: BoundsOptions[] = [
    "none",
    { type: "mult", value: random.int(2, 3) },
    { type: "square", abs: true },
    { type: "log", value: 2 },
  ]

  // if manipulation is square we calculate abs(x)*x, so we keep the negative number
  let endManipulation: BoundsOptions = random.weightedChoice([
    [endManipulationOptions[0], 0.6],
    [endManipulationOptions[1], 0.15],
    [endManipulationOptions[2], 0.15],
    [endManipulationOptions[3], 0.1],
  ])

  if (whileCaseOption === "xPlus") {
    const _ = computeOptionXPlus(
      variableOrder,
      random,
      compareOption,
      firstVariableValue,
      secondVariableValue,
      endValue,
    )
    variableOrder = _.variableOrder
    compareOption = _.compareOption
    firstVariableValue = _.firstVariableValue
    secondVariableValue = _.secondVariableValue
    endValue = _.endValue
  }
  if (whileCaseOption === "xMult" || whileCaseOption === "xPlusX") {
    const _ = computeOptionXMultxPlusX(
      variableOrder,
      random,
      compareOption,
      firstVariableValue,
      secondVariableValue,
      endValue,
    )
    variableOrder = _.variableOrder
    compareOption = _.compareOption
    firstVariableValue = _.firstVariableValue
    secondVariableValue = _.secondVariableValue
    endValue = _.endValue
  }
  if (whileCaseOption === "xSquare") {
    const _ = computeOptionxSquare(
      variableOrder,
      random,
      compareOption,
      firstVariableValue,
      secondVariableValue,
      endValue,
    )
    variableOrder = _.variableOrder
    compareOption = _.compareOption
    firstVariableValue = _.firstVariableValue
    secondVariableValue = _.secondVariableValue
    endValue = _.endValue
  }
  if (whileCaseOption === "xMinus") {
    const _ = computeOptionxMinus(
      variableOrder,
      random,
      compareOption,
      firstVariableValue,
      secondVariableValue,
      endValue,
    )
    variableOrder = _.variableOrder
    compareOption = _.compareOption
    firstVariableValue = _.firstVariableValue
    secondVariableValue = _.secondVariableValue
    endValue = _.endValue
  }
  if (whileCaseOption === "xDiv" || whileCaseOption === "xLog") {
    const _ = computeOptionxDivXLog(
      variableOrder,
      random,
      compareOption,
      firstVariableValue,
      secondVariableValue,
      endValue,
    )
    variableOrder = _.variableOrder
    compareOption = _.compareOption
    firstVariableValue = _.firstVariableValue
    secondVariableValue = _.secondVariableValue
    endValue = _.endValue
  }
  if (whileCaseOption === "xPlusY") {
    const _ = computeOptionxPlusY(
      variableOrder,
      compareOption,
      random,
      firstVariableValue,
      secondVariableValue,
      endValue,
    )
    variableOrder = _.variableOrder
    compareOption = _.compareOption
    firstVariableValue = _.firstVariableValue
    secondVariableValue = _.secondVariableValue
    endValue = _.endValue
  }
  if (whileCaseOption === "xMultY") {
    const _ = computeOptionxMultY(
      variableOrder,
      compareOption,
      random,
      firstVariableValue,
      secondVariableValue,
      endValue,
    )
    variableOrder = _.variableOrder
    compareOption = _.compareOption
    firstVariableValue = _.firstVariableValue
    secondVariableValue = _.secondVariableValue
    endValue = _.endValue
  }
  if (whileCaseOption === "xDivY") {
    const _ = computeOptionxDivY(
      variableOrder,
      random,
      compareOption,
      firstVariableValue,
      secondVariableValue,
      endValue,
    )
    variableOrder = _.variableOrder
    compareOption = _.compareOption
    firstVariableValue = _.firstVariableValue
    secondVariableValue = _.secondVariableValue
    endValue = _.endValue
  }
  if (whileCaseOption === "xMinusY" || whileCaseOption === "xMinusYPlus") {
    const _ = computeOptionxMinusYxMinusYPlus(
      variableOrder,
      random,
      whileCaseOption,
      compareOption,
      firstVariableValue,
      secondVariableValue,
      endValue,
    )
    variableOrder = _.variableOrder
    compareOption = _.compareOption
    firstVariableValue = _.firstVariableValue
    secondVariableValue = _.secondVariableValue
    endValue = _.endValue
  }
  if (
    whileCaseOption === "xMinusYMult" ||
    whileCaseOption === "xDivYPlus" ||
    whileCaseOption === "xDivYMult"
  ) {
    const _ = computeOptionxMinusYMultxDivYPlusxDivYMult(
      variableOrder,
      random,
      compareOption,
      firstVariableValue,
      secondVariableValue,
      whileCaseOption,
      endValue,
    )
    variableOrder = _.variableOrder
    compareOption = _.compareOption
    firstVariableValue = _.firstVariableValue
    secondVariableValue = _.secondVariableValue
    endValue = _.endValue
  }
  if (whileCaseOption === "xMinusYYPlus") {
    const _ = computeOptionxMinusYYPlus(
      variableOrder,
      random,
      compareOption,
      firstVariableValue,
      secondVariableValue,
      endValue,
    )
    variableOrder = _.variableOrder
    compareOption = _.compareOption
    firstVariableValue = _.firstVariableValue
    secondVariableValue = _.secondVariableValue
    endValue = _.endValue
  }
  if (whileCaseOption === "bothPlus" || whileCaseOption === "bothMult") {
    const _ = computeOptionbothPlusbothMult(
      endManipulation,
      variableOrder,
      random,
      compareOption,
      firstVariableValue,
      secondVariableValue,
      whileCaseOption,
    )
    endManipulation = _.endManipulation
    variableOrder = _.variableOrder
    compareOption = _.compareOption
    firstVariableValue = _.firstVariableValue
    secondVariableValue = _.secondVariableValue
  }
  if (whileCaseOption === "bothMinus") {
    const _ = computeOptionBothMinus(
      endManipulation,
      variableOrder,
      random,
      compareOption,
      firstVariableValue,
      secondVariableValue,
    )
    endManipulation = _.endManipulation
    variableOrder = _.variableOrder
    compareOption = _.compareOption
    firstVariableValue = _.firstVariableValue
    secondVariableValue = _.secondVariableValue
  }

  return {
    firstVariableValue,
    secondVariableValue,
    endValue,
    variableOrder,
    compareOption,
    whileCaseOption,
    endManipulation,
  }
}

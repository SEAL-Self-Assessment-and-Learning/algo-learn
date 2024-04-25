import { Language } from "@shared/api/Language.ts"
import { validateParameters } from "@shared/api/Parameters.ts"
import {
  FreeTextFeedbackFunction,
  minimalMultipleChoiceFeedback,
  MultiFreeTextFormatFunction,
  Question,
  QuestionGenerator,
} from "@shared/api/QuestionGenerator.ts"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter.ts"
import { Stack } from "@shared/question-generators/StackQueue/Stack.ts"
import Random from "@shared/utils/random.ts"
import { t, tFunction, tFunctional, Translations } from "@shared/utils/translations.ts"

const translations: Translations = {
  en: {
    name: "Stack-Implementation using an Array",
    description: "Basic questions to test the understanding of Stacks",
    solutionFreetext: "|Index|Question|Solution|\n{{0}}",
    performOperations: `**We perform the following operations:**{{0}}`,
    checkFormat: "Please only enter a number.",
    checkFormatArray: "Please only enter numbers separated by commas.",
    checkFormatJSON: "Error! It has to be passed a valid JSON type.",
    dynamic: "dynamic",
    notDynamic: "not dynamic",
    stackEmpty: "Currently the stack is empty.",
    stackContainsValues: `The stack currently contains the following elements:`,
    multipleChoiceText:
      `Consider having a **{{0}} Stack "{{1}}"**, who can store at most` +
      " ${{2}}$ " +
      `elements. 
{{3}}
       **We perform the following operations:**
{{4}}
    **What can we definitely say about the stack?**
    `,
    freeTextInput:
      `Consider having a **{{0}} Stack "{{1}}"**, who can store at most` +
      " ${{2}}$ " +
      `elements. {{3}}
    **We perform the following operations:**
{{4}}
    `,
  },
  de: {
    name: "Implementierung eines Stacks mit einem Array",
    description: "Basisfragen zum Testen des Verständnisses von Stacks",
    solutionFreetext: "|Index|Frage|Lösung|\n{{0}}",
    performOperations: `**Wir führen nun folgende Operationen aus:**{{0}}`,
    dynamic: "dynamisch",
    notDynamic: "nicht dynamisch",
    checkFormat: "Bitte gib nur Zahlen ein.",
    checkFormatArray: "Bitte gib nur Zahlen getrennt durch Kommas ein.",
    checkFormatJSON: "Error! It has to be passed a valid JSON type.",
    stackEmpty: "Der Stack ist aktuell leer.",
    stackContainsValues: `Der Stack enthält aktuell folgende Elemente:`,
    multipleChoiceText:
      `Angenommen Sie haben einen **{{0}} Stack "{{1}}"**, welcher maximal` +
      " ${{2}}$ " +
      `Elemente speichern kann. 
{{3}}
       **Wir führen nun folgende Operationen aus:** 
{{4}}
    **Welche Aussagen können wir nun über den Stack treffen?**`,
  },
}

const answerOptionList: Translations = {
  en: {
    overFlowErrorV1: "We get an overflow error",
    overFlowErrorV2: "We insert more elements into the Stack {{0}} than it could store",
    overFlowErrorV1N: "We don't get an overflow error",
    stackFullV1: "The Stack {{0}} is full",
    stackFullV1N: "The Stack {{0}} is not full",
    stackEmptyV1: "The Stack {{0}} is empty",
    stackEmptyV1N: "The Stack {{0}} is not empty",
    bottomElementV1: "In the Stack {{0}} the bottom element is {{1}}",
    topElementV1: "The top element of the Stack {{0}} is {{1}}",
    couldStoreElementsV1: "The Stack {{0}} could store {{1}} elements",
    currentlyStoreElementsV1S: "The Stack {{0}} currently stores {{1}} element",
    currentlyStoreElementsV1P: "The Stack {{0}} currently stores {{1}} element",
    pushMoreCouldStoreV1S:
      "Pushing {{0}} value onto the Stack {{1}} will increase the number of elements stored by {{0}}",
    pushMoreCouldStoreV1P:
      "Pushing {{0}} values onto the Stack {{1}} will increase the number of elements stored by {{0}}",
    pushMoreCouldStoreV1NS:
      "Pushing {{0}} value onto the Stack {{1}} will not increase the number of elements stored",
    pushMoreCouldStoreV1NP:
      "Pushing {{0}} values onto the Stack {{1}} will not increase the number of elements stored",
    pushMoreCouldIncrSizeV1S:
      "Pushing {{0}} value onto the Stack {{1}} will increase the size of the Stack to {{2}}",
    pushMoreCouldIncrSizeV1P:
      "Pushing {{0}} values onto the Stack {{1}} will increase the size of the Stack to {{2}}",
    pushMoreCouldIncrSizeV1NS:
      "Pushing {{0}} value onto the Stack {{1}} will not increase the size of the Stack",
    pushMoreCouldIncrSizeV1NP:
      "Pushing {{0}} values onto the Stack {{1}} will not increase the size of the Stack",
    popForQuaterV1S: "Popping {{0}} value from the Stack {{1}} will divide the size by 4",
    popForQuaterV1P: "Popping {{0}} values from the Stack {{1}} will divide the size by 4",
    minElementV1: "The minimum element in the Stack {{0}} is {{1}}",
    toStringV1: "The Stack {{0}} is currently {{1}}",
  },
  de: {
    overFlowErrorV1: "Wir bekommen einen Overflow Fehler",
    overFlowErrorV2: "Wir fügen mehr Elemente in den Stack {{0}} ein, als er speichern könnte",
    overFlowErrorV1N: "Wir bekommen keinen Overflow Fehler",
    stackFullV1: "Der Stack {{0}} ist voll",
    stackFullV1N: "Der Stack {{0}} ist nicht voll",
    stackEmptyV1: "Der Stack {{0}} ist leer",
    stackEmptyV1N: "Der Stack {{0}} ist nicht leer",
    bottomElementV1: "Im Stack {{0}} ist das unterste Element {{1}}",
    topElementV1: "Das oberste Element des Stacks {{0}} ist {{1}}",
    couldStoreElementsV1: "Der Stack {{0}} könnte {{1}} Elemente speichern",
    currentlyStoreElementsV1S: "Der Stack {{0}} speichert aktuell {{1}} Element",
    currentlyStoreElementsV1P: "Der Stack {{0}} speichert aktuell {{1}} Elemente",
    pushMoreCouldStoreV1S:
      "Das Pushen von einem Element auf den Stack {{1}} wird die Anzahl der gespeicherten Elemente um {{0}} erhöhen",
    pushMoreCouldStoreV1P:
      "Das Pushen von {{0}} Elementen auf den Stack {{1}} wird die Anzahl der gespeicherten Elemente um {{0}} erhöhen",
    pushMoreCouldStoreV1NS:
      "Das Pushen von einem Element auf den Stack {{1}} wird die Anzahl der gespeicherten Elemente nicht erhöhen",
    pushMoreCouldStoreV1NP:
      "Das Pushen von {{0}} Elementen auf den Stack {{1}} wird die Anzahl der gespeicherten Elemente nicht erhöhen",
    pushMoreCouldIncrSizeV1S:
      "Das Pushen von einem Element auf den Stack {{1}} wird die Größe des Stacks auf {{2}} erhöhen",
    pushMoreCouldIncrSizeV1P:
      "Das Pushen von {{0}} Elementen auf den Stack {{1}} wird die Größe des Stacks auf {{2}} erhöhen",
    pushMoreCouldIncrSizeV1NS:
      "Das Pushen von einem Element auf den Stack {{1}} wird die Größe des Stacks nicht erhöhen",
    pushMoreCouldIncrSizeV1NP:
      "Das Pushen von {{0}} Elementen auf den Stack {{1}} wird die Größe des Stacks nicht erhöhen",
    popForQuaterV1S: "Das poppen von einem Element vom Stack {{1}} wird die Größe um 4 teilen",
    popForQuaterV1P: "Das poppen von {{0}} Elementen vom Stack {{1}} wird die Größe um 4 teilen",
    minElementV1: "Das kleinste Element im Stack {{0}} ist {{1}}",
    toStringV1: "Der Stack {{0}} ist aktuell {{1}}",
  },
}

/**
 * This function generates the operations for the stack
 * @param elements  The elements to push onto the stack before generating operations
 *                  Those are the start values
 * @param stackSize The size of the stack at the beginning
 * @param resize   If the stack is dynamic or not
 * @param increase If the stack should increase or decrease
 * @param stackOverFlowError If we want to get an overflow error
 * @param stackName The name of the stack
 * @param random
 */
function generateOperationsStack(
  elements: number[],
  stackSize: number,
  resize: boolean,
  increase: boolean,
  stackOverFlowError: boolean,
  stackName: string,
  random: Random,
) {
  const stack: Stack = new Stack(stackSize, stackOverFlowError ? true : resize)
  for (const value of elements) {
    stack.push(value)
  }
  stack.setSize(stackSize) // set size to stack size

  let operations: string[] = []
  // Differ between the two cases
  // if true, create an operation list, in which we exceed the max array size
  if (stackOverFlowError) {
    const missingElements = stack.getSize() - stack.getCurrentPosition()
    const amountOperations = random.int(missingElements + 1, missingElements + 3)
    for (let i = 0; i < amountOperations; i++) {
      operations.push(stackName + ".push(" + random.int(1, 20) + ")")
    }
    for (let i = 0; i < amountOperations - missingElements - 1; i++) {
      random.weightedChoice([
        [true, 0.15],
        [false, 0.85],
      ])
        ? operations.push(stackName + ".push(" + random.int(1, 20) + ")")
        : operations.push(stackName + ".getTop()")
    }
    operations = random.shuffle(operations)
    // do those operations until we get an overflow error
    for (let i = 0; i < operations.length; i++) {
      const value = operations[i].match(/\((.*?)\)/)
      if (value !== null) {
        if (operations[i].includes("push")) {
          // get the value from inside the ()
          stack.push(parseInt(value[1])) // possible to push, because we theoretically have space
        } else {
          stack.getTop() // possible to pop, because we have elements
        }
      }
    }
  } else {
    const numOfOperations = random.int(4, 8)
    for (let i = 0; i < numOfOperations; i++) {
      // if there are no elements in the stack, we can only push, or the stack is full
      // and no resizing allowed then only pop, otherwise 50% for each push or pop
      const pushOrPop =
        stack.getCurrentPosition() === 0
          ? true
          : !resize && stack.getCurrentPosition() === stackSize - 1
            ? false
            : increase // if we want to increase the stack, we push more often (resizing to new size)
              ? random.weightedChoice([
                  [true, 0.7],
                  [false, 0.3],
                ])
              : random.weightedChoice([
                  [true, 0.25],
                  [false, 0.75],
                ])

      if (pushOrPop) {
        const pushValue = random.int(1, 20)
        operations.push(stackName + ".push(" + pushValue + ")")
        stack.push(pushValue)
      } else {
        operations.push(stackName + ".getTop()")
        stack.getTop()
      }
    }
  }

  return {
    operations: operations,
    stack: stack,
  }
}

function generateOperationsFreetextStack(
  elements: number[],
  stackSize: number,
  resize: boolean,
  random: Random,
) {
  const stack: Stack = new Stack(stackSize, resize)
  // initialize the stack with the elements
  for (const value of elements) {
    stack.push(value)
  }
  stack.setSize(stackSize) // set size to stack size

  function ppORsizeDecider(lastOperation: { [key: string]: string }, i: number): boolean {
    let ppORsize = random.weightedChoice([
      [true, 0.2],
      [false, 0.8],
    ])
    if (i > 0) {
      if (
        Object.prototype.hasOwnProperty.call(lastOperation, "size") ||
        Object.prototype.hasOwnProperty.call(lastOperation, "amount")
      ) {
        ppORsize = false
      }
    }
    return ppORsize
  }

  const operations: { [key: string]: string }[] = []

  const numOfOperations = random.int(4, 8)
  if (!resize) {
    for (let i = 0; i < numOfOperations; i++) {
      // decide if we want to ask for current number of elements or current size
      const ppORsize = ppORsizeDecider(operations[i - 1], i)
      // if true -> push or pop if false -> current size of current number of elements
      if (ppORsize) {
        const sizeOrAmount = random.choice([true, false])
        // if true -> getSize() if false -> getCurrentPosition()
        if (sizeOrAmount) {
          operations.push({ size: stack.getSize().toString() })
        } else {
          operations.push({ amount: stack.getCurrentPosition().toString() })
        }
      } else {
        // if there are no elements in the stack, we can only push, or the stack is full
        // and no resizing allowed then only pop, otherwise 50% for each push or pop
        const pushOrPop =
          stack.getCurrentPosition() === 0
            ? true
            : !resize && stack.getCurrentPosition() === stackSize - 1
              ? false
              : random.weightedChoice([
                  [true, 0.5],
                  [false, 0.5],
                ])

        if (pushOrPop) {
          const pushValue = random.int(1, 20)
          operations.push({ push: pushValue.toString() })
          stack.push(pushValue)
        } else {
          const topValue = stack.getTop()
          operations.push({ getTop: topValue.toString() })
        }
      }
    }
  } else {
    const increase = random.weightedChoice([
      [true, stack.getCurrentPosition()],
      [false, stack.getSize() - stack.getCurrentPosition()],
    ])
    for (let i = 0; i < numOfOperations; i++) {
      // decide if we want to ask for current number of elements or current size
      const ppORsize = ppORsizeDecider(operations[i - 1], i)
      // if true -> push or pop if false -> current size of current number of elements
      if (ppORsize) {
        const sizeOrAmount = random.choice([true, false])
        // if true -> getSize() if false -> getCurrentPosition()
        if (sizeOrAmount) {
          operations.push({ size: stack.getSize().toString() })
        } else {
          operations.push({ amount: stack.getCurrentPosition().toString() })
        }
      } else {
        let pushOrPop = increase
          ? random.weightedChoice([
              [true, 0.7],
              [false, 0.3],
            ])
          : random.weightedChoice([
              [true, 0.25],
              [false, 0.75],
            ])
        if (stack.getCurrentPosition() === 0) pushOrPop = true
        if (pushOrPop) {
          const pushValue = random.int(1, 20)
          operations.push({ push: pushValue.toString() })
          stack.push(pushValue)
        } else {
          const topValue = stack.getTop()
          operations.push({ getTop: topValue.toString() })
        }
      }
    }
  }

  return {
    operations,
    stack,
  }
}

/**
 * This function generates the answers for the stack (which are correct) using options from answerOptionList
 * @param stack
 * @param stackOverflowError
 * @param dynamic
 * @param stackName
 * @param random
 * @param lang
 */
function generateCorrectAnswersStack(
  stack: Stack,
  stackOverflowError: boolean,
  dynamic: boolean,
  stackName: string,
  random: Random,
  lang: Language,
) {
  const answers: Set<string> = new Set<string>()
  if (stackOverflowError) {
    answers.add(
      t(answerOptionList, lang, random.choice(["overFlowErrorV1", "overFlowErrorV2"]), [stackName]),
    )
    /*
    random.choice([true, false])
      ? answers.push(
          `If the Stack ${stackName} would have been dynamic, it could store ${stack.getSize()} now.`,
        )
      : null
     */
    // more correct answers here???
  } else {
    if (stack.getCurrentPosition() === stack.getSize()) {
      answers.add(t(answerOptionList, lang, "stackFullV1", [stackName]))
    }
    if (stack.getCurrentPosition() === 0) {
      answers.add(t(answerOptionList, lang, "stackEmptyV1", [stackName]))
    } else {
      answers.add(
        t(answerOptionList, lang, "bottomElementV1", [stackName, stack.getStack()[0].toString()]),
      )
      answers.add(t(answerOptionList, lang, "topElementV1", [stackName, stack.getTopValue().toString()]))
      answers.add(t(answerOptionList, lang, "minElementV1", [stackName, stack.getMin().toString()]))
    }

    answers.add(
      t(answerOptionList, lang, "couldStoreElementsV1", [stackName, stack.getSize().toString()]),
    )
    answers.add(
      t(
        answerOptionList,
        lang,
        stack.getCurrentPosition() === 1 ? "currentlyStoreElementsV1S" : "currentlyStoreElementsV1P",
        [stackName, stack.getCurrentPosition().toString(), stack.getCurrentPosition() === 1 ? "" : "s"],
      ),
    )
    if (dynamic) {
      const increaseValue = stack.getSize() - stack.getCurrentPosition() + random.int(1, 3)
      answers.add(
        t(
          answerOptionList,
          lang,
          increaseValue === 1 ? "pushMoreCouldStoreV1S" : "pushMoreCouldStoreV1P",
          [increaseValue.toString(), stackName],
        ),
      )
      answers.add(
        t(
          answerOptionList,
          lang,
          increaseValue === 1 ? "pushMoreCouldIncrSizeV1S" : "pushMoreCouldIncrSizeV1P",
          [increaseValue.toString(), stackName, (stack.getSize() * 2).toString()],
        ),
      )
      if (stack.getSize() >= 4) {
        const quaterValue = stack.getCurrentPosition() - Math.floor(stack.getSize() / 4) + 1
        answers.add(
          t(answerOptionList, lang, quaterValue === 1 ? "popForQuaterV1S" : "popForQuaterV1P", [
            quaterValue.toString(),
            stackName,
          ]),
        )
      }
    }

    answers.add(t(answerOptionList, lang, "toStringV1", [stackName, stack.getStack().toString()]))
  }
  const answerList: string[] = Array.from(answers)
  // Only Shuffle the answers
  return random.shuffle(answerList)
}

/**
 * This function generates the wrong answers for the stack using options from answerOptionList
 * @param stack
 * @param stackOverflowError
 * @param dynamic
 * @param stackName
 * @param random
 * @param lang
 * @param amount
 */
function generateWrongAnswerStack(
  stack: Stack,
  stackOverflowError: boolean,
  dynamic: boolean,
  stackName: string,
  random: Random,
  lang: Language,
  amount: number,
): string[] {
  const wrongAnswers: Set<string> = new Set<string>()
  // either the wrong option we get or we don't get an overflow error
  if (stackOverflowError) {
    wrongAnswers.add(t(answerOptionList, lang, "overFlowErrorV1N"))
  } else {
    wrongAnswers.add(
      t(answerOptionList, lang, random.choice(["overFlowErrorV1", "overFlowErrorV2"]), [stackName]),
    )
  }

  wrongAnswers.add(
    t(answerOptionList, lang, "couldStoreElementsV1", [stackName, (stack.getSize() * 2).toString()]),
  )

  wrongAnswers.add(
    t(
      answerOptionList,
      lang,
      stack.getCurrentPosition() + 1 === 1 ? "currentlyStoreElementsV1S" : "currentlyStoreElementsV1P",
      [stackName, (stack.getCurrentPosition() + 1).toString()],
    ),
  )

  // check the stack size
  // check if full
  if (stack.getSize() === stack.getCurrentPosition()) {
    wrongAnswers.add(t(answerOptionList, lang, "stackFullV1N", [stackName]))
  } else {
    stack.getSize() - stack.getCurrentPosition() < 3
      ? wrongAnswers.add(t(answerOptionList, lang, "stackFullV1", [stackName]))
      : null
  }
  // check if empty
  if (stack.getCurrentPosition() === 0) {
    wrongAnswers.add(t(answerOptionList, lang, "stackEmptyV1N", [stackName]))
  } else {
    stack.getCurrentPosition() < 3
      ? wrongAnswers.add(t(answerOptionList, lang, "stackEmptyV1", [stackName]))
      : null

    const stackToString = stack.getStack()
    stackToString.pop()
    wrongAnswers.add(t(answerOptionList, lang, "toStringV1", [stackName, stackToString.toString()]))

    random.uniform() > 0.8
      ? wrongAnswers.add(
          t(answerOptionList, lang, "topElementV1", [stackName, random.int(1, 20).toString()]),
        )
      : null
  }

  if (stack.getCurrentPosition() >= 2) {
    if (stack.getMin() !== stack.getSecondMin()) {
      wrongAnswers.add(
        t(answerOptionList, lang, "minElementV1", [stackName, stack.getSecondMin().toString()]),
      )
    }

    // check the top element
    const stackToString = stack.getStack()
    const stackLen = stack.getCurrentPosition()
    if (stackToString[stackLen - 1] !== stackToString[stackLen - 2]) {
      wrongAnswers.add(
        t(answerOptionList, lang, "topElementV1", [stackName, stackToString[stackLen - 2].toString()]),
      )
    }

    if (stackToString[0] !== stackToString[1]) {
      wrongAnswers.add(
        t(answerOptionList, lang, "bottomElementV1", [stackName, stackToString[1].toString()]),
      )
    }

    // swap values inside the stack
    // get two random different numbers from 0 to stack.length - 1
    const index1 = random.int(0, stack.getCurrentPosition() - 1)
    let index2 = random.int(0, stack.getCurrentPosition() - 1)
    if (index1 === index2) {
      index2 = (index2 + 1) % stack.getCurrentPosition()
    }
    ;[stackToString[index1], stackToString[index2]] = [stackToString[index2], stackToString[index1]]
    if (stack.getStack().toString() !== stackToString.toString()) {
      wrongAnswers.add(t(answerOptionList, lang, "toStringV1", [stackName, stackToString.toString()]))
    }
  }

  // re-declaring increaseValue to get different numbers
  if (!dynamic) {
    let increaseValue = stack.getSize() - stack.getCurrentPosition() + random.int(1, 3)
    wrongAnswers.add(
      t(
        answerOptionList,
        lang,
        increaseValue === 1 ? "pushMoreCouldStoreV1S" : "pushMoreCouldStoreV1P",
        [increaseValue.toString(), stackName],
      ),
    )
    increaseValue = stack.getSize() - stack.getCurrentPosition() + random.int(1, 3)
    wrongAnswers.add(
      t(
        answerOptionList,
        lang,
        increaseValue === 1 ? "pushMoreCouldIncrSizeV1S" : "pushMoreCouldIncrSizeV1P",
        [increaseValue.toString(), stackName, (stack.getSize() * 2).toString()],
      ),
    )
    let decreaseValue = stack.getCurrentPosition() - Math.floor(stack.getSize() * 0.25)
    if (decreaseValue > stack.getCurrentPosition()) decreaseValue += random.int(0, 1)
    wrongAnswers.add(
      t(answerOptionList, lang, decreaseValue === 1 ? "popForQuaterV1S" : "popForQuaterV1P", [
        decreaseValue.toString(),
        stackName,
      ]),
    )
  } else {
    let increaseValue = stack.getSize() - stack.getCurrentPosition() + random.int(1, 3)
    wrongAnswers.add(
      t(
        answerOptionList,
        lang,
        increaseValue === 1 ? "pushMoreCouldStoreV1NS" : "pushMoreCouldStoreV1NP",
        [increaseValue.toString(), stackName],
      ),
    )
    increaseValue = stack.getSize() - stack.getCurrentPosition() + random.int(1, 3)
    wrongAnswers.add(
      t(
        answerOptionList,
        lang,
        increaseValue === 1 ? "pushMoreCouldIncrSizeV1NS" : "pushMoreCouldIncrSizeV1NP",
        [increaseValue.toString(), stackName, (stack.getSize() * 2).toString()],
      ),
    )
    // No question about decreasing here
  }
  const answerList = Array.from(wrongAnswers)
  return random.subset(answerList, amount > answerList.length ? answerList.length : amount)
}

export function parseArrayString(text: string): string {
  text = text.replace(/\s/g, "")
  if (text[0] === "[") {
    text = text.slice(1)
  }
  if (text[text.length - 1] === "]") {
    text = text.slice(0, -1)
  }
  return text
}

export const stackQuestion: QuestionGenerator = {
  name: tFunctional(translations, "name"),
  description: tFunctional(translations, "description"),
  tags: ["stack"],
  languages: ["en", "de"],
  expectedParameters: [
    {
      type: "string",
      name: "variant",
      allowedValues: ["choice", "input"],
    },
  ],

  /**
   * Generates a new Stack question
   *
   * @param generatorPath The path the generator is located. Defined in settings/questionSelection
   * @param lang The language of the question
   * @param parameters The parameters for the question. In this case, none are used.
   * @param seed The seed for the random number generator
   * @returns A new MultipleChoiceQuestion question
   */
  generate: (generatorPath, lang = "en", parameters, seed) => {
    const random = new Random(seed)

    const permalink = serializeGeneratorCall({
      generator: stackQuestion,
      lang,
      parameters,
      seed,
      generatorPath,
    })

    // throw an error if the variant is unknown
    if (!validateParameters(parameters, stackQuestion.expectedParameters)) {
      throw new Error(
        `Unknown variant ${parameters.variant.toString()}. 
                Valid variants are: ${stackQuestion.expectedParameters.join(", ")}`,
      )
    }

    const variant = parameters.variant as "choice" | "input"

    const stackName = random.choice("ABCSU".split(""))
    const stackSize = random.choice([4, 6, 8, 10])

    // weighted choice if we want to get an OverFlow error or not (15% for Overflow 85% for not)
    const stackOverflowError =
      variant === "choice"
        ? random.weightedChoice([
            [true, 0.15],
            [false, 0.85],
          ])
        : false

    // decide if stack is dynamic or not
    const dynamic = !stackOverflowError
      ? random.weightedChoice([
          [true, 0.65],
          [false, 0.35],
        ])
      : false

    // a boolean to decide if we want to increase or decrease
    // weighted because with increase happens more often than decrease
    const increase = random.weightedChoice([
      [true, 0.7],
      [false, 0.3],
    ])

    // pick a number between 0 and stack size
    const stackElementsAmount = stackOverflowError
      ? random.int(Math.ceil(stackSize * 0.5), stackSize - 1)
      : dynamic
        ? increase
          ? random.int(stackSize - 3, stackSize - 1)
          : random.int(Math.ceil(stackSize * 0.25), 3)
        : random.int(0, stackSize - 1)

    let stackElementsString: string
    const stackElementsValues = []
    if (stackElementsAmount === 0) {
      stackElementsString = t(translations, lang, "stackEmpty")
    } else {
      // create a table view of the stack
      stackElementsString = t(translations, lang, "stackContainsValues")
      for (let i = 0; i < stackElementsAmount; i++) {
        stackElementsValues.push(random.int(1, 20))
      }
      stackElementsString += "\n\n| Index | Value |\n| --- | --- |"
      for (let i = 0; i < stackElementsAmount; i++) {
        stackElementsString += `\n| ${i} | ${stackElementsValues[i]} |`
      }
      // add the new line to the table for the extra feature #div_my-5#
      stackElementsString += `\n|#div_my-5?td#| |`
    }

    /*
    Variation between multiple choice and input
     */
    let question: Question
    if (variant === "choice") {
      const generation = generateOperationsStack(
        stackElementsValues,
        stackSize,
        dynamic,
        increase,
        stackOverflowError,
        stackName,
        random,
      )

      const correctAnswers = generateCorrectAnswersStack(
        generation.stack,
        stackOverflowError,
        dynamic,
        stackName,
        random,
        lang,
      )

      const amount = 6 - correctAnswers.length
      const wrongAnswers = generateWrongAnswerStack(
        generation.stack,
        stackOverflowError,
        dynamic,
        stackName,
        random,
        lang,
        amount,
      )

      let allAnswers = []
      let i = 0
      let j = 0
      allAnswers.push(correctAnswers[i])
      i++
      while (allAnswers.length < 6 && (i < correctAnswers.length || j < wrongAnswers.length)) {
        let wOt = random.choice([true, false])
        if (i > correctAnswers.length - 1) {
          wOt = false
        }
        if (j > wrongAnswers.length - 1) {
          wOt = true
        }
        if (wOt) {
          allAnswers.push(correctAnswers[i])
          i++
        } else {
          allAnswers.push(wrongAnswers[j])
          j++
        }
      }
      allAnswers = random.shuffle(allAnswers)

      if (allAnswers.length < 6) {
        throw new Error("Not enough answers")
      }

      const correctAnswerIndex = []
      for (let i = 0; i < correctAnswers.length; i++) {
        correctAnswerIndex.push(allAnswers.indexOf(correctAnswers[i]))
      }

      const operations = generation.operations
      const operationsString =
        operations.length > 0
          ? t(translations, lang, "performOperations", ["\n- " + operations.join("\n- ")])
          : ""

      question = {
        type: "MultipleChoiceQuestion",
        name: stackQuestion.name(lang),
        path: permalink,
        allowMultiple: true,
        text: t(translations, lang, "multipleChoiceText", [
          dynamic ? t(translations, lang, "dynamic") : t(translations, lang, "notDynamic"),
          stackName,
          stackSize.toString(),
          stackElementsString,
          operationsString,
        ]),
        answers: allAnswers,
        feedback: minimalMultipleChoiceFeedback({
          correctAnswerIndex: correctAnswerIndex,
        }),
      }
    } else {
      const checkFormat: MultiFreeTextFormatFunction = ({ text }, fieldID) => {
        // check if the text provided is for the toString question
        if (correctAnswers[fieldID + "-format"] === "toString") {
          // remove all whitespaces and "[", "]"
          text = parseArrayString(text)
          // split text to get the array
          const stackArray = text.split(",")
          for (let i = 0; i < stackArray.length; i++) {
            stackArray[i] = stackArray[i].trim()
            if (stackArray[i].startsWith("-")) {
              stackArray[i] = stackArray[i].slice(1)
            }
            if (!/^\d+$/.test(stackArray[i]) && stackArray[i] !== "") {
              return { valid: false, message: t(translations, lang, "checkFormatArray") }
            }
          }
          return { valid: true, message: "" }
        }
        // else check if the text only contains numbers
        if (!/^\d+$/.test(text)) {
          return { valid: false, message: t(translations, lang, "checkFormat") }
        }
        return { valid: true, message: "" }
      }

      const feedback: FreeTextFeedbackFunction = ({ text }) => {
        let resultMap: { [key: string]: string } = {}
        try {
          resultMap = JSON.parse(text) as { [key: string]: string }
        } catch (e) {
          return {
            correct: false,
            message: tFunction(translations, lang).t("feedback.incomplete"),
            correctAnswer: t(translations, lang, "checkFormatJSON"),
          }
        }

        for (const key in resultMap) {
          if (correctAnswers[key + "-format"] === "toString") {
            const userArray = resultMap[key].split(",")
            const resultArray = correctAnswers[key].split(",")
            for (let i = 0; i < userArray.length; i++) {
              userArray[i] = userArray[i].trim()
              resultArray[i] = resultArray[i].trim()
              if (userArray[i] !== resultArray[i]) {
                console.log(userArray[i], resultArray[i])
                return {
                  correct: false,
                  message: tFunction(translations, lang).t("feedback.incomplete"),
                  correctAnswer: t(translations, lang, "solutionFreetext", [solutionDisplay]),
                }
              }
            }
          } else if (resultMap[key] !== correctAnswers[key]) {
            console.log(resultMap[key], correctAnswers[key])
            return {
              correct: false,
              message: tFunction(translations, lang).t("feedback.incomplete"),
              correctAnswer: solutionDisplay,
            }
          }
        }
        return {
          correct: true,
          message: tFunction(translations, lang).t("feedback.correct"),
        }
      }

      const generatedOperations = generateOperationsFreetextStack(
        stackElementsValues,
        stackSize,
        dynamic,
        random,
      )
      const operations = generatedOperations.operations
      const stack = generatedOperations.stack

      // Example inputfield {{test#NL#**Char: **##overlay}}
      let inputText = "| Operation | Result |\n| --- | --- |\n"
      let solutionDisplay = ""
      let solutionIndex = 0
      const correctAnswers: { [key: string]: string } = {}
      let index = 0
      for (const operation of operations) {
        if (Object.prototype.hasOwnProperty.call(operation, "push")) {
          inputText += `|${stackName}.push(${operation.push})|(void function)|\n`
        } else {
          if (Object.prototype.hasOwnProperty.call(operation, "getTop")) {
            inputText += `|${stackName}.getTop()|{{input-${index}#TL###overlay}}|\n`
            solutionIndex++
            correctAnswers[`input-${index}`] = operation.getTop
            correctAnswers[`input-${index}-format`] = "getTop"
            solutionDisplay += `|${solutionIndex}|${stackName}.getTop() | ${operation.getTop} |\n`
          } else if (Object.prototype.hasOwnProperty.call(operation, "size")) {
            inputText += `|${stackName}.getSize()|{{input-${index}#TL###overlay}}|\n`
            solutionIndex++
            correctAnswers[`input-${index}`] = operation.size
            correctAnswers[`input-${index}-format`] = "getSize"
            solutionDisplay += `|${solutionIndex}|${stackName}.getSize() | ${operation.size} |\n`
          } else if (Object.prototype.hasOwnProperty.call(operation, "amount")) {
            inputText += `|${stackName}.amountElements()|{{input-${index}#TL###overlay}}|\n`
            solutionIndex++
            correctAnswers[`input-${index}`] = operation.amount
            correctAnswers[`input-${index}-format`] = "getCurrentPosition"
            solutionDisplay += `|${solutionIndex}|${stackName}.getCurrentPosition() | ${operation.amount} |\n`
          }
        }
        index++
      }

      // add question to write down the array
      inputText += `|${stackName}.toString()|{{input-${index}#NL##[1,2,3,4]#overlay}}|\n`
      correctAnswers[`input-${index}`] = stack.toString()
      correctAnswers[`input-${index}-format`] = "toString"
      solutionIndex++
      solutionDisplay += `|${solutionIndex}|${stackName}.toString() | ${stack.toString()} |\n`

      // adding the extra feature for a div
      solutionDisplay += "|#div_my-5?table_w-full#| |"
      inputText += `|#div_my-5?border_none?av_middle?ah_center?table_w-full#| |`
      // generate the input fields for the operations (if either getTop, size or amount)
      // if push, we don't ask the user for input
      // last question is to write down the array

      console.log(correctAnswers)

      question = {
        type: "MultiFreeTextQuestion",
        name: stackQuestion.name(lang),
        path: permalink,
        fillOutAll: true,
        text: t(translations, lang, "freeTextInput", [
          dynamic ? t(translations, lang, "dynamic") : t(translations, lang, "notDynamic"),
          stackName,
          stackSize.toString(),
          stackElementsString,
          inputText,
        ]),
        checkFormat,
        feedback,
      }
    }

    return { question }
  },
}

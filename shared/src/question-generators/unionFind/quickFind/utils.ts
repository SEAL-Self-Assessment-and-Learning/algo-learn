import { QuickFind } from "@shared/question-generators/unionFind/quickFind/quickFindAlgorithm.ts"
import Random from "@shared/utils/random.ts"

/**
 * This function will create two bigger unions
 *
 * It'll return the values of the two unions
 *
 * @param random
 * @param union
 * @param unionSize
 * @param otherOperation - if true, two other random values will also be united
 */
function generateTwoBlocks({
  random,
  union,
  unionSize,
  otherOperation = true,
}: {
  random: Random
  union: QuickFind
  unionSize: number
  otherOperation?: true | false
}) {
  const block1Size = random.int(Math.min(2, unionSize / 2 - 1), unionSize / 2 - 1)
  const block2Size = random.int(2, unionSize / 2 - 1)

  const valueOptions: number[] = random.subset([...Array(unionSize).keys()], block1Size + block2Size)
  const block1Values: number[] = valueOptions.slice(0, block1Size)
  const block2Values: number[] = valueOptions.slice(block1Size)

  block1Values.forEach((value) => {
    union.union(value, block1Values[0])
  })

  block2Values.forEach((value) => {
    union.union(value, block2Values[0])
  })

  const otherRandomOperation = !otherOperation
    ? false
    : unionSize - block1Size - block2Size >= 2
      ? random.bool(0.7)
      : false

  if (otherRandomOperation) {
    // get a two values neither inside block1 nor block2
    const otherValues = random.subset(
      [...Array(unionSize).keys()].filter(
        (value) => !block1Values.includes(value) && !block2Values.includes(value),
      ),
      2,
    )
    union.union(otherValues[0], otherValues[1])
  }

  return { block1Values, block2Values, union }
}

/**
 * Only generates one big block
 *
 * @param random
 * @param union
 * @param unionSize
 * @param otherOperation - if 0 --> no other operation
 *                         if 1 --> one other operation (no elements inside big union are used)
 *                         if 2 --> two other operations (no elements inside big union are used and not from the
 *                                                        previous operation)
 *                         if x --> perform until x reached, or it's not possible anymore
 */
function generateOneBlock({
  random,
  union,
  unionSize,
  otherOperation = 1,
}: {
  random: Random
  union: QuickFind
  unionSize: number
  otherOperation?: number
}) {
  let amountElementsRemaining = unionSize
  const usedElements: number[] = []

  const block1Size = random.int(3, unionSize - 4)
  amountElementsRemaining -= block1Size

  const block1Values: number[] = random.subset([...Array(unionSize).keys()], block1Size)
  usedElements.push(...block1Values)

  block1Values.forEach((value) => {
    union.union(value, block1Values[0])
  })

  while (amountElementsRemaining >= 2 && otherOperation > 0) {
    const otherValues = random.subset(
      [...Array(unionSize).keys()].filter((value) => !usedElements.includes(value)),
      2,
    )
    union.union(otherValues[0], otherValues[1])
    amountElementsRemaining -= 2
    otherOperation--
    usedElements.push(...otherValues)
  }

  return { block1Values, union }
}

/**
 * This will generate a question with two bigger unions
 * And as next operation to combine those two
 *
 * @param random
 * @param union
 * @param unionSize
 */
export function unionTwoBlocksCombineBoth({
  random,
  union,
  unionSize,
}: {
  random: Random
  union: QuickFind
  unionSize: number
}) {
  const { block1Values, block2Values, union: union_ } = generateTwoBlocks({ random, union, unionSize })
  union = union_

  const gapField = union.toStringTable(true)

  const gapOperationValues: number[] = []
  gapOperationValues[0] = random.choice(block1Values)
  gapOperationValues[1] = random.choice(block2Values)
  // shuffle the values, so that the first value is not always the first value of block1
  random.shuffle(gapOperationValues)

  // compute the final union
  union.union(gapOperationValues[0], gapOperationValues[1])

  return { gapField, gapOperationValues }
}

/**
 * This generates two bigger unions (or one bigger random.bool())
 * And as next operation to combine one of those with another random element
 * not inside one of the unions union
 *
 * @param random
 * @param union
 * @param unionSize
 */
export function unionOneOrTwoBlocksCombineOne({
  random,
  union,
  unionSize,
}: {
  random: Random
  union: QuickFind
  unionSize: number
}) {
  let block1Values: number[]
  if (random.bool()) {
    const { block1Values: block1Values_, union: union_ } = generateTwoBlocks({
      random,
      union,
      unionSize,
    })
    union = union_
    block1Values = block1Values_
  } else {
    const { block1Values: block1Values_, union: union_ } = generateOneBlock({
      random,
      union,
      unionSize,
      otherOperation: 10,
    })
    union = union_
    block1Values = block1Values_
  }

  const gapField = union.toStringTable(true)

  const gapOperationValues: number[] = []
  gapOperationValues[0] = random.choice(block1Values)
  gapOperationValues[1] = random.choice(
    [...Array(unionSize).keys()].filter((value) => !block1Values.includes(value)),
  )
  // shuffle the values, so that the first value is not always the first value of block1
  random.shuffle(gapOperationValues)

  // compute the final union
  union.union(gapOperationValues[0], gapOperationValues[1])

  return { gapField, gapOperationValues }
}

/**
 * Generates two bigger unions
 * And as the next operation, combine the two elements inside neither of those
 *
 * @param random
 * @param union
 * @param unionSize
 */
export function unionTwoBlocksCombineNone({
  random,
  union,
  unionSize,
}: {
  random: Random
  union: QuickFind
  unionSize: number
}) {
  let block1Size = 0
  let block2Size = 0
  let block1Values: number[] = []
  let block2Values: number[] = []

  do {
    const {
      block1Values: block1Values_,
      block2Values: block2Values_,
      union: union_,
    } = generateTwoBlocks({ random, union, unionSize, otherOperation: false })
    block1Values = block1Values_
    block2Values = block2Values_
    union = union_
    block1Size = block1Values.length
    block2Size = block2Values.length
  } while (block1Size + block2Size >= unionSize - 1)

  const gapField = union.toStringTable(true)

  // get two values neither from block1 nor block2
  const gapOperationValues = random.subset(
    [...Array(unionSize).keys()].filter(
      (value) => !block1Values.includes(value) && !block2Values.includes(value),
    ),
    2,
  )

  // compute the final union
  union.union(gapOperationValues[0], gapOperationValues[1])

  return {
    gapField,
    gapOperationValues,
  }
}

/**
 * This just creates twoBlocks
 * Next operation is to combine two elements inside the same block
 * @param random
 * @param union
 * @param unionSize
 */
export function unionTwoBlocksCombineSame({
  random,
  union,
  unionSize,
}: {
  random: Random
  union: QuickFind
  unionSize: number
}) {
  const { block1Values, union: union_ } = generateTwoBlocks({ random, union, unionSize })
  union = union_

  const gapField = union.toStringTable(true)

  const gapOperationValues: number[] = random.subset(block1Values, 2)

  // compute the final union
  union.union(gapOperationValues[0], gapOperationValues[1])

  return {
    gapField,
    gapOperationValues,
  }
}

/**
 * This just creates one big block
 * And as next operation to combine two elements outside the big union
 *
 * @param random
 * @param union
 * @param unionSize
 */
export function unionOneBlocksCombineNone({
  random,
  union,
  unionSize,
}: {
  random: Random
  union: QuickFind
  unionSize: number
}) {
  const { block1Values, union: union_ } = generateOneBlock({
    random,
    union,
    unionSize,
    otherOperation: 10,
  })
  union = union_

  const gapField = union.toStringTable(true)

  const gapOperationValues: number[] = random.subset(
    [...Array(unionSize).keys()].filter((value) => !block1Values.includes(value)),
    2,
  )

  // compute the final union
  union.union(gapOperationValues[0], gapOperationValues[1])

  return {
    gapField,
    gapOperationValues,
  }
}

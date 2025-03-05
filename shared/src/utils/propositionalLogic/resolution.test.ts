import { describe, expect, test } from "vitest"
import { Literal } from "@shared/utils/propositionalLogic/propositionalLogic.ts"
import { getDisjunctionTerms, literalListsEqual } from "@shared/utils/propositionalLogic/resolution.ts"

describe("Resolution", () => {
  const AT = new Literal("A")
  const BT = new Literal("B")
  const CT = new Literal("C")
  const DT = new Literal("D")
  const ET = new Literal("E")
  const AF = new Literal("A", true)
  const BF = new Literal("B", true)
  const CF = new Literal("C", true)
  const DF = new Literal("D", true)
  const EF = new Literal("E", true)

  test("Res - 1", () => {
    // https://ae.cs.uni-frankfurt.de/teaching/22ws/+dismod/selbsttest_01_resolution.pdf
    const dt = [[CT, DT], [ET, DF, CF, AF], [AF, BF], [BF], [CT]]
    const dtl = getDisjunctionTerms(dt, 2)
    expect(dtl.some((x) => literalListsEqual(x, [DT]))).toBeFalsy()
    expect(dtl.some((x) => literalListsEqual(x, [AT, BT, CF, ET]))).toBeFalsy()
    expect(dtl.some((x) => literalListsEqual(x, [DT, AF]))).toBeFalsy()
    expect(dtl.some((x) => literalListsEqual(x, [CF, CT, ET, AF]))).toBeTruthy()
    expect(dtl.some((x) => literalListsEqual(x, [BT, ET]))).toBeFalsy()
    expect(dtl.some((x) => literalListsEqual(x, [AT, ET, BF]))).toBeFalsy()
    expect(dtl.some((x) => literalListsEqual(x, [ET, AF]))).toBeTruthy()
    expect(dtl.some((x) => literalListsEqual(x, [DF, DT, ET, AF]))).toBeTruthy()
  })

  test("Res - 2", () => {
    // https://ae.cs.uni-frankfurt.de/teaching/22ws/+dismod/selbsttest_01_resolution.pdf
    const dt = [[BT], [AT, DF, CF, BF], [CT, AF], [BT, EF], [CT, DF, ET, AF], [ET]]
    const dtl = getDisjunctionTerms(dt, 2)
    expect(dtl.some((x) => literalListsEqual(x, [DT]))).toBeFalsy()
    expect(dtl.some((x) => literalListsEqual(x, [AT, DF, AF]))).toBeTruthy()
    expect(dtl.some((x) => literalListsEqual(x, [AT, EF, DF, CF]))).toBeTruthy()
    expect(dtl.some((x) => literalListsEqual(x, [AT, BF, DF, CF, AF]))).toBeTruthy()
    expect(dtl.some((x) => literalListsEqual(x, [BT, ET, BF, DF, AF]))).toBeTruthy()
    expect(dtl.some((x) => literalListsEqual(x, [ET, EF, DF, CF, BF]))).toBeTruthy()
    expect(dtl.some((x) => literalListsEqual(x, [AT, EF, DT, CF]))).toBeFalsy()
    expect(dtl.some((x) => literalListsEqual(x, [CF, BT, DT, ET]))).toBeFalsy()
  })

  test("Res - 3", () => {
    // https://ae.cs.uni-frankfurt.de/teaching/22ws/+dismod/selbsttest_02_resolution.pdf
    const dt = [[AT, BF], [DF], [CT], [DF, BF, AF], [AT, CT, DT, BF], [ET]]
    const dtl = getDisjunctionTerms(dt, 2)
    expect(dtl.some((x) => literalListsEqual(x, [DF, BF]))).toBeTruthy()
    expect(dtl.some((x) => literalListsEqual(x, [AT, CT, BF]))).toBeTruthy()
    expect(dtl.some((x) => literalListsEqual(x, [BT, DT]))).toBeFalsy()
    expect(dtl.some((x) => literalListsEqual(x, [DT]))).toBeFalsy()
    expect(dtl.some((x) => literalListsEqual(x, [CF, AF]))).toBeFalsy()
    expect(dtl.some((x) => literalListsEqual(x, [EF]))).toBeFalsy()
    expect(dtl.some((x) => literalListsEqual(x, [CF, DF, ET, AF]))).toBeFalsy()
    expect(dtl.some((x) => literalListsEqual(x, [AT, DT]))).toBeFalsy()
  })

  test("Res - 4", () => {
    // https://ae.cs.uni-frankfurt.de/teaching/22ws/+dismod/selbsttest_02_resolution.pdf
    const dt = [[AT, DT], [AT, DT, BF], [AT, CT, DT, ET], [CF], [BT, CT, DF, AF], [EF, DT, CF, BF]]
    const dtl = getDisjunctionTerms(dt, 2)
    expect(dtl.some((x) => literalListsEqual(x, [BT, DT, DF, ET]))).toBeTruthy()
    expect(dtl.some((x) => literalListsEqual(x, [CT, DT, EF, DF, CF, AF]))).toBeTruthy()
    expect(dtl.some((x) => literalListsEqual(x, [AT, BT, ET, BF, EF, AF]))).toBeTruthy()
    expect(dtl.some((x) => literalListsEqual(x, [AT, EF, BF]))).toBeFalsy()
    expect(dtl.some((x) => literalListsEqual(x, [AT, CT, ET, AF, EF, BF]))).toBeTruthy()
    expect(dtl.some((x) => literalListsEqual(x, [BT, CT, EF, CF, AF]))).toBeTruthy()
    expect(dtl.some((x) => literalListsEqual(x, [AT, BT, CT, DT, BF, CF, AF]))).toBeTruthy()
    expect(dtl.some((x) => literalListsEqual(x, [AT, CT, DT, ET, EF, AF]))).toBeTruthy()
  })

  test("Res - Empty term", () => {
    const dt = [[AT, BT, CF], [BT, CT, DT], [DF], [AF, DT], [BF, DT]]
    const dtl = getDisjunctionTerms(dt)
    expect(dtl.some((x) => literalListsEqual(x, []))).toBeTruthy()
  })
})

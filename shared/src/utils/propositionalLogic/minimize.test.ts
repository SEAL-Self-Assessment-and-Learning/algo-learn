import { expect, test } from "vitest"
import { MinimalNormalForm } from "@shared/utils/propositionalLogic/minimize.ts"
import {
  compareExpressions,
  ParserError,
  PropositionalLogicParser,
} from "@shared/utils/propositionalLogic/propositionalLogic.ts"

test("minimize normal forms", () => {
  const inputTester = ([expr, numLiteralsDNF, numLiteralsCNF]: (string | number)[]) => {
    const parseResult = PropositionalLogicParser.parse(expr as string)
    if (parseResult instanceof ParserError) {
      // expect() does not narrow down the type, so "if" is used here
      expect(parseResult).not.toBeInstanceOf(ParserError)
    } else {
      const minimalFormsDNF = new MinimalNormalForm(parseResult, "DNF")
      expect(compareExpressions([minimalFormsDNF.get(), parseResult])).toBeTruthy()
      expect(minimalFormsDNF.get().getNumLiterals()).toEqual(numLiteralsDNF)

      const minimalFormsCNF = new MinimalNormalForm(parseResult, "CNF")
      expect(compareExpressions([minimalFormsCNF.get(), parseResult])).toBeTruthy()
      expect(minimalFormsCNF.get().getNumLiterals()).toEqual(numLiteralsCNF)
    }
  }

  ;[
    ["\\not A \\and B", 2, 2],
    ["\\not(A \\and B)", 2, 2],
    ["\\not A \\and (B \\or C)", 4, 3],
    ["(\\not A \\or B) \\and (B \\or C)", 3, 4],
    ["((\\notA\\orB)\\and(B\\xorC))=>(D<=>E)", 10, 18],
    ["c \\or ((a \\or b) \\and ((\\not a \\xor b \\xor a) \\or a))", 2, 2],
    ["\\not c \\or ((c \\or \\not a) \\and c \\and (a \\or c \\or b)) \\and b", 2, 2],
    [
      "(a \\xor c) \\and (((c => f) \\or e) => (\\not e \\or b \\or c)) \\and (b \\or (f \\and d)) \\and (c \\or f) \\and (a \\or e)",
      18,
      15,
    ],
  ].forEach(inputTester)
})

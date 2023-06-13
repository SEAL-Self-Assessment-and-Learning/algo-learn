import Fraction from "fraction.js"
import { expect, test } from "vitest"

import math from "../../utils/math"
import {
  createProductTerm,
  mathNodeToSumProductTerm,
  ProductTerm,
  usedIterationNumbers,
} from "./asymptoticsUtils"

test("ProductTerms: 2 * 7 equals 14", () => {
  const a = new ProductTerm({ coefficient: 2 })
  const b = new ProductTerm({ coefficient: 7 })
  const c = a.mul(b)
  expect(c.coefficient.valueOf()).toBe(14)
})

test("ProductTerms: usedIterationNumbers", () => {
  let t
  let S

  t = createProductTerm()
  S = usedIterationNumbers(t)
  expect(S.length).toEqual(0)

  t = createProductTerm({ polyexponent: 3, coefficient: 7 })
  S = usedIterationNumbers(t)
  expect(S.length).toEqual(1)
  expect(S[0]).toEqual(0)
  expect(t.logarithmExponents.get(0).valueOf()).toEqual(3)

  t = createProductTerm({ logexponent: 9, coefficient: 7 })
  S = usedIterationNumbers(t)
  expect(S.length).toEqual(1)
  expect(S[0]).toEqual(1)
  expect(t.logarithmExponents.get(1).valueOf()).toEqual(9)
})

test("ProductTerms: x * 7x^3 equals 7x^3", () => {
  const a = createProductTerm({
    exponentialBase: new Fraction(4, 7),
    logexponent: 66,
    polyexponent: 3,
    coefficient: 7,
  })
  const b = createProductTerm({
    exponentialBase: 3,
    logexponent: 2,
    polyexponent: 3,
    coefficient: 7,
  })
  const c = a.mul(b)
  expect(c.coefficient.valueOf()).toBe(7 * 7)
  expect(c.logarithmExponents.get(0).valueOf()).toBe(3 + 3)
  expect(c.logarithmExponents.get(1).valueOf()).toBe(66 + 2)
  expect(c.exponentialBase.n).toBe(4 * 3)
  expect(c.exponentialBase.d).toBe(7)
})

test("ProductTerms: lim c = c", () => {
  for (const c of [-3, -2, -1, 0, 1, 2, 3]) {
    const t = createProductTerm({
      coefficient: c,
    })
    expect(t.limit().valueOf()).toBe(c)
  }
})

test("ProductTerms: lim +/- x^{+/- 1/2}", () => {
  expect(
    createProductTerm({
      polyexponent: new Fraction(1, 2),
    }).limit()
  ).toBe("infty")
  expect(
    createProductTerm({
      coefficient: -1,
      polyexponent: new Fraction(1, 2),
    }).limit()
  ).toBe("-infty")
  expect(
    createProductTerm({
      coefficient: 0,
      polyexponent: new Fraction(1, 2),
    })
      .limit()
      .valueOf()
  ).toBe(0)
  expect(
    createProductTerm({
      polyexponent: new Fraction(-1, 2),
    })
      .limit()
      .valueOf()
  ).toBe(0)
  expect(
    createProductTerm({
      coefficient: -1,
      polyexponent: new Fraction(-1, 2),
    })
      .limit()
      .valueOf()
  ).toBe(0)
})

test("ProductTerms: lim +/- log(x)^{+/- 1/2}", () => {
  expect(
    createProductTerm({
      logexponent: new Fraction(1, 2),
    }).limit()
  ).toBe("infty")
  expect(
    createProductTerm({
      coefficient: -1,
      logexponent: new Fraction(1, 2),
    }).limit()
  ).toBe("-infty")
  expect(
    createProductTerm({
      coefficient: 0,
      logexponent: new Fraction(1, 2),
    })
      .limit()
      .valueOf()
  ).toBe(0)
  expect(
    createProductTerm({
      logexponent: new Fraction(-1, 2),
    })
      .limit()
      .valueOf()
  ).toBe(0)
  expect(
    createProductTerm({
      coefficient: -1,
      logexponent: new Fraction(-1, 2),
    })
      .limit()
      .valueOf()
  ).toBe(0)
})

test("ProductTerms: lim +/- c * x^0", () => {
  for (const d of [-99, -2, -1, 0, 1, 2, 99]) {
    expect(
      createProductTerm({
        coefficient: d,
        polyexponent: 0,
      })
        .limit()
        .valueOf()
    ).toBe(d)
    expect(
      createProductTerm({
        coefficient: d,
        logexponent: 0,
      })
        .limit()
        .valueOf()
    ).toBe(d)
    expect(
      createProductTerm({
        coefficient: d,
        polyexponent: 0,
        logexponent: 0,
      })
        .limit()
        .valueOf()
    ).toBe(d)
  }
})

test("ProductTerms: lim +/- x^{+/- c} log(x)^{+/- d}", () => {
  for (const d of [-99, -2, -1, 0, 1, 2, 99]) {
    expect(
      createProductTerm({
        coefficient: 7,
        polyexponent: 2,
        logexponent: d,
      }).limit()
    ).toBe("infty")
    expect(
      createProductTerm({
        coefficient: -7,
        polyexponent: 2,
        logexponent: d,
      }).limit()
    ).toBe("-infty")
  }
  for (const d of [-99, -2, -1, 0, 1, 2, 99]) {
    expect(
      createProductTerm({
        coefficient: 7,
        polyexponent: -2,
        logexponent: d,
      })
        .limit()
        .valueOf()
    ).toBe(0)
    expect(
      createProductTerm({
        coefficient: -7,
        polyexponent: -2,
        logexponent: d,
      })
        .limit()
        .valueOf()
    ).toBe(0)
  }
})

test("ProductTerms.compare: -f(x) << constant << f(x)", () => {
  const c = createProductTerm({
    coefficient: 100,
  })
  for (const d of [1, 2, 99, 100, 101]) {
    expect(
      c
        .compare(
          createProductTerm({
            logexponent: d,
          })
        )
        .valueOf()
    ).toBe(-1)
  }
  expect(
    c
      .compare(
        createProductTerm({
          logexponent: 0,
        })
      )
      .valueOf()
  ).toBe(0)
  for (const d of [1, 2, 99, 100, 101]) {
    expect(
      c
        .compare(
          createProductTerm({
            logexponent: -d,
          })
        )
        .valueOf()
    ).toBe(1)
  }
  for (const d of [1, 2, 99, 100, 101]) {
    expect(
      c
        .compare(
          createProductTerm({
            polyexponent: d,
          })
        )
        .valueOf()
    ).toBe(-1)
  }
  for (const d of [1, 2, 99, 100, 101]) {
    expect(
      c
        .compare(
          createProductTerm({
            polyexponent: -d,
          })
        )
        .valueOf()
    ).toBe(1)
  }
})

test("ProductTerms.compare: strict", () => {
  for (const c of [-3, 0, 3]) {
    for (const d of [-3, 0, 3]) {
      let tc, td
      tc = createProductTerm({
        coefficient: c,
      })
      td = createProductTerm({
        coefficient: d,
      })
      expect(
        tc.compare(td, true).valueOf() === (c > d ? 1 : c < d ? -1 : 0)
      ).toBeTruthy()

      tc = createProductTerm({
        coefficient: c,
        logexponent: 22,
        polyexponent: 17,
      })
      td = createProductTerm({
        coefficient: d,
        logexponent: 22,
        polyexponent: 17,
      })
      expect(
        tc.compare(td, true).valueOf() === (c > d ? 1 : c < d ? -1 : 0)
      ).toBeTruthy()

      tc = createProductTerm({
        logexponent: c,
      })
      td = createProductTerm({
        logexponent: d,
      })
      expect(
        tc.compare(td, true).valueOf() === (c > d ? 1 : c < d ? -1 : 0)
      ).toBeTruthy()

      tc = createProductTerm({
        coefficient: 6,
        polyexponent: c,
      })
      td = createProductTerm({
        coefficient: 6,
        polyexponent: d,
      })
      expect(
        tc.compare(td, true).valueOf() === (c > d ? 1 : c < d ? -1 : 0)
      ).toBeTruthy()
    }
  }
})

test("ProductTerms.compare: mathNodeToProductTerm compare", () => {
  const n = (str: string) => {
    const t = mathNodeToSumProductTerm(math.parse(str))
    expect(t).toBeDefined()
    return t
  }
  expect(n(`7`).toString()).toBe("7")
  expect(n(`7/7`).toString()).toBe("1")
  expect(n(`7/9`).toString()).toBe("7/9")
  expect(n(`-7`).toString()).toBe("-7")
  expect(n(`-7/9`).toString()).toBe("-7/9")
  expect(n(`x`).toString()).toBe("x")
  expect(n(`x^2`).toString()).toBe("x^2")
  expect(n(`x^0`).toString()).toBe("1")
  expect(n(`0^0`).toString()).toBe("1")
  expect(n(`7^0`).toString()).toBe("1")
  expect(n(`0^7`).toString()).toBe("0")
  expect(n(`0^x`).toString()).toBe("0")
  expect(n(`x^0.1`).toString()).toBe("x^(1/10)")
  expect(n(`x^(-1/3)`).toString()).toBe("x^(-1/3)")
  expect(n(`(2x) * (5x)`).toString()).toBe("10 * x^2")
  expect(n(`3 x^2 + 7 x^2`).toString()).toBe("10 * x^2")
  expect(n(`x + 1`).compare(n(`1`))).toBe(1)
  expect(n(`x`).Oh(n(`x`))).toBeTruthy()
  expect(n(`x`).Oh(n(`x^2`))).toBeTruthy()
  expect(n(`x^2`).Oh(n(`x`))).toBeFalsy()
  expect(n(`x`).oh(n(`x`))).toBeFalsy()
  expect(n(`x`).oh(n(`x^2`))).toBeTruthy()
  expect(n(`x`).Oh(n(`log(x)`))).toBeFalsy()
  expect(n(`log(x)^10`).Oh(n(`x`))).toBeTruthy()
  expect(n(`-log(x)^10`).Oh(n(`x`))).toBeTruthy()
  expect(n(`log(x)^10`).oh(n(`x`))).toBeTruthy()
  expect(n(`log(x)^10`).Theta(n(`x`))).toBeFalsy()
  expect(n(`-log(x)^10`).Omega(n(`-x`))).toBeTruthy()
  expect(n(`-log(x)^10`).omega(n(`-x`))).toBeTruthy()
  expect(n(`3 x^7`).compare(n(`x^3`)).valueOf()).toBe(1)
  expect(n(`3 x^7`).compare(n(`x^7`)).valueOf()).toBe(0)
  expect(n(`-3 x^7`).compare(n(`x^9`)).valueOf()).toBe(-1)
  expect(n(`-3 x^7`).compare(n(`-x^9`)).valueOf()).toBe(1)
  expect(n(`3 x^7`).compare(n(`-x^2`)).valueOf()).toBe(1)
  expect(n(`3 x`).compare(n(`-x^2`)).valueOf()).toBe(1)
  expect(n(`x`).tilde(n(`x^2`))).toBeFalsy()
  expect(n(`x`).tilde(n(`2x`))).toBeFalsy()
  expect(n(`6 x^2`).tilde(n(`x^2`))).toBeFalsy()
  expect(n(`6 x^2`).tilde(n(`6 x^2 + log(x)`))).toBeTruthy()
  expect(n(`3 x^2 + 7 x^2`).tilde(n(`(2 x) * (5 x)`))).toBeTruthy()
  expect(n(`3 x^2 + 7 x^2`).Theta(n(`(2 x) * (5 x)`))).toBeTruthy()
  expect(n(`3 x^2 - 7 x`).Theta(n(`x^2`))).toBeTruthy()
  expect(n(`3 x^2 - 7 x`).Theta(n(`x`))).toBeFalsy()
  expect(n(`3 x^2 - x^3`).Theta(n(`x^2`))).toBeFalsy()
  expect(n(`3 x^2 - 2 x^2`).Theta(n(`x^2`))).toBeTruthy()
  expect(n(`3 x^2 - 3 x^2`).Theta(n(`x^2`))).toBeFalsy()
  expect(n(`x^7`).Oh(n(`2^x`))).toBeTruthy()
  expect(n(`x^7`).oh(n(`2^x`))).toBeTruthy()
  expect(n(`x^2`).oh(n(`2^x`))).toBeTruthy()
  expect(n(`4^x`).omega(n(`x^77`))).toBeTruthy()
  expect(n(`92^x`).omega(n(`7^x`))).toBeTruthy()
  expect(n(`(3 x^2 + 9 log(x)) - 3 x^2`).tilde(n(`9 * log(x)`))).toBeTruthy()
  expect(n(`3 x^2 + 9 log(x) - 3 x^2`).tilde(n(`9 * log(x)`))).toBeTruthy()
  expect(n(`9 x^2 + 9 log(x) - 3 x^2`).tilde(n(`6 x^2`))).toBeTruthy()
  expect(n(`(2x+3)(5x+7)`).tilde(n(`10 x^2`))).toBeTruthy()
  expect(n(`(2x+3)(5x+7)-10x^2`).tilde(n(`29x`))).toBeTruthy()
  expect(n(`2^(log(x))`).tilde(n(`x`))).toBeTruthy()
  expect(n(`3^(log_3(x))`).Theta(n(`x`))).toBeTruthy()
  expect(n(`3^(log_3(x))`).tilde(n(`x`))).toBeTruthy()
  expect(n(`2^(log_3(x))`).tilde(n(`x`))).toBeFalsy()
  expect(n(`y^7`).toString("y")).toBe("y^7")
  expect(n(`3^n`).toString("n")).toBe("3^n")
})

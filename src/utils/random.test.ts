import Random, { xmur3, sfc32 } from "./random"

test("Check that xmur3 and sfc32 return a known sequence.", () => {
  const hashSequence = xmur3("some fixed seed")
  const a = hashSequence()
  const b = hashSequence()
  const c = hashSequence()
  const d = hashSequence()
  expect(a).toBe(3542692267)
  expect(b).toBe(3160529141)
  expect(c).toBe(1496264693)
  expect(d).toBe(752192802)
  const intSequence = sfc32(a, b, c, d)
  expect(intSequence()).toBe(0.735848889220506)
  expect(intSequence()).toBe(0.04587011621333659)
})

test("Check that random.base36string returns a known seed.", () => {
  const random = new Random("some fixed seed")
  expect(random.base36string(0)).toBe("")
  // Note, this will change if we change the hash function or the PRNG.
  expect(random.base36string(10)).toBe("q1vi1sxcq5")
  expect(random.base36string(10)).toBe("n7bkwmhonl")
  expect(random.base36string(10)).toBe("u04exe3hvd")
})

test("Check that random.uniform returns only values in [0,1).", () => {
  const random = new Random("some fixed seed")
  for (let i = 0; i < 100; i++) {
    const x = random.uniform()
    expect(x).toBeGreaterThanOrEqual(0)
    expect(x).toBeLessThan(1)
  }
})

test("Check that random.float returns only values in [MIN,MAX).", () => {
  const random = new Random("some fixed seed")
  const [MIN, MAX] = [7, 19]
  for (let i = 0; i < 100; i++) {
    const x = random.float(MIN, MAX)
    expect(x).toBeGreaterThanOrEqual(MIN)
    expect(x).toBeLessThan(MAX)
  }
})

test("Check that random.int returns values from the expected interval.", () => {
  const random = new Random("some fixed seed")
  const [MIN, MAX] = [7, 19]
  const S = new Set()
  for (let i = 0; i < 100; i++) {
    S.add(random.int(MIN, MAX))
  }
  for (const x of S) {
    expect(x).toBeGreaterThanOrEqual(MIN)
    expect(x).toBeLessThanOrEqual(MAX)
  }
  expect(S.size).toBe(MAX - MIN + 1)
})

test("Check that random.choice returns all values eventually.", () => {
  const random = new Random("some fixed seed")
  const L = [2, 3, 4, 5, 6, 7, 8, 9, 10]
  const S = new Set()
  for (let i = 0; i < 100; i++) {
    S.add(random.choice(L))
  }
  for (const x of S) {
    expect(x).toBeGreaterThanOrEqual(2)
    expect(x).toBeLessThanOrEqual(10)
  }
  expect(S.size).toBe(9)
})

import { describe, expect, test } from "vitest"
import { MapLinked } from "./MapLinked.ts"
import { DoubleHashFunction, HashFunction, MapLinProbing } from "./MapLinProbing.ts"

function createHashMap<T extends MapLinked | MapLinProbing>(
  type: new (size: number) => T,
  size: number,
): T {
  const hashMap: T = new type(size)
  hashMap.insert(1, "one")
  hashMap.insert(2, "two")
  hashMap.insert(3, "three")
  hashMap.insert(4, "four")
  hashMap.insert(5, "five")
  hashMap.insert(6, "six")

  hashMap.change(1, "ONE")
  hashMap.change(2, "TWO")

  return hashMap
}

function insertValues(hashMap: MapLinked | MapLinProbing) {
  hashMap.insert(90, "")
  hashMap.insert(35, "")
  hashMap.insert(88, "")
  hashMap.insert(28, "")
  hashMap.insert(91, "")
  hashMap.insert(44, "")
  hashMap.insert(26, "")
  hashMap.insert(53, "")
  hashMap.insert(16, "")
  hashMap.insert(14, "")
  hashMap.insert(59, "")

  return hashMap
}

describe("Hashing with Linked List", () => {
  test("Handles (only) inserting followed by toString(), get(), has(), listKeys()", () => {
    const hashMap: MapLinked = new MapLinked(6)
    hashMap.insert(1, "one")
    hashMap.insert(2, "two")
    hashMap.insert(3, "three")
    hashMap.insert(4, "four")
    hashMap.insert(5, "five")
    hashMap.insert(6, "six")
    hashMap.insert(7, "seven")
    hashMap.insert(8, "eight")
    expect(hashMap.toString()).toEqual(
      `0: (6, six)  \n1: (7, seven) -> (1, one)  \n2: (8, eight) -> (2, two)  \n3: (3, three)  \n4: (4, four)  \n5: (5, five)`,
    )

    expect(hashMap.get(1)).toEqual("one")
    expect(hashMap.get(2)).toEqual("two")
    expect(hashMap.get(30)).toEqual(null)

    expect(hashMap.has(1)).toBeTruthy()
    expect(hashMap.has(2)).toBeTruthy()
    expect(hashMap.has(30)).toBeFalsy()

    expect(hashMap.keys()).toEqual([6, 7, 1, 8, 2, 3, 4, 5])
  })

  test("Handles inserting, changing followed by toString(), get(), has()", () => {
    const hashMap = createHashMap(MapLinked, 4)

    expect(hashMap.toString()).toEqual(
      `0: (4, four)  \n1: (5, five) -> (1, ONE)  \n2: (6, six) -> (2, TWO)  \n3: (3, three)`,
    )

    expect(hashMap.get(1)).toEqual("ONE")
    expect(hashMap.get(2)).toEqual("TWO")
    expect(hashMap.get(3)).toEqual("three")
    expect(hashMap.get(30)).toEqual(null)

    expect(hashMap.has(1)).toBeTruthy()
    expect(hashMap.has(2)).toBeTruthy()
    expect(hashMap.has(30)).toBeFalsy()
  })

  test("Handles inserting, changing, deleting followed by toString(), get(), has(), listKeys(), listValues()", () => {
    const hashMap = createHashMap(MapLinked, 4)

    hashMap.delete(1)
    hashMap.delete(5)
    hashMap.delete(6)

    expect(hashMap.toString()).toEqual(`0: (4, four)  \n1: \n2: (2, TWO)  \n3: (3, three)`)

    expect(hashMap.get(1)).toEqual(null)
    expect(hashMap.get(2)).toEqual("TWO")

    expect(hashMap.has(1)).toBeFalsy()
    expect(hashMap.has(2)).toBeTruthy()

    expect(hashMap.keys()).toEqual([4, 2, 3])

    expect(hashMap.values()).toEqual(["four", "TWO", "three"])
  })

  test("Handles resizing (decrease) followed by toString()", () => {
    const hashMap = createHashMap(MapLinked, 4)

    hashMap.resize(2)

    hashMap.delete(1)

    expect(hashMap.toString()).toEqual(
      `0: (4, four) -> (6, six) -> (2, TWO)  \n1: (5, five) -> (3, three)`,
    )
  })

  test("Handles resizing (increase) followed by toString()", () => {
    const hashMap = createHashMap(MapLinked, 4)

    hashMap.resize(8)

    hashMap.delete(1)

    expect(hashMap.toString()).toEqual(
      `0: \n1: \n2: (2, TWO)  \n3: (3, three)  \n4: (4, four)  \n5: (5, five)  \n6: (6, six)  \n7:`,
    )

    hashMap.resize(4)

    expect(hashMap.toString()).toEqual(
      `0: (4, four)  \n1: (5, five)  \n2: (2, TWO) -> (6, six)  \n3: (3, three)`,
    )
  })

  test("Handles entries(), isEmpty(), getAmount(), clear()", () => {
    const hashMap = createHashMap(MapLinked, 4)

    expect(hashMap.entries()).toEqual([
      [4, "four"],
      [5, "five"],
      [1, "ONE"],
      [6, "six"],
      [2, "TWO"],
      [3, "three"],
    ])

    expect(hashMap.keysList()).toEqual([[4], [5, 1], [6, 2], [3]])

    expect(hashMap.isEmpty()).toBeFalsy()
    expect(hashMap.getAmount()).toEqual(6)

    hashMap.clear()

    expect(hashMap.entries()).toEqual([])
    expect(hashMap.isEmpty()).toBeTruthy()
    expect(hashMap.getAmount()).toEqual(0)
  })

  test("Aufgabe 8.1 Hashing I", () => {
    // f(x) = (13 · x) mod 11
    const hashFunction: HashFunction = (x: number): number => {
      return (13 * x) % 11
    }

    let hashMap = new MapLinked(11, hashFunction)
    hashMap = insertValues(hashMap) as MapLinked

    expect(hashMap.toString()).toEqual(`0: (44, ) -> (88, )  
1: (28, )  
2: 
3: 
4: (35, ) -> (90, )  
5: 
6: (14, ) -> (91, )  
7: (53, )  
8: (59, ) -> (26, )  
9: 
10: (16, )`)
  })
})

describe("Hashing with Linear Probing", () => {
  test("Handles inserting and deleting with collisions", () => {
    const hashMap = new MapLinProbing({ size: 13 })

    hashMap.insert(1, "one")
    hashMap.insert(14, "fourteen")
    hashMap.insert(27, "twenty-seven")

    hashMap.insert(2, "two")
    hashMap.insert(15, "fifteen")

    expect(hashMap.toString()).toEqual(
      `|0|  1|       2|           3|  4|      5|6|7|8|9|10|11|12|
| |  1|      14|          27|  2|     15| | | | |  |  |  |
| |one|fourteen|twenty-seven|two|fifteen| | | | |  |  |  |`,
    )

    expect(hashMap.get(1)).toEqual("one")
    expect(hashMap.get(14)).toEqual("fourteen")
    expect(hashMap.get(27)).toEqual("twenty-seven")
    expect(hashMap.get(2)).toEqual("two")
    expect(hashMap.get(15)).toEqual("fifteen")

    expect(hashMap.has(1)).toBeTruthy()
    expect(hashMap.has(14)).toBeTruthy()
    expect(hashMap.has(27)).toBeTruthy()
    expect(hashMap.has(2)).toBeTruthy()
    expect(hashMap.has(15)).toBeTruthy()

    expect(hashMap.keys()).toEqual([1, 14, 27, 2, 15])
    expect(hashMap.values()).toEqual(["one", "fourteen", "twenty-seven", "two", "fifteen"])

    hashMap.delete(1)
    hashMap.delete(27)

    expect(hashMap.toString()).toEqual(
      `|0|       1|  2|      3|4|5|6|7|8|9|10|11|12|
| |      14|  2|     15| | | | | | |  |  |  |
| |fourteen|two|fifteen| | | | | | |  |  |  |`,
    )
  })

  test("Aufgabe 8.1 Hashing I (own single hash function)", () => {
    // f(x) = (13 · x) mod 11
    const hashFunction: HashFunction = (x: number, size: number): number => {
      return (13 * x) % size
    }

    let hashMap = new MapLinProbing({ size: 11, hashFunction })

    hashMap = insertValues(hashMap) as MapLinProbing

    expect(hashMap.toString()).toEqual(
      `| 0| 1| 2| 3| 4| 5| 6| 7| 8| 9|10|
|88|28|44|59|90|35|91|53|26|14|16|
|  |  |  |  |  |  |  |  |  |  |  |`,
    )

    expect(hashMap.get(90)).toEqual("")

    expect(hashMap.has(90)).toBeTruthy()

    expect(hashMap.isEmpty()).toBeFalsy()

    expect(hashMap.entries()).toEqual([
      [88, ""],
      [28, ""],
      [44, ""],
      [59, ""],
      [90, ""],
      [35, ""],
      [91, ""],
      [53, ""],
      [26, ""],
      [14, ""],
      [16, ""],
    ])

    expect(hashMap.getAmount()).toEqual(11)

    hashMap.clear()

    expect(hashMap.entries()).toEqual([])
  })

  test("Aufgabe 8.1 Hashing I c (own double hashing", () => {
    /*
    f(x) = (13 · x) mod 11
    g(x) = 5 − (x mod 5)
    hi(x) = (f(x) + i · g(x)) mod 11)
     */

    const hashFunction: DoubleHashFunction = (x: number, i: number, size: number): number => {
      return (((13 * x) % size) + i * (5 - (x % 5))) % size
    }

    let hashMap = new MapLinProbing({ size: 11, hashFunction })

    hashMap = insertValues(hashMap) as MapLinProbing

    expect(hashMap.toString()).toEqual(
      `| 0| 1| 2| 3| 4| 5| 6| 7| 8| 9|10|
|88|28|44|14|90|59|91|53|26|35|16|
|  |  |  |  |  |  |  |  |  |  |  |`,
    )
  })

  test("Aufgabe 8.2 Hashing II (own single hash function) and resizing", () => {
    /*
    Gegeben ist eine leere Hashtabelle H der Größe m = 2 mit den Hashfunktionen hi(x) = (13x + i) mod m.
    Fügen sie die folgende Sequenz in der gegebenen Reihenfolge in die Hashtabelle ein und vergrößern Sie
    die Hashtabelle, wann immer der Auslastungsfaktor λ wenigstens 12 erreicht. Stellen Sie die Hashtabelle
    vor und nach jeder Reorganisation sowie nachdem alle Schlüssel eingefügt wurden dar. Immer wenn Sie
    die Hashtabelle vergrößern müssen wählen Sie als neue Größe die kleinste Primzahl, sodass sich die Größe
    wenigstens verdoppelt. Fügen Sie Schlüssel, die bereits in der Hashtabelle waren, in der Reihenfolge in
    die größere Tabelle ein, in der sie in der kleineren Tabelle standen (vom kleinen zum großen Index).
                              90, 35, 88, 28, 91, 44, 26, 53, 16, 14, 59
     */

    const hashFunction: HashFunction = (x: number, size: number): number => {
      return (13 * x) % size
    }

    const hashMap = new MapLinProbing({ size: 2, hashFunction, resize: true })

    hashMap.insert(90, "")

    expect(hashMap.toString()).toEqual(`| 0|1|2|3|4|
|90| | | | |
|  | | | | |`)

    hashMap.insert(35, "")
    hashMap.insert(88, "")

    expect(hashMap.toString()).toEqual(`| 0|1|2|3| 4| 5|6|7|8|9|10|
|88| | | |90|35| | | | |  |
|  | | | |  |  | | | | |  |`)

    hashMap.insert(28, "")
    hashMap.insert(91, "")
    hashMap.insert(44, "")

    expect(hashMap.toString()).toEqual(`|0|1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|17|18|19|20|21|22|
| | | | | | | | | | |91|  |  |  |  |  |  |88|35|28|44|90|  |
| | | | | | | | | | |  |  |  |  |  |  |  |  |  |  |  |  |  |`)

    hashMap.insert(26, "")
    hashMap.insert(53, "")
    hashMap.insert(16, "")
    hashMap.insert(14, "")
    hashMap.insert(59, "")

    expect(hashMap.toString()).toEqual(`| 0| 1|2|3|4|5|6|7| 8|9|10|11|12|13|14|15|16|17|18|19|20|21|22|
|14|16| | | | | | |59| |91|  |  |  |  |  |26|88|35|28|44|90|53|
|  |  | | | | | | |  | |  |  |  |  |  |  |  |  |  |  |  |  |  |`)
  })
})

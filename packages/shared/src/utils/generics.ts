/**
 * Some generic functions following the lodash naming scheme.
 */

export const _ = {
  isObject(value: any): value is object {
    return typeof value === "object" && value !== null
  },

  has(object: object, key: string): key is keyof object {
    return key in object
  },

  isEqual(value: any, other: any): boolean {
    if (value === other) return true

    if (Array.isArray(value) && Array.isArray(other)) {
      return value.length === other.length && value.every((e, i) => _.isEqual(other[i], e))
    }
    if (_.isObject(value) && _.isObject(other)) {
      const valueKeys = Object.keys(value)
      const otherKeys = Object.keys(other)

      return (
        valueKeys.length === otherKeys.length &&
        valueKeys.every((k) => _.has(other, k) && _.isEqual(value[k], other[k]))
      )
    }

    return false
  },

  difference<T>(array: T[], values: T[]): T[] {
    return array.filter((e) => !values.includes(e))
  },

  zip<T>(...arrays: T[][]): T[][] {
    const zipped: T[][] = []
    for (let i = 0; i < arrays[0].length; i++) {
      const row = []
      for (let j = 0; j < arrays.length; j++) row.push(arrays[j][i])
      zipped.push(row)
    }
    return zipped
  },

  unzip<T>(array: T[][]): T[][] {
    return this.zip(...array)
  },

  chunk<T>(arr: T[], size: number): T[][] {
    const result: T[][] = []
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size))
    }
    return result
  },
}

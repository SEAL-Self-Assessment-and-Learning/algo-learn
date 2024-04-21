/**
 * Some generic functions following the lodash naming scheme.
 */

export const _ = {
  isObject: (value: any): value is object => {
    return typeof value === "object" && value !== null
  },

  has: (object: object, key: string): key is keyof object => {
    return key in object
  },

  isEqual: (value: any, other: any): boolean => {
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
}

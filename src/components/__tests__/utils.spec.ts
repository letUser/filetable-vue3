import { describe, it, expect } from 'vitest'

import capitalize from '@/utils/capitalize'

describe('Utilities', () => {
  it('"capitalize" function returns correct string', () => {
    const mockData = [
      'available', 'scheduled', 'wInTon', 'MaUGA', '123sombra0', '$@#!d21@', '   Juno  ', ' '
    ]
    const results: boolean[] = []

    mockData.forEach(str => {
      const newStr = capitalize(str)
      const trimmedStr = str.trim()

      if (!trimmedStr.length) { // if str is empty
        results.push(true)
      } else if (newStr[0] !== trimmedStr[0].toLocaleUpperCase()
        || !newStr.slice(1).includes(trimmedStr.slice(1).toLocaleLowerCase())) {
        results.push(false)
      } else { // pass cases
        results.push(true)
      }
    })

    expect(results).not.toHaveLength(0)
    expect(results.every(result => result)).toBe(true)
  })
})
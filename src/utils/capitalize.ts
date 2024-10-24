/**
 * Capitalization pure utility
 * @param {string} text text for capitalization 
 * @returns new capitalized string
 */
export default function capitalize(text: string) {
  const pureText = text.trim()

  if (!pureText.length) {
    console.warn('No text for capitalization!')
    return ''
  }

  const firstChar = pureText[0].toLocaleUpperCase()
  return firstChar + pureText.slice(1).toLocaleLowerCase()
}
export function upperCase(str: string) {
  return str.slice(0, 1).toLocaleUpperCase() + str.slice(1)
}

export function getName(str: string) {
  return str
    .split('-')
    .map((v) => upperCase(v))
    .join('')
}

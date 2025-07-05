export function capitalizeFirst(str?: string) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export const formatListWithY = (items: (string | undefined)[]): string => {
  const names = items.filter(Boolean) as string[]
  if (names.length === 0) return ''
  if (names.length === 1) return names[0]
  if (names.length === 2) return `${names[0]} y ${names[1]}`
  return `${names.slice(0, -1).join(', ')} y ${names[names.length - 1]}`
}

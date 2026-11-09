export const randomIndex = (length: number, exclude?: number) => {
  const next = Math.floor(Math.random() * length)
  return next === exclude ? (next + 1) % length : next
}

export const getInitials = (name: string) =>
  name
    .split(' ')
    .map((word) => word[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 2)

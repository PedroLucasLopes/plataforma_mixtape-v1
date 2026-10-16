const DAY_MS = 24 * 60 * 60 * 1000

export function rotateDaily<T> (items: readonly T[], today: Date = new Date()): T[] {
  if (items.length === 0) {
    return []
  }
  const offset = Math.floor(today.getTime() / DAY_MS) % items.length
  return [...items.slice(offset), ...items.slice(0, offset)]
}

export function monthKey (date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
}

export function closedMonths (count: number, today: Date = new Date()): string[] {
  const months: string[] = []
  for (let offset = 1; offset <= count; offset += 1) {
    months.push(monthKey(new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - offset, 1))))
  }
  return months
}

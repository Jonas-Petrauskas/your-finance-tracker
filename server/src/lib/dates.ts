const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const

export function monthLabel(year: number, month: number) {
  return `${MONTH_NAMES[month - 1]} ${year}`
}

export function nextYearMonth(year: number, month: number) {
  if (month === 12) return { year: year + 1, month: 1 }
  return { year, month: month + 1 }
}

export function validateYearMonth(year: number, month: number) {
  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    throw new Error('Year must be between 2000 and 2100')
  }
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new Error('Month must be an integer from 1 to 12')
  }
}

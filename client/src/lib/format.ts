import i18n from '../i18n'

export function formatMoney(amountCents: number, currency: string): string {
  return new Intl.NumberFormat(i18n.language, {
    style: 'currency',
    currency,
  }).format(amountCents / 100)
}

/** Parse a decimal money string into positive integer cents. */
export function amountToCents(value: string): number | null {
  const normalized = value.trim().replace(',', '.')
  if (!normalized) return null
  const parsed = Number(normalized)
  if (!Number.isFinite(parsed) || parsed <= 0) return null
  return Math.round(parsed * 100)
}

/** Parse a non-negative money string (e.g. bank balance) into cents. */
export function balanceToCents(value: string): number | null {
  const normalized = value.trim().replace(',', '.')
  if (!normalized) return null
  const parsed = Number(normalized)
  if (!Number.isFinite(parsed) || parsed < 0) return null
  return Math.round(parsed * 100)
}

/** @deprecated Use amountToCents */
export const eurosToCents = amountToCents

export function centsToInput(amountCents: number): string {
  return (amountCents / 100).toFixed(2)
}

export function graphqlErrorMessage(error: unknown, fallback: string): string {
  if (!error || typeof error !== 'object') return fallback
  const graphQLErrors = (
    error as { graphQLErrors?: Array<{ message?: string }> }
  ).graphQLErrors
  if (graphQLErrors?.length && graphQLErrors[0]?.message) {
    return graphQLErrors[0].message
  }
  const message = (error as { message?: string }).message
  return message || fallback
}

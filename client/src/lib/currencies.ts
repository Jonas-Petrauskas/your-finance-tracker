export const SUPPORTED_CURRENCIES = [
  { value: 'EUR', label: 'EUR' },
  { value: 'USD', label: 'USD' },
] as const

export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number]['value']

export function isSupportedCurrency(code: string): code is SupportedCurrency {
  return SUPPORTED_CURRENCIES.some((currency) => currency.value === code)
}

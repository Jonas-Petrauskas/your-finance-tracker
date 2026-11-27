export function validateCurrency(currency: string) {
  const code = currency.trim().toUpperCase()
  if (!/^[A-Z]{3}$/.test(code)) {
    throw new Error('Currency must be a 3-letter code (e.g. EUR, PLN)')
  }
  return code
}

export function validateBankBalance(amountCents: number) {
  if (!Number.isInteger(amountCents) || amountCents < 0) {
    throw new Error('Bank balance must be an integer >= 0 (cents)')
  }
  return amountCents
}

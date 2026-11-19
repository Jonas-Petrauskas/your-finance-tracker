import { useMutation } from '@apollo/client'
import { useEffect, useState } from 'react'
import { GET_MONTH, SET_MONTH_BANK_BALANCE } from '../graphql/operations'
import { centsToInput } from '../lib/format'

type Props = {
  monthId: string
  bankBalanceCents: number
  year: number
  month: number
}

function balanceToCents(value: string): number | null {
  const normalized = value.trim().replace(',', '.')
  if (!normalized) return null
  const parsed = Number(normalized)
  if (!Number.isFinite(parsed) || parsed < 0) return null
  return Math.round(parsed * 100)
}

export function BankBalanceSetting({
  monthId,
  bankBalanceCents,
  year,
  month,
}: Props) {
  const [value, setValue] = useState(centsToInput(bankBalanceCents))
  const [error, setError] = useState<string | null>(null)
  const [setMonthBankBalance, { loading }] = useMutation(
    SET_MONTH_BANK_BALANCE,
    {
      refetchQueries: [{ query: GET_MONTH, variables: { year, month } }],
    },
  )

  useEffect(() => {
    setValue(centsToInput(bankBalanceCents))
  }, [bankBalanceCents])

  return (
    <form
      className="flex flex-col gap-1 text-left"
      onSubmit={(event) => {
        event.preventDefault()
        const amountCents = balanceToCents(value)
        if (amountCents === null) {
          setError('Enter a balance of 0 or more')
          return
        }
        setError(null)
        void setMonthBankBalance({ variables: { monthId, amountCents } })
      }}
    >
      <div className="flex items-end gap-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-(--muted)">Bank savings</span>
          <input
            className="w-36 rounded-md border border-(--line) bg-white px-2 py-1.5"
            inputMode="decimal"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            aria-label="Bank savings amount"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-(--accent) px-3 py-1.5 text-sm text-white disabled:opacity-50"
        >
          Save
        </button>
      </div>
      {error ? <p className="text-sm text-(--expense)">{error}</p> : null}
    </form>
  )
}

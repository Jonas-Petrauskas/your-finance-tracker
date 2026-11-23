import { useEffect, useState } from 'react'
import { balanceToCents, centsToInput } from '../../lib/format'

type Props = {
  bankBalanceCents: number
  loading?: boolean
  onSave: (amountCents: number) => Promise<unknown>
}

export function BankBalanceSettingView({
  bankBalanceCents,
  loading,
  onSave,
}: Props) {
  const [value, setValue] = useState(centsToInput(bankBalanceCents))
  const [error, setError] = useState<string | null>(null)

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
        void onSave(amountCents)
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
          className="btn-primary px-3 py-1.5 text-sm disabled:opacity-50"
        >
          Save
        </button>
      </div>
      {error ? <p className="text-sm text-(--expense)">{error}</p> : null}
    </form>
  )
}

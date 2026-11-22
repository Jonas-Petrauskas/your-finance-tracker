import { useMutation } from '@apollo/client'
import { useEffect, useState } from 'react'
import { GET_HOME, GET_MONTH, SET_CURRENCY } from '../graphql/operations'

type Props = {
  currency: string
  year?: number
  month?: number
}

export function CurrencySetting({ currency, year, month }: Props) {
  const [value, setValue] = useState(currency)

  useEffect(() => {
    setValue(currency)
  }, [currency])

  const refetchQueries =
    year != null && month != null
      ? [
          { query: GET_HOME },
          { query: GET_MONTH, variables: { year, month } },
        ]
      : [{ query: GET_HOME }]

  const [setCurrency, { loading }] = useMutation(SET_CURRENCY, {
    refetchQueries,
  })

  return (
    <form
      className="flex items-end gap-2"
      onSubmit={(event) => {
        event.preventDefault()
        void setCurrency({ variables: { currency: value } })
      }}
    >
      <label className="flex flex-col gap-1 text-left text-sm">
        <span className="text-(--muted)">Currency</span>
        <input
          className="w-20 rounded-md border border-(--line) bg-white px-2 py-1.5 uppercase"
          value={value}
          maxLength={3}
          onChange={(event) => setValue(event.target.value.toUpperCase())}
          aria-label="Currency code"
        />
      </label>
      <button
        type="submit"
        disabled={loading || value === currency}
        className="btn-primary px-3 py-1.5 text-sm disabled:opacity-50"
      >
        Save
      </button>
    </form>
  )
}

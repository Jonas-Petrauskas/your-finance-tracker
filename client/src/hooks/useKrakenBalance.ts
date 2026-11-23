import { useQuery } from '@apollo/client'
import { useMemo, useState } from 'react'
import { GET_KRAKEN_BALANCE } from '../graphql/operations'
import {
  resolveDisplayKraken,
  usesLiveKraken,
  type MonthKrakenFields,
} from '../lib/kraken'
import type { KrakenBalance } from '../lib/types'

type KrakenData = {
  krakenBalance: KrakenBalance
}

export function useKrakenBalance(
  month: MonthKrakenFields | null | undefined,
  options?: { skip?: boolean },
) {
  const live = usesLiveKraken(month)
  const {
    data,
    loading: krakenLoading,
    refetch,
  } = useQuery<KrakenData>(GET_KRAKEN_BALANCE, {
    variables: { forceRefresh: false },
    skip: Boolean(options?.skip) || !live,
  })
  const [refreshingKraken, setRefreshingKraken] = useState(false)

  const displayKraken = useMemo(
    () => resolveDisplayKraken(month, data?.krakenBalance),
    [month, data?.krakenBalance],
  )

  async function refreshKraken() {
    if (!live) return
    setRefreshingKraken(true)
    try {
      await refetch({ forceRefresh: true })
    } finally {
      setRefreshingKraken(false)
    }
  }

  return {
    live,
    displayKraken,
    krakenLoading: live && krakenLoading,
    refreshingKraken,
    refreshKraken: live ? refreshKraken : undefined,
  }
}

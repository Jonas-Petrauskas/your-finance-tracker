import { createHash, createHmac } from 'node:crypto'

const KRAKEN_API = 'https://api.kraken.com'

/** Cash fiat only — stables like USDC are priced as holdings. */
const FIAT_ASSETS = new Set([
  'ZEUR',
  'EUR',
  'ZUSD',
  'USD',
  'ZGBP',
  'GBP',
  'ZCAD',
  'CAD',
  'ZJPY',
  'JPY',
  'CHF',
  'AUD',
  'NZD',
])

const ASSET_ALIASES: Record<string, string[]> = {
  ETH: ['XETH', 'ETH', 'ETH2'],
  ETH2: ['XETH', 'ETH', 'ETH2'],
  XETH: ['XETH', 'ETH', 'ETH2'],
  XBT: ['XXBT', 'XBT', 'BTC'],
  XXBT: ['XXBT', 'XBT', 'BTC'],
  BTC: ['XXBT', 'XBT', 'BTC'],
  XRP: ['XXRP', 'XRP'],
  XXRP: ['XXRP', 'XRP'],
  SOL: ['SOL'],
}

const LOCKED_BALANCE_SUFFIXES = ['.S', '.M', '.F', '.B']

type KrakenResponse<T> = {
  error: string[]
  result?: T
}

export type KrakenCryptoBalance = {
  balanceCents: number
  earnCents: number
  spotCents: number
  currency: string
  configured: boolean
  error: string | null
  updatedAt: string
}

type EarnAmount = {
  native?: string
  converted?: string
}

type EarnAllocationItem = {
  native_asset: string
  amount_allocated?: {
    total?: EarnAmount
  }
}

type EarnAllocationsResult = {
  converted_asset?: string
  total_allocated?: string
  items?: EarnAllocationItem[]
}

function getCredentials() {
  const apiKey = process.env.KRAKEN_API_KEY?.trim()
  const apiSecret = process.env.KRAKEN_API_SECRET?.trim()
  if (!apiKey || !apiSecret) return null
  return { apiKey, apiSecret }
}

/** Kraken requires strictly increasing nonces across concurrent requests. */
let lastNonce = 0
function nextNonce() {
  const now = Date.now() * 1000
  lastNonce = now <= lastNonce ? lastNonce + 1 : now
  return String(lastNonce)
}

/** Serialize private calls so React Strict Mode / parallel queries cannot collide. */
let privateQueue: Promise<unknown> = Promise.resolve()

function enqueuePrivate<T>(task: () => Promise<T>): Promise<T> {
  const run = privateQueue.then(task, task)
  privateQueue = run.then(
    () => undefined,
    () => undefined,
  )
  return run
}

function signRequest(path: string, body: string, apiSecret: string) {
  const nonce = new URLSearchParams(body).get('nonce') ?? ''
  const hash = createHash('sha256').update(nonce + body).digest()
  return createHmac('sha512', Buffer.from(apiSecret, 'base64'))
    .update(path)
    .update(hash)
    .digest('base64')
}

async function privatePostOnce<T>(
  path: string,
  params: Record<string, string>,
  credentials: { apiKey: string; apiSecret: string },
): Promise<T> {
  const nonce = nextNonce()
  const body = new URLSearchParams({ nonce, ...params }).toString()
  const signature = signRequest(path, body, credentials.apiSecret)

  const response = await fetch(`${KRAKEN_API}${path}`, {
    method: 'POST',
    headers: {
      'API-Key': credentials.apiKey,
      'API-Sign': signature,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  })

  if (!response.ok) {
    throw new Error(`Kraken HTTP ${response.status}`)
  }

  const json = (await response.json()) as KrakenResponse<T>
  if (json.error?.length) {
    throw new Error(json.error.join(', '))
  }
  if (!json.result) {
    throw new Error('Kraken returned an empty result')
  }
  return json.result
}

async function privatePost<T>(
  path: string,
  params: Record<string, string>,
  credentials: { apiKey: string; apiSecret: string },
): Promise<T> {
  return enqueuePrivate(async () => {
    try {
      return await privatePostOnce<T>(path, params, credentials)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      // One retry after a short delay if Kraken rejects the nonce.
      if (message.includes('Invalid nonce')) {
        await new Promise((resolve) => setTimeout(resolve, 50))
        return privatePostOnce<T>(path, params, credentials)
      }
      throw error
    }
  })
}

async function publicGet<T>(
  path: string,
  query?: Record<string, string>,
): Promise<T> {
  const url = new URL(`${KRAKEN_API}${path}`)
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      url.searchParams.set(key, value)
    }
  }
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Kraken HTTP ${response.status}`)
  }
  const json = (await response.json()) as KrakenResponse<T>
  if (json.error?.length) {
    throw new Error(json.error.join(', '))
  }
  if (!json.result) {
    throw new Error('Kraken returned an empty result')
  }
  return json.result
}

function stripEarnSuffix(asset: string) {
  return asset.split('.')[0] ?? asset
}

function isLockedBalanceAsset(asset: string) {
  const upper = asset.toUpperCase()
  return LOCKED_BALANCE_SUFFIXES.some((suffix) => upper.endsWith(suffix))
}

function assetCandidates(asset: string): string[] {
  const raw = asset.toUpperCase()
  const base = stripEarnSuffix(raw)
  const withoutDigits = base.replace(/\d+$/, '')
  const candidates = [raw, base]
  if (withoutDigits && withoutDigits !== base) candidates.push(withoutDigits)

  for (const candidate of [...candidates]) {
    const aliases = ASSET_ALIASES[candidate]
    if (aliases) candidates.push(...aliases)
  }

  return [...new Set(candidates)]
}

function canonicalAsset(asset: string) {
  const candidates = assetCandidates(asset)
  return candidates.find((candidate) => ASSET_ALIASES[candidate]) ?? candidates[0]
}

function isFiat(asset: string) {
  return assetCandidates(asset).some((candidate) => FIAT_ASSETS.has(candidate))
}

function sharesUnderlying(assetA: string, assetB: string) {
  const setA = new Set(assetCandidates(assetA))
  return assetCandidates(assetB).some((candidate) => setA.has(candidate))
}

type AssetPair = {
  altname?: string
  wsname?: string
  base: string
  quote: string
  status?: string
}

type Ticker = {
  c?: [string, string]
  a?: [string, string, string]
}

function pickEurPair(
  asset: string,
  pairs: Record<string, AssetPair>,
): string | null {
  const candidates = assetCandidates(asset)
  const eurPairs = Object.entries(pairs).filter(([, pair]) => {
    if (pair.status && pair.status !== 'online') return false
    const quote = pair.quote.toUpperCase()
    return quote === 'ZEUR' || quote === 'EUR'
  })

  for (const candidate of candidates) {
    const exact = eurPairs.find(
      ([, pair]) => pair.base.toUpperCase() === candidate,
    )
    if (exact) return exact[0]
  }

  for (const candidate of candidates) {
    const byWs = eurPairs.find(([, pair]) => {
      const wsBase = pair.wsname?.split('/')[0]?.toUpperCase()
      return wsBase === candidate
    })
    if (byWs) return byWs[0]
  }

  for (const candidate of candidates) {
    const byAlt = eurPairs.find(([, pair]) =>
      pair.altname?.toUpperCase().startsWith(candidate),
    )
    if (byAlt) return byAlt[0]
  }

  return null
}

function tickerPrice(ticker: Ticker): number | null {
  const last = ticker.c?.[0] ?? ticker.a?.[0]
  if (!last) return null
  const value = Number(last)
  return Number.isFinite(value) && value > 0 ? value : null
}

async function priceAssetsEur(
  holdings: Array<{ asset: string; amount: number }>,
): Promise<number> {
  if (holdings.length === 0) return 0

  const pairs = await publicGet<Record<string, AssetPair>>(
    '/0/public/AssetPairs',
  )
  const pairByAsset = new Map<string, string>()
  for (const { asset } of holdings) {
    if (isFiat(asset)) continue
    const pair = pickEurPair(asset, pairs)
    if (pair) pairByAsset.set(asset, pair)
  }

  const uniquePairs = [...new Set(pairByAsset.values())]
  const tickers =
    uniquePairs.length > 0
      ? await publicGet<Record<string, Ticker>>('/0/public/Ticker', {
          pair: uniquePairs.join(','),
        })
      : {}

  let totalEur = 0
  for (const { asset, amount } of holdings) {
    if (isFiat(asset)) {
      // ZEUR / EUR cash counts 1:1
      if (assetCandidates(asset).some((c) => c === 'ZEUR' || c === 'EUR')) {
        totalEur += amount
      }
      continue
    }
    const pairName = pairByAsset.get(asset)
    if (!pairName) continue
    const price = tickerPrice(tickers[pairName] ?? {})
    if (price == null) continue
    totalEur += amount * price
  }

  return totalEur
}

function parseAmount(value: string | undefined) {
  const amount = Number(value ?? 0)
  return Number.isFinite(amount) ? amount : 0
}

async function fetchKrakenTotals(credentials: {
  apiKey: string
  apiSecret: string
}) {
  // Sequential on purpose (also queued globally) to keep Kraken nonces ordered.
  const balances = await privatePost<Record<string, string>>(
    '/0/private/Balance',
    {},
    credentials,
  )
  const earn = await privatePost<EarnAllocationsResult>(
    '/0/private/Earn/Allocations',
    {
      converted_asset: 'EUR',
      hide_zero_allocations: 'true',
    },
    credentials,
  )

  const earnItems = (earn.items ?? []).filter(
    (item) => parseAmount(item.amount_allocated?.total?.native) > 0,
  )

  const earnNativeByAsset = new Map<string, number>()
  for (const item of earnItems) {
    const key = canonicalAsset(item.native_asset)
    const amount = parseAmount(item.amount_allocated?.total?.native)
    earnNativeByAsset.set(key, (earnNativeByAsset.get(key) ?? 0) + amount)
  }

  const earnEur =
    parseAmount(earn.total_allocated) ||
    earnItems.reduce(
      (sum, item) => sum + parseAmount(item.amount_allocated?.total?.converted),
      0,
    )

  // Spot / free funds: balance rows not already covered by Earn allocations.
  // Locked .S/.M/.F/.B rows are counted via Earn to avoid double-counting.
  const remainingEarn = new Map(earnNativeByAsset)
  const spotHoldings: Array<{ asset: string; amount: number }> = []

  for (const [asset, rawAmount] of Object.entries(balances)) {
    const amount = Number(rawAmount)
    if (!Number.isFinite(amount) || amount <= 0) continue

    if (isLockedBalanceAsset(asset)) {
      // Consume matching earn amount so leftovers (if any) stay in earn total only.
      const key = canonicalAsset(asset)
      const earnLeft = remainingEarn.get(key) ?? 0
      remainingEarn.set(key, Math.max(0, earnLeft - amount))
      continue
    }

    // Flexible earn can mirror free balances (same native amount). Skip those.
    let matchedEarn = false
    for (const [earnAsset, earnAmount] of remainingEarn) {
      if (!sharesUnderlying(asset, earnAsset)) continue
      if (Math.abs(earnAmount - amount) <= Math.max(amount, earnAmount) * 1e-6 + 1e-12) {
        remainingEarn.set(earnAsset, 0)
        matchedEarn = true
        break
      }
      if (earnAmount >= amount) {
        remainingEarn.set(earnAsset, earnAmount - amount)
        matchedEarn = true
        break
      }
    }
    if (matchedEarn) continue

    spotHoldings.push({ asset, amount })
  }

  const spotEur = await priceAssetsEur(spotHoldings)
  const totalEur = earnEur + spotEur

  return {
    totalEur,
    earnEur,
    spotEur,
  }
}

export async function getKrakenCryptoBalance(): Promise<KrakenCryptoBalance> {
  const updatedAt = new Date().toISOString()
  const credentials = getCredentials()

  if (!credentials) {
    return {
      balanceCents: 0,
      earnCents: 0,
      spotCents: 0,
      currency: 'EUR',
      configured: false,
      error: 'Kraken API keys are not configured on the server',
      updatedAt,
    }
  }

  try {
    const { totalEur, earnEur, spotEur } = await fetchKrakenTotals(credentials)
    return {
      balanceCents: Math.round(totalEur * 100),
      earnCents: Math.round(earnEur * 100),
      spotCents: Math.round(spotEur * 100),
      currency: 'EUR',
      configured: true,
      error: null,
      updatedAt,
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch Kraken balance'
    return {
      balanceCents: 0,
      earnCents: 0,
      spotCents: 0,
      currency: 'EUR',
      configured: true,
      error: message,
      updatedAt,
    }
  }
}

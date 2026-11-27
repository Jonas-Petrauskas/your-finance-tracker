import { meResolvers } from '../modules/me/resolvers.js'
import { monthsResolvers } from '../modules/months/resolvers.js'
import { itemsResolvers } from '../modules/items/resolvers.js'
import { goalsResolvers } from '../modules/goals/resolvers.js'
import { settingsResolvers } from '../modules/settings/resolvers.js'
import { krakenResolvers } from '../modules/kraken/resolvers.js'

type ResolverMap = Record<string, Record<string, unknown>>

function mergeResolvers(...maps: ResolverMap[]): ResolverMap {
  const out: ResolverMap = {}
  for (const map of maps) {
    for (const [typeName, fields] of Object.entries(map)) {
      out[typeName] = { ...out[typeName], ...fields }
    }
  }
  return out
}

export const resolvers = mergeResolvers(
  meResolvers,
  monthsResolvers,
  itemsResolvers,
  goalsResolvers,
  settingsResolvers,
  krakenResolvers,
)

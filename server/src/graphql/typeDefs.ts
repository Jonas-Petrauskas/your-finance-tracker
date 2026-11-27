import { operationsTypeDefs } from './operations.js'
import { sharedTypeDefs } from '../modules/shared/typeDefs.js'
import { meTypeDefs } from '../modules/me/typeDefs.js'
import { monthsTypeDefs } from '../modules/months/typeDefs.js'
import { itemsTypeDefs } from '../modules/items/typeDefs.js'
import { goalsTypeDefs } from '../modules/goals/typeDefs.js'
import { settingsTypeDefs } from '../modules/settings/typeDefs.js'
import { krakenTypeDefs } from '../modules/kraken/typeDefs.js'

export const typeDefs = [
  sharedTypeDefs,
  meTypeDefs,
  monthsTypeDefs,
  itemsTypeDefs,
  goalsTypeDefs,
  settingsTypeDefs,
  krakenTypeDefs,
  operationsTypeDefs,
].join('\n')

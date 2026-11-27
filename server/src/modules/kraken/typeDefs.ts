export const krakenTypeDefs = /* GraphQL */ `
  type KrakenBalance {
    balanceCents: Int!
    earnCents: Int!
    spotCents: Int!
    currency: String!
    configured: Boolean!
    error: String
    updatedAt: String!
    cached: Boolean!
  }
`

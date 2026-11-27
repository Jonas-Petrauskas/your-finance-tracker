export const monthsTypeDefs = /* GraphQL */ `
  type MonthlySummary {
    incomeCents: Int!
    expenseCents: Int!
    leftCents: Int!
  }

  type Month {
    id: ID!
    year: Int!
    month: Int!
    label: String!
    bankBalanceCents: Int!
    krakenBalanceCents: Int
    krakenEarnCents: Int
    krakenSpotCents: Int
    krakenSnapshottedAt: String
    items: [RecurringItem!]!
    summary: MonthlySummary!
  }
`

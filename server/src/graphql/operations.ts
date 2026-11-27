/** Root Query / Mutation fields — keep in sync when adding module operations. */
export const operationsTypeDefs = /* GraphQL */ `
  type Query {
    me: Me!
    months: [Month!]!
    monthByDate(year: Int!, month: Int!): Month
    settings: Settings!
    krakenBalance(forceRefresh: Boolean): KrakenBalance!
    goals: [Goal!]!
  }

  type Mutation {
    createNextMonth: Month!
    deleteMonth(id: ID!): Boolean!
    createItem(monthId: ID!, input: ItemInput!): RecurringItem!
    updateItem(id: ID!, input: ItemInput!): RecurringItem!
    deleteItem(id: ID!): Boolean!
    setItemPaid(id: ID!, paid: Boolean!): RecurringItem!
    setCurrency(currency: String!): Settings!
    setMonthBankBalance(monthId: ID!, amountCents: Int!): Month!
    snapshotMonthKraken(monthId: ID!): Month!
    createGoal(input: GoalInput!): Goal!
    updateGoal(id: ID!, input: GoalInput!): Goal!
    deleteGoal(id: ID!): Boolean!
  }
`

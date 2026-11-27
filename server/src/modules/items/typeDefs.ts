export const itemsTypeDefs = /* GraphQL */ `
  type RecurringItem {
    id: ID!
    monthId: ID!
    name: String!
    amountCents: Int!
    direction: Direction!
    category: Category!
    billingDay: Int
    notes: String
    active: Boolean!
    paid: Boolean!
    oneOff: Boolean!
  }

  input ItemInput {
    name: String!
    amountCents: Int!
    direction: Direction!
    category: Category!
    billingDay: Int
    notes: String
    active: Boolean
    paid: Boolean
    oneOff: Boolean
  }
`

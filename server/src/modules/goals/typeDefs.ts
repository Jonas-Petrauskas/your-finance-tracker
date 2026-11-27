export const goalsTypeDefs = /* GraphQL */ `
  type Goal {
    id: ID!
    name: String!
    targetCents: Int!
  }

  input GoalInput {
    name: String!
    targetCents: Int!
  }
`

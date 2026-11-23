import { gql } from '@apollo/client'

const ITEM_FIELDS = `
  id
  monthId
  name
  amountCents
  direction
  category
  billingDay
  notes
  active
  paid
  oneOff
`

const MONTH_SUMMARY_FIELDS = `
  incomeCents
  expenseCents
  leftCents
`

const MONTH_LIST_FIELDS = `
  id
  year
  month
  label
  bankBalanceCents
  krakenBalanceCents
  summary {
    ${MONTH_SUMMARY_FIELDS}
  }
`

const KRAKEN_BALANCE_FIELDS = `
  balanceCents
  earnCents
  spotCents
  currency
  configured
  error
  updatedAt
  cached
`

export const GET_HOME = gql`
  query GetHome {
    months {
      ${MONTH_LIST_FIELDS}
    }
    settings {
      currency
    }
    goals {
      id
      name
      targetCents
    }
    krakenBalance {
      ${KRAKEN_BALANCE_FIELDS}
    }
  }
`

export const GET_MONTH = gql`
  query GetMonth($year: Int!, $month: Int!) {
    monthByDate(year: $year, month: $month) {
      id
      year
      month
      label
      bankBalanceCents
      krakenBalanceCents
      krakenEarnCents
      krakenSpotCents
      krakenSnapshottedAt
      items {
        ${ITEM_FIELDS}
      }
      summary {
        ${MONTH_SUMMARY_FIELDS}
      }
    }
    settings {
      currency
    }
    goals {
      id
      name
      targetCents
    }
  }
`

export const GET_KRAKEN_BALANCE = gql`
  query GetKrakenBalance($forceRefresh: Boolean) {
    krakenBalance(forceRefresh: $forceRefresh) {
      ${KRAKEN_BALANCE_FIELDS}
    }
  }
`

export const CREATE_NEXT_MONTH = gql`
  mutation CreateNextMonth {
    createNextMonth {
      ${MONTH_LIST_FIELDS}
    }
  }
`

export const DELETE_MONTH = gql`
  mutation DeleteMonth($id: ID!) {
    deleteMonth(id: $id)
  }
`

export const CREATE_ITEM = gql`
  mutation CreateItem($monthId: ID!, $input: ItemInput!) {
    createItem(monthId: $monthId, input: $input) {
      ${ITEM_FIELDS}
    }
  }
`

export const UPDATE_ITEM = gql`
  mutation UpdateItem($id: ID!, $input: ItemInput!) {
    updateItem(id: $id, input: $input) {
      ${ITEM_FIELDS}
    }
  }
`

export const DELETE_ITEM = gql`
  mutation DeleteItem($id: ID!) {
    deleteItem(id: $id)
  }
`

export const SET_ITEM_PAID = gql`
  mutation SetItemPaid($id: ID!, $paid: Boolean!) {
    setItemPaid(id: $id, paid: $paid) {
      ${ITEM_FIELDS}
    }
  }
`

export const SET_CURRENCY = gql`
  mutation SetCurrency($currency: String!) {
    setCurrency(currency: $currency) {
      currency
    }
  }
`

export const SET_MONTH_BANK_BALANCE = gql`
  mutation SetMonthBankBalance($monthId: ID!, $amountCents: Int!) {
    setMonthBankBalance(monthId: $monthId, amountCents: $amountCents) {
      id
      bankBalanceCents
    }
  }
`

export const CREATE_GOAL = gql`
  mutation CreateGoal($input: GoalInput!) {
    createGoal(input: $input) {
      id
      name
      targetCents
    }
  }
`

export const UPDATE_GOAL = gql`
  mutation UpdateGoal($id: ID!, $input: GoalInput!) {
    updateGoal(id: $id, input: $input) {
      id
      name
      targetCents
    }
  }
`

export const DELETE_GOAL = gql`
  mutation DeleteGoal($id: ID!) {
    deleteGoal(id: $id)
  }
`

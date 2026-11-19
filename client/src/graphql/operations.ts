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
`

export const GET_HOME = gql`
  query GetHome {
    months {
      ${MONTH_LIST_FIELDS}
    }
    settings {
      currency
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
  }
`

export const GET_KRAKEN_BALANCE = gql`
  query GetKrakenBalance {
    krakenBalance {
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

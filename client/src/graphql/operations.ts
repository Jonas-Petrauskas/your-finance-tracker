import { gql } from '@apollo/client'

export const GET_DASHBOARD = gql`
  query GetDashboard {
    items {
      id
      name
      amountCents
      direction
      category
      notes
      active
    }
    monthlySummary {
      incomeCents
      expenseCents
      leftCents
    }
    settings {
      currency
      bankBalanceCents
    }
  }
`

export const CREATE_ITEM = gql`
  mutation CreateItem($input: ItemInput!) {
    createItem(input: $input) {
      id
      name
      amountCents
      direction
      category
      notes
      active
    }
  }
`

export const UPDATE_ITEM = gql`
  mutation UpdateItem($id: ID!, $input: ItemInput!) {
    updateItem(id: $id, input: $input) {
      id
      name
      amountCents
      direction
      category
      notes
      active
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
      bankBalanceCents
    }
  }
`

export const SET_BANK_BALANCE = gql`
  mutation SetBankBalance($amountCents: Int!) {
    setBankBalance(amountCents: $amountCents) {
      currency
      bankBalanceCents
    }
  }
`
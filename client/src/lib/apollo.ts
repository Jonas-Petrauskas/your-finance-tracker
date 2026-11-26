import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'

const graphqlUri = import.meta.env.VITE_GRAPHQL_URL ?? '/graphql'

type TokenGetter = () => Promise<string | null>

let getToken: TokenGetter = async () => null

export function setApolloAuthTokenGetter(getter: TokenGetter) {
  getToken = getter
}

const authLink = setContext(async (_, { headers }) => {
  const token = await getToken()
  return {
    headers: {
      ...headers,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  }
})

export const apolloClient = new ApolloClient({
  link: from([authLink, new HttpLink({ uri: graphqlUri })]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: { fetchPolicy: 'cache-and-network' },
  },
})

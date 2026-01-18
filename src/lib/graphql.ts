// ============================================
// LAST RALLY - GraphQL Client & Operations
// ============================================

import { ApolloClient, InMemoryCache, gql } from '@apollo/client';

// Default endpoint - update chain/app IDs as needed
const DEFAULT_CHAIN_ID = 'e689e315ec8f4f0d56fb2d57240c1ce420667d958eb5f1c396929a0dc3f30375';
const DEFAULT_APP_ID = 'c6a045dd6e835fa5e6b958eff6d62105fdc028c7e4f901f0fba7f9c602a91b6e';

// Build the GraphQL endpoint URL
export function getGraphQLEndpoint(chainId?: string, appId?: string) {
  const chain = chainId || DEFAULT_CHAIN_ID;
  const app = appId || DEFAULT_APP_ID;
  return `http://localhost:8081/chains/${chain}/applications/${app}`;
}

// Apollo client configured for Linera service
export const client = new ApolloClient({
  uri: getGraphQLEndpoint(),
  cache: new InMemoryCache(),
  defaultOptions: {
    query: { fetchPolicy: 'network-only' },
    mutate: { fetchPolicy: 'no-cache' },
  },
});

// =============================================================================
// QUERIES
// =============================================================================

export const GET_MATCH_STATE = gql`
  query GetMatchState {
    player1
    player2
    player1Score
    player2Score
    status
    winner
  }
`;

// =============================================================================
// MUTATIONS
// =============================================================================

export const CREATE_MATCH = gql`
  mutation CreateMatch {
    createMatch
  }
`;

export const JOIN_MATCH = gql`
  mutation JoinMatch {
    joinMatch
  }
`;

export const REPORT_SCORE = gql`
  mutation ReportScore($scorer: Int!) {
    reportScore(scorer: $scorer)
  }
`;

export const FORFEIT = gql`
  mutation Forfeit {
    forfeit
  }
`;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export async function createMatch() {
  try {
    const result = await client.mutate({ mutation: CREATE_MATCH });
    console.log('Match created:', result.data);
    return result.data;
  } catch (error) {
    console.error('Failed to create match:', error);
    throw error;
  }
}

export async function reportScore(scorer: 1 | 2) {
  try {
    const result = await client.mutate({
      mutation: REPORT_SCORE,
      variables: { scorer },
    });
    console.log('Score reported:', result.data);
    return result.data;
  } catch (error) {
    console.error('Failed to report score:', error);
    throw error;
  }
}

export async function getMatchState() {
  try {
    const result = await client.query({ query: GET_MATCH_STATE });
    return result.data;
  } catch (error) {
    console.error('Failed to get match state:', error);
    throw error;
  }
}

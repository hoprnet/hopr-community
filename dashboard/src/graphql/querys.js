import { gql } from '@apollo/client';

export const GET_ACCOUNTS = gql`
  query GetExchangeRates {
    accounts(first: 5) {
      id
      multiaddr
      channels {
        id
      }
      hasAnnounced
    }
    channels(first: 5) {
      id
      source {
        id
      }
      destination {
        id
      }
      balance
    }
  }
`;

import { gql } from '@apollo/client';

export const GET_ACCOUNTS = gql`
  query GetAccounts {
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

export const GET_ADDRESS = gql`
  query GetAddress($id: ID) {
    accounts(where: { id: $id }) {
      id
      multiaddr
      channels {
        id
      }
      hasAnnounced
    }
  }
`;

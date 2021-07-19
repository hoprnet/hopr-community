import { WalletConnectConnector } from '@web3-react/walletconnect-connector'

const POLLING_INTERVAL = 12000
const RPC_URLS: { [chainId: number]: string } = {
  1: 'https://mainnet.infura.io/v3/84842078b09946638c03157f83405213',
  4: 'https://rinkeby.infura.io/v3/84842078b09946638c03157f83405213',
}

export const RPC_COLOURS: { [chainId: number]: { bg: string, color: string} } = {
  5: { bg:"lightblue", color:"#414141" }
}

export const walletconnect = new WalletConnectConnector({
  rpc: { 1: RPC_URLS[1], 4: RPC_URLS[4] },
  qrcode: true,
  pollingInterval: POLLING_INTERVAL,
})

export const chainIdToNetwork = (chainId: number): string => {
  switch (chainId) {
    case 5:
      return "goerli";
    case 31337:
      return "hardhat";
    default:
      return "localhost";
  }
};
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'

const POLLING_INTERVAL = 12000
const RPC_URLS: { [chainId: number]: string } = {
  5: 'https://goerli-light.eth.linkpool.io/',
  100: 'https://rpc.xdaichain.com/',
}

export const RPC_COLOURS: { [chainId: number]: { bg: string, color: string} } = {
  5: { bg:"lightblue", color:"#414141" },
  100: { bg:"yellow.500", color:"#414141" }
}

export const walletconnect = new WalletConnectConnector({
  rpc: { 5: RPC_URLS[5], 100: RPC_URLS[100] },
  qrcode: true,
  pollingInterval: POLLING_INTERVAL,
})

export const chainIdToNetwork = (chainId: number): string => {
  switch (chainId) {
    case 5:
      return "goerli";
    case 100:
      return "xdai";
    case 31337:
      return "hardhat";
    default:
      return "localhost";
  }
};
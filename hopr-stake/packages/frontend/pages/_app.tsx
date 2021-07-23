import { ChakraProvider } from '@chakra-ui/react'
import {
  ChainId,
  Config,
  DAppProvider,
  MULTICALL_ADDRESSES,
} from '@usedapp/core'
import type { AppProps } from 'next/app'
import React from 'react'
import Multicall from '@hoprnet/hopr-stake/deployments/localhost/Multicall.json'

const config: Config = {
  readOnlyChainId: ChainId.xDai,
  readOnlyUrls: {
    [ChainId.Goerli]: `https://goerli.infura.io/v3/de898745bd39430f9cf6e359b911257a`,
    [ChainId.xDai]: `https://rpc.xdaichain.com/`,
    [ChainId.Hardhat]: 'http://localhost:8545',
    [ChainId.Localhost]: 'http://localhost:8545',
  },
  supportedChains: [
    ChainId.Goerli,
    ChainId.xDai,
    ChainId.Localhost,
    ChainId.Hardhat,
  ],
  multicallAddresses: {
    ...MULTICALL_ADDRESSES,
    [ChainId.Hardhat]: Multicall.address,
    [ChainId.Localhost]: Multicall.address,
  },
}

const MyApp = ({ Component, pageProps }: AppProps): JSX.Element => {
  return (
    <DAppProvider config={config}>
      <ChakraProvider>
        <Component {...pageProps} />
      </ChakraProvider>
    </DAppProvider>
  )
}

export default MyApp

import { Text, Tag, Box } from '@chakra-ui/react'
import { useEtherBalance, useEthers } from '@usedapp/core'
import { utils } from 'ethers'
import {
  chainIdToNetwork,
  chainToNativeToken,
  RPC_COLOURS,
} from '../lib/connectors'
import { round } from '../lib/helpers'
import { CurrencyTag } from './atoms/CurrencyTag'
import { TokenBalance } from './atoms/TokenBalance'
import { EtherBalance } from './atoms/EtherBalance'

/**
 * Component
 */
function Balance({
  xHOPRContractAddress,
}: {
  xHOPRContractAddress: string
}): JSX.Element {
  const { chainId } = useEthers()

  const colours = RPC_COLOURS[chainId]

  return (
    <>
      <Box d="flex" alignItems="baseline" mr="20px">
        <TokenBalance tokenContract={xHOPRContractAddress} />
        <CurrencyTag tag={'xHOPR'} />
      </Box>
      <Box d="flex" alignItems="baseline">
        <EtherBalance />
        <CurrencyTag tag={chainToNativeToken(chainId)} />
      </Box>
      <Tag px="10px" ml="10" textTransform="uppercase" {...colours}>
        {chainIdToNetwork(chainId) || 'Loading...'}
      </Tag>
    </>
  )
}

export default Balance

import { Text, Tag } from '@chakra-ui/react'
import { ChainId, useEtherBalance } from '@usedapp/core'
import { utils } from 'ethers'
import { chainIdToNetwork, RPC_COLOURS } from '../lib/connectors'
import { XHoprBalance } from './XHoprBalance'

/**
 * Component
 */
function Balance({
  chainId,
  account,
  xHOPRContractAddress,
}: {
  chainId: ChainId
  account: string
  xHOPRContractAddress: string
}): JSX.Element {
  const etherBalance = useEtherBalance(account)
  const finalBalance = etherBalance
    ? Number(utils.formatEther(etherBalance)).toFixed(3)
    : '0.00'

  const colours = RPC_COLOURS[chainId]

  return (
    <>
      <Tag mr="5" textTransform="capitalize" {...colours}>
        {chainIdToNetwork(chainId) || 'Loading...'}
      </Tag>
      <Text fontFamily="mono">
        <XHoprBalance xHOPRContractAddress={xHOPRContractAddress} />{' '}
        <Tag>xHOPR</Tag>
      </Text>
      &nbsp;
      <Text fontFamily="mono">
        {finalBalance} <Tag variant={'outline'}>ETH</Tag>
      </Text>
    </>
  )
}

export default Balance

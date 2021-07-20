import { Text, Tag } from '@chakra-ui/react'
import { ChainId, useEtherBalance } from '@usedapp/core'
import { utils } from 'ethers'
import { chainIdToNetwork, chainToNativeToken, RPC_COLOURS } from '../lib/connectors'
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
    ? Number(utils.formatEther(etherBalance)).toFixed(4)
    : '0.00'

  const colours = RPC_COLOURS[chainId]

  return (
    <>
      <Text mr="5" fontFamily="mono">
        <XHoprBalance xHOPRContractAddress={xHOPRContractAddress} />{' '}
        <Tag>xHOPR</Tag>
      </Text>
      <Text mr="5" fontFamily="mono">
        {finalBalance} <Tag variant={'outline'}>{chainToNativeToken(chainId)}</Tag>
      </Text>
      <Tag ml="10" textTransform="uppercase" {...colours}>
        {chainIdToNetwork(chainId) || 'Loading...'}
      </Tag>
    </>
  )
}

export default Balance

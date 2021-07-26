import { Text, Tag } from '@chakra-ui/react'
import { useEtherBalance, useEthers } from '@usedapp/core'
import { utils } from 'ethers'
import { chainIdToNetwork, chainToNativeToken, RPC_COLOURS } from '../lib/connectors'
import { round } from '../lib/helpers'
import { XHoprBalance } from './XHoprBalance'

/**
 * Component
 */
function Balance({
  xHOPRContractAddress,
}: {
  xHOPRContractAddress: string
}): JSX.Element {
  const { chainId, account } = useEthers()
  const etherBalance = useEtherBalance(account)
  const finalBalance = etherBalance
    ? round(Number(utils.formatEther(etherBalance)), 4)
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
      <Tag px="10px" ml="10" textTransform="uppercase" {...colours}>
        {chainIdToNetwork(chainId) || 'Loading...'}
      </Tag>
    </>
  )
}

export default Balance

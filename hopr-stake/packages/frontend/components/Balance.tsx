import { Text, Tag } from '@chakra-ui/react'
import { ChainId, useEtherBalance } from '@usedapp/core'
import { utils } from 'ethers'
import { chainIdToNetwork } from '../lib/connectors'
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

  return (
    <>
      <Tag mr="5" textTransform="capitalize" bg="lightblue" color="#414141">
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

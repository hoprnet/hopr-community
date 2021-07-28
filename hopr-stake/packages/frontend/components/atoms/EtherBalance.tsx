import { utils } from 'ethers'
import { useEtherBalance, useEthers } from '@usedapp/core'
import { Skeleton, Tag } from '@chakra-ui/react'
import { round } from '../../lib/helpers'
import { RPC_COLOURS } from '../../lib/connectors'

export const EtherBalance = ({
  givenAccount,
}: {
  givenAccount?: string
}): JSX.Element => {
  let isLoaded = false
  const { account, chainId } = useEthers()
  const etherBalance = useEtherBalance(givenAccount || account)
  const balance = etherBalance
    ? round(Number(utils.formatEther(etherBalance)), 4)
    : '0.00'
  isLoaded = true

  const colours = RPC_COLOURS[chainId]

  return (
    <>
      <Skeleton isLoaded={isLoaded} mr="5px">
        <Tag mr="5px" colorScheme={colours.scheme} fontFamily="mono">
          {balance}
        </Tag>
      </Skeleton>
    </>
  )
}

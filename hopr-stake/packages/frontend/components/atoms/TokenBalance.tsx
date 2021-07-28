import { utils, constants } from 'ethers'
import { useEthers, useTokenBalance } from '@usedapp/core'
import { Skeleton, Tag } from '@chakra-ui/react'
import { round } from '../../lib/helpers'

export const TokenBalance = ({
  tokenContract,
  givenAccount,
  colorScheme = 'green',
}: {
  tokenContract: string
  givenAccount?: string
  colorScheme?: string
}): JSX.Element => {
  let isLoaded = false;
  const { account } = useEthers()
  
  const tokenBalance =
    useTokenBalance(tokenContract, givenAccount || account) || constants.Zero
  const balance = tokenBalance
    ? round(Number(utils.formatEther(tokenBalance)), 4)
    : '--'
    isLoaded = true;

  return (
    <>
      <Skeleton isLoaded={isLoaded} mr="5px">
        <Tag mr="5px" colorScheme={colorScheme} fontFamily="mono">
          {balance}
        </Tag>
      </Skeleton>
    </>
  )
}

import { Text, Tag } from '@chakra-ui/react'
import { ChainId, useEtherBalance, useTokenBalance } from '@usedapp/core'
import { utils, constants } from 'ethers'

/**
 * Component
 */
function Balance({
  chainId,
  account,
  xHOPRAddress,
}: {
  chainId: ChainId
  account: string
  xHOPRAddress: string
}): JSX.Element {
  const etherBalance = useEtherBalance(account)
  const xHOPRBalance = useTokenBalance(
    xHOPRAddress || constants.Zero.toHexString(),
    account
  )
  const finalBalance = etherBalance
    ? Number(utils.formatEther(etherBalance)).toFixed(3)
    : '0.00'
  const xHOPRFinalBalance = xHOPRBalance
    ? Number(utils.formatEther(xHOPRBalance)).toFixed(3)
    : '0.00'

  return (
    <>
      <Tag mr="5" backgroundColor="lightblue">
        Network {chainId}
      </Tag>
      <Text fontFamily="mono">
        {xHOPRFinalBalance} <Tag>xHOPR</Tag>
      </Text>
      &nbsp;
      <Text fontFamily="mono">
        {finalBalance} <Tag variant={'outline'}>ETH</Tag>
      </Text>
    </>
  )
}

export default Balance

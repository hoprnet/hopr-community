import { Text } from '@chakra-ui/react'
import { utils, constants } from 'ethers'
import { useEthers, useTokenBalance } from '@usedapp/core'

export const XHoprBalance = ({
  xHOPRContractAddress
}: {
  xHOPRContractAddress: string,
}): JSX.Element => {
  const { account } = useEthers();
  const xHOPRBalance = useTokenBalance(
    xHOPRContractAddress || constants.Zero.toHexString(),
    account
  )
  const xHOPRFinalBalance = xHOPRBalance
    ? Number(utils.formatEther(xHOPRBalance)).toFixed(3)
    : '0.00'

  return <>{xHOPRFinalBalance}</>
}

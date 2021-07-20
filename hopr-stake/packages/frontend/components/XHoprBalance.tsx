import { utils, constants } from 'ethers'
import { useEthers, useTokenBalance } from '@usedapp/core'

export const XHoprBalance = ({
  xHOPRContractAddress,
  givenAccount
}: {
  xHOPRContractAddress: string,
  givenAccount?: string,
}): JSX.Element => {
  const { account } = useEthers();
  const xHOPRBalance = useTokenBalance(
    xHOPRContractAddress || constants.Zero.toHexString(),
    givenAccount || account
  )
  const xHOPRFinalBalance = xHOPRBalance
    ? Number(utils.formatEther(xHOPRBalance)).toFixed(4)
    : '--'

  return <>{xHOPRFinalBalance}</>
}

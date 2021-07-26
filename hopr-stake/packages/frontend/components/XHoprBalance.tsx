import { utils, constants } from 'ethers'
import { useEthers, useTokenBalance } from '@usedapp/core'
import { round } from '../lib/helpers'

export const XHoprBalance = ({
  xHOPRContractAddress,
  givenAccount,
}: {
  xHOPRContractAddress: string
  givenAccount?: string
}): JSX.Element => {
  const { account } = useEthers()
  const xHOPRBalance = useTokenBalance(
    xHOPRContractAddress,
    givenAccount || account
  ) || constants.Zero
  const xHOPRFinalBalance = xHOPRBalance
    ? round(Number(utils.formatEther(xHOPRBalance)), 4)
    : '--'

  return <>{xHOPRFinalBalance}</>
}

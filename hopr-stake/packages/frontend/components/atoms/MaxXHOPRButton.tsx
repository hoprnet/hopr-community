import { utils, constants } from 'ethers'
import { useEthers, useTokenBalance } from '@usedapp/core'
import { Button } from '@chakra-ui/react'
import { round } from '../../lib/helpers'

export const MaxXHOPRButton = ({
  XHOPRContractAddress,
  updateBalanceHandler,
}: {
  XHOPRContractAddress: string
  updateBalanceHandler: (balance: string) => void
}): JSX.Element => {
  const { account } = useEthers()

  const tokenBalance =
    useTokenBalance(XHOPRContractAddress, account) || constants.Zero
  const balance = tokenBalance
    ? round(Number(utils.formatEther(tokenBalance)), 4)
    : '--'

  return (
    <Button
      ml="5px"
      width="10rem"
      size="sm"
      bg="blue.100"
      onClick={() => updateBalanceHandler(balance)}
    >
      Max
    </Button>
  )
}

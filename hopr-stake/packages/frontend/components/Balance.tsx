import { Text, Tag } from '@chakra-ui/react'
import { useEtherBalance, useEthers, useTokenBalance } from '@usedapp/core'
import { xHOPR as LOCAL_XHOPR_TOKEN_CONTRACT_ADDRESS } from '../artifacts/contracts/contractAddress'
import { utils } from 'ethers'

/**
 * Component
 */
function Balance(): JSX.Element {
  const { account } = useEthers()
  const etherBalance = useEtherBalance(account)
  console.log('Account Address', account)
  const xHOPRBalance = useTokenBalance(LOCAL_XHOPR_TOKEN_CONTRACT_ADDRESS, account)
  const finalBalance = etherBalance ? Number(utils.formatEther(etherBalance)).toFixed(3) : '0.00'
  const xHOPRFinalBalance = xHOPRBalance ? Number(utils.formatEther(xHOPRBalance)).toFixed(3) : '0.00'

  return <>
    <Text fontFamily="mono">{xHOPRFinalBalance} <Tag>xHOPR</Tag></Text>&nbsp;
    <Text fontFamily="mono">{finalBalance} <Tag variant={"outline"}>ETH</Tag></Text>
  </>
}

export default Balance

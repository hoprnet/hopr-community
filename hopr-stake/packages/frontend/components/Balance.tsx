import { Text, Tag } from '@chakra-ui/react'
import { useEtherBalance, useEthers, useTokenBalance } from '@usedapp/core'
import { xHOPR as LOCAL_XHOPR_TOKEN_CONTRACT_ADDRESS } from '../artifacts/contracts/contractAddress'
import { utils, constants } from 'ethers'
import { chainIdToNetwork } from '../lib/connectors'
import { getContractAddresses, IContractAddress } from '../lib/addresses'


/**
 * Component
 */
function Balance({ chainId, account, xHOPRAddress }): JSX.Element {
  const etherBalance = useEtherBalance(account)  
  const xHOPRBalance = useTokenBalance(xHOPRAddress || constants.Zero, account);
  console.log('xHOPR Balance', xHOPRBalance)
  const finalBalance = etherBalance ? Number(utils.formatEther(etherBalance)).toFixed(3) : '0.00'
  const xHOPRFinalBalance = xHOPRBalance ? Number(utils.formatEther(xHOPRBalance)).toFixed(3) : '0.00'

  return <>
    <Tag mr="5" backgroundColor="lightblue">Network {chainId}</Tag>
    <Text fontFamily="mono">{xHOPRFinalBalance} <Tag>xHOPR</Tag></Text>&nbsp;
    <Text fontFamily="mono">{finalBalance} <Tag variant={"outline"}>ETH</Tag></Text>
  </>
}

export default Balance

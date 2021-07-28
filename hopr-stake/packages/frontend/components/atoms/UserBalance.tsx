import { Tag } from '@chakra-ui/react'
import { useEthers } from '@usedapp/core'
import {
  chainIdToNetwork,
  chainToNativeToken,
  RPC_COLOURS,
} from '../../lib/connectors'
import { CurrencyTag } from './CurrencyTag'
import { TokenBalance } from './TokenBalance'
import { EtherBalance } from './EtherBalance'
import { BalanceWithCurrency } from '../molecules/BalanceWithCurrency'

/**
 * Component
 */
function Balance({
  xHOPRContractAddress,
}: {
  xHOPRContractAddress: string
}): JSX.Element {
  const { chainId } = useEthers()
  const colours = RPC_COLOURS[chainId]

  return (
    <>
      <BalanceWithCurrency
        balanceElement={<TokenBalance tokenContract={xHOPRContractAddress} />}
        currencyElement={<CurrencyTag tag={'xHOPR'} />}
        props={{ mr: '20px' }}
      />
      <BalanceWithCurrency
        balanceElement={<EtherBalance />}
        currencyElement={<CurrencyTag tag={chainToNativeToken(chainId)} />}
      />
      <Tag px="10px" ml="10" textTransform="uppercase" {...colours}>
        {chainIdToNetwork(chainId) || 'Loading...'}
      </Tag>
    </>
  )
}

export default Balance

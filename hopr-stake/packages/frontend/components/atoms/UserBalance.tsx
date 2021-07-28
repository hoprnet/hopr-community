import { useEthers } from '@usedapp/core'
import { chainToNativeToken } from '../../lib/connectors'
import { CurrencyTag } from './CurrencyTag'
import { TokenBalance } from './TokenBalance'
import { EtherBalance } from './EtherBalance'
import { BalanceWithCurrency } from '../molecules/BalanceWithCurrency'

/**
 * Component
 */
function UserBalance({
  wxHOPRContractAddress,
  xHOPRContractAddress,
}: {
  wxHOPRContractAddress: string
  xHOPRContractAddress: string
}): JSX.Element {
  const { chainId } = useEthers()

  return (
    <>
      <BalanceWithCurrency
        balanceElement={
          <TokenBalance
            colorScheme="blue"
            tokenContract={wxHOPRContractAddress}
          />
        }
        currencyElement={<CurrencyTag tag={'wxHOPR'} />}
        props={{ mr: '20px' }}
      />
      <BalanceWithCurrency
        balanceElement={<TokenBalance tokenContract={xHOPRContractAddress} />}
        currencyElement={<CurrencyTag tag={'xHOPR'} />}
        props={{ mr: '20px' }}
      />
      <BalanceWithCurrency
        balanceElement={<EtherBalance />}
        currencyElement={<CurrencyTag tag={chainToNativeToken(chainId)} />}
      />
    </>
  )
}

export default UserBalance

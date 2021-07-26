import { useEthers } from '@usedapp/core'
import { useEffect, useReducer } from 'react'
import { nonEmptyAccount } from '../lib/helpers'
import { fetchAccountData, initialState, reducer } from '../lib/reducers'

export const HoprStakeBalance = ({
  HoprStakeContractAddress,
}: {
  HoprStakeContractAddress: string
}): JSX.Element => {
  const { account, library } = useEthers()
  const [state, dispatch] = useReducer(reducer, initialState)
  useEffect(() => {
    const loadAccountData = async () => {
      nonEmptyAccount(account) && await fetchAccountData(
        HoprStakeContractAddress,
        account,
        library,
        dispatch
      )
    }
    loadAccountData()
  }, [account, library, HoprStakeContractAddress])
  return <>{state.stakedHOPRTokens || '--'}</>
}

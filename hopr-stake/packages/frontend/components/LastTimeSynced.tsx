import { useBlockNumber, useEthers } from '@usedapp/core'
import { useEffect, useReducer } from 'react'
import { nonEmptyAccount } from '../lib/helpers'
import { fetchAccountData, initialState, reducer } from '../lib/reducers'

export const LastTimeSynced = ({
  HoprStakeContractAddress,
}: {
  HoprStakeContractAddress: string
}): JSX.Element => {
  const { account, library } = useEthers()
  const [state, dispatch] = useReducer(reducer, initialState)
  const block = useBlockNumber();
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
  }, [state.lastSync, account, library, HoprStakeContractAddress, block])
  return <>{state.lastSync ? state.lastSync == "" ? 'Never' : new Date(+state.lastSync * 1000).toUTCString() : '--'}</>
}

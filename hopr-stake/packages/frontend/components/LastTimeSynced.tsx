import { useBlockNumber, useEthers } from '@usedapp/core'
import { Dispatch, useEffect } from 'react'
import { nonEmptyAccount } from '../lib/helpers'
import { ActionType, fetchAccountData, StateType } from '../lib/reducers'

export const LastTimeSynced = ({
  HoprStakeContractAddress,
  state,
  dispatch,
}: {
  HoprStakeContractAddress: string
  state: StateType
  dispatch: Dispatch<ActionType>
}): JSX.Element => {
  const { account, library } = useEthers()
  const block = useBlockNumber()
  useEffect(() => {
    const loadAccountData = async () => {
      nonEmptyAccount(account) &&
        (await fetchAccountData(
          HoprStakeContractAddress,
          account,
          library,
          dispatch
        ))
    }
    loadAccountData()
  }, [])
  return (
    <>
      {state.lastSync
        ? state.lastSync == '0'
          ? 'Never'
          : new Date(+state.lastSync * 1000).toUTCString()
        : '--'}
    </>
  )
}

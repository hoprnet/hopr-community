import { useEthers } from '@usedapp/core'
import { Dispatch, useEffect } from 'react'
import { nonEmptyAccount } from '../lib/helpers'
import {
  ActionType,
  fetchAccountData,
  StateType,
} from '../lib/reducers'

export const HoprStakeBalance = ({
  HoprStakeContractAddress,
  state,
  dispatch,
}: {
  HoprStakeContractAddress: string
  state: StateType
  dispatch: Dispatch<ActionType>
}): JSX.Element => {
  const { account, library } = useEthers()
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
  }, [HoprStakeContractAddress, account, library, dispatch])
  return <>{state.stakedHOPRTokens || '--'}</>
}

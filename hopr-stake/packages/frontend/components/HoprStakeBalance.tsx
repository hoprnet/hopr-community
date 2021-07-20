import { useEthers } from '@usedapp/core'
import { useEffect, useReducer } from 'react'
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
      await fetchAccountData(
        HoprStakeContractAddress,
        account,
        library,
        dispatch
      )
    }
    loadAccountData()
  })
  return <>{state.stakedHOPRTokens || '--'}</>
}

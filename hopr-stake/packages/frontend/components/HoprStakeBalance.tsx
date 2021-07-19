import { useEthers } from '@usedapp/core'
import { useEffect, useReducer } from 'react'
import { fetchStakedXHOPRTokens, initialState, reducer } from '../lib/reducers'

export const HoprStakeBalance = ({
  HoprStakeContractAddress,
}: {
  HoprStakeContractAddress: string
}): JSX.Element => {
  const { account, library } = useEthers()
  const [state, dispatch] = useReducer(reducer, initialState)
  useEffect(() => {
    const loadStakedXHoprBalance = async () => {
      await fetchStakedXHOPRTokens(
        HoprStakeContractAddress,
        account,
        library,
        dispatch
      )
    }
    loadStakedXHoprBalance()
  })
  return <>{state.amount || 'Loading...'}</>
}

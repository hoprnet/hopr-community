import { Text } from '@chakra-ui/react'
import { Dispatch, useEffect } from 'react'
import { ActionType, fetchAccountData, StateType } from '../lib/reducers'
import { useEthers } from '@usedapp/core'
import { nonEmptyAccount } from '../lib/helpers'

export const ClaimableRewards = ({
  HoprStakeContractAddress,
  state,
  dispatch,
}: {
  HoprStakeContractAddress: string
  state: StateType
  dispatch: Dispatch<ActionType>
}): JSX.Element => {
  const { library, account } = useEthers()
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
      <Text ml="6px" fontSize="sm" fontFamily="mono">
        {state.yetToClaimRewards} wxHOPR (Since last sync)
      </Text>
    </>
  )
}

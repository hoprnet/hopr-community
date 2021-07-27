import { useEthers } from '@usedapp/core'
import { Button } from '@chakra-ui/react'
import { Dispatch, useEffect } from 'react'
import {
  ActionType,
  fetchAccountData,
  setSync,
  StateType,
} from '../lib/reducers'
import { nonEmptyAccount } from '../lib/helpers'

export const SyncButton = ({
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
  }, [])
  return (
    <Button
      size="md"
      bg="blackAlpha.900"
      color="whiteAlpha.900"
      isLoading={state.isLoadingSync}
      onClick={() => {
        setSync(HoprStakeContractAddress, state, library, dispatch)
      }}
    >
      Sync Rewards
    </Button>
  )
}

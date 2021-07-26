import { useEthers } from '@usedapp/core'
import { Button } from '@chakra-ui/react'
import { useEffect, useReducer } from 'react'
import {
  fetchAccountData,
  initialState,
  reducer,
  setSync,
} from '../lib/reducers'
import { nonEmptyAccount } from '../lib/helpers'

export const SyncButton = ({
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
  }, [state.lastSync, account, library, HoprStakeContractAddress])
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

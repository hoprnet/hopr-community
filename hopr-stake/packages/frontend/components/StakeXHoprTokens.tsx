import {
  Button,
  InputGroup,
  Input,
  InputRightElement,
  Text,
  Box,
} from '@chakra-ui/react'
import { HoprStakeBalance } from '../components/HoprStakeBalance'
import { LastTimeSynced } from '../components/LastTimeSynced'
import { SyncButton } from '../components/SyncButton'
import { ClaimableRewards } from '../components/ClaimableRewards'
import { ActionType, setStaking, StateType } from '../lib/reducers'
import { RPC_COLOURS } from '../lib/connectors'
import { useBlockNumber, useEthers } from '@usedapp/core'
import { Dispatch } from 'react'
import { EndProgramDateDays } from './atoms/ProgramDate'
import { format } from 'timeago.js'

export const StakeXHoprTokens = ({
  XHOPRContractAddress,
  HoprStakeContractAddress,
  state,
  dispatch,
}: {
  XHOPRContractAddress: string
  HoprStakeContractAddress: string
  state: StateType
  dispatch: Dispatch<ActionType>
}): JSX.Element => {
  const { chainId, library, account } = useEthers()
  const block = useBlockNumber()
  const colours = RPC_COLOURS[chainId]

  const timeDiff = (new Date().getTime() - (+state.lastSync * 1000)) / 1000 // to seconds
  const baseBoost = 1/1e12
  const bonusBoost = ((state.totalAPRBoost / 317 * 3600 * 24) / 1e12) * 365
  const totalBoost = bonusBoost + baseBoost;
  const estimatedRewards = timeDiff * (+state.stakedHOPRTokens * totalBoost)

  return (
    <>
      <Box d="flex" justifyContent="space-between" mb="10px">
        <Box d="flex" alignItems="center">
          <Text fontSize="xl" fontWeight="900">
            Stake xHOPR tokens
          </Text>
          <Text ml="10px" fontSize="sm" fontWeight="400">
            You won’t be able to recover your stake until the staking program
            ends.
          </Text>
        </Box>
        <Box d="flex" alignItems="center">
          <Text fontWeight="600" fontSize="md" mr="5px">
            Blocks
          </Text>
          <Text ml="6px" fontSize="sm" fontFamily="mono">
            {block}
          </Text>
        </Box>
      </Box>
      <Box d="flex" justifyContent="space-between" alignItems="center">
        <Box d="flex" alignItems="center">
          <Text fontWeight="600" fontSize="md" mr="5px">
            Staked -{' '}
          </Text>
          <Text fontFamily="mono" fontSize="sm">
            <HoprStakeBalance
              HoprStakeContractAddress={HoprStakeContractAddress}
              state={state}
              dispatch={dispatch}
            />{' '}
            xHOPR
          </Text>
        </Box>
        <Box d="flex" alignItems="center">
          <Text fontWeight="600" fontSize="md" mr="5px">
            Rewards (every sec)
          </Text>
          <Text ml="6px" fontSize="sm" fontFamily="mono">
            +{baseBoost.toFixed(18)}% Base
          </Text>
          <Text ml="6px" fontSize="sm" fontFamily="mono" color="green.600">
            +{bonusBoost}% Boost
          </Text>
        </Box>
      </Box>
      <Box
        d="flex"
        justifyContent="space-between"
        alignItems="center"
        mt="10px"
      >
        <InputGroup size="md">
          <Input
            pr="10.5rem"
            type={'number'}
            placeholder="Enter amount"
            onChange={(e) => {
              dispatch({
                type: 'SET_STAKING_AMOUNT',
                amountValue: e.target.value,
              })
            }}
          />
          {account && (
            <InputRightElement width="10.5rem">
              <Button
                width="10rem"
                size="sm"
                isLoading={state.isLoading}
                onClick={() => {
                  setStaking(
                    XHOPRContractAddress,
                    HoprStakeContractAddress,
                    state,
                    library,
                    dispatch
                  )
                }}
                {...colours}
              >
                {state.isLoading ? 'Loading...' : 'Stake xHOPR tokens'}
              </Button>
            </InputRightElement>
          )}
        </InputGroup>
      </Box>
      <Box
        mt="20px"
        d="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Box>
          <Text fontSize="sm" fontFamily="mono">
            Last time synced:{' '}
            <LastTimeSynced
              HoprStakeContractAddress={HoprStakeContractAddress}
              state={state}
              dispatch={dispatch}
            />{' '}
            {+state.lastSync > 0 && `(${format(+state.lastSync * 1000)})`}
          </Text>
          <Box d="flex" alignItems="center">
            <Text fontWeight="600" fontSize="md" mr="5px">
              Claimable -
            </Text>
            <ClaimableRewards
              HoprStakeContractAddress={HoprStakeContractAddress}
              state={state}
              dispatch={dispatch}
            />
            <Text ml="6px" fontSize="sm" fontFamily="mono" color="blue.600">
              + {estimatedRewards.toFixed(18)} (Estimated)
            </Text>
          </Box>
        </Box>
        {account && (
          <Box textAlign="right">
            <SyncButton
              HoprStakeContractAddress={HoprStakeContractAddress}
              state={state}
              dispatch={dispatch}
            />
            <Button
              size="md"
              ml="10px"
              bg="blackAlpha.900"
              color="whiteAlpha.900"
              isDisabled={true}
            >
              Claim Rewards (<EndProgramDateDays HoprStakeContractAddress={HoprStakeContractAddress} />  to go)
            </Button>
          </Box>
        )}
      </Box>
    </>
  )
}

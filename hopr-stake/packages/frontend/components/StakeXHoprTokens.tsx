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
import { initialState, reducer, setStaking } from '../lib/reducers'
import { RPC_COLOURS } from '../lib/connectors'
import { useBlockNumber, useEthers } from '@usedapp/core'
import { useReducer } from 'react'

export const StakeXHoprTokens = ({
  XHOPRContractAddress,
  HoprStakeContractAddress,
}: {
  XHOPRContractAddress: string
  HoprStakeContractAddress: string
}): JSX.Element => {
  const { chainId, library, account } = useEthers()
  const block = useBlockNumber();
  const [state, dispatch] = useReducer(reducer, initialState)
  const colours = RPC_COLOURS[chainId]

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
            />{' '}
            xHOPR
          </Text>
        </Box>
        <Box d="flex" alignItems="center">
          <Text fontWeight="600" fontSize="md" mr="5px">
            Rewards (every sec)
          </Text>
          <Text ml="6px" fontSize="sm" fontFamily="mono">
            +0.000010% Base
          </Text>
          <Text ml="6px" fontSize="sm" fontFamily="mono" color="green.600">
            +0.0000025% Boost
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
            /> (X time ago)
          </Text>
          <Box d="flex" alignItems="center">
            <Text fontWeight="600" fontSize="md" mr="5px">
              Claimable -
            </Text>
            <Text ml="6px" fontSize="sm" fontFamily="mono">
              0.12 wxHOPR (Since last sync)
            </Text>
            <Text ml="6px" fontSize="sm" fontFamily="mono" color="blue.600">
              + 0.0016831 Boost (Estimated)
            </Text>
          </Box>
        </Box>
        {account && (
          <Box textAlign="right">
            <SyncButton HoprStakeContractAddress={HoprStakeContractAddress} />
            <Button
              size="md"
              ml="10px"
              bg="blackAlpha.900"
              color="whiteAlpha.900"
              isDisabled={true}
            >
              Claim Rewards (175 days to go)
            </Button>
          </Box>
        )}
      </Box>
    </>
  )
}

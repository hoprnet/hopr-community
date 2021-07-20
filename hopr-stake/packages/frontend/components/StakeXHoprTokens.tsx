import {
  Button,
  InputGroup,
  Input,
  InputRightElement,
  Text,
  Box,
  Tag,
} from '@chakra-ui/react'
import { HoprStakeBalance } from '../components/HoprStakeBalance'
import { LastTimeSynced } from '../components/LastTimeSynced'
import { initialState, reducer, setStaking } from '../lib/reducers'
import { RPC_COLOURS } from '../lib/connectors'
import { useEthers } from '@usedapp/core'
import { useReducer } from 'react'

export const StakeXHoprTokens = ({
  XHOPRContractAddress,
  HoprStakeContractAddress,
}: {
  XHOPRContractAddress: string
  HoprStakeContractAddress: string
}): JSX.Element => {
  const { chainId, library } = useEthers()
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
            Your xHOPR tokens will be sent to our smart contract upon locking.
          </Text>
        </Box>
        <Box d="flex">
          <Tag size="lg" variant="outline" colorScheme="green">
            APR boost (from NFTs): --%
          </Tag>
          <Tag ml="10px" size="lg" variant="outline" colorScheme="blue">
            Your total APR: --
          </Tag>
        </Box>
      </Box>
      <Box d="flex" justifyContent="space-between" alignItems="center">
        <Text fontSize="md" fontFamily="mono">
          Staked:{' '}
          <HoprStakeBalance
            HoprStakeContractAddress={HoprStakeContractAddress}
          />
        </Text>
        <Text fontSize="md" fontFamily="mono">
          Current Rewards (in xHOPR tokens): --
        </Text>
        <Text fontSize="sm" fontFamily="mono">
          Last time synced:{' '}
          <LastTimeSynced HoprStakeContractAddress={HoprStakeContractAddress} />
        </Text>
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
        </InputGroup>
      </Box>
    </>
  )
}

import {
  Box,
  Heading,
  Text,
  Tag,
  Link,
  useColorMode,
  Button,
  InputGroup,
  Input,
  InputRightElement,
} from '@chakra-ui/react'
import { useEthers } from '@usedapp/core'
import React, { useEffect, useReducer, useState } from 'react'
import { DarkModeSwitch } from '../components/DarkModeSwitch'
import Layout from '../components/layout/Layout'
import {
  emptyContractAddresses,
  getContractAddresses,
  IContractAddress,
} from '../lib/addresses'
import { XHoprBalance } from '../components/XHoprBalance'
import { HoprStakeBalance } from '../components/HoprStakeBalance'
import { initialState, reducer, setStaking } from '../lib/reducers'
import { RPC_COLOURS } from '../lib/connectors'

function HomeIndex(): JSX.Element {
  const { chainId, library } = useEthers()
  const { colorMode } = useColorMode()
  const [ state, dispatch] = useReducer(reducer, initialState)

  const bgColor = { light: 'gray.50', dark: 'gray.900' }
  const color = { light: '#414141', dark: 'white' }
  const [contractAddresses, setContractAddresses] = useState<IContractAddress>(
    emptyContractAddresses
  )

  useEffect(() => {
    const loadContracts = async () => {
      const contractAddresses = await getContractAddresses(chainId)
      setContractAddresses(contractAddresses)
    }
    loadContracts()
  }, [chainId])

  const colours = RPC_COLOURS[chainId]
  
  return (
    <Layout>
      <Heading as="h1" mb="8">
        HOPR Staking
      </Heading>

      <Text mt="8" fontSize="xl">
        Lock your xHOPR tokens for <Tag size="lg">175 days</Tag> to earn up to
        18.5% of your staked amount. Increase your APY % by activating NFTs on
        your account, which can be earned by participating in HOPR testnets and
        activities. Follow our{' '}
        <Link href="https://twitter.com/hoprnet">Twitter</Link>
        account to learn about new events.
      </Text>
      <Box
        maxWidth="container.l"
        p="8"
        mt="8"
        bg={bgColor[colorMode]}
        color={color[colorMode]}
      >
        <Box d="flex" justifyContent="space-between" alignItems="center">
          <Text fontSize="xl" fontWeight="900">
            Stake xHOPR tokens
          </Text>
          <Text fontSize="xl" fontFamily="mono">
            Available:{' '}
            <XHoprBalance xHOPRContractAddress={contractAddresses.xHOPR} />
          </Text>
          <Text fontSize="xl" fontFamily="mono">
          Staked:{' '}
          <HoprStakeBalance
            HoprStakeContractAddress={contractAddresses.HoprStake}
          />
        </Text>
        </Box>
        <Box d="flex" justifyContent="space-between" alignItems="center" mt="10px">
          <InputGroup size="md">
            <Input pr="10.5rem" type={'number'} placeholder="Enter amount" onChange={(e) => {
              dispatch({
                type: 'SET_STAKING_AMOUNT',
                amountValue: e.target.value,
              })
            }}/>
            <InputRightElement width="10.5rem">
              <Button
                width="10rem"
                size="sm"
                isLoading={state.isLoading}
                onClick={() => {
                  setStaking(
                    contractAddresses.xHOPR,
                    contractAddresses.HoprStake,
                    state,
                    library,
                    dispatch
                  )
                }}
                {...colours}
              >
                {
                  state.isLoading ? 'Loading...' : 'Stake xHOPR tokens'
                }
              </Button>
            </InputRightElement>
          </InputGroup>
        </Box>
      </Box>
      <DarkModeSwitch />
    </Layout>
  )
}

export default HomeIndex

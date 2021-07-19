import {
  Box,
  Heading,
  Text,
  Tag,
  Link,
  useColorMode,
  Button,
} from '@chakra-ui/react'
import { useEthers } from '@usedapp/core'
import React, { useEffect, useState } from 'react'
import { DarkModeSwitch } from '../components/DarkModeSwitch'

import Layout from '../components/layout/Layout'
import { NFTQuery } from '../components/NFTQuery'
import { StakeXHoprTokens } from '../components/StakeXHoprTokens'
import {
  emptyContractAddresses,
  emptyFromBlockNumbers,
  getBlockNumberFromDeploymentTransactionHashReceipt,
  getContractAddresses,
  IContractAddress,
  IContractFromBlockNumbers,
} from '../lib/addresses'

function HomeIndex(): JSX.Element {
  const { chainId } = useEthers()
  const { colorMode } = useColorMode()

  const bgColor = { light: 'gray.50', dark: 'gray.900' }
  const color = { light: '#414141', dark: 'white' }
  const [contractAddresses, setContractAddresses] = useState<IContractAddress>(
    emptyContractAddresses
  )
  const [fromBlockNumbers, setFromBlockNumbers] =
    useState<IContractFromBlockNumbers>(emptyFromBlockNumbers)

  useEffect(() => {
    const loadContracts = async () => {
      const contractAddresses = await getContractAddresses(chainId)
      const fromBlockNumbers =
        await getBlockNumberFromDeploymentTransactionHashReceipt(chainId)
      setContractAddresses(contractAddresses)
      setFromBlockNumbers(fromBlockNumbers)
    }
    loadContracts()
  }, [chainId])

  return (
    <Layout>
      <Box d="flex" mb="8" justifyContent="space-between" alignItems="center">
        <Heading as="h1">HOPR Staking</Heading>
        <Box>
          <Tag size="lg" variant="outline" colorScheme="green">
            APR boost (from NFTs): --%
          </Tag>
          <Tag ml="10px" size="lg" variant="outline" colorScheme="blue">
            Your total APR: --
          </Tag>
        </Box>
        <Box>
          <Button size="md" bg="blackAlpha.900" color="whiteAlpha.900">
            Sync Rewards
          </Button>
          <Button size="md" ml="10px" bg="blackAlpha.900" color="whiteAlpha.900">
            Claim Rewards
          </Button>
        </Box>
      </Box>

      <Text mt="8" fontSize="xl">
        Lock your xHOPR tokens for <Tag size="lg">175 days</Tag> to earn up to
        18.5% of your staked amount. Increase your APR % by activating NFTs on
        your account, which can be earned by participating in HOPR testnets and
        activities. Follow our{' '}
        <Link href="https://twitter.com/hoprnet">Twitter</Link> account to learn
        about new events.
      </Text>
      <Box
        maxWidth="container.l"
        p="8"
        mt="8"
        bg={bgColor[colorMode]}
        color={color[colorMode]}
      >
        <StakeXHoprTokens
          XHOPRContractAddress={contractAddresses.xHOPR}
          HoprStakeContractAddress={contractAddresses.HoprStake}
        />
      </Box>
      <Box
        maxWidth="container.l"
        p="8"
        mt="8"
        bg={bgColor[colorMode]}
        color={color[colorMode]}
      >
        <NFTQuery
          HoprBoostContractAddress={contractAddresses.HoprBoost}
          fromBlock={fromBlockNumbers.HoprBoost}
        />
      </Box>
      <DarkModeSwitch />
    </Layout>
  )
}

export default HomeIndex

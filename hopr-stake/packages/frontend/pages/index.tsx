import {
  Box,
  Heading,
  Text,
  Tag,
  Link,
  useColorMode,
  Button,
} from '@chakra-ui/react'
import { ChainId, useEthers, useTokenBalance } from '@usedapp/core'
import React, { useEffect, useState } from 'react'
import { utils, constants } from 'ethers'
import { DarkModeSwitch } from '../components/DarkModeSwitch'
import Layout from '../components/layout/Layout'
import {
  emptyContractAddresses,
  getContractAddresses,
  IContractAddress,
} from '../lib/addresses'
import { XHoprBalance } from '../components/XHoprBalance'
import { HoprStakeBalance } from '../components/HoprStakeBalance'

const ROPSTEN_CONTRACT_ADDRESS = '0x6b61a52b1EA15f4b8dB186126e980208E1E18864'

function HomeIndex(): JSX.Element {
  const { chainId, account } = useEthers()
  const { colorMode } = useColorMode()

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


  const CONTRACT_ADDRESS =
    chainId === ChainId.Ropsten
      ? ROPSTEN_CONTRACT_ADDRESS
      : contractAddresses.HoprStake

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
          <Button size="lg" variant="outline" onClick={() => {}}>
            Stake
          </Button>
        </Box>
        <Text fontSize="xl" fontFamily="mono">
          Available: <XHoprBalance xHOPRContractAddress={contractAddresses.xHOPR} />
        </Text>
        <Text fontSize="xl" fontFamily="mono">
          Staked: <HoprStakeBalance HoprStakeContractAddress={contractAddresses.HoprStake }/>
        </Text>
      </Box>
      <DarkModeSwitch />
    </Layout>
  )
}

export default HomeIndex

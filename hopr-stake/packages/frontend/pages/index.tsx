import { Box, Heading, Text, Tag, Link, useColorMode } from '@chakra-ui/react'
import { ExternalLinkIcon } from '@chakra-ui/icons'
import { useBlockNumber, useEthers } from '@usedapp/core'
import React, { useEffect, useReducer, useState } from 'react'
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
import { XHoprBalance } from '../components/XHoprBalance'
import { bgColor, color, daysUntilProgramEnd } from '../lib/helpers'
import { APRBalance } from '../components/APRBalance'
import { reducer, initialState } from '../lib/reducers'
import { ParagraphLinks } from '../components/ParagraphLinks'

function HomeIndex(): JSX.Element {
  const { chainId } = useEthers()
  const { colorMode } = useColorMode()
  const block = useBlockNumber()
  const [state, dispatch] = useReducer(reducer, initialState)

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
  }, [chainId, block])

  return (
    <Layout>
      <Box d="flex" mb="8" justifyContent="space-between" alignItems="center">
        <Heading as="h1">HOPR Staking</Heading>
        <Box d="flex" alignItems="center">
          <Text mr="10px" fontWeight="600">
            Available Rewards{'  '}
          </Text>
          <Tag mr="20px" colorScheme="green" fontFamily="mono">
            <XHoprBalance
              xHOPRContractAddress={contractAddresses.wxHOPR}
              givenAccount={contractAddresses.HoprStake}
            />{' '}
            wxHOPR
          </Tag>
          <Text mr="10px" fontWeight="600">
            Total Staked{'  '}
          </Text>
          <Tag ml="10px" colorScheme="blue" fontFamily="mono">
            <XHoprBalance
              xHOPRContractAddress={contractAddresses.xHOPR}
              givenAccount={contractAddresses.HoprStake}
            />{' '}
            xHOPR
          </Tag>
        </Box>
      </Box>

      <Text mt="8" fontSize="xl">
        Stake{' '}
        <Link
          px="1"
          href={`https://blockscout.com/xdai/mainnet/address/${contractAddresses.xHOPR}/transactions`}
          isExternal
        >
          xHOPR <ExternalLinkIcon />
        </Link>{' '}
        tokens to earn a base APR of{' '}
        <APRBalance totalAPRBoost={state.totalAPRBoost} />. Starting{' '}
        <b>July 27th 2021</b>, rewards can be claimed on each block. All rewards
        will be returned as{' '}
        <Link
          px="1"
          href={`https://blockscout.com/xdai/mainnet/address/${contractAddresses.wxHOPR}/transactions`}
          isExternal
        >
          wxHOPR <ExternalLinkIcon />
        </Link>{' '}
        tokens. xHOPR staked today will be locked for{' '}
        <b>{daysUntilProgramEnd} days</b>.
      </Text>
      <Text mt="2" fontSize="xl">
        Increase your APR by redeeming NFTs to your account. HOPR NFTs can be
        earned by participating in HOPR testnets and activities.
      </Text>
      <ParagraphLinks />
      <Text mt="2" fontSize="xl"></Text>
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
          state={state}
          dispatch={dispatch}
        />
      </Box>
      <NFTQuery
        HoprBoostContractAddress={contractAddresses.HoprBoost}
        HoprStakeContractAddress={contractAddresses.HoprStake}
        fromBlock={fromBlockNumbers.HoprBoost}
        state={state}
        dispatch={dispatch}
      />
      <DarkModeSwitch />
    </Layout>
  )
}

export default HomeIndex

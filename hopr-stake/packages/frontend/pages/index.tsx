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
import { bgColor, color, daysUntilProgramEnd } from '../lib/helpers'
import { APRBalance } from '../components/APRBalance'
import { reducer, initialState } from '../lib/reducers'
import { ParagraphLinks } from '../components/ParagraphLinks'
import { TokenBalance } from '../components/atoms/TokenBalance'
import { CurrencyTag } from '../components/atoms/CurrencyTag'

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
  }, [chainId])

  return (
    <Layout>
      <Box d="flex" mb="8" justifyContent="space-between" alignItems="center">
        <Heading as="h1">HOPR Staking</Heading>
        <Box d="flex" alignItems="center">
          <Box d="flex" alignItems="baseline" mr="20px">
            <Text fontWeight="600" mr="10px">
              Available Rewards{'  '}
            </Text>
            <TokenBalance
              tokenContract={contractAddresses.wxHOPR}
              givenAccount={contractAddresses.HoprStake}
            />{' '}
            <Text fontSize="xs">wxHOPR</Text>
          </Box>
          <Box d="flex" alignItems="baseline">
            <Text fontWeight="600" mr="10px">
              Total Staked{'  '}
            </Text>
            <TokenBalance
              tokenContract={contractAddresses.xHOPR}
              givenAccount={contractAddresses.HoprStake}
              colorScheme="blue"
            />
            <CurrencyTag tag="xHOPR" />
          </Box>
        </Box>
      </Box>
      <Text mt="8" fontSize="xl" d="inline">
        Stake{' '}
        <Link
          px="1"
          href={`https://blockscout.com/xdai/mainnet/address/${contractAddresses.xHOPR}/transactions`}
          isExternal
        >
          xHOPR <ExternalLinkIcon />
        </Link>{' '}
        tokens to earn a base APR of{' '}
      </Text>
      <APRBalance totalAPRBoost={state.totalAPRBoost} />.
      <Text mt="8" fontSize="xl" d="inline">
        Starting <b>July 27th 2021</b>, rewards can be claimed on each block.
        All rewards will be returned as{' '}
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

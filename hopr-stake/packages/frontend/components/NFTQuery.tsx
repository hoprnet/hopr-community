import { useEthers } from '@usedapp/core'
import { Text, Box, Link, Button } from '@chakra-ui/react'
import { useEffect, useState, useReducer } from 'react'
import HoprBoostABI from '@hoprnet/hopr-stake/lib/chain/abis/HoprBoost.json'
import { HoprBoost as HoprBoostType } from '@hoprnet/hopr-stake/lib/types/HoprBoost'
import { TypedEvent } from '@hoprnet/hopr-stake/lib/types/commons'
import { BigNumber, Contract } from 'ethers'
import { initialState, reducer } from '../lib/reducers'
import { RPC_COLOURS } from '../lib/connectors'

export const NFTQuery = ({
  HoprBoostContractAddress,
  fromBlock,
}: {
  HoprBoostContractAddress: string
  fromBlock: number
}): JSX.Element => {
  const { library, chainId } = useEthers()
  const [state] = useReducer(reducer, initialState)
  const colours = RPC_COLOURS[chainId]
  const [, setEvents] = useState<
    TypedEvent<
      [BigNumber, BigNumber, BigNumber] & {
        boostTypeIndex: BigNumber
        boostNumerator: BigNumber
        redeemDeadline: BigNumber
      }
    >[]
  >([])

  useEffect(() => {
    const loadStakedXHoprBalance = async () => {
      if (HoprBoostContractAddress != '') {
        try {
          const HoprBoost = new Contract(
            HoprBoostContractAddress,
            HoprBoostABI,
            library
          ) as unknown as HoprBoostType
          const events = await HoprBoost.queryFilter(
            HoprBoost.filters.BoostMinted(),
            fromBlock,
            'latest'
          )
          setEvents(events)
        } catch (e) {
          console.error('Unable to create contract or parse past events', e)
        }
      }
    }
    loadStakedXHoprBalance()
  })
  return (
    <>
      <Box d="flex" alignItems="center">
      <Text fontSize="xl" fontWeight="900">
        Redeemable HOPR NFTs
      </Text>
      <Text ml="10px" fontSize="sm" fontWeight="400">Your NFTs will show up here. Earn them by participating our activities.</Text>
      </Box>
      {[].map((event) => {
        return (
          <Box
            key={event.transactionHash}
            d="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Text>
              BoostType Index -{' '}
              <code>{(event.args[0] as BigNumber).toString()}</code>
            </Text>
            <Text>
              Boost Numerator -{' '}
              <code>{(event.args[1] as BigNumber).toString()}</code>
            </Text>
            <Text>
              Redeem Deadline -{' '}
              <code>{new Date(+(event.args[2] as BigNumber).toString() * 1000).toUTCString()}</code>
            </Text>
            <Link
              isExternal
              href={`https://blockscout.com/xdai/mainnet/tx/${event.transactionHash}`}
            >
              Transaction Hash -{' '}
              <code>{`${event.transactionHash.substr(0, 10)}...`}</code>
            </Link>
            <Button
              width="10rem"
              size="sm"
              isLoading={state.isLoading}
              isDisabled={true}
              {...colours}
            >
              {state.isLoading ? 'Loading...' : 'Redeem NFT'}
            </Button>
          </Box>
        )
      })}
    </>
  )
}

import { useEthers, useTokenBalance } from '@usedapp/core'
import { Text, Box, Button } from '@chakra-ui/react'
import { useEffect, useState, useReducer } from 'react'
import HoprBoostABI from '@hoprnet/hopr-stake/lib/chain/abis/HoprBoost.json'
import { HoprBoost as HoprBoostType } from '@hoprnet/hopr-stake/lib/types/HoprBoost'
import { Contract, constants } from 'ethers'
import { initialState, reducer } from '../lib/reducers'
import { RPC_COLOURS } from '../lib/connectors'

type NFT = {
  tokenId: string
  typeOfBoost: string
  typeName: string
  factor: number
  deadline: number
}

export const NFTQuery = ({
  HoprBoostContractAddress,
}: {
  HoprBoostContractAddress: string
  fromBlock?: number
}): JSX.Element => {
  const { chainId, library, account } = useEthers()
  const [state] = useReducer(reducer, initialState)
  const colours = RPC_COLOURS[chainId]
  const [nfts, setNFTS] = useState<NFT[]>([])

  const NFTBalance = useTokenBalance(
    HoprBoostContractAddress || constants.Zero.toHexString(),
    account
  )

  useEffect(() => {
    const loadNFTBalance = async () => {
      const amountofNFTS = NFTBalance
        ? [...Array(Number(NFTBalance.toString()))]
        : []
      if (amountofNFTS.length > 0) {
        const HoprBoost = new Contract(
          HoprBoostContractAddress,
          HoprBoostABI,
          library
        ) as unknown as HoprBoostType
        const nftsPromises = amountofNFTS.map(async (_, index) => {
          const tokenId = await HoprBoost.tokenOfOwnerByIndex(account, index)
          const typeOfBoost = await HoprBoost.typeIndexOf(tokenId)
          const typeName = await HoprBoost.typeOf(tokenId)
          const [factor, deadline] = await HoprBoost.boostOf(tokenId)

          return {
            tokenId: tokenId.toString(),
            typeOfBoost: typeOfBoost.toString(),
            typeName,
            factor: factor.toNumber(),
            deadline: deadline.toNumber(),
          }
        })
        const nfts = await Promise.all(nftsPromises)
        setNFTS(nfts)
      }
    }
    loadNFTBalance()
  })
  return (
    <>
      <Box d="flex" alignItems="center">
        <Text fontSize="xl" fontWeight="900">
          Redeemable HOPR NFTs
        </Text>
        <Text ml="10px" fontSize="sm" fontWeight="400">
          Your NFTs will show up here. Earn them by participating in our
          activities.
        </Text>
      </Box>
      {nfts.map((nft) => {
        return (
          <Box
            key={nft.tokenId}
            d="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Text>
              Name - <code>{nft.typeName}</code>
            </Text>
            <Text>
              Boost Type - <code>{nft.typeOfBoost}</code>
            </Text>
            <Text>
              Boost Factor - <code>{nft.factor}</code>
            </Text>
            <Text>
              Redeem Deadline -{' '}
              <code>{new Date(nft.deadline * 1000).toUTCString()}</code>
            </Text>
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

import { useEthers, useBlockNumber, useTokenBalance } from '@usedapp/core'
import { Text, Box, Button, useColorMode, Image, Tag } from '@chakra-ui/react'
import { useEffect, useState, useReducer } from 'react'
import HoprBoostABI from '@hoprnet/hopr-stake/lib/chain/abis/HoprBoost.json'
import { HoprBoost as HoprBoostType } from '@hoprnet/hopr-stake/lib/types/HoprBoost'
import HoprStakeABI from '@hoprnet/hopr-stake/lib/chain/abis/HoprStake.json'
import { HoprStake as HoprStakeType } from '@hoprnet/hopr-stake/lib/types/HoprStake'
import { Contract, constants, BigNumber } from 'ethers'
import { initialState, reducer, setRedeemNFT } from '../lib/reducers'
import { RPC_COLOURS } from '../lib/connectors'
import { bgColor, color, nonEmptyAccount } from '../lib/helpers'

type NFT = {
  tokenId: string
  typeOfBoost: string
  typeName: string
  factor: number
  deadline: number
  tokenURI: string
  redeemed?: boolean
  image: string
  typeOfBoostName: string
}

const NFT_TYPE_COLOURS: { [boostType: string]: string } = {
  'silver': '#A8A8B3',
  'bronze': '#5F4919',
  'gold': '#F9E82B',
  'diamond': '#C5CDD0'
}

const getNFTFromTokenId = async (
  HoprBoost: HoprBoostType,
  tokenId: BigNumber,
  redeemed = false
) => {
  const typeOfBoost = await HoprBoost.typeIndexOf(tokenId)
  const typeName = await HoprBoost.typeOf(tokenId)
  const [factor, deadline] = await HoprBoost.boostOf(tokenId)
  const tokenURI = await HoprBoost.tokenURI(tokenId)

  const json: any = await fetch(tokenURI).then((res) => res.json())
  const gateway = 'https://cloudflare-ipfs.com/ipfs/'
  const [, ipfsCID] = json.image.split('ipfs://')
  const image = `${gateway}${ipfsCID}`
  const typeOfBoostName = tokenURI.split('/').pop();

  return {
    tokenId: tokenId.toString(),
    typeOfBoost: typeOfBoost.toString(),
    typeName,
    factor: factor.toNumber(),
    deadline: deadline.toNumber(),
    tokenURI,
    redeemed,
    image,
    typeOfBoostName
  }
}

const NFTLockButton = ({
  tokenId,
  HoprBoostContractAddress,
  HoprStakeContractAddress,
}: {
  tokenId: string
  HoprBoostContractAddress: string
  HoprStakeContractAddress: string
}) => {
  const { chainId, library } = useEthers()
  const [state, dispatch] = useReducer(reducer, initialState)
  const colours = RPC_COLOURS[chainId]
  return (
    <Button
      width="10rem"
      size="sm"
      isLoading={state.isLoadingRedeem}
      isDisabled={state.isLoadingRedeem}
      {...colours}
      onClick={() => {
        setRedeemNFT(
          HoprBoostContractAddress,
          HoprStakeContractAddress,
          tokenId,
          library,
          dispatch
        )
      }}
    >
      {state.isLoading ? 'Loading...' : 'Lock NFT'}
    </Button>
  )
}

const NFTContainer = ({
  nfts,
  HoprBoostContractAddress,
  HoprStakeContractAddress,
}: {
  nfts: NFT[]
  HoprBoostContractAddress: string
  HoprStakeContractAddress: string
}) => (
  <>
    {nfts.map((nft) => {
      return (
        <Box key={nft.tokenId} my="2" maxW="m">
          <Image src={nft.image} width="250px" />
          <Box p="6">
            <Box d="flex" alignItems="baseline" flexDirection="column">
              <Text fontWeight="bold" as="h3" fontSize="large">
                <code>{nft.typeName}</code> <Tag bg={NFT_TYPE_COLOURS[nft.typeOfBoostName]} textTransform="capitalize">{nft.typeOfBoostName}</Tag>
              </Text>
              <Box>
                <Text>
                  Boost Factor - <code>{(nft.factor / 317).toFixed(2)}%</code>
                </Text>
                <Text>
                  APR - { nft.factor * 3600 * 24 / 1e12 * 365 }
                </Text>
              </Box>
              <Box isTruncated>
                Redeem Deadline
              </Box>
              <Text fontSize="xs" fontFamily="mono">{new Date(nft.deadline * 1000).toUTCString()}</Text>

              {!nft.redeemed && (
                <NFTLockButton
                  tokenId={nft.tokenId}
                  HoprBoostContractAddress={HoprBoostContractAddress}
                  HoprStakeContractAddress={HoprStakeContractAddress}
                />
              )}
            </Box>
          </Box>
        </Box>
      )
    })}
  </>
)

export const NFTQuery = ({
  HoprBoostContractAddress,
  HoprStakeContractAddress,
}: {
  HoprBoostContractAddress: string
  HoprStakeContractAddress: string
  fromBlock?: number
}): JSX.Element => {
  const { library, account } = useEthers()
  const [nfts, setNFTS] = useState<NFT[]>([])
  const [redeemedNFTs, setRedeeemedNFTS] = useState<NFT[]>([])

  const { colorMode } = useColorMode()
  const block = useBlockNumber()
  const NFTBalance =
    useTokenBalance(HoprBoostContractAddress, account) || constants.Zero

  useEffect(() => {
    const loadNFTBalance = async () => {
      if (
        !(HoprStakeContractAddress && account) ||
        HoprStakeContractAddress.length == 0 ||
        account.length == 0
      ) {
        return
      }
      const amountofNFTS = NFTBalance
        ? [...Array(Number(NFTBalance.toString()))]
        : []
      const HoprStake = new Contract(
        HoprStakeContractAddress,
        HoprStakeABI,
        library
      ) as unknown as HoprStakeType
      const redeemedNFTsAmountScalar = (
        nonEmptyAccount(account)
          ? await HoprStake.redeemedNftIndex(account)
          : constants.Zero
      ).toString()
      if (amountofNFTS.length > 0 || +redeemedNFTsAmountScalar > 0) {
        const HoprBoost = new Contract(
          HoprBoostContractAddress,
          HoprBoostABI,
          library
        ) as unknown as HoprBoostType
        const redeemedNFTsAmount = [...Array(Number(redeemedNFTsAmountScalar))]
        const redeemedNFTSPromises = redeemedNFTsAmount.map(
          async (_, index) => {
            const tokenId = nonEmptyAccount(account)
              ? await HoprStake.redeemedNft(account, index)
              : constants.NegativeOne
            return +tokenId >= 0
              ? await getNFTFromTokenId(HoprBoost, tokenId, true)
              : undefined
          }
        )
        const nftsPromises = amountofNFTS.map(async (_, index) => {
          const tokenId = await HoprBoost.tokenOfOwnerByIndex(account, index)
          return await getNFTFromTokenId(HoprBoost, tokenId)
        })
        const nfts = await Promise.all(nftsPromises)
        const redemeedNfts = await Promise.all(redeemedNFTSPromises)
        setNFTS(nfts)
        setRedeeemedNFTS(redemeedNfts)
      }
    }
    loadNFTBalance()
  }, [HoprStakeContractAddress, HoprBoostContractAddress, account, block])
  return (
    <>
      <Box
        maxWidth="container.l"
        p="8"
        mt="8"
        bg={bgColor[colorMode]}
        color={color[colorMode]}
      >
        <Box d="flex" alignItems="center">
          <Text fontSize="xl" fontWeight="900">
            HOPR NFTs
          </Text>
          <Text ml="10px" fontSize="sm" fontWeight="400">
            Your NFTs will show up here. Earn them by participating in our
            activities.
          </Text>
        </Box>
        <Box d="flex" alignItems="center">
          <NFTContainer
            nfts={nfts}
            HoprBoostContractAddress={HoprBoostContractAddress}
            HoprStakeContractAddress={HoprStakeContractAddress}
          />
        </Box>
      </Box>
      <Box
        maxWidth="container.l"
        p="8"
        mt="8"
        bg={bgColor[colorMode]}
        color={color[colorMode]}
      >
        <Box d="flex" alignItems="center">
          <Text fontSize="xl" fontWeight="900">
            Locked HOPR NFTs
          </Text>
          <Text ml="10px" fontSize="sm" fontWeight="400">
            Your locked NFTs will show up here. By activating them you’ll
            benefit from its bonuses.
          </Text>
        </Box>
        <Box d="flex" alignItems="center">
          <NFTContainer
            nfts={redeemedNFTs}
            HoprBoostContractAddress={HoprBoostContractAddress}
            HoprStakeContractAddress={HoprStakeContractAddress}
          />
        </Box>
      </Box>
    </>
  )
}

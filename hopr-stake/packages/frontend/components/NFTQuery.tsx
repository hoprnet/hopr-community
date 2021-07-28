import { useBlockNumber, useEthers, useTokenBalance } from '@usedapp/core'
import {
  Text,
  Box,
  Button,
  useColorMode,
  Image,
  Tag,
  Skeleton,
} from '@chakra-ui/react'
import { useEffect, useState, Dispatch } from 'react'
import HoprBoostABI from '@hoprnet/hopr-stake/lib/chain/abis/HoprBoost.json'
import { HoprBoost as HoprBoostType } from '@hoprnet/hopr-stake/lib/types/HoprBoost'
import HoprStakeABI from '@hoprnet/hopr-stake/lib/chain/abis/HoprStake.json'
import { HoprStake as HoprStakeType } from '@hoprnet/hopr-stake/lib/types/HoprStake'
import { Contract, constants, BigNumber } from 'ethers'
import { ActionType, setRedeemNFT, StateType } from '../lib/reducers'
import { RPC_COLOURS } from '../lib/connectors'
import { bgColor, color, nonEmptyAccount } from '../lib/helpers'
import { useRedeemedNFTs } from '../lib/hooks'
import { CurrencyTag } from './atoms/CurrencyTag'

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
  silver: '#A8A8B3',
  bronze: '#5F4919',
  gold: '#F9E82B',
  diamond: '#C5CDD0',
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
  const typeOfBoostName = tokenURI.split('/').pop()

  return {
    tokenId: tokenId.toString(),
    typeOfBoost: typeOfBoost.toString(),
    typeName,
    factor: factor.toNumber(),
    deadline: deadline.toNumber(),
    tokenURI,
    redeemed,
    image,
    typeOfBoostName,
  }
}

const NFTLockButton = ({
  tokenId,
  HoprBoostContractAddress,
  HoprStakeContractAddress,
  state,
  dispatch,
}: {
  tokenId: string
  HoprBoostContractAddress: string
  HoprStakeContractAddress: string
  state: StateType
  dispatch: Dispatch<ActionType>
}) => {
  const { chainId, library } = useEthers()
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
      {state.isLoadingRedeem ? 'Loading...' : 'Lock NFT'}
    </Button>
  )
}

const NFTContainer = ({
  nfts,
  HoprBoostContractAddress,
  HoprStakeContractAddress,
  state,
  dispatch,
}: {
  nfts: NFT[]
  HoprBoostContractAddress: string
  HoprStakeContractAddress: string
  state: StateType
  dispatch: Dispatch<ActionType>
}) => (
  <>
    {nfts.map((nft) => {
      return (
        <Box
          key={nft.tokenId}
          my="2"
          d="flex"
          flexDirection="column"
          alignContent="space-evenly"
          border="1px solid #ccc"
          p="5"
          m="5"
          borderRadius="5px"
        >
          <Image src={nft.image} width="250px" m="auto" />
          <Box py="6" px="6">
            <Box d="flex" alignItems="baseline" flexDirection="column">
              <Text fontWeight="bold" as="h3" fontSize="large">
                <code>{nft.typeName}</code>{' '}
                <Tag
                  bg={NFT_TYPE_COLOURS[nft.typeOfBoostName]}
                  textTransform="capitalize"
                >
                  {nft.typeOfBoostName}
                </Tag>
                {nft.factor === state.totalAPRBoost ? (
                  <Tag ml="2px" colorScheme="green">
                    In Use
                  </Tag>
                ) : (
                  <Tag ml="2px" colorScheme="red">
                    Ignored
                  </Tag>
                )}
              </Text>
              <Box >
                <Text>
                  <b>Boost Factor</b> -{' '}
                  <code>{(nft.factor / 317).toFixed(2)}%</code>
                </Text>
                <b>APR</b>
                <Box d="flex" alignItems="baseline">
                  <Text mr="2px">
                     <code>{(nft.factor / 1e12).toFixed(12)}</code>
                  </Text>
                  <CurrencyTag tag="wxHOPR/sec" />
                </Box>
              </Box>
              <Box isTruncated mt="5px">
                Redeem Deadline
              </Box>
              <Text fontSize="xs" fontFamily="mono">
                {new Date(nft.deadline * 1000).toUTCString()}
              </Text>

              {!nft.redeemed && (
                <NFTLockButton
                  tokenId={nft.tokenId}
                  HoprBoostContractAddress={HoprBoostContractAddress}
                  HoprStakeContractAddress={HoprStakeContractAddress}
                  state={state}
                  dispatch={dispatch}
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
  state,
  dispatch,
}: {
  HoprBoostContractAddress: string
  HoprStakeContractAddress: string
  state: StateType
  dispatch: Dispatch<ActionType>
  fromBlock?: number
}): JSX.Element => {
  const { library, account } = useEthers()
  const [nfts, setNFTS] = useState<NFT[]>([])
  const [redeemedNFTs, setRedeeemedNFTS] = useState<NFT[]>([])
  const startingBlock = useBlockNumber()
  const [blocks, setBlockCounter] = useState<number>(0)
  const { colorMode } = useColorMode()
  const NFTBalance =
    useTokenBalance(HoprBoostContractAddress, account) || constants.Zero

  const redeemedNFTsBalance =
    useRedeemedNFTs(HoprStakeContractAddress, account) || constants.Zero

  useEffect(() => {
    const loadNFTBalance = async () => {
      startingBlock != startingBlock - 1 && setBlockCounter(blocks + 1)
      if (
        !(HoprStakeContractAddress && account) ||
        HoprStakeContractAddress.length == 0 ||
        account.length == 0
      ) {
        return
      }
      if (library && (+NFTBalance > 0 || +redeemedNFTsBalance > 0)) {
        // We create empty arrays we can .map later based on the amount of
        // nfts or redeemed nfts a user has.
        const nftsMappedArray = [...Array(+NFTBalance)]
        const redeemedNFTsMappedArray = [...Array(+redeemedNFTsBalance)]
        // Only then we create the actual contracts we will be using.
        const HoprBoost = new Contract(
          HoprBoostContractAddress,
          HoprBoostABI,
          library
        ) as unknown as HoprBoostType
        const HoprStake = new Contract(
          HoprStakeContractAddress,
          HoprStakeABI,
          library
        ) as unknown as HoprStakeType
        // We go through both mapped arrays and create the to be resolved promises
        // for both redeemed and not redeemed NFT tokens.
        const redeemedNFTSPromises = redeemedNFTsMappedArray.map(
          async (_, index) => {
            const tokenId = nonEmptyAccount(account)
              ? await HoprStake.redeemedNft(account, index)
              : constants.NegativeOne
            return +tokenId >= 0
              ? await getNFTFromTokenId(HoprBoost, tokenId, true)
              : undefined
          }
        )
        const nftsPromises = nftsMappedArray.map(async (_, index) => {
          const tokenId = await HoprBoost.tokenOfOwnerByIndex(account, index)
          return await getNFTFromTokenId(HoprBoost, tokenId)
        })
        // We resolve both promises to make sure all NFTs are properly obtained
        const nfts = (await Promise.all(nftsPromises)) || []
        const redemeedNfts = (await Promise.all(redeemedNFTSPromises)) || []
        // We update our current component state accordingly
        setNFTS(nfts)
        setRedeeemedNFTS(redemeedNfts)
        // We propagate the total APR boost to the rest of the application.
        const maxFactorNFT = redeemedNFTs.reduce(
          (prev, curr) => (prev.factor > curr.factor ? prev : curr),
          { factor: 0 }
        )
        dispatch({
          type: 'SET_TOTAL_APR_BOOST',
          totalAPRBoost: maxFactorNFT.factor,
        })
      }
    }
    loadNFTBalance()
  }, [account, startingBlock])
  return (
    <>
      <Box
        maxWidth="container.l"
        p="8"
        mt="8"
        bg={bgColor[colorMode]}
        color={color[colorMode]}
      >
        <Box d="flex" justifyContent="space-between" mb="10px">
          <Box d="flex" alignItems="center">
            <Text fontSize="xl" fontWeight="900">
              HOPR NFTs
            </Text>
            <Text ml="10px" fontSize="sm" fontWeight="400">
              Please wait up to six block changes for your NFTs to show.
            </Text>
          </Box>
          <Box d="flex" alignItems="center">
            <Text fontWeight="600" fontSize="md" mr="5px">
              Blocks
            </Text>
            <Text ml="6px" fontSize="sm" fontFamily="mono">
              {startingBlock}
            </Text>
            {blocks > 0 && (
              <Text ml="2px" fontSize="sm" fontFamily="mono" color="green.600">
                (+{blocks} block changes)
              </Text>
            )}
          </Box>
        </Box>
        {[
          {
            title: 'Available HOPR NFTs',
            subtitle: `Your NFTs will show up here. Earn them by participating in activities. Lock them to boost your APR.`,
            items: nfts,
          },
          {
            title: 'Locked HOPR NFTs',
            subtitle: `Your locked NFTs will show up here. The combined NFT boost (one per NFT type) will be added to your base APR`,
            items: redeemedNFTs,
          },
        ].map((nftDataContainer) => {
          return (
            <Box key={nftDataContainer.title}>
              <Box d="flex" alignItems="center">
                <Text fontWeight="600" fontSize="md" mr="2px">
                  {nftDataContainer.title}
                </Text>
                <Text ml="10px" fontSize="sm" fontWeight="400">
                  {nftDataContainer.subtitle}
                </Text>
              </Box>
              <Skeleton isLoaded={blocks > 5}>
                <Box d="flex" alignItems="center" mb="10px">
                  {nftDataContainer.items.length > 0 ? (
                    <NFTContainer
                      nfts={nftDataContainer.items}
                      HoprBoostContractAddress={HoprBoostContractAddress}
                      HoprStakeContractAddress={HoprStakeContractAddress}
                      state={state}
                      dispatch={dispatch}
                    />
                  ) : (
                    <Box
                      minH="100px"
                      d="flex"
                      textAlign="center"
                      alignItems="center"
                      margin="auto"
                      width="100%"
                      borderRadius="5px"
                      border="1px solid #ccc"
                      justifyContent="center"
                    >
                      <Text fontSize="lg">
                        Your available NFTs will show up here.
                      </Text>
                    </Box>
                  )}
                </Box>
              </Skeleton>
            </Box>
          )
        })}
      </Box>
    </>
  )
}

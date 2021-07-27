import { Web3Provider } from '@ethersproject/providers'
import { Contract, ethers, BigNumber, utils, constants } from 'ethers'
import React from 'react'
import xHOPRTokenABI from '@hoprnet/hopr-stake/lib/chain/abis/ERC677Mock.json'
import { ERC677Mock as xHOPRTokenType } from '@hoprnet/hopr-stake/lib/types/ERC677Mock'
import HoprStakeABI from '@hoprnet/hopr-stake/lib/chain/abis/HoprStake.json'
import { HoprStake as HoprStakeType } from '@hoprnet/hopr-stake/lib/types/HoprStake'
import HoprBoostABI from '@hoprnet/hopr-stake/lib/chain/abis/HoprBoost.json'
import { HoprBoost as HoprBoostType } from '@hoprnet/hopr-stake/lib/types/HoprBoost'
import { round } from './helpers'

/**
 * Prop Types
 */
export type StateType = {
  stakedHOPRTokens: string
  yetToClaimRewards: string
  lastSync: string
  alreadyClaimedRewards: string
  amountValue: string
  isLoading: boolean
  isLoadingSync: boolean
  isLoadingRedeem: boolean
  totalAPRBoost: number
}

/**
 * Component
 */
export const initialState: StateType = {
  stakedHOPRTokens: '',
  yetToClaimRewards: '',
  lastSync: '',
  alreadyClaimedRewards: '',
  amountValue: '',
  isLoading: false,
  isLoadingSync: false,
  isLoadingRedeem: false,
  totalAPRBoost: 0,
}

type Accounts = {
  actualLockedTokenAmount: BigNumber
  virtualLockedTokenAmount: BigNumber
  lastSyncTimestamp: BigNumber
  cumulatedRewards: BigNumber
  claimedRewards: BigNumber
}

export type ActionType =
  | {
    type: 'SET_ACCOUNT_DATA'
    stakedHOPRTokens: StateType['stakedHOPRTokens']
    yetToClaimRewards: StateType['yetToClaimRewards']
    lastSync: StateType['lastSync']
    alreadyClaimedRewards: StateType['alreadyClaimedRewards']
  }
  | {
    type: 'SET_LOADING'
    isLoading: StateType['isLoading']
  }
  | {
    type: 'SET_LOADING_SYNC'
    isLoadingSync: StateType['isLoadingSync']
  }
  | {
    type: 'SET_LOADING_REDEEM'
    isLoadingRedeem: StateType['isLoadingRedeem']
  }
  | {
    type: 'SET_STAKING_AMOUNT'
    amountValue: StateType['amountValue']
  }
  | {
    type: 'SET_TOTAL_APR_BOOST'
    totalAPRBoost: StateType['totalAPRBoost']
  }

export function reducer(state: StateType, action: ActionType): StateType {
  switch (action.type) {
    case 'SET_ACCOUNT_DATA':
      return {
        ...state,
        stakedHOPRTokens: action.stakedHOPRTokens,
        yetToClaimRewards: action.yetToClaimRewards,
        lastSync: action.lastSync,
        alreadyClaimedRewards: action.alreadyClaimedRewards,
      }
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.isLoading,
      }
    case 'SET_LOADING_SYNC':
      return {
        ...state,
        isLoadingSync: action.isLoadingSync
      }
    case 'SET_LOADING_REDEEM':
      return {
        ...state,
        isLoadingRedeem: action.isLoadingRedeem
      }
    case 'SET_STAKING_AMOUNT':
      return {
        ...state,
        amountValue: action.amountValue,
      }
    case 'SET_TOTAL_APR_BOOST':
      return {
        ...state,
        totalAPRBoost: action.totalAPRBoost
      }
    default:
      throw new Error()
  }
}


export async function fetchAccountData(
  HoprStakeContractAddress: string,
  account: string,
  provider: Web3Provider,
  dispatch: React.Dispatch<ActionType>
): Promise<void> {
  if (provider && HoprStakeContractAddress != '') {
    const contract = new Contract(
      HoprStakeContractAddress,
      HoprStakeABI,
      provider
    ) as unknown as HoprStakeType
    try {
      const accountStruct: Accounts = account && await contract.accounts(account)
      const {
        actualLockedTokenAmount,
        cumulatedRewards,
        lastSyncTimestamp,
        claimedRewards,
      } = accountStruct
      const [
        stakedHOPRTokens,
      ] = [
        actualLockedTokenAmount,
      ].map((dataPoint) =>
        dataPoint ? round(Number(utils.formatEther(dataPoint)), 4) : '0.0000'
      )
      dispatch({
        type: 'SET_ACCOUNT_DATA',
        stakedHOPRTokens,
        yetToClaimRewards: cumulatedRewards.toString(),
        lastSync: lastSyncTimestamp.toString(),
        alreadyClaimedRewards: claimedRewards.toString(),
      })
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log('Error: ', err)
    }
  }
}

export async function setSync(
  HoprStakeContractAddress: string,
  state: StateType,
  provider: Web3Provider,
  dispatch: React.Dispatch<ActionType>
): Promise<void> {
  if (provider && HoprStakeContractAddress != '') {
    dispatch({
      type: 'SET_LOADING_SYNC',
      isLoadingSync: true,
    })
    const signer = provider.getSigner()
    const address = await signer.getAddress()
    const contract = new ethers.Contract(
      HoprStakeContractAddress,
      HoprStakeABI,
      signer
    ) as unknown as HoprStakeType
    const transaction = await contract.sync(address)
    await transaction.wait()
    fetchAccountData(
      HoprStakeContractAddress,
      address,
      provider,
      dispatch
    )
    dispatch({
      type: 'SET_LOADING_SYNC',
      isLoadingSync: false,
    })
  }
}

export async function setRedeemNFT(
  HoprBoostContractAddress: string,
  HoprStakeContractAddress: string,
  tokenId: string,
  provider: Web3Provider,
  dispatch: React.Dispatch<ActionType>
): Promise<void> {
  if (provider && HoprBoostContractAddress != '') {
    dispatch({
      type: 'SET_LOADING_REDEEM',
      isLoadingRedeem: true,
    })
    const signer = provider.getSigner()
    const address = await signer.getAddress()
    const contract = new ethers.Contract(
      HoprBoostContractAddress,
      HoprBoostABI,
      signer
    ) as unknown as HoprBoostType
    const transaction = await contract['safeTransferFrom(address,address,uint256)'](address, HoprStakeContractAddress, tokenId)
    await transaction.wait()
    dispatch({
      type: 'SET_LOADING_REDEEM',
      isLoadingRedeem: false,
    })
  }
}

export async function setStaking(
  xHOPRContractAddress: string,
  HoprStakeContractAddress: string,
  state: StateType,
  provider: Web3Provider,
  dispatch: React.Dispatch<ActionType>
): Promise<void> {
  if (!state.amountValue) return
  if (provider && HoprStakeContractAddress != '') {
    dispatch({
      type: 'SET_LOADING',
      isLoading: true,
    })
    const signer = provider.getSigner()
    const address = await signer.getAddress()
    const contract = new ethers.Contract(
      xHOPRContractAddress,
      xHOPRTokenABI,
      signer
    ) as unknown as xHOPRTokenType
    const transaction = await contract.transferAndCall(
      HoprStakeContractAddress,
      utils.parseEther(state.amountValue),
      constants.HashZero
    )
    await transaction.wait()
    fetchAccountData(
      HoprStakeContractAddress,
      address,
      provider,
      dispatch
    )
    dispatch({
      type: 'SET_LOADING',
      isLoading: false,
    })
  }
}

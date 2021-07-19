import { Web3Provider } from '@ethersproject/providers'
import { Contract, ethers, BigNumber, utils, constants } from 'ethers'
import React from 'react'
import xHOPRTokenABI from '@hoprnet/hopr-stake/lib/chain/abis/ERC677Mock.json'
import { ERC677Mock as xHOPRTokenType } from '@hoprnet/hopr-stake/lib/types/ERC677Mock'
import HoprStakeABI from '@hoprnet/hopr-stake/lib/chain/abis/HoprStake.json'
import { HoprStake as HoprStakeType } from '@hoprnet/hopr-stake/lib/types/HoprStake'

/**
 * Prop Types
 */
type StateType = {
  stakedHOPRTokens: string
  yetToClaimRewards: string
  lastSync: string
  alreadyClaimedRewards: string
  amountValue: string
  isLoading: boolean
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
}

type Accounts = {
  actualLockedTokenAmount: BigNumber
  virtualLockedTokenAmount: BigNumber
  lastSyncTimestamp: BigNumber
  cumulatedRewards: BigNumber
  claimedRewards: BigNumber
}

type ActionType =
  | {
      type: 'SET_ACCOUNT_DATA'
      stakedHOPRTokens: StateType['stakedHOPRTokens'],
      yetToClaimRewards: StateType['yetToClaimRewards'],
      lastSync: StateType['lastSync'],
      alreadyClaimedRewards: StateType['alreadyClaimedRewards']
    }
  | {
      type: 'SET_LOADING'
      isLoading: StateType['isLoading']
    }
    | {
      type: 'SET_STAKING_AMOUNT'
      amountValue: StateType['amountValue']
    }

export function reducer(state: StateType, action: ActionType): StateType {
  switch (action.type) {
    case 'SET_ACCOUNT_DATA':
      return {
        ...state,
        stakedHOPRTokens: action.stakedHOPRTokens,
        yetToClaimRewards: action.yetToClaimRewards,
        lastSync: action.lastSync,
        alreadyClaimedRewards: action.alreadyClaimedRewards
      }
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.isLoading,
      }
    case 'SET_STAKING_AMOUNT':
      return {
        ...state,
        amountValue: action.amountValue,
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
      const accountStruct: Accounts = await contract.accounts(account)
      const { actualLockedTokenAmount, cumulatedRewards, lastSyncTimestamp, claimedRewards } = accountStruct;
      const [ stakedHOPRTokens, yetToClaimRewards, lastSync, alreadyClaimedRewards ] = [actualLockedTokenAmount, cumulatedRewards, lastSyncTimestamp, claimedRewards].map(dataPoint => dataPoint ? Number(
            utils.formatEther(dataPoint)
          ).toFixed(2)
        : '0.00')
      dispatch({ type: 'SET_ACCOUNT_DATA', stakedHOPRTokens, yetToClaimRewards, lastSync, alreadyClaimedRewards })
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log('Error: ', err)
    }
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
      utils.parseEther(state.amountValue), //@TODO: Replace this by state.amount
      constants.HashZero
    )
    await transaction.wait()
    fetchStakedXHOPRTokens(
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

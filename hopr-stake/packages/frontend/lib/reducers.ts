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
  amount: string
  isLoading: boolean
}

/**
 * Component
 */
export const initialState: StateType = {
  amount: '',
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
      type: 'SET_STAKING'
      amount: StateType['amount']
    }
  | {
      type: 'SET_LOADING'
      isLoading: StateType['isLoading']
    }

export function reducer(state: StateType, action: ActionType): StateType {
  switch (action.type) {
    // Track the greeting from the blockchain
    case 'SET_STAKING':
      return {
        ...state,
        amount: action.amount,
      }
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.isLoading,
      }
    default:
      throw new Error()
  }
}

export async function fetchStakedXHOPRTokens(
  HoprStakeContractAddress: string,
  account: string,
  provider: Web3Provider,
  dispatch: React.Dispatch<ActionType>
) {
  if (provider) {
    const contract = new Contract(
      HoprStakeContractAddress,
      HoprStakeABI,
      provider
    ) as unknown as HoprStakeType
    try {
      const accountStruct: Accounts = await contract.accounts(account)
      const stakedHOPRTokens = accountStruct.actualLockedTokenAmount
        ? Number(
            utils.formatEther(accountStruct.actualLockedTokenAmount)
          ).toFixed(3)
        : '0.000'
      dispatch({ type: 'SET_STAKING', amount: stakedHOPRTokens })
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log('Error: ', err)
    }
  }
}

export async function setStaking(
  xHOPRContractAddress: string,
  HoprStakeContractAddress: string,
//   state: StateType,
  provider: Web3Provider,
  dispatch: React.Dispatch<ActionType>
) {
  // @TODO Actually very the dispatched event and ignore if not amount was given.
  // if (!state.amount) return
  if (provider) {
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
      utils.parseEther('0.1'), //@TODO: Replace this by state.amount
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

import HoprStakeABI from '@hoprnet/hopr-stake/lib/chain/abis/HoprStake.json'
import { useContractCall } from '@usedapp/core'
import { Falsy } from '@usedapp/core/dist/esm/src/model/types'
import { Interface } from 'ethers/lib/utils'

export function useStartProgramDate(stakeContractAddress: string | Falsy) {
    const [startProgramDate] =
      useContractCall(
        stakeContractAddress && {
        abi: new Interface(HoprStakeABI),
        address: stakeContractAddress,
        method: 'BASIC_START',
        args: [],
        }
      ) ?? []
    return startProgramDate
}

export function useEndProgramDate(stakeContractAddress: string | Falsy) {
    const [endProgramDate] =
      useContractCall(
        stakeContractAddress && {
        abi: new Interface(HoprStakeABI),
        address: stakeContractAddress,
        method: 'PROGRAM_END',
        args: [],
        }
      ) ?? []
    return endProgramDate
    
}
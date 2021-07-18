import { Text } from '@chakra-ui/react'
import { utils, constants, Contract, BigNumber } from 'ethers'
import { useEthers, useTokenBalance } from '@usedapp/core'
import HoprStakeABI from '@hoprnet/hopr-stake/lib/chain/abis/HoprStake.json'
import { HoprStake as HoprStakeType } from '@hoprnet/hopr-stake/lib/types/HoprStake'
import { useEffect, useState } from 'react'

type Accounts = {
  actualLockedTokenAmount: BigNumber
  virtualLockedTokenAmount: BigNumber
  lastSyncTimestamp: BigNumber
  cumulatedRewards: BigNumber
  claimedRewards: BigNumber
}

async function fetchStakedXHOPRTokens(
  library,
  HoprStakeContractAddress,
  account
) {
  if (library) {
    const contract = new Contract(
      HoprStakeContractAddress,
      HoprStakeABI,
      library
    ) as unknown as HoprStakeType
    try {
      const accountStruct: Accounts = await contract.accounts(account)
      const stakedHOPRTokens = accountStruct.actualLockedTokenAmount
        ? Number(
            utils.formatEther(accountStruct.actualLockedTokenAmount)
          ).toFixed(3)
        : '0.000'
      return stakedHOPRTokens
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log('Error: ', err)
    }
  }
}

export const HoprStakeBalance = ({
  HoprStakeContractAddress,
}: {
  HoprStakeContractAddress: string
}): JSX.Element => {
  const { account, library } = useEthers()
  const [stakedBalance, setStakedBalance] = useState<string>(undefined)
  useEffect(() => {
    const loadStakedXHoprBalance = async () => {
      const stakedBalance = await fetchStakedXHOPRTokens(library, HoprStakeContractAddress, account)
      setStakedBalance(stakedBalance)
    }
    loadStakedXHoprBalance()
  }, [account])
  return <>{ stakedBalance || 'Loading...'}</>
}

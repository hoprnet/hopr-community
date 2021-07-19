import { chainIdToNetwork } from './connectors'

export type IContractAddress = {
  xHOPR: string
  wxHOPR: string
  HoprBoost: string
  HoprStake: string
  Multicall: string
}

export type IContractFromBlockNumbers = {
  xHOPR: number
  wxHOPR: number
  HoprBoost: number
  HoprStake: number
  Multicall: number
}

export const emptyContractAddresses: IContractAddress = {
  xHOPR: '',
  wxHOPR: '',
  HoprBoost: '',
  HoprStake: '',
  Multicall: ''
}
export const emptyFromBlockNumbers: IContractFromBlockNumbers = {
  xHOPR: -1,
  wxHOPR: -1,
  HoprBoost: -1,
  HoprStake: -1,
  Multicall: -1
}

export const getContractAddresses = async (chainId: number): Promise<IContractAddress> => {
  const network = chainIdToNetwork(chainId)
  return {
    xHOPR: (
      await import(`@hoprnet/hopr-stake/deployments/${network}/xHOPR.json`)
    ).address,
    wxHOPR: (
      await import(`@hoprnet/hopr-stake/deployments/${network}/wxHOPR.json`)
    ).address,
    HoprBoost: (
      await import(`@hoprnet/hopr-stake/deployments/${network}/HoprBoost.json`)
    ).address,
    HoprStake: (
      await import(`@hoprnet/hopr-stake/deployments/${network}/HoprStake.json`)
    ).address,
    Multicall: (
      await import(`@hoprnet/hopr-stake/deployments/${network}/Multicall.json`)
    ).address,
  }
}

export const getBlockNumberFromDeploymentTransactionHashReceipt = async (chainId: number): Promise<IContractFromBlockNumbers> => {
  const network = chainIdToNetwork(chainId)
  return {
    xHOPR: (
      await import(`@hoprnet/hopr-stake/deployments/${network}/xHOPR.json`)
    ).receipt.blockNumber,
    wxHOPR: (
      await import(`@hoprnet/hopr-stake/deployments/${network}/wxHOPR.json`)
    ).receipt.blockNumber,
    HoprBoost: (
      await import(`@hoprnet/hopr-stake/deployments/${network}/HoprBoost.json`)
    ).receipt.blockNumber,
    HoprStake: (
      await import(`@hoprnet/hopr-stake/deployments/${network}/HoprStake.json`)
    ).receipt.blockNumber,
    Multicall: (
      await import(`@hoprnet/hopr-stake/deployments/${network}/Multicall.json`)
    ).receipt.blockNumber,
  }
}
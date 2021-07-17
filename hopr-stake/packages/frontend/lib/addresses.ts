import { chainIdToNetwork } from './connectors'

export type IContractAddress = {
  xHOPR: string
  wxHOPR: string
  HoprBoost: string
  HoprStake: string
  Multicall: string
}

export const emptyContractAddresses: IContractAddress = {
  xHOPR: '',
  wxHOPR: '',
  HoprBoost: '',
  HoprStake: '',
  Multicall: ''
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

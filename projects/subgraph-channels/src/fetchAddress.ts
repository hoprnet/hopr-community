import {networks, PublicNetworks, ContractNames, getContractData, ContractData} from "@hoprnet/hopr-ethereum"
import fs from 'fs'

type Config = {
    network: string
    channelAddress: string
    startBlock: string
}

const supportedNetworks = ['goerli', 'matic', 'xdai'];

const conversion = (contract: ContractData, deployedNetwork: PublicNetworks): Config | null => {
    if (deployedNetwork === 'polygon') {
        return {network: 'matic', channelAddress: contract.address, startBlock: (contract as any).blockNumber.toString() ?? 0};
    }
    if (supportedNetworks.includes(deployedNetwork)) {
        return {network:deployedNetwork, channelAddress: contract.address, startBlock: (contract as any).blockNumber.toString() ?? 0};
    }
    return null;
}

const main = () => {
    const deployedNetworks = Object.keys(networks) as PublicNetworks[];
    console.log(deployedNetworks)

    deployedNetworks.forEach((deployedNetwork: PublicNetworks) => {
        const contract = getContractData(deployedNetwork, 'HoprChannels' as ContractNames)
        const config = conversion(contract, deployedNetwork);
        if (config) {
            fs.writeFileSync(`${__dirname}/../config/${config.network}.json`, JSON.stringify(config, null, 2));
        }
    })
}

main()
import {PublicNetworks, ContractNames, getContractData, ContractData} from "@hoprnet/hopr-ethereum"
import fs from 'fs'

// As in https://thegraph.com/docs/en/deploying/deploying-a-subgraph-to-hosted/#using-graph-cli
type DataSourceConfig = {
    address: string
    startBlock: number
}

type NetworkConfig = {
    [network: string]: {
        [dataSource: string]: DataSourceConfig
    }
}

// remove matic
const supportedNetworks = ['goerli', 'xdai'];

const conversion = (contract: ContractData, deployedNetwork: PublicNetworks): NetworkConfig | null => {
    // FIXME: legacy pology does not exist anymore
    // if (deployedNetwork === 'polygon') {
    //     return {network: 'matic', channelAddress: contract.address, startBlock: (contract as any).blockNumber.toString() ?? 0};
    // }
    if (supportedNetworks.includes(deployedNetwork)) {
        return {
            [deployedNetwork]: {
                "HoprChannels": {
                    "address": contract.address,
                    "startBlock": (contract as any).blockNumber ?? 0
                }
            }
        }
    }
    return null;
}

/**
 * @param environmentId string name of environment
 * @param networkName string name of network
 */
const main = (environmentId: string, networkName: string) => {
    if (environmentId && networkName) {
        console.log(`Fetching contract data from environment ${environmentId}`)
        const deployedNetwork = networkName as PublicNetworks
        // Object.keys(Networks) as PublicNetworks[];
        console.log(deployedNetwork)

    
        const contract = getContractData(deployedNetwork, environmentId, 'HoprChannels' as ContractNames)
        console.log(`contract ${contract.address} of deployedNetwork ${deployedNetwork}`)
        const config = conversion(contract, deployedNetwork);
        if (config) {
            fs.writeFileSync(`${__dirname}/../networks.json`, JSON.stringify(config, null, 2));
        }
    } else {
        console.log("Missing <environmentId>. Quit.");
        process.exit(1);
    }
}

/**
 * 
 */
main(process.argv[2], process.argv[3])
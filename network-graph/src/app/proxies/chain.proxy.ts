import { Injectable } from '@angular/core';
import { ethers } from 'ethers';
import { ChainTxEventType, ChainType } from '../enums/chain.enum';
import { ConfigChainModel } from '../models/config.model';
import { CommonUtil } from '../utils/common.util';

@Injectable({
  providedIn: 'root'
})
export class ChainProxy {

  public createEthersProvider(url: string): ethers.providers.Provider {
    if (CommonUtil.isNullOrWhitespace(url)) {
      return null;
    }
    return new ethers.providers.JsonRpcProvider(url);
  }

  public async getBlockNumberAsync(provider: ethers.providers.Provider): Promise<number> {
    const blockNumber = await provider.getBlockNumber();
    console.log('getBlockNumber', blockNumber);
    return blockNumber;
  }

  public async getSymbolAsync(contract: ethers.Contract): Promise<string> {
    const symbol = await contract.symbol();
    console.log('symbol', symbol);
    return symbol;
  }

  public async getBalanceAsync(contract: ethers.Contract, address: string): Promise<string> {
    const balance = await contract.balanceOf(address);
    const balanceFormatted = ethers.utils.formatUnits(balance, 18);
    console.log('balance', balanceFormatted);
    return balanceFormatted;
  }

  public async getAllEventsByTypeAsync(
    chain: ConfigChainModel,
    contract: ethers.Contract,
    type: ChainTxEventType,
    blockNumber: number
  ): Promise<ethers.Event[]> {
    const eventName = this.getTxEventName(chain, type);
    // Create a filter e.g. contract.filters.Transfer() if the eventName is equal to Transfer
    const filter = contract.filters[eventName]();
    const events = await this.getEventsByBlockAsync(contract, filter, 0, blockNumber);
    return events;
  }

  public async getEventsByBlockAsync(
    contract: ethers.Contract, filter: ethers.EventFilter, fromBlock: number, toBlock: number
  ): Promise<ethers.Event[]> {
    if (fromBlock <= toBlock) {
      try {
        return await contract.queryFilter(filter, fromBlock, toBlock);
      }
      catch (error) {
        // tslint:disable-next-line: no-bitwise
        const midBlock = (fromBlock + toBlock) >> 1;
        console.log('getEventsByBlockAsync midBlock', midBlock);
        const arr1 = await this.getEventsByBlockAsync(contract, filter, fromBlock, midBlock);
        const arr2 = await this.getEventsByBlockAsync(contract, filter, midBlock + 1, toBlock);
        return [...arr1, ...arr2];
      }
    }
    return [];
  }

  public async loadRawData(chain: ConfigChainModel): Promise<any> {
    const provider = this.createEthersProvider(chain.rpcProviderUrl);
    const contract = new ethers.Contract(chain.tokenContractAddress, chain.tokenContractAbi, provider);
    const blockNumber = await this.getBlockNumberAsync(contract.provider);
    const chainName = ChainType[chain.type];
    console.log(chain.tokenContractAddress, await contract.name());
    let events = [];
    for (const eventType of [ChainTxEventType.MINT, ChainTxEventType.TRANSFER, ChainTxEventType.BURN]) {
      const eventName = ChainTxEventType[eventType];
      console.log(`Extract ${eventName} events of ${chainName} started.`);
      events = events.concat(await this.getAllEventsByTypeAsync(chain, contract, eventType, blockNumber));
      console.log(`Extract ${eventName} events of ${chainName} ended.`);
    }
    return events;
  }

  public getTxEventName(chain: ConfigChainModel, type: ChainTxEventType): string {
    const typeName = ChainTxEventType[type];
    if (chain?.txEventNames && chain.txEventNames.hasOwnProperty(typeName)) {
      return chain.txEventNames[typeName];
    }
    return undefined;
  }

  public async test(contract: ethers.Contract): Promise<void> {
    const filter = contract.filters.Burn();
    const events = await contract.queryFilter(filter);
    console.log('test', events);
    if (events && events.length > 0) {
      const test = events[0];
      console.log(test.decode(test.data, test.topics));
    }
  }
}

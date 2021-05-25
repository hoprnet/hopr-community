import { Injectable } from '@angular/core';
import { ethers } from 'ethers';
import { ChainTxEventType, ChainType } from '../enums/chain.enum';
import { ChainConfigModel } from '../models/config.model';
import { Logger } from '../services/logger.service';
import { CommonUtil } from '../utils/common.util';
import { Ensure } from '../utils/ensure.util';
import { FileUtil } from '../utils/file.util';

@Injectable({
  providedIn: 'root'
})
export class EthersClient {

  constructor(private logger: Logger, private fileUtil: FileUtil) {

  }

  public createEthersProvider(url: string): ethers.providers.Provider {
    Ensure.notNullOrWhiteSpace(url, 'url');
    return new ethers.providers.JsonRpcProvider(url);
  }

  public async getBlockNumberAsync(provider: ethers.providers.Provider): Promise<number> {
    const blockNumber = await provider.getBlockNumber();
    this.logger.info('Current block number', blockNumber)();
    return blockNumber;
  }

  public async getSymbolAsync(contract: ethers.Contract): Promise<string> {
    const symbol = await contract.symbol();
    this.logger.info('symbol', symbol)();
    return symbol;
  }

  public async getBalanceAsync(contract: ethers.Contract, address: string): Promise<string> {
    const balance = await contract.balanceOf(address);
    const balanceFormatted = ethers.utils.formatUnits(balance, 18);
    this.logger.info('balance', balanceFormatted)();
    return balanceFormatted;
  }

  public async getAllEvents(chain: ChainConfigModel): Promise<any> {
    let events = [];
    events = events.concat(await this.getTokenEvents(chain));
    events = events.concat(await this.getBridgeEvents(chain));
    return events;
  }

  public async getTokenEvents(chain: ChainConfigModel): Promise<any> {
    const provider = this.createEthersProvider(chain.rpcProviderUrl);
    const blockNumber = await this.getBlockNumberAsync(provider);
    const abi = await this.fileUtil.readFileAsync(chain.tokenContractAbiPath);
    const contract = new ethers.Contract(chain.tokenContractAddress, JSON.parse(abi), provider);
    // this.logger.info(chain.tokenContractAddress, await contract.name())();
    let events = [];
    for (const eventType of [ChainTxEventType.MINT, ChainTxEventType.TRANSFER, ChainTxEventType.BURN]) {
      events = events.concat(await this.getEventsByTypeAsync(chain, contract, eventType, blockNumber));
    }
    return events;
  }

  public async getBridgeEvents(chain: ChainConfigModel): Promise<any> {
    const provider = this.createEthersProvider(chain.rpcProviderUrl);
    const blockNumber = await this.getBlockNumberAsync(provider);
    const abi = await this.fileUtil.readFileAsync(chain.bridgeContractAbiPath);
    const contract = new ethers.Contract(chain.bridgeContractAddress, JSON.parse(abi), provider);
    // this.logger.info(chain.bridgeContractAddress)();
    let events = [];
    for (const eventType of [ChainTxEventType.BRIDGE_START, ChainTxEventType.BRIDGE_END]) {
      events = events.concat(await this.getEventsByTypeAsync(chain, contract, eventType, blockNumber));
    }
    return events;
  }

  public async getEventsByTypeAsync(
    chain: ChainConfigModel,
    contract: ethers.Contract,
    type: ChainTxEventType,
    blockNumber: number
  ): Promise<ethers.Event[]> {
    const chainName = ChainType[chain.type];
    const eventSignature = chain.mapTxEventTypeToString(type);
    if (CommonUtil.isNullOrWhitespace(eventSignature)) {
      this.logger.info(`Extract ${ChainTxEventType[type]} events of ${chainName} skipped (no signature found).`)();
      return Promise.resolve([]);
    } else {
      this.logger.info(`Extract ${eventSignature} events of ${chainName} started.`)();
      // Create a filter e.g. contract.filters.Transfer() if the eventName is equal to Transfer
      let filter: ethers.EventFilter;
      switch (type) {
        case ChainTxEventType.BRIDGE_START:
        case ChainTxEventType.BRIDGE_END:
          // Filter by token smart contract address
          // - TokensBridged(address indexed token, address indexed recipient, uint256 value, bytes32 indexed messageId)
          // - TokensBridgingInitiated(index_topic_1 address token, index_topic_2 address sender, ...)
          filter = contract.filters[eventSignature](chain.tokenContractAddress);
          break;
        default:
          filter = contract.filters[eventSignature]();
          break;
      }
      const events = await this.getEventsByBlockAsync(contract, filter, chain.startBlock, blockNumber);
      this.logger.info(`Extract ${eventSignature} events of ${chainName} ended.`)();
      return events;
    }
  }

  public async getEventsByBlockAsync(
    contract: ethers.Contract, filter: ethers.EventFilter, fromBlock: number, toBlock: number
  ): Promise<ethers.Event[]> {
    if (fromBlock <= toBlock) {
      try {
        return await contract.queryFilter(filter, fromBlock, toBlock);
      }
      catch (error) {
        const midBlock = (fromBlock + toBlock) >> 1;
        this.logger.info(`Divide and conquer block ${midBlock}`)();
        const arr1 = await this.getEventsByBlockAsync(contract, filter, fromBlock, midBlock);
        const arr2 = await this.getEventsByBlockAsync(contract, filter, midBlock + 1, toBlock);
        return [...arr1, ...arr2];
      }
    }
    return [];
  }

  public async test(contract: ethers.Contract): Promise<void> {
    const filter = contract.filters.Burn();
    const events = await contract.queryFilter(filter);
    this.logger.info('test', events)();
    if (events && events.length > 0) {
      const test = events[0];
      this.logger.info(test.decode(test.data, test.topics))();
    }
  }
}

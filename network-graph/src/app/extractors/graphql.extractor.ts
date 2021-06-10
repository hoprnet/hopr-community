import { Injectable } from '@angular/core';
import { TheGraphClient } from '../clients/thegraph.client';
import { ChainSourceType, ChainTxEventType, ChainType } from '../enums/chain.enum';
import { ChainConfigModel } from '../models/config.model';
import { EventModel, TransferEventModel } from '../models/event.model';
import { SubgraphTokenTypes, SubgraphTransactionModel, SubgraphTransferEventModel } from '../models/subgraph.model';
import { Logger } from '../services/logger.service';
import { CommonUtil } from '../utils/common.util';
import { BaseChainExtractor } from './base.extractor';

@Injectable({
  providedIn: 'root'
})
export class GraphqlChainExtractor extends BaseChainExtractor {

  constructor(protected logger: Logger, private client: TheGraphClient) {
    super(logger);
  }

  protected get type(): ChainSourceType {
    return ChainSourceType.GRAPHQL;
  }

  protected async extractAsyncInternal(chain: ChainConfigModel): Promise<EventModel[]> {
    // Get all transactions and transform them
    const events: EventModel[] = [];
    const transactions = await this.getTransactionsRecursiveAsync(chain, 1000);
    this.transform(chain, transactions, events);
    return events;
  }

  private async getTransactionsRecursiveAsync(
    chain: ChainConfigModel, limit: number, lastIndex: number = 0
  ): Promise<SubgraphTransactionModel[]> {
    this.logger.info(`Extracting transactions with index greater than ${lastIndex}.`)();
    let transactions = await this.client.getTransactions(chain, limit, lastIndex);
    if (transactions?.length >= limit) {
      const index = CommonUtil.tryParseInt(transactions[transactions.length - 1].index);
      if (index && index > 0) {
        transactions = transactions.concat(await this.getTransactionsRecursiveAsync(chain, limit, index));
      }
    }
    return transactions;
  }

  private transform(chain: ChainConfigModel, transactions: SubgraphTransactionModel[], events: EventModel[]): void {
    if (transactions && events) {
      const eventSignature = chain.mapTxEventTypeToString(ChainTxEventType.TRANSFER);
      for (const transaction of transactions) {
        for (const transfer of transaction.transferEvents) {
          if (!this.shouldSkip(chain.type, transfer.tokenType)) {
            const event = this.transformTransfer(chain.type, transaction, transfer, eventSignature);
            if (event) {
              events.push(event);
            }
          }
        }
      }
    }
  }

  private transformTransfer(
    chainType: ChainType,
    transaction: SubgraphTransactionModel,
    transfer: SubgraphTransferEventModel,
    eventSignature: string
  ): TransferEventModel {
    if (transfer) {
      return new TransferEventModel({
        chainType,
        eventSignature,
        blockNumber: CommonUtil.tryParseInt(transfer.blockNumber),
        blockTimestamp: transfer.blockTimestamp,
        transactionHash: transaction.id,
        logIndex: CommonUtil.tryParseInt(transfer.logIndex),
        argsFrom: transfer.from,
        argsTo: transfer.to,
        argsAmount: transfer.amount
      });
    }
    return undefined;
  }

  private shouldSkip(chainType: ChainType, tokenType: string): boolean {
    if (chainType === ChainType.XDAI_MAIN && tokenType !== SubgraphTokenTypes.XHOPR) {
      return true;
    }
    return false;
  }
}

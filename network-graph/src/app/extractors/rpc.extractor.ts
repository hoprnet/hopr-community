import { Injectable } from '@angular/core';
import { EthersClient } from '../clients/ethers.client';
import { ChainSourceType } from '../enums/chain.enum';
import { ChainConfigModel } from '../models/config.model';
import { EventModel } from '../models/event.model';
import { Logger } from '../services/logger.service';
import { BaseChainExtractor } from './base.extractor';

@Injectable({
  providedIn: 'root'
})
export class RpcChainExtractor extends BaseChainExtractor {

  constructor(protected logger: Logger, private client: EthersClient) {
    super(logger);
  }

  protected get type(): ChainSourceType {
    return ChainSourceType.RPC;
  }

  protected async extractAsyncInternal(chain: ChainConfigModel): Promise<EventModel[]> {
    return this.client.getAllEvents(chain).then(result => {
      if (Array.isArray(result)) {
        return Promise.resolve(result.map(e => EventModel.fromJS(e, chain)));
      }
      return Promise.resolve(undefined);
    }).catch(error => {
      return Promise.reject(error);
    });
  }

}

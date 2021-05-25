import { Injectable } from '@angular/core';
import axios from 'axios';
import { ChainType } from '../enums/chain.enum';
import { ChainConfigModel } from '../models/config.model';
import { SubgraphStatContainerModel, SubgraphTransactionModel } from '../models/subgraph.model';

@Injectable({
  providedIn: 'root'
})
export class TheGraphClient {

  constructor() {

  }

  private handleResponse(response: any, transformFn: (e: any) => any): Promise<any> {
    if (response?.data || response?.error) {
      if (response.data) {
        if (Array.isArray(response.data)) {
          return Promise.resolve(response.data.map((e: any) => transformFn(e)));
        } else {
          return Promise.resolve(transformFn(response.data));
        }
      }
    }
    return Promise.reject(response);
  }

  public getTransactions(chain: ChainConfigModel, limit: number = 1000, lastIndex: number = 0): Promise<SubgraphTransactionModel[]> {
    return axios.post(chain.theGraphUrl, {
      query: `{
        transactions(first: ${limit}, orderBy: index, orderDirection: asc, where: { index_gt: ${lastIndex} }) {
          id
          index
          from
          to
          blockNumber
          blockTimestamp
          ${this.getTransferEventsQuery(chain.type)}
        }
      }`
    }).then(result => {
      return this.handleResponse(result?.data, (e: any) => {
        return e?.transactions?.map((e1: any) => SubgraphTransactionModel.fromJS(e1));
      });
    }).catch(error => {
      return Promise.reject(error);
    });
  }

  public getStatContainer(url: string): Promise<SubgraphStatContainerModel> {
    return axios.post(url, {
      query: `{
        statsContainers {
          id,
          lastAccountIndex,
          lastAccountSnapshotIndex,
          lastTransactionIndex,
          lastTransferEventIndex
        }
      }`
    }).then(result => {
      return this.handleResponse(result?.data, (e: any) => {
        const containers = e?.statsContainers?.map((e1: any) => SubgraphStatContainerModel.fromJS(e1));
        return containers?.length > 0 ? containers[0] : undefined;
      });
    }).catch(error => {
      return Promise.reject(error);
    });
  }

  private getTransferEventsQuery(chainType: ChainType): string {
    switch (chainType) {
      case ChainType.ETH_MAIN:
        return `transferEvents {
          id
          index
          transaction
          logIndex
          blockNumber
          blockTimestamp
          from
          to
          amount
        }`;
      case ChainType.XDAI_MAIN:
        return `transferEvents {
          id
          index
          transaction
          logIndex
          blockNumber
          blockTimestamp
          from
          to
          amount
          tokenType
        }`;
      default:
        break;
    }
    return undefined;
  }
}

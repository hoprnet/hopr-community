import { Injectable } from '@angular/core';
import { ChainSourceType } from '../enums/chain.enum';
import { IChainExtractor } from '../extractors/base.extractor';
import { FileChainExtractor } from '../extractors/file.extractor';
import { GraphqlChainExtractor } from '../extractors/graphql.extractor';
import { RpcChainExtractor } from '../extractors/rpc.extractor';

@Injectable({
  providedIn: 'root'
})
export class ChainExtractorFactory {

  constructor(
    private fileExtractor: FileChainExtractor,
    private rpcExtractor: RpcChainExtractor,
    private graphqlExtractor: GraphqlChainExtractor
  ) {
  }

  public get(type: ChainSourceType): IChainExtractor {
    switch (type) {
      case ChainSourceType.GRAPHQL:
        return this.graphqlExtractor;
      case ChainSourceType.RPC:
        return this.rpcExtractor;
      case ChainSourceType.FILE:
      default:
        return this.fileExtractor;
    }
  }

}

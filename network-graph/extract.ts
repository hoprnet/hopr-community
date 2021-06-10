import { EthersClient } from './src/app/clients/ethers.client';
import { TheGraphClient } from './src/app/clients/thegraph.client';
import { ChainType } from './src/app/enums/chain.enum';
import { GraphqlChainExtractor } from './src/app/extractors/graphql.extractor';
import { RpcChainExtractor } from './src/app/extractors/rpc.extractor';
import { ChainConfigModel, ConfigModel } from './src/app/models/config.model';
import { EventModel } from './src/app/models/event.model';
import { DefaultLoggerService, Logger } from './src/app/services/logger.service';
import { CommonUtil } from './src/app/utils/common.util';
import { LocalFileUtil } from './src/app/utils/local-file.util';

class Extractor {

  private logger: Logger;
  private fileUtil: LocalFileUtil;
  private extractor1: GraphqlChainExtractor;
  private extractor2: RpcChainExtractor;

  constructor() {
    this.logger = new DefaultLoggerService();
    this.fileUtil = new LocalFileUtil();
    this.fileUtil.baseDir = __dirname;
    this.extractor1 = new GraphqlChainExtractor(this.logger, new TheGraphClient());
    this.extractor2 = new RpcChainExtractor(this.logger, new EthersClient(this.logger, this.fileUtil));
  }

  public async extractAsync(): Promise<void> {
    const rawConfig = await this.fileUtil.readFileAsync('./src/assets/config.json');
    const config = new ConfigModel(JSON.parse(rawConfig));
    for (const chain of config.chains) {
      if (chain.type !== ChainType.TEST) {
        await this.extractChainAsync(chain);
      }
    }
  }

  private async extractChainAsync(chain: ChainConfigModel): Promise<void> {
    const chainName = ChainType[chain.type];
    this.logger.info(`Extract ${chainName} started.`)();
    let events: EventModel[];
    if (CommonUtil.isNullOrWhitespace(chain.theGraphUrl)) {
      this.logger.info(`Skipping GraphQL extraction because theGraphUrl is empty.`)();
    } else {
      // Use GraphQL extractor
      events = await this.extractor1.extractAsync(chain);
    }
    if ((!events || events?.length <= 0)) {
      if (CommonUtil.isNullOrWhitespace(chain.rpcProviderUrl)) {
        this.logger.info(`Skipping RPC extraction because rpcProviderUrl is empty.`)();
      } else {
        // Use RPC extractor
        events = await this.extractor2.extractAsync(chain);
      }
    }
    if (events && events.length > 0) {
      this.fileUtil.writeFile(CommonUtil.toJsonString(events), `./src/assets/data/${chainName}_EVENTS.json`);
    }
    this.logger.info(`Extract ${chainName} ended.`)();
  }
}

const extractor = new Extractor();
extractor.extractAsync().finally(() => {
  console.log('Data extraction finished.');
});

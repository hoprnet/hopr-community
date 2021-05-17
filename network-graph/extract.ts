import * as fs from 'fs';
import { ChainType } from './src/app/enums/chain.enum';
import { ConfigChainModel, ConfigModel } from './src/app/models/config.model';
import { ChainProxy } from './src/app/proxies/chain.proxy';
import { CommonUtil } from './src/app/utils/common.util';
import { JsonUtil } from './src/app/utils/json.util';

class Extractor {

  private proxy: ChainProxy;

  constructor() {
    this.proxy = new ChainProxy();
  }

  public async extractAsync(): Promise<void> {
    const config = new ConfigModel(JSON.parse(fs.readFileSync('./src/assets/config.json', 'utf8')));
    for (const chain of config.chains) {
      if (chain.type !== ChainType.TEST) {
        await this.extractChainAsync(chain);
      }
    }
  }

  private async extractChainAsync(chain: ConfigChainModel): Promise<void> {
    const chainName = ChainType[chain.type];
    if (CommonUtil.isNullOrWhitespace(chain.rpcProviderUrl)) {
      console.log(`Skipping ${chainName} because rpcProviderUrl is empty.`);
      return;
    }
    console.log(`Extract ${chainName} started.`);
    const events = await this.proxy.loadRawData(chain);
    console.log(`Extract ${chainName} ended.`);
    fs.writeFileSync(`./src/assets/data/${chainName}_EVENTS.json`, JsonUtil.toString(events), 'utf8');
  }
}

const extractor = new Extractor();
extractor.extractAsync().finally(() => {
  console.log('Data extraction finished.');
});

import { AppConstants } from '../app.constants';
import { ChainSourceType, ChainType } from '../enums/chain.enum';
import { ChainConfigModel } from '../models/config.model';
import { EventModel } from '../models/event.model';
import { Logger } from '../services/logger.service';
import { Ensure } from '../utils/ensure.util';

export interface IChainExtractor {
  extractAsync(chain: ChainConfigModel): Promise<EventModel[]>;
}

export abstract class BaseChainExtractor implements IChainExtractor {

  constructor(protected logger: Logger) {

  }

  protected abstract get type(): ChainSourceType;

  protected get name(): string {
    return AppConstants.SOURCES.find(e => e.type === this.type)?.name ?? 'Unknown';
  }

  public async extractAsync(chain: ChainConfigModel): Promise<EventModel[]> {
    Ensure.notNull(chain, 'chain');
    this.logger.info(`${this.name} extraction of ${ChainType[chain.type]} started.`)();
    try {
      const result = await this.extractAsyncInternal(chain);
      this.logger.info(`${this.name} extraction of ${ChainType[chain.type]} ended.`)();
      return result;
    } catch (error) {
      this.logger.error(error)();
      return Promise.reject('Chain data could not be extracted.');
    }
  }

  protected abstract extractAsyncInternal(chain: ChainConfigModel): Promise<EventModel[]>;

}

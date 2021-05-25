import { Injectable } from '@angular/core';
import { ChainType } from '../enums/chain.enum';
import { ChainStatModel } from '../models/stat.model';
import { ConfigService } from '../services/config.service';
import { Logger } from '../services/logger.service';
import { BaseRepository } from './base.repository';

@Injectable({
  providedIn: 'root'
})
export class StatRepository extends BaseRepository<ChainStatModel> {

  constructor(protected logger: Logger, private configService: ConfigService) {
    super(logger);
  }

  protected init(): void {
    super.createDatabase('stats');
  }

  public async getOrCreateByChainTypeAsync(type: ChainType): Promise<ChainStatModel> {
    const id = ChainType[type];
    try {
      let result: ChainStatModel = await super.getByIdAsync(id);
      if (!result) {
        result = new ChainStatModel({
          _id: id,
          version: this.configService.config.version,
          type
        });
        await super.insertAsync(result);
      }
      return Promise.resolve(result);
    } catch (error) {
      return Promise.reject(error);
    }
  }
}

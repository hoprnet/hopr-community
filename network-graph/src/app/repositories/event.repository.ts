import { Injectable } from '@angular/core';
import { ChainType } from '../enums/chain.enum';
import { EventModel } from '../models/event.model';
import { Logger } from '../services/logger.service';
import { BaseRepository } from './base.repository';

@Injectable({
  providedIn: 'root'
})
export class EventRepository extends BaseRepository<EventModel> {

  constructor(protected logger: Logger) {
    super(logger);
  }

  protected init(): void {
    super.createDatabase('events');
  }

  public getByChainTypeAsync(type: ChainType): Promise<EventModel[]> {
    try {
      return Promise.resolve(this._db({ chainType: type }).get());
    } catch (error) {
      return Promise.reject(error);
    }
  }

  public getLastBlockByChainTypeAsync(type: ChainType): Promise<number> {
    try {
      return Promise.resolve(this._db({ chainType: type }).max('blockNumber'));
    } catch (error) {
      return Promise.reject(error);
    }
  }

  public clearByChainType(type: ChainType): Promise<void> {
    try {
      this._db({ chainType: type }).remove();
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  }
}

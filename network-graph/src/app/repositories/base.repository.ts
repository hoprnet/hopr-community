import { taffy } from 'taffydb';
import { Logger } from '../services/logger.service';
import { CommonUtil } from '../utils/common.util';
import { Ensure } from '../utils/ensure.util';

export abstract class BaseRepository<T> {

  private _isLocalStorageDisabled = true;
  private _namespace = 'hopr_network_graph_taffydb_';
  private _dbName: string;
  protected _db: any;

  constructor(protected logger: Logger) {
    this.init();
  }

  protected abstract init(): void;

  protected createDatabase(name: string): void {
    Ensure.notNullOrWhiteSpace(name, 'name');
    this._dbName = name;
    this._db = taffy(this.getLocalStorage());
  }

  public getByIdAsync(id: string): Promise<T> {
    try {
      return Promise.resolve(this._db({ _id: id }).first());
    } catch (error) {
      return Promise.reject(error);
    }
  }

  public getAllAsync(): Promise<T[]> {
    try {
      return Promise.resolve(this._db().get());
    } catch (error) {
      return Promise.reject(error);
    }
  }

  public insertAsync(item: T): Promise<void> {
    try {
      this._db.insert(item);
      this.updateLocalStorage();
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  }

  public insertManyAsync(items: T[]): Promise<void> {
    try {
      this._db.insert(items);
      this.updateLocalStorage();
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  }

  public clearAllAsync(): Promise<void> {
    try {
      this._db().remove();
      this.updateLocalStorage();
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  }

  private get localStorageKey(): string {
    return this._namespace + this._dbName;
  }

  private updateLocalStorage(): void {
    try {
      if (!this._isLocalStorageDisabled) {
        const json = JSON.stringify(this._db().get());
        localStorage.setItem(this.localStorageKey, CommonUtil.compress(json));
      }
    } catch (error) {
      this.logger.error(error)();
    }
  }

  private getLocalStorage(): any {
    try {
      if (!this._isLocalStorageDisabled) {
        const data = localStorage.getItem(this.localStorageKey);
        if (data) {
          return JSON.parse(CommonUtil.decompress(data));
        }
      }
      return undefined;
    } catch (error) {
      this.logger.error(error)();
    }
  }
}

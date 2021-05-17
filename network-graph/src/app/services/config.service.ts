import { Injectable } from '@angular/core';
import { ConfigModel } from '../models/config.model';
import { JsonUtil } from '../utils/json.util';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  private _config: ConfigModel = new ConfigModel();

  public get config(): ConfigModel {
    return this._config;
  }

  public async initAsync(): Promise<void> {
    const config = await JsonUtil.loadLocalAsync('./assets/config.json');
    this._config = new ConfigModel(config);
  }
}

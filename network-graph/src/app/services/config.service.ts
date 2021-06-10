import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { ConfigModel } from '../models/config.model';
import { FileUtil } from '../utils/file.util';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  private _config: ConfigModel = new ConfigModel();

  constructor(private fileUtil: FileUtil) {

  }

  public get config(): ConfigModel {
    return this._config;
  }

  public async initAsync(): Promise<void> {
    const config = await this.fileUtil.readFileAsync('./assets/config.json');
    this._config = new ConfigModel(JSON.parse(config));
    this._config.isDevelopment = !environment.production;
    this._config.version = environment.version;
  }
}

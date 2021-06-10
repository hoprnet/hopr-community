import { Injectable } from '@angular/core';
import * as fs from 'fs';
import * as _path from 'path';
import { CommonUtil } from './common.util';
import { FileUtil } from './file.util';

@Injectable()
export class LocalFileUtil extends FileUtil {

  public baseDir: string;

  public async readFileAsync(path: string): Promise<any> {
    return Promise.resolve(fs.readFileSync(this.getFullPath(path), 'utf8'));
  }

  public writeFile(data: any, path?: string): void {
    fs.writeFileSync(this.getFullPath(path), data, 'utf8');
  }

  private getFullPath(path: string): string {
    return CommonUtil.isNullOrWhitespace(this.baseDir) ?
      path : path.startsWith('./src/') ? _path.join(this.baseDir, path) : _path.join(this.baseDir, 'src', path);
  }

}

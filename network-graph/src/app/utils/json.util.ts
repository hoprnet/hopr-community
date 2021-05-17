import { CommonUtil } from './common.util';

export class JsonUtil {

  public static toString(data: any): string {
    return JSON.stringify(data, null, 2);
  }

  public static async loadLocalAsync(path: string): Promise<any> {
    const response = await fetch(path);
    return await response.json();
  }

  public static download(data: any): void {
    const blob = new Blob([JsonUtil.toString(data)], { type: 'application/json' });
    CommonUtil.download(blob);
  }

}

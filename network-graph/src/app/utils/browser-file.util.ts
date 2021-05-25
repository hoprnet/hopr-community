import { Injectable } from '@angular/core';
import { CommonUtil } from './common.util';
import { FileUtil } from './file.util';

@Injectable()
export class BrowserFileUtil extends FileUtil {

  public async readFileAsync(path: string): Promise<any> {
    const response = await fetch(path);
    return response.text();
  }

  public writeFile(data: any, path?: string): void {
    const blob = new Blob([CommonUtil.toJsonString(data)], { type: 'application/json' });
    const textFile = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.setAttribute('download', 'data.json');
    link.href = textFile;
    document.body.appendChild(link);

    // wait for the link to be added to the document
    window.requestAnimationFrame(() => {
      const event = new MouseEvent('click');
      link.dispatchEvent(event);
      document.body.removeChild(link);
      // revoke the object URL to avoid memory leaks.
      window.URL.revokeObjectURL(textFile);
    });
  }

}

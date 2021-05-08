import { BigNumber } from '@ethersproject/bignumber';
import { ethers } from 'ethers';

export class CommonUtil {

  public static isString(value: any): boolean {
    return typeof value === 'string' || value instanceof String;
  }

  public static isNullOrWhitespace(value: string): boolean {
    if (!CommonUtil.isString(value)) {
      // console.log('Expected a string but got: ', value);
      return true;
    } else {
      return value === null || value === undefined || value.trim() === '';
    }
  }

  public static download(blob: Blob): void {
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

  public static toBigNumber(bn: any): BigNumber {
    return BigNumber.from(bn);
  }

  public static formatBigNumber(bn: any): string {
    return ethers.utils.formatUnits(BigNumber.from(bn), 18);
  }

}

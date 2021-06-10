import { BigNumber } from '@ethersproject/bignumber';
import { ethers } from 'ethers';
import * as LZString from 'lz-string';

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

  public static isObject(value: any): boolean {
    return value && typeof value === 'object';
  }

  public static isFunction(value: any): boolean {
    return value && typeof value === 'function';
  }

  public static toBigNumber(bn: any): BigNumber {
    return BigNumber.from(bn);
  }

  public static toJsonString(data: any): string {
    return JSON.stringify(data, null, 2);
  }

  public static formatBigNumber(bn: any): string {
    return ethers.utils.formatUnits(BigNumber.from(bn), 18);
  }

  public static tryParseInt(value: string): number {
    try {
      return parseInt(value, 10);
    } catch (error) {
      return undefined;
    }
  }

  public static timeout(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public static compress(data: string): string {
    return LZString.compressToUTF16(data);
  }

  public static decompress(data: string): string {
    return LZString.decompressFromUTF16(data);
  }

  public static assign<T>(values: Partial<T>, ctor: new () => T): T {
    const instance = new ctor();
    return Object.keys(instance).reduce((acc, key) => {
      acc[key] = values[key];
      return acc;
    }, {}) as T;
  }

  public static combineIndex(index1: string, index2: string): string {
    if (CommonUtil.isNullOrWhitespace(index1) || CommonUtil.isNullOrWhitespace(index2)) {
      return undefined;
    }
    if (index1 > index2) {
      return `${index2}_${index1}`;
    }
    return `${index1}_${index2}`;
  }

  public static hexToRgb(hex: string): number[] {
    if (CommonUtil.isNullOrWhitespace(hex)) {
      return [0, 0, 0];
    }
    const bigint = parseInt(hex.startsWith('#') ? hex.substring(1, hex.length) : hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return [r, g, b];
  }

  public static scrollTo(element: HTMLElement, offset: number): void {
    if (element) {
      const y = element.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }
}

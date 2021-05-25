import { TestBed } from '@angular/core/testing';
import { AppConstants } from '../app.constants';
import { CommonUtil } from './common.util';

describe('CommonUtil', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('combineIndex should return combined index with same order', () => {
    const index1 = '0x88ad';
    const index2 = '0xA5B7';
    expect(CommonUtil.combineIndex(undefined, undefined)).toBeUndefined();
    expect(CommonUtil.combineIndex(index1, undefined)).toBeUndefined();
    expect(CommonUtil.combineIndex(undefined, index2)).toBeUndefined();
    expect(CommonUtil.combineIndex(index1, index2)).toBe('0x88ad_0xA5B7');
    expect(CommonUtil.combineIndex(index2, index1)).toBe('0x88ad_0xA5B7');
  });

  it('hexToRgb should convert the color in hexadecimal format to rbg', () => {
    expect(CommonUtil.hexToRgb(undefined)).toEqual([0, 0, 0]);
    expect(CommonUtil.hexToRgb('test')).toEqual([0, 0, 0]);
    expect(CommonUtil.hexToRgb(AppConstants.TX_EVENT_BURN_COLOR)).toEqual([208, 74, 53]);
  });

});

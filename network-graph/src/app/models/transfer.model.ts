import { ChainTxEventType } from '../enums/chain.enum';
import { CommonUtil } from '../utils/common.util';

export class TransferModel {
  blockNumber: number;
  blockHash: string;
  transactionIndex: number;
  removed: boolean;
  address: string;
  data: string;
  topics: string[];
  transactionHash: string;
  logIndex: number;
  event: string;
  type: ChainTxEventType;
  eventSignature: string;
  args: TransferArgsModel;

  public constructor(init?: Partial<TransferModel>) {
    Object.assign(this, init);

    if (init?.args) {
      this.args = TransferArgsModel.create(init?.args);
    }
  }
}

export class TransferArgsModel {
  from: string;
  to: string;
  amount: string;

  public constructor(init?: Partial<TransferArgsModel>) {
    Object.assign(this, init);
  }

  public static create(items: any): TransferArgsModel {
    if (!Array.isArray(items) || items.length !== 3) {
      throw new Error('Invalid transfer arguments.');
    }
    return new TransferArgsModel({
      from: items[0],
      to: items[1],
      amount: CommonUtil.formatBigNumber(items[2])
    });
  }
}

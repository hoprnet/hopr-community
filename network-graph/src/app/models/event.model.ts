import { ChainTxEventType, ChainType } from '../enums/chain.enum';
import { CommonUtil } from '../utils/common.util';
import { IdUtil } from '../utils/id.util';
import { ChainConfigModel } from './config.model';

export class EventModel {
  _id: string;
  chainType: ChainType;
  blockNumber: number;
  blockHash: string;
  blockTimestamp: string;
  transactionIndex: number;
  removed: boolean;
  address: string;
  data: string;
  topics: string[];
  transactionHash: string;
  logIndex: number;
  eventSignature: string;
  type: ChainTxEventType;

  public constructor(data?: Partial<EventModel>) {
    this.init(data);
  }

  static fromJS(data: any, chain: ChainConfigModel): EventModel {
    data = typeof data === 'object' ? data : {};
    data.chainType = chain.type;
    data.type = chain.mapTxEventSignatureToType(data.eventSignature);
    switch (data.type) {
      case ChainTxEventType.TRANSFER:
        return TransferEventModel.fromJS(data);
      case ChainTxEventType.BRIDGE_START:
        return TokensBridgingInitiatedEventModel.fromJS(data);
      case ChainTxEventType.BRIDGE_END:
        return TokensBridgedEventModel.fromJS(data);
      default:
        break;
    }
    return new EventModel(data);
  }

  init(data?: any): void {
    if (data) {
      this._id = data._id;
      this.chainType = data.chainType;
      this.blockNumber = data.blockNumber;
      this.blockHash = data.blockHash;
      this.blockTimestamp = data.blockTimestamp;
      this.transactionIndex = data.transactionIndex;
      this.removed = data.removed;
      this.address = data.address;
      this.data = data.data;
      if (Array.isArray(data.topics)) {
        this.topics = [];
        for (const item of data.topics) {
          this.topics.push(item);
        }
      }
      this.transactionHash = data.transactionHash;
      this.logIndex = data.logIndex;
      this.eventSignature = data.eventSignature;
      this.type = data.type;
    }
    if (!this._id) {
      this._id = IdUtil.create();
    }
    if (!this.topics) {
      this.topics = [];
    }
  }
}

export class TransferEventModel extends EventModel {
  argsFrom: string;
  argsTo: string;
  argsAmount: string;

  public constructor(data?: Partial<TransferEventModel>) {
    super(data);
  }

  static fromJS(data: any): TransferEventModel {
    data = typeof data === 'object' ? data : {};
    const result = new TransferEventModel(data);
    if (Array.isArray(data.args)) {
      if (data.args.length !== 3) {
        throw new Error('Invalid TransferEvent arguments.');
      }
      result.argsFrom = data.args[0];
      result.argsTo = data.args[1];
      result.argsAmount = CommonUtil.formatBigNumber(data.args[2]);
    }
    return result;
  }

  init(data?: any): void {
    super.init(data);
    if (data) {
      this.argsFrom = data.argsFrom;
      this.argsTo = data.argsTo;
      this.argsAmount = data.argsAmount;
    }
    if (!this.type) {
      this.type = ChainTxEventType.TRANSFER;
    }
  }
}

export class TokensBridgingInitiatedEventModel extends EventModel {
  argsToken: string;
  argsSender: string;
  argsValue: string;
  argsMessageId: string;

  public constructor(data?: Partial<TokensBridgingInitiatedEventModel>) {
    super(data);
  }

  static fromJS(data: any): TokensBridgingInitiatedEventModel {
    data = typeof data === 'object' ? data : {};
    const result = new TokensBridgingInitiatedEventModel(data);
    if (Array.isArray(data.args)) {
      if (data.args.length !== 4) {
        throw new Error('Invalid TokensBridgingInitiatedEvent arguments.');
      }
      result.argsToken = data.args[0];
      result.argsSender = data.args[1];
      result.argsValue = data.args[2];
      result.argsMessageId = data.args[3];
    }
    return result;
  }

  init(data?: any): void {
    super.init(data);
    if (data) {
      this.argsToken = data.argsToken;
      this.argsSender = data.argsSender;
      this.argsValue = data.argsValue;
      this.argsMessageId = data.argsMessageId;
    }
    if (!this.type) {
      this.type = ChainTxEventType.BRIDGE_START;
    }
  }
}

export class TokensBridgedEventModel extends EventModel {
  argsToken: string;
  argsRecipient: string;
  argsValue: string;
  argsMessageId: string;

  public constructor(data?: Partial<TokensBridgedEventModel>) {
    super(data);
  }

  static fromJS(data: any): TokensBridgedEventModel {
    data = typeof data === 'object' ? data : {};
    const result = new TokensBridgedEventModel(data);
    if (Array.isArray(data.args)) {
      if (data.args.length !== 4) {
        throw new Error('Invalid TokensBridgedEvent arguments.');
      }
      result.argsToken = data.args[0];
      result.argsRecipient = data.args[1];
      result.argsValue = data.args[2];
      result.argsMessageId = data.args[3];
    }
    return result;
  }

  init(data?: any): void {
    super.init(data);
    if (data) {
      this.argsToken = data.argsToken;
      this.argsRecipient = data.argsRecipient;
      this.argsValue = data.argsValue;
      this.argsMessageId = data.argsMessageId;
    }
    if (!this.type) {
      this.type = ChainTxEventType.BRIDGE_END;
    }
  }
}

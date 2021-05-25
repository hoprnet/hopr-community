export abstract class SubgraphTokenTypes {
  static readonly XHOPR: string = 'xHOPR';
  static readonly WXHOPR: string = 'wxHOPR';
}

export class SubgraphTransactionModel {
  id: string;
  index: string;
  blockNumber: string;
  blockTimestamp: string;
  from: string;
  to: string;
  transferEvents: SubgraphTransferEventModel[];

  public constructor(data?: Partial<SubgraphTransactionModel>) {
    this.init(data);
  }

  static fromJS(data: any): SubgraphTransactionModel {
    data = typeof data === 'object' ? data : {};
    return new SubgraphTransactionModel(data);
  }

  init(data?: any): void {
    if (data) {
      this.id = data.id;
      this.index = data.index;
      this.blockNumber = data.blockNumber;
      this.blockTimestamp = data.blockTimestamp;
      this.from = data.from;
      this.to = data.to;
      if (Array.isArray(data.transferEvents)) {
        this.transferEvents = [];
        for (const item of data.transferEvents) {
          this.transferEvents.push(SubgraphTransferEventModel.fromJS(item));
        }
      }
    }
    if (!this.transferEvents) {
      this.transferEvents = [];
    }
  }
}

export abstract class SubgraphTransactionEventModel {
  id: string;
  index: string;
  blockNumber: string;
  blockTimestamp: string;
  logIndex: string;

  public constructor(data?: Partial<SubgraphTransactionEventModel>) {
    this.init(data);
  }

  init(data?: any): void {
    if (data) {
      this.id = data.id;
      this.index = data.index;
      this.blockNumber = data.blockNumber;
      this.blockTimestamp = data.blockTimestamp;
      this.logIndex = data.logIndex;
    }
  }
}

export class SubgraphTransferEventModel extends SubgraphTransactionEventModel {
  from: string;
  to: string;
  amount: string;
  tokenType: string;

  public constructor(data?: Partial<SubgraphTransferEventModel>) {
    super(data);
  }

  static fromJS(data: any): SubgraphTransferEventModel {
    data = typeof data === 'object' ? data : {};
    return new SubgraphTransferEventModel(data);
  }

  init(data?: any): void {
    super.init(data);
    if (data) {
      this.from = data.from;
      this.to = data.to;
      this.amount = data.amount;
      this.tokenType = data.tokenType;
    }
  }
}

export class SubgraphStatContainerModel {
  id: string;
  lastAccountIndex: string;
  lastAccountSnapshotIndex: string;
  lastTransactionIndex: string;
  lastTransferEventIndex: string;

  public constructor(data?: Partial<SubgraphStatContainerModel>) {
    this.init(data);
  }

  static fromJS(data: any): SubgraphStatContainerModel {
    data = typeof data === 'object' ? data : {};
    return new SubgraphStatContainerModel(data);
  }

  init(data?: any): void {
    if (data) {
      this.id = data.id;
      this.lastAccountIndex = data.lastAccountIndex;
      this.lastAccountSnapshotIndex = data.lastAccountSnapshotIndex;
      this.lastTransactionIndex = data.lastTransactionIndex;
      this.lastTransferEventIndex = data.lastTransferEventIndex;
    }
  }
}

import { ChainSourceType, ChainType } from '../enums/chain.enum';

export class StatModel {
  _id: string;
  version: string;
  extractedDate: Date;
  extractSuccess: boolean;
  lastBlock: number;

  public constructor(init?: Partial<StatModel>) {
    Object.assign(this, init);
    if (!this.extractedDate) {
      this.extractedDate = new Date();
    }
  }
}

export class ChainStatModel extends StatModel {
  type: ChainType;
  source: ChainSourceType;

  public constructor(init?: Partial<ChainStatModel>) {
    super(init);
  }
}

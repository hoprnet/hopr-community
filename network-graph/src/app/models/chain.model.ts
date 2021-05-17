import { ChainType } from '../enums/chain.enum';

export class ChainModel {
  type: ChainType;
  name: string;

  public constructor(init?: Partial<ChainModel>) {
    Object.assign(this, init);
  }
}

export class ChainFilterItemModel {
  id: string;
  name: string;
  isSelected: boolean;
  color: string;

  public constructor(init?: Partial<ChainFilterItemModel>) {
    Object.assign(this, init);
  }
}

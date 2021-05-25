export class ChainFilterItemModel {
  id: string;
  name: string;
  isSelected: boolean;
  color: string;

  public constructor(init?: Partial<ChainFilterItemModel>) {
    Object.assign(this, init);
  }
}

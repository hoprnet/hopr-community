export class PositionModel {
  x: number;
  y: number;

  public constructor(init?: Partial<PositionModel>) {
    Object.assign(this, init);
  }
}

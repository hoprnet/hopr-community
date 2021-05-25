export class PositionModel {
  x: number;
  y: number;

  public constructor(data?: Partial<PositionModel>) {
    this.init(data);
  }

  init(data?: any): void {
    if (data) {
      this.x = data.x;
      this.y = data.y;
    }
  }
}

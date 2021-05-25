import { ChainSourceType, ChainType } from '../enums/chain.enum';
import { GraphLibraryType } from '../enums/graph.enum';

export abstract class TypeModel<T> {
  type: T;
  name: string;

  public constructor(init?: Partial<TypeModel<T>>) {
    Object.assign(this, init);
  }
}

export class ChainTypeModel extends TypeModel<ChainType> {
  public constructor(init?: Partial<ChainTypeModel>) {
    super(init);
  }
}

export class ChainSourceTypeModel extends TypeModel<ChainSourceType> {
  public constructor(init?: Partial<ChainSourceTypeModel>) {
    super(init);
  }
}

export class GraphLibraryTypeModel extends TypeModel<GraphLibraryType> {
  public constructor(init?: Partial<GraphLibraryTypeModel>) {
    super(init);
  }
}

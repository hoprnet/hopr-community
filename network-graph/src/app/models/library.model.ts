import { GraphLibraryType } from '../enums/graph.enum';

export class LibraryModel {
  type: GraphLibraryType;
  name: string;

  public constructor(init?: Partial<LibraryModel>) {
    Object.assign(this, init);
  }
}

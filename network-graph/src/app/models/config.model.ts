import { ChainType } from '../enums/chain.enum';
import { GraphLibraryType } from '../enums/graph.enum';

export class ConfigModel {

  private _selectedChainType: ChainType;
  private _selectedChain: ConfigChainModel;

  minWeight: number;
  chains: ConfigChainModel[];
  selectedGraphLibraryType: GraphLibraryType;

  public constructor(init?: Partial<ConfigModel>) {
    Object.assign(this, init);
    if (!this.chains) {
      this.chains = [];
    }
  }

  public get selectedChainType(): ChainType {
    return this._selectedChainType;
  }

  public set selectedChainType(value: ChainType) {
    this._selectedChainType = value;
    this.setSelectedChain(value);
  }

  public get selectedChain(): ConfigChainModel {
    if (this._selectedChain?.type !== this._selectedChainType) {
      this.setSelectedChain(this._selectedChainType);
    }
    return this._selectedChain;
  }

  private setSelectedChain(value: ChainType): void {
    this._selectedChain = this.chains?.find(e => e.type === value);
  }
}

export class ConfigChainModel {
  type: ChainType;
  rpcProviderUrl: string;
  addressUrl: string;
  txUrl: string;
  tokenContractAbi: string[];
  tokenContractAddress: string;
  txEventNames: { [key: string]: string };
  jsonPath: string;

  public constructor(init?: Partial<ConfigChainModel>) {
    Object.assign(this, init);
    if (!this.tokenContractAbi) {
      this.tokenContractAbi = [];
    }
    if (!this.txEventNames) {
      this.txEventNames = {};
    }
  }
}

import { ChainSourceType, ChainType } from './enums/chain.enum';
import { GraphLibraryType } from './enums/graph.enum';
import { ChainSourceTypeModel, ChainTypeModel, GraphLibraryTypeModel } from './models/type.model';

export abstract class AppConstants {
  static readonly VOID_ADDRESS: string = '0x0000000000000000000000000000000000000000';
  static readonly PIMARY_COLOR = '#ffffa0';
  static readonly SECONDARY_COLOR = '#0000b4';
  static readonly TX_EVENT_MINT_COLOR: string = '#18cc7e';
  static readonly TX_EVENT_TRANSFER_COLOR: string = '#a9a9a9';
  static readonly TX_EVENT_BURN_COLOR: string = '#d04a35';
  static readonly CHAINS: ChainTypeModel[] = [
    new ChainTypeModel({
      type: ChainType.ETH_MAIN,
      name: 'ETH mainnet'
    }),
    new ChainTypeModel({
      type: ChainType.XDAI_MAIN,
      name: 'xDai chain'
    })
  ];
  static readonly LIBRARIES: GraphLibraryTypeModel[] = [
    new GraphLibraryTypeModel({
      type: GraphLibraryType.D3,
      name: 'd3'
    }),
    new GraphLibraryTypeModel({
      type: GraphLibraryType.CYTOSCAPE,
      name: 'cytoscape'
    }),
    new GraphLibraryTypeModel({
      type: GraphLibraryType.STARDUST,
      name: 'stardust'
    }),
    // new GraphLibraryTypeModel({
    //   type: GraphLibraryType.D3_CANVAS,
    //   name: 'd3-canvas'
    // })
  ];
  static readonly SOURCES: ChainSourceTypeModel[] = [
    new ChainSourceTypeModel({
      type: ChainSourceType.FILE,
      name: 'File'
    }),
    new ChainSourceTypeModel({
      type: ChainSourceType.RPC,
      name: 'RPC'
    }),
    new ChainSourceTypeModel({
      type: ChainSourceType.GRAPHQL,
      name: 'GraphQL'
    })
  ];
}

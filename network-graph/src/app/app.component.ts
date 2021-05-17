import { Component } from '@angular/core';
import { ChainType } from './enums/chain.enum';
import { GraphLibraryType } from './enums/graph.enum';
import { ChainModel } from './models/chain.model';
import { LibraryModel } from './models/library.model';
import { ConfigService } from './services/config.service';
import { GraphService } from './services/graph.service';

@Component({
  selector: 'hopr-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  public minWeight = 0;
  public selectedLibraryType: GraphLibraryType = GraphLibraryType.D3;
  public selectedChainType: ChainType = ChainType.TEST;
  public chains: ChainModel[] = [
    new ChainModel({
      type: ChainType.ETH_MAIN,
      name: 'ETH mainnet'
    }),
    new ChainModel({
      type: ChainType.XDAI_MAIN,
      name: 'xDai chain'
    })
  ];
  public libraries: LibraryModel[] = [
    new LibraryModel({
      type: GraphLibraryType.D3,
      name: 'd3'
    }),
    new LibraryModel({
      type: GraphLibraryType.CYTOSCAPE,
      name: 'cytoscape'
    })
  ];

  constructor(private configService: ConfigService, private graphService: GraphService) {
    this.setMinWeight();
    this.setSelectedLibraryType();
    this.setSelectedChainType();
    this.load();
  }

  public changeMinWeight($event: any): void {
    this.configService.config.minWeight = $event.target.value;
    this.setMinWeight();
    this.load();
  }

  public changeChain($event: any): void {
    this.configService.config.selectedChainType = ChainType[ChainType[$event.target.value]];
    this.setSelectedChainType();
    this.load();
  }

  public changeLibrary($event: any): void {
    this.configService.config.selectedGraphLibraryType = ChainType[ChainType[$event.target.value]];
    this.setSelectedLibraryType();
    this.load();
  }

  public get showStopSimulationButton(): boolean {
    return this.graphService.isSimulating && this.configService.config.selectedGraphLibraryType === GraphLibraryType.D3;
  }

  public stopSimulation(): void {
    this.graphService.stopSimulation();
  }

  private setMinWeight(): void {
    this.minWeight = this.configService.config.minWeight;
  }

  private setSelectedChainType(): void {
    this.selectedChainType = this.configService.config.selectedChainType;
  }

  private setSelectedLibraryType(): void {
    this.selectedLibraryType = this.configService.config.selectedGraphLibraryType;
  }

  private load(): void {
    this.graphService.load();
  }
}

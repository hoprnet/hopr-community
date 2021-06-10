import { AfterViewInit, Component } from '@angular/core';
import { AppConstants } from './app.constants';
import { ChainSourceType, ChainType } from './enums/chain.enum';
import { GraphLibraryType } from './enums/graph.enum';
import { StatModel } from './models/stat.model';
import { ChainSourceTypeModel, ChainTypeModel, GraphLibraryTypeModel } from './models/type.model';
import { ChainService } from './services/chain.service';
import { ConfigService } from './services/config.service';
import { GraphService } from './services/graph.service';
import { Logger } from './services/logger.service';
import { MomentUtil } from './utils/moment.util';

@Component({
  selector: 'hopr-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {

  public minWeight = 0;
  public selectedLibraryType: GraphLibraryType = GraphLibraryType.D3;
  public selectedChainType: ChainType = ChainType.TEST;
  public selectedChainStat: StatModel;
  public chains: ChainTypeModel[] = AppConstants.CHAINS;
  public libraries: GraphLibraryTypeModel[] = AppConstants.LIBRARIES;
  public sources: ChainSourceTypeModel[] = AppConstants.SOURCES;

  constructor(
    private logger: Logger,
    private momentUtil: MomentUtil,
    private configService: ConfigService,
    private chainService: ChainService,
    private graphService: GraphService
  ) {
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.setMinWeight();
      this.setSelectedLibraryType();
      this.setSelectedChainType();
      this.load();
    }, 0);
  }

  public changeMinWeight($event: any): void {
    this.configService.config.minWeight = $event.target.value;
    this.setMinWeight();
    this.load();
  }

  public changeChain($event: any): void {
    this.configService.config.selectedChainType = ChainType[ChainType[$event.target.value]];
    this.setSelectedChainType();
    this.setSelectedChainStat();
    this.load();
  }

  public changeLibrary($event: any): void {
    this.graphService.stopSimulation();
    setTimeout(() => {
      this.configService.config.selectedGraphLibraryType = GraphLibraryType[GraphLibraryType[$event.target.value]];
      this.setSelectedLibraryType();
      this.load();
    }, 0);
  }

  public changeSource($event: any): void {
    this.clear();
    const source = ChainSourceType[ChainSourceType[$event.target.value]];
    this.chainService.extractChainBySourceAsync(this.configService.config.selectedChainType, source).then(() => {
      this.setSelectedChainStat();
      this.graphService.load();
    });
  }

  public get isLoading(): boolean {
    return this.chainService.isExtracting;
  }

  public get showGraph(): boolean {
    return !this.chainService.isExtracting && (this.selectedChainStat?.extractSuccess || this.selectedChainType === ChainType.TEST);
  }

  public get showStopSimulationButton(): boolean {
    return this.graphService.isSimulating;
  }

  public get appVersion(): string {
    return 'v' + this.configService.config.version;
  }

  public stopSimulation(): void {
    this.graphService.stopSimulation();
  }

  public reload(): void {
    this.chainService.clearAllAsync().then(() => {
      this.load();
    });
  }

  public formatDate(date: Date): string {
    return this.momentUtil.getLocalReverseFormatted(date);
  }

  private setMinWeight(): void {
    this.minWeight = this.configService.config.minWeight;
  }

  private setSelectedChainStat(): void {
    this.chainService.getChainStatByType(this.configService.config.selectedChainType).then(result => {
      this.selectedChainStat = result;
    });
  }

  private setSelectedChainType(): void {
    this.selectedChainType = this.configService.config.selectedChainType;
  }

  private setSelectedLibraryType(): void {
    this.selectedLibraryType = this.configService.config.selectedGraphLibraryType;
  }

  private clear(): void {
    this.logger.clear();
    this.graphService.clear();
  }

  private load(): void {
    this.clear();
    this.chainService.extractAsync().then(() => {
      this.setSelectedChainStat();
      this.graphService.load();
      // this.graphService.transformCrossChain();
    });
  }
}

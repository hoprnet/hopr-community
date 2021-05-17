import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { GraphEventType, GraphLibraryType } from '../../enums/graph.enum';
import { ChainFilterItemModel } from '../../models/chain.model';
import { BaseGraphModel, EdgeGraphModel, GraphEventModel, NodeGraphModel } from '../../models/graph.model';
import { ConfigService } from '../../services/config.service';
import { GraphService } from '../../services/graph.service';

@Component({
  selector: 'hopr-network-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.css']
})

export class GraphComponent implements OnInit, OnDestroy {

  private subs: Subscription[] = [];

  public node: NodeGraphModel;
  public edge: EdgeGraphModel;
  public message: string;

  constructor(private configService: ConfigService, private graphService: GraphService) {
  }

  ngOnInit(): void {
    if (this.graphService.onChangeSubject) {
      const sub1 = this.graphService.onChangeSubject.subscribe({
        next: (data: GraphEventModel) => {
          setTimeout(() => {
            this.handleOnChangeSubject(data);
          }, 0);
        }
      });
      this.subs.push(sub1);
    }
  }

  ngOnDestroy(): any {
    this.subs.forEach(sub => {
      sub.unsubscribe();
    });
    this.subs = [];
  }

  private handleOnChangeSubject(data: GraphEventModel): void {
    if (data) {
      switch (data.type) {
        case GraphEventType.DATA_CHANGED:
          this.onDataChanged(data.payload);
          break;
        default:
          break;
      }
    }
  }

  private onDataChanged(data: any): void {
    this.node = undefined;
    this.edge = undefined;
    if (Array.isArray(data?.nodes) && data.nodes.length > 0) {
      this.message = undefined;
    } else {
      this.message = 'Graph is empty. Consider changing the minimum weight.';
    }
  }

  public nodeChange(event: BaseGraphModel): void {
    if (event instanceof NodeGraphModel) {
      this.node = event;
      this.edge = undefined;
    } else if (event instanceof EdgeGraphModel) {
      this.edge = event;
      this.node = undefined;
    } else {
      this.node = undefined;
      this.edge = undefined;
    }
  }

  public get isLoading(): boolean {
    return this.graphService.isLoading;
  }

  public get useCytoscapeLibrary(): boolean {
    return this.configService.config.selectedGraphLibraryType === GraphLibraryType.CYTOSCAPE;
  }

  public get filter(): Map<string, ChainFilterItemModel> {
    return this.graphService.filter;
  }

  public buildAddressUrl(address: string): string {
    if (address && this.configService.config?.selectedChain?.addressUrl) {
      return this.configService.config.selectedChain.addressUrl.replace('{address}', address);
    }
    return undefined;
  }

  public buildTxUrl(transactionHash: string): string {
    if (transactionHash && this.configService.config?.selectedChain?.txUrl) {
      return this.configService.config.selectedChain.txUrl.replace('{transactionHash}', transactionHash);
    }
    return undefined;
  }

  public changeFilter(id: string, event: any): void {
    this.graphService.changeFilter(id);
  }
}

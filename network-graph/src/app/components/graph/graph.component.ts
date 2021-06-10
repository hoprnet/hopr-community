import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AppConstants } from '../../app.constants';
import { ChainTxEventType } from '../../enums/chain.enum';
import { GraphEventType, GraphLibraryType } from '../../enums/graph.enum';
import { ChainFilterItemModel } from '../../models/chain.model';
import { TransferEventModel } from '../../models/event.model';
import { BaseGraphModel, EdgeGraphModel, GraphEventModel, NodeGraphModel } from '../../models/graph.model';
import { ConfigService } from '../../services/config.service';
import { GraphService } from '../../services/graph.service';

@Component({
  selector: 'hopr-network-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.css']
})

export class GraphComponent implements OnInit, OnDestroy {

  private _showTransfers: boolean;

  private subs: Subscription[] = [];

  public node: NodeGraphModel;
  public edge: EdgeGraphModel;
  public transfers: TransferEventModel[];
  public message: string;

  public graphLibraries = {
    d3: GraphLibraryType.D3,
    cytoscape: GraphLibraryType.CYTOSCAPE,
    stardust: GraphLibraryType.STARDUST,
    d3canvas: GraphLibraryType.D3_CANVAS
  };

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
          this.onDataChanged(this.graphService.currentData);
          break;
        default:
          break;
      }
    }
  }

  private onDataChanged(data: any): void {
    this.node = undefined;
    this.edge = undefined;
    this.transfers = undefined;
    this._showTransfers = false;
    if (Array.isArray(data?.nodes) && data.nodes.length > 0) {
      this.message = undefined;
    } else {
      this.message = 'Graph is empty. Consider changing the minimum weight.';
    }
  }

  public get showTransfers(): boolean {
    return this._showTransfers || this.transfers?.length <= 100;
  }

  public nodeChange(event: BaseGraphModel): void {
    this._showTransfers = false;
    if (event instanceof NodeGraphModel) {
      this.node = event;
      this.transfers = this.node.scratch.transfers;
      this.edge = undefined;
    } else if (event instanceof EdgeGraphModel) {
      this.edge = event;
      this.transfers = this.edge.scratch.transfers;
      this.node = undefined;
    } else {
      this.node = undefined;
      this.edge = undefined;
      this.transfers = undefined;
    }
  }

  public get isLoading(): boolean {
    return this.graphService.isLoading;
  }

  public get selectedGraphLibraryType(): GraphLibraryType {
    return this.configService.config.selectedGraphLibraryType;
  }

  public get filter(): Map<string, ChainFilterItemModel> {
    return this.graphService.filter;
  }

  public revealTransfers(): void {
    this._showTransfers = true;
  }

  public getTransferColor(transfer: TransferEventModel): string {
    if (transfer) {
      switch (transfer.type) {
        case ChainTxEventType.BURN:
          return AppConstants.TX_EVENT_BURN_COLOR;
        case ChainTxEventType.MINT:
          return AppConstants.TX_EVENT_MINT_COLOR;
        default:
          break;
      }
    }
    return '#000';
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

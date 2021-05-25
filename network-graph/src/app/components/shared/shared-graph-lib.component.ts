import { EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs';
import { GraphElementType, GraphEventType } from '../../enums/graph.enum';
import {
  EdgeDataModel,
  EdgeGraphModel,
  EdgeViewGraphModel,
  GraphContainerModel,
  GraphEventModel,
  GraphScratchModel,
  GraphStateModel,
  NodeDataModel,
  NodeGraphModel,
  NodeViewGraphModel
} from '../../models/graph.model';
import { GraphService } from '../../services/graph.service';
import { Logger } from '../../services/logger.service';
import { CommonUtil } from '../../utils/common.util';

export abstract class SharedGraphLibComponent {

  private subs: Subscription[] = [];

  protected state: GraphStateModel;
  protected nodes: NodeViewGraphModel[];
  protected edges: EdgeViewGraphModel[];
  protected connectedLookup: any = {};

  constructor(protected logger: Logger, protected graphService: GraphService) {

  }

  protected onInit(): void {
    this.state = new GraphStateModel();
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
    if (this.graphService.currentData) {
      setTimeout(() => {
        this.init(this.graphService.currentData);
      }, 0);
    }
  }

  protected onDestroy(): void {
    this.logger.info(`${this.componentName} onDestroy called.`)();
    this.destroy();
    this.nodes = undefined;
    this.edges = undefined;
    this.connectedLookup = undefined;
    this.state.isDestroyed = true;
    this.subs.forEach(sub => {
      sub.unsubscribe();
    });
    this.subs = [];
  }

  private handleOnChangeSubject(data: GraphEventModel) {
    if (data && !this.state.isDestroyed) {
      switch (data.type) {
        case GraphEventType.DATA_CHANGED:
          this.init(this.graphService.currentData);
          break;
        case GraphEventType.STOP_SIMULATION:
          this.destroy();
          break;
        default:
          break;
      }
    }
  }

  protected abstract get selectEmitter(): EventEmitter<any>;

  protected abstract get componentName(): string;

  protected abstract init(data: GraphContainerModel): void;

  protected abstract destroy(): void;

  protected abstract center(count: number): void;

  protected beforeInit(data: GraphContainerModel): void {
    this.logger.info(`${this.componentName} init called.`)();
    this.state.isZoomed = false;
    this.graphService.isLoading = true;
    if (data) {
      this.nodes = data.nodes.map((e: NodeGraphModel) => {
        return new NodeViewGraphModel({
          type: GraphElementType.NODE,
          id: e.data.id,
          name: e.data.name ?? '-',
          weight: e.data.weight,
          transfers: e.scratch.transfers
        });
      });
      this.edges = data.edges.map((e: EdgeGraphModel) => {
        return new EdgeViewGraphModel({
          type: GraphElementType.EDGE,
          name: e.data.name ?? '-',
          source: e.data.source,
          target: e.data.target,
          strength: e.data.strength,
          refTransfer: e.scratch.refTransfer,
          transfers: e.scratch.transfers
        });
      });
    }
  }

  protected afterInit(): void {
    this.connectedLookup = {};
    this.edges?.forEach((d: EdgeViewGraphModel) => {
      this.connectedLookup[CommonUtil.combineIndex(d.source.id, d.target.id)] = true;
    });
    this.center(0);
    this.graphService.isLoading = false;
  }

  protected registerMouseWheelEvent(element: HTMLElement | SVGSVGElement): void {
    if (element) {
      element.onwheel = () => {
        this.state.isZoomed = true;
      };
    }
  }

  protected handleSelectedElement(element: EdgeViewGraphModel | NodeViewGraphModel): void {
    if (element instanceof EdgeViewGraphModel) {
      this.selectEmitter.emit(new EdgeGraphModel({
        data: new EdgeDataModel({
          name: element.name,
          source: element.source.id,
          target: element.target.id,
          strength: element.strength
        }),
        scratch: new GraphScratchModel({
          refTransfer: element.refTransfer,
          transfers: element.transfers
        })
      }));
    } else if (element instanceof NodeViewGraphModel) {
      this.selectEmitter.emit(new NodeGraphModel({
        data: new NodeDataModel({
          id: element.id,
          name: element.name,
          weight: element.weight
        }),
        scratch: new GraphScratchModel({
          transfers: element.transfers
        })
      }));
    }
  }

  protected isConnected(a: string, b: string): boolean {
    return this.connectedLookup[CommonUtil.combineIndex(a, b)] || a === b;
  }
}

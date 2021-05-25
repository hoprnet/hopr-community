import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import * as DataForge from 'data-forge';
import * as Stardust from 'stardust-core';
import * as StardustWebGL from 'stardust-webgl';
import { AppConstants } from '../../app.constants';
import { ChainTxEventType } from '../../enums/chain.enum';
import { EdgeViewGraphModel, GraphContainerModel, NodeViewGraphModel } from '../../models/graph.model';
import { GraphService } from '../../services/graph.service';
import { Logger } from '../../services/logger.service';
import { CommonUtil } from '../../utils/common.util';
import { GraphUtil } from '../../utils/graph.util';
import { SharedGraphLibComponent } from '../shared/shared-graph-lib.component';

@Component({
  selector: 'hopr-stardust',
  templateUrl: './stardust.component.html',
  styleUrls: ['./stardust.component.css']
})
export class StardustComponent extends SharedGraphLibComponent implements OnInit, OnDestroy {

  @Output() selectEmitter: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild('containerElementRef') containerElementRef: ElementRef;

  protected readonly componentName: string = 'Stardust';

  private width: number;
  private height: number;
  private canvas: HTMLElement;
  private canvasContainer: d3.Selection<HTMLCanvasElement, unknown, HTMLElement, any>;
  private zoom: d3.ZoomBehavior<Element, unknown>;
  private nodesDataFrame: DataForge.IDataFrame<number, any>;
  private selectedElement: any;
  private isSelectionPermanent: boolean;
  private simulation: d3.Simulation<d3.SimulationNodeDatum, undefined>;
  private transform: any;
  private platform: StardustWebGL.WebGLCanvasPlatform2D;
  private positions: Stardust.ArrayBinding;
  private starNodes: Stardust.Mark;
  private starNodesBg: Stardust.Mark;
  private starNodesSelected: Stardust.Mark;
  private starEdges: Stardust.Mark;
  private starEdgesSelected: Stardust.Mark;
  private starNodeText: Stardust.Mark;
  private starEdgeText: Stardust.Mark;

  constructor(protected logger: Logger, protected graphService: GraphService) {
    super(logger, graphService);
    const webGLversion = StardustWebGL.version;
  }

  ngOnInit(): void {
    super.onInit();
  }

  ngOnDestroy(): void {
    super.onDestroy();
  }

  protected destroy(): void {
    this.stopSimulation();
    this.nodesDataFrame = undefined;
  }

  private stopSimulation(): void {
    this.logger.info(`${this.componentName} stop simulation called.`)();
    this.simulation?.stop();
    this.graphService.isSimulating = false;
  }

  protected init(data: GraphContainerModel): void {
    super.beforeInit(data);
    this.width = this.containerElementRef.nativeElement.clientWidth;
    this.height = this.containerElementRef.nativeElement.clientHeight;
    this.createCanvas();
    if (this.nodes && this.edges) {
      this.nodesDataFrame = new DataForge.DataFrame(this.nodes).bake();

      function mapColor(color: number[], opacity: number = 1): number[] {
        return [color[0] / 255, color[1] / 255, color[2] / 255, opacity];
      }

      const colors = [
        mapColor([0, 0, 0], 0.5),
        mapColor([0, 0, 0], 1),
        mapColor(CommonUtil.hexToRgb(AppConstants.PIMARY_COLOR)),
        mapColor(CommonUtil.hexToRgb(AppConstants.SECONDARY_COLOR)),
        mapColor(CommonUtil.hexToRgb(AppConstants.TX_EVENT_BURN_COLOR)),
        mapColor(CommonUtil.hexToRgb(AppConstants.TX_EVENT_MINT_COLOR)),
        mapColor(CommonUtil.hexToRgb(AppConstants.TX_EVENT_TRANSFER_COLOR))
      ];

      this.starNodes.attr('radius', 2).attr('color', colors[2]);
      this.starNodesBg.attr('radius', 3).attr('color', colors[0]);
      this.starNodesSelected.attr('radius', 4).attr('color', colors[3]);
      this.starEdges.attr('width', 1).attr('color', (d: EdgeViewGraphModel) => {
        switch (d.refTransfer?.type) {
          case ChainTxEventType.BURN:
            return colors[4];
          case ChainTxEventType.MINT:
            return colors[5];
          default:
            break;
        }
        return colors[6];
      });
      this.starEdgesSelected.attr('width', 1).attr('color', colors[3]);
      this.starNodeText.attr('text', (d: NodeViewGraphModel) => d.name)
        // .attr('up', [0, 1])
        .attr('fontFamily', 'Arial')
        .attr('fontSize', 12)
        // .attr('scale', d => this.transform.k)
        // .attr('scale', d => 1 + Math.sin(d) / 2)
        .attr('color', colors[1]);
      this.starEdgeText.attr('text', (d: EdgeViewGraphModel) => d.name)
        .attr('fontFamily', 'Arial')
        .attr('fontSize', 10)
        .attr('color', colors[1]);

      this.positions = Stardust.array()
        .value((d: NodeViewGraphModel) => [
          d.x * this.transform.k + this.transform.x,
          d.y * this.transform.k + this.transform.y
        ])
        .data(this.nodes);

      const edgePositions = Stardust.array()
        .value((d: EdgeViewGraphModel) => [
          ((d.source.x * this.transform.k + this.transform.x) + (d.target.x * this.transform.k + this.transform.x)) / 2,
          ((d.source.y * this.transform.k + this.transform.y) + (d.target.y * this.transform.k + this.transform.y)) / 2
        ])
        .data(this.edges);

      const positionScale = Stardust.scale.custom('array(pos, value)').attr('pos', 'Vector2Array', this.positions);
      const edgePositionScale = Stardust.scale.custom('array(pos, value)').attr('pos', 'Vector2Array', edgePositions);

      this.starNodes.attr('center', positionScale(d => d.index));
      this.starNodesBg.attr('center', positionScale(d => d.index));
      this.starNodesSelected.attr('center', positionScale(d => d.index));
      this.starNodeText.attr('position', positionScale(d => d.index));
      this.starEdges.attr('p1', positionScale(d => d.source.index));
      this.starEdges.attr('p2', positionScale(d => d.target.index));
      this.starEdgesSelected.attr('p1', positionScale(d => d.source.index));
      this.starEdgesSelected.attr('p2', positionScale(d => d.target.index));
      this.starEdgeText.attr('position', edgePositionScale(d => d.index));

      this.starNodes.data(this.nodes);
      this.starNodesBg.data(this.nodes);
      this.starNodeText.data(this.nodes);
      this.starEdges.data(this.edges);
      this.starEdgeText.data(this.edges);

      if (this.simulation) {
        this.simulation.stop();
      }
      this.simulation = d3.forceSimulation(this.nodes as any)
        .force('link', d3.forceLink(this.edges).id((d: any) => d.id))
        .force('charge', d3.forceManyBody().strength(-400))
        .force('center', d3.forceCenter(this.width / 2, this.height / 2))
        .force('x', d3.forceX())
        .force('y', d3.forceY())
        .on('end', () => {
          this.graphService.isSimulating = false;
          this.logger.info(`${this.componentName} simulation ended.`)();
        });
      this.graphService.isSimulating = true;

      this.simulation.on('tick', () => {
        // positions.data(this.nodes);
        this.requestRender();
      });

      this.requestRender();
    }
    super.afterInit();
  }

  public requestRender(): void {
    if (this.state.requestedAnimationFrame) {
      return;
    }
    this.state.requestedAnimationFrame = requestAnimationFrame(() => {
      this.render();
    });
  }

  private render(): void {
    this.state.requestedAnimationFrame = undefined;

    // Cleanup and re-render.
    // this.platform.clear([1, 1, 1, 1]);
    this.starEdges.attr('width', (d: any) => GraphUtil.calculateEdgeWidth(d.strength) * this.transform.k);
    this.starEdges.render();
    this.starEdgesSelected.attr('width', (d: any) => GraphUtil.calculateEdgeWidth(d.strength) * this.transform.k + 1);
    this.starEdgesSelected.render();
    this.starNodesBg.attr('radius', (d: any) => GraphUtil.calculateNodeRadius(d.weight) * this.transform.k + 1);
    this.starNodesBg.render();
    this.starNodes.attr('radius', (d: any) => GraphUtil.calculateNodeRadius(d.weight) * this.transform.k);
    this.starNodes.render();
    this.starNodesSelected.attr('radius', (d: any) => GraphUtil.calculateNodeRadius(d.weight) * this.transform.k);
    this.starNodesSelected.render();
    this.starNodeText.attr('scale', this.transform.k);
    this.starNodeText.render();
    this.starNodeText.attr('alignX', 0.5);
    this.starNodeText.attr('alignY', 0.6);

    this.starEdgeText.attr('scale', this.transform.k);
    this.starEdgeText.render();
    this.starEdgeText.attr('alignX', 0.5);
    this.starEdgeText.attr('alignY', 0.6);

    // Render the picking buffer.
    this.platform.beginPicking(this.width, this.height);
    this.starEdges.render();
    this.starNodes.render();
    this.platform.endPicking();
  }

  private createCanvas(): void {
    const canvasId = 'mainCanvas';
    d3.select('#' + canvasId).remove();
    this.canvasContainer = d3.select('#container')
      .append('canvas')
      .attr('id', canvasId)
      .attr('width', this.width)
      .attr('height', this.height);

    this.canvas = document.getElementById(canvasId);
    this.platform = Stardust.platform('webgl-2d', this.canvas, this.width, this.height) as StardustWebGL.WebGLCanvasPlatform2D;
    this.platform.pixelRatio = 1;

    this.starNodes = Stardust.mark.create(Stardust.mark.circle(), this.platform);
    this.starNodesBg = Stardust.mark.create(Stardust.mark.circle(), this.platform);
    this.starNodesSelected = Stardust.mark.create(Stardust.mark.circle(), this.platform);
    this.starEdges = Stardust.mark.create(Stardust.mark.line(), this.platform);
    this.starEdgesSelected = Stardust.mark.create(Stardust.mark.line(), this.platform);
    this.starNodeText = Stardust.mark.createText('2d', this.platform);
    this.starEdgeText = Stardust.mark.createText('2d', this.platform);

    this.transform = d3.zoomIdentity;

    this.registerMouseEvents();

    this.zoom = d3.zoom()
      .extent([[0, 0], [this.width, this.height]])
      .scaleExtent([0, 10])
      .on('zoom', (e: any) => {
        this.transform = e.transform;
        this.requestRender();
      });
    this.canvasContainer.call(this.zoom);
  }

  private registerMouseEvents(): void {
    super.registerMouseWheelEvent(this.canvas);
    this.canvas.onmousemove = (e: MouseEvent) => {
      e.stopPropagation();
      if (!this.isSelectionPermanent) {
        const element = this.tryGetSelectedElement(e);
        if (element) {
          if (this.selectedElement !== element) {
            this.handleSelectedElement(element);
          }
        } else {
          this.deselectElement();
        }
      }
    };
    this.canvas.onclick = (e: MouseEvent) => {
      e.stopPropagation();
      const element = this.tryGetSelectedElement(e);
      if (element) {
        if (this.isSelectionPermanent) {
          if (this.selectedElement === element) {
            this.isSelectionPermanent = false;
            this.deselectElement();
          } else {
            this.handleSelectedElement(element);
          }
        } else {
          this.isSelectionPermanent = true;
          if (this.selectedElement !== element) {
            this.handleSelectedElement(element);
          }
        }
      } else {
        this.deselectElement();
      }
    };
  }

  protected handleSelectedElement(element: EdgeViewGraphModel | NodeViewGraphModel): void {
    super.handleSelectedElement(element);
    this.selectedElement = element;
    if (this.selectedElement instanceof EdgeViewGraphModel) {
      this.starEdgesSelected.data([this.selectedElement]);
      this.starNodesSelected.data(this.nodes.filter(
        e => e.id === this.selectedElement.source.id || e.id === this.selectedElement.target.id));
    } else if (this.selectedElement instanceof NodeViewGraphModel) {
      this.starNodesSelected.data([this.selectedElement]);
      this.starEdgesSelected.data(this.edges.filter(
        e => e.source.id === this.selectedElement.id || e.target.id === this.selectedElement.id));
    }
    this.requestRender();
  }

  private deselectElement(): void {
    if (this.selectedElement != null) {
      this.isSelectionPermanent = false;
      this.selectedElement = null;
      this.requestRender();
      this.selectEmitter.emit(undefined);
      this.starEdgesSelected.data([]);
      this.starNodesSelected.data([]);
    }
  }

  private tryGetSelectedElement(e: MouseEvent): EdgeViewGraphModel | NodeViewGraphModel {
    const bb = this.canvas.getBoundingClientRect();
    const x = e.clientX - bb.left;
    const y = e.clientY - bb.top;
    const p = this.platform.getPickingPixel(x * this.platform.pixelRatio, y * this.platform.pixelRatio);
    if (p) {
      return p[0].data()[p[1]];
    }
    return undefined;
  }

  protected center(count: number): void {
    if (!this.state.isDestroyed && !this.state.isZoomed) {
      if (this.nodesDataFrame) {
        const seriesX = this.nodesDataFrame.deflate(e => e.x);
        const seriesY = this.nodesDataFrame.deflate(e => e.y);
        const minMaxNodes = {
          minX: seriesX.min(),
          minY: seriesY.min(),
          maxX: seriesX.max(),
          maxY: seriesY.max()
        };
        const width = minMaxNodes.maxX - minMaxNodes.minX;
        const height = minMaxNodes.maxY - minMaxNodes.minY;
        if (width && height) {
          const scale = Math.min(this.width / width, this.height / height) * 0.8;
          if (count > 0) {
            this.canvasContainer.transition()
              .duration(750)
              .call(this.zoom.scaleTo, scale);
          }
        }
        if (this.graphService.isSimulating && count < 5) {
          setTimeout(() => {
            this.center(++count);
          }, 1000);
        }
      }
    }
  }
}

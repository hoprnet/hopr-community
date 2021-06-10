import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import { AppConstants } from '../../app.constants';
import { ChainTxEventType } from '../../enums/chain.enum';
import { GraphContainerModel } from '../../models/graph.model';
import { GraphService } from '../../services/graph.service';
import { Logger } from '../../services/logger.service';
import { GraphUtil } from '../../utils/graph.util';
import { SharedGraphLibComponent } from '../shared/shared-graph-lib.component';

@Component({
  selector: 'hopr-d3canvas',
  templateUrl: './d3canvas.component.html',
  styleUrls: ['./d3canvas.component.css']
})
export class D3CanvasComponent extends SharedGraphLibComponent implements OnInit, OnDestroy {

  @Output() selectEmitter: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild('containerElementRef') containerElementRef: ElementRef;

  protected readonly componentName: string = 'D3Canvas';

  private width: number;
  private height: number;
  private canvas: d3.Selection<HTMLCanvasElement, unknown, HTMLElement, any>;
  private context: CanvasRenderingContext2D;
  private zoom: d3.ZoomBehavior<Element, unknown>;
  private simulation: d3.Simulation<d3.SimulationNodeDatum, undefined>;
  private transform: any;

  constructor(protected logger: Logger, protected graphService: GraphService) {
    super(logger, graphService);
  }

  ngOnInit(): void {
    super.onInit();
  }

  ngOnDestroy(): void {
    super.onDestroy();
  }

  protected destroy(): void {
    this.stopSimulation();
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
      if (this.simulation) {
        this.simulation.stop();
      }
      this.simulation = d3.forceSimulation(this.nodes)
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
        this.requestRender();
      });
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
    this.context.save();
    this.context.clearRect(0, 0, this.width, this.height);
    this.context.translate(this.transform.x, this.transform.y);
    this.context.scale(this.transform.k, this.transform.k);
    this.drawEdges();
    this.drawNodes();
    this.context.restore();
  }

  private drawEdges(): void {
    // draw links
    this.context.strokeStyle = AppConstants.TX_EVENT_TRANSFER_COLOR;
    this.context.beginPath();
    this.edges.forEach((d) => {
      if (d?.refTransfer?.type) {
        switch (d.refTransfer.type) {
          case ChainTxEventType.MINT:
            this.context.strokeStyle = AppConstants.TX_EVENT_MINT_COLOR;
            break;
          case ChainTxEventType.BURN:
            this.context.strokeStyle = AppConstants.TX_EVENT_BURN_COLOR;
            break;
          default:
            this.context.strokeStyle = AppConstants.TX_EVENT_TRANSFER_COLOR;
            break;
        }
      } else {
        this.context.strokeStyle = AppConstants.TX_EVENT_TRANSFER_COLOR;
      }
      this.context.moveTo(d.source.x, d.source.y);
      this.context.lineTo(d.target.x, d.target.y);
    });
    this.context.stroke();
  }

  private drawNodes(): void {
    this.context.fillStyle = AppConstants.SECONDARY_COLOR;
    this.context.beginPath();
    this.nodes.forEach((d) => {
      const radius = GraphUtil.calculateNodeRadius(d.weight);
      this.context.moveTo(d.x + radius, d.y);
      this.context.arc(d.x, d.y, radius, 0, 2 * Math.PI);
      this.context.fillText(d.name, d.x, d.y);
    });
    this.context.fill();
  }

  private drawNodes1(): void {
    this.nodes.forEach((d) => {
      this.context.beginPath();
      this.context.fillStyle = AppConstants.SECONDARY_COLOR;
      const radius = GraphUtil.calculateNodeRadius(d.weight);
      this.context.moveTo(d.x + radius, d.y);
      this.context.arc(d.x, d.y, radius, 0, 2 * Math.PI);
      this.context.fill();
      this.context.beginPath();
      this.context.fillStyle = AppConstants.TX_EVENT_BURN_COLOR;
      this.context.fillText(d.name, d.x, d.y);
    });
  }

  private createCanvas(): void {
    d3.select('#canvasContainer').remove();
    this.canvas = d3.select('#container')
      .append('canvas')
      .attr('id', 'canvasContainer')
      .attr('width', this.width)
      .attr('height', this.height)
      .on('click', () => {
        this.selectEmitter.emit(undefined);
      });

    this.context = this.canvas.node().getContext('2d');
    this.transform = d3.zoomIdentity;

    super.registerMouseWheelEvent(this.canvas.node());

    // this.canvas.call(d3.drag().subject((e) => console.log(e)));
    // this.canvas.call(this.drag());
    this.zoom = d3.zoom()
      .extent([[0, 0], [this.width, this.height]])
      .scaleExtent([0, 10])
      .on('zoom', (e: any) => {
        this.transform = e.transform;
        this.requestRender();
      });
    this.canvas.call(this.zoom);
  }

  protected center(count: number): void {
    if (!this.state.isDestroyed && !this.state.isZoomed) {
      const width = this.canvas.node().clientWidth;
      const height = this.canvas.node().clientHeight;
      // TODO: set min/max nodes
      if (width && height) {
        const scale = Math.min(this.width / width, this.height / height) * 0.8;
        if (count > 0) {
          this.canvas.transition()
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

import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import { AppConstants } from '../../app.constants';
import { ChainTxEventType } from '../../enums/chain.enum';
import { EdgeViewGraphModel, GraphContainerModel, NodeViewGraphModel } from '../../models/graph.model';
import { GraphService } from '../../services/graph.service';
import { Logger } from '../../services/logger.service';
import { GraphUtil } from '../../utils/graph.util';
import { SharedGraphLibComponent } from '../shared/shared-graph-lib.component';

@Component({
  selector: 'hopr-d3',
  templateUrl: './d3.component.html',
  styleUrls: ['./d3.component.css']
})
export class D3Component extends SharedGraphLibComponent implements OnInit, OnDestroy {

  @Output() selectEmitter: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild('containerElementRef') containerElementRef: ElementRef;

  protected readonly componentName: string = 'D3';

  private width: number;
  private height: number;
  private svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>;
  private g: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
  private zoom: d3.ZoomBehavior<Element, unknown>;
  private edge: d3.Selection<d3.BaseType | SVGLineElement, unknown, SVGGElement, unknown>;
  private edgeLabel: d3.Selection<SVGTextElement, unknown, SVGGElement, unknown>;
  private node: d3.Selection<d3.BaseType | SVGCircleElement, unknown, SVGGElement, unknown>;
  private nodeLabel: d3.Selection<SVGTextElement, unknown, SVGGElement, unknown>;
  private simulation: d3.Simulation<d3.SimulationNodeDatum, undefined>;

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
    this.createSvg();
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
        });
      this.graphService.isSimulating = true;

      this.edge = this.g
        .selectAll('.edge')
        .data(this.edges)
        .join('line')
        .attr('class', 'graphElement')
        .attr('marker-end', 'url(#arrowhead)')
        .attr('stroke', (d: EdgeViewGraphModel) => {
          if (d?.refTransfer?.type) {
            switch (d.refTransfer.type) {
              case ChainTxEventType.MINT:
                return AppConstants.TX_EVENT_MINT_COLOR;
              case ChainTxEventType.BURN:
                return AppConstants.TX_EVENT_BURN_COLOR;
              default:
                break;
            }
          }
          return AppConstants.TX_EVENT_TRANSFER_COLOR;
        })
        .attr('stroke-opacity', 0.6)
        .attr('stroke-width', (d: EdgeViewGraphModel) => GraphUtil.calculateEdgeWidth(d.strength))
        .on('click', this.handleClick);

      if (this.graphService.drawEdgeLabel) {
        this.edgeLabel = this.g
          .selectAll('.edgeLabel')
          .data(this.edges)
          .enter()
          .append('text')
          .style('pointer-events', 'none')
          .attr('font-size', 5)
          .attr('fill', 'black')
          .attr('class', 'graphElement')
          .text((d: EdgeViewGraphModel) => d.name);
      }

      this.node = this.g
        .selectAll('.node')
        .data(this.nodes)
        .join('circle')
        .attr('stroke', '#fff')
        .attr('stroke-width', 1.5)
        .attr('r', (d: NodeViewGraphModel) => GraphUtil.calculateNodeRadius(d.weight))
        .attr('fill', AppConstants.SECONDARY_COLOR)
        .attr('class', 'graphElement')
        .on('click', this.handleClick)
        .call(this.drag());

      if (this.graphService.drawNodeLabel) {
        this.nodeLabel = this.g
          .selectAll('.nodeLabel')
          .data(this.nodes)
          .enter()
          .append('text')
          .attr('font-size', 10)
          .attr('fill', 'black')
          .attr('class', 'graphElement')
          .text((d: NodeViewGraphModel) => d.name);
      }

      this.node.append('title')
        .text((d: NodeViewGraphModel) => d.id);

      this.node.append('text')
        .attr('font-size', 10)
        .attr('fill', 'black')
        .text((d: NodeViewGraphModel) => d.name);

      this.simulation.on('tick', () => {
        this.graphService.isSimulating = true;
        this.edge
          .attr('x1', (d: EdgeViewGraphModel) => d.source.x)
          .attr('y1', (d: EdgeViewGraphModel) => d.source.y)
          .attr('x2', (d: EdgeViewGraphModel) => d.target.x)
          .attr('y2', (d: EdgeViewGraphModel) => d.target.y);
        if (this.graphService.drawEdgeLabel) {
          this.edgeLabel
            .attr('x', (d: EdgeViewGraphModel) => (d.source.x + d.target.x) / 2)
            .attr('y', (d: EdgeViewGraphModel) => (d.source.y + d.target.y) / 2);
        }
        this.node
          .attr('cx', (d: NodeViewGraphModel) => d.x)
          .attr('cy', (d: NodeViewGraphModel) => d.y);
        if (this.graphService.drawNodeLabel) {
          this.nodeLabel
            .attr('x', (d: NodeViewGraphModel) => d.x)
            .attr('y', (d: NodeViewGraphModel) => d.y);
        }
      });
    }
    super.afterInit();
  }

  private createSvg(): void {
    d3.select('#svgContainer').remove();
    this.svg = d3.select('#container')
      .append('svg')
      .attr('id', 'svgContainer')
      .attr('width', this.width)
      .attr('height', this.height)
      .on('click', () => {
        this.g.selectAll('.graphElement').style('opacity', 1);
        this.selectEmitter.emit(undefined);
      });

    // Draw arrows
    if (this.graphService.drawArrow) {
      this.svg.append('defs')
        .append('marker')
        .attr('id', 'arrowhead')
        .attr('viewBox', '-0 -5 10 10')
        .attr('refX', 10)
        .attr('refY', 0)
        .attr('orient', 'auto')
        .attr('markerWidth', 10)
        .attr('markerHeight', 10)
        .attr('xoverflow', 'visible')
        .append('svg:path')
        .attr('d', 'M 0,-2.5 L 5,0 L 0,2.5')
        .attr('fill', '#ccc')
        .attr('stroke', '#ccc');
    }

    this.g = this.svg.append('g');

    super.registerMouseWheelEvent(this.svg.node());

    this.zoom = d3.zoom()
      .extent([[0, 0], [this.width, this.height]])
      .scaleExtent([0, 10])
      .on('zoom', (e: any) => {
        this.g.attr('transform', e.transform);
      });
    this.svg.call(this.zoom);
  }

  private drag(): any {
    const dragstarted = (event: any, d: any) => {
      if (!event.active) {
        this.simulation.alphaTarget(0.3).restart();
      }
      d.fx = d.x;
      d.fy = d.y;
    };

    const dragged = (event: any, d: any) => {
      d.fx = event.x;
      d.fy = event.y;
    };

    const dragended = (event: any, d: any) => {
      if (!event.active) {
        this.simulation.alphaTarget(0);
      }
      d.fx = null;
      d.fy = null;
    };

    return d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended);
  }

  private handleClick = (event: any, d: NodeViewGraphModel | EdgeViewGraphModel) => {
    event.stopPropagation();
    this.g.selectAll('.graphElement').style('opacity', (o: any) => {
      if (d instanceof EdgeViewGraphModel) {
        if (o instanceof EdgeViewGraphModel) {
          // d = EDGE and o = EDGE
          if (o === d) {
            return 1.0;
          }
          return 0;
        } else if (o instanceof NodeViewGraphModel) {
          // d = EDGE and o = NODE
          if (o.id === d.source.id || o.id === d.target.id) {
            return 1.0;
          }
          return 0;
        } else {
          return 0;
        }
      } else {
        if (o instanceof EdgeViewGraphModel) {
          // d = NODE and o = EDGE
          if (o.source.id === d.id || o.target.id === d.id) {
            return 1.0;
          }
          return 0;
        } else if (o instanceof NodeViewGraphModel) {
          // d = NODE and o = NODE
          if (o.id === d.id) {
            return 1;
          }
          if (this.isConnected(o.id, d.id)) {
            return 0.5;
          }
          return 0;
        } else {
          return 0;
        }
      }
    });
    d3.select(event.target).style('opacity', 1);

    super.handleSelectedElement(d);
  }

  protected center(count: number): void {
    if (!this.state.isDestroyed && !this.state.isZoomed) {
      const { width, height } = this.g.node().getBBox();
      if (width && height) {
        const scale = Math.min(this.width / width, this.height / height) * 0.8;
        if (count > 0) {
          this.svg.transition()
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

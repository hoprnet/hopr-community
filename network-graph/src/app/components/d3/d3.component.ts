import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import { Subscription } from 'rxjs';
import { AppConstants } from '../../app.constants';
import { ChainTxEventType } from '../../enums/chain.enum';
import { GraphElementType, GraphEventType } from '../../enums/graph.enum';
import { EdgeDataModel, EdgeGraphModel, GraphEventModel, GraphScratchModel, NodeDataModel, NodeGraphModel } from '../../models/graph.model';
import { GraphService } from '../../services/graph.service';

@Component({
  selector: 'hopr-d3',
  templateUrl: './d3.component.html',
  styleUrls: ['./d3.component.css']
})
export class D3Component implements OnInit, OnDestroy {

  @Output() selectEmitter: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild('containerElementRef') containerElementRef: ElementRef;

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
  private isDestroyed = false;
  private connectedLookup: any = {};
  private subs: Subscription[] = [];

  constructor(private graphService: GraphService) {

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

  ngOnDestroy(): void {
    console.log('D3 destroy called.');
    this.stopSimulation();
    this.isDestroyed = true;
    this.subs.forEach(sub => {
      sub.unsubscribe();
    });
    this.subs = [];
  }

  private handleOnChangeSubject(data: GraphEventModel) {
    if (data && !this.isDestroyed) {
      switch (data.type) {
        case GraphEventType.DATA_CHANGED:
          this.render(data.payload);
          break;
        case GraphEventType.STOP_SIMULATION:
          this.stopSimulation();
          break;
        default:
          break;
      }
    }
  }

  private stopSimulation(): void {
    console.log('D3 stop simulation called.');
    this.simulation?.stop();
    this.graphService.isSimulating = false;
  }

  private render(data: any): void {
    this.graphService.isLoading = true;
    this.width = this.containerElementRef.nativeElement.clientWidth;
    this.height = this.containerElementRef.nativeElement.clientHeight;
    this.createSvg();
    if (data) {
      const nodes = data.nodes.map((e: NodeGraphModel) => {
        return {
          type: GraphElementType.NODE,
          id: e.data.id,
          name: e.data.name,
          weight: e.data.weight
        };
      });
      const edges = data.edges.map((e: EdgeGraphModel) => {
        return {
          type: GraphElementType.EDGE,
          source: e.data.source,
          target: e.data.target,
          strength: e.data.strength,
          transfer: e.scratch?.transfer
        };
      });
      if (this.simulation) {
        this.simulation.stop();
      }
      this.simulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(edges).id((d: any) => d.id))
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
        .data(edges)
        .join('line')
        .attr('class', 'graphElement')
        .attr('marker-end', 'url(#arrowhead)')
        .attr('stroke', (d: any) => {
          if (d?.transfer?.type) {
            switch (d.transfer.type) {
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
        .attr('stroke-width', 2)
        .on('click', this.handleClick);

      if (this.graphService.drawEdgeLabel) {
        this.edgeLabel = this.g
          .selectAll('.edgeLabel')
          .data(edges)
          .enter()
          .append('text')
          .style('pointer-events', 'none')
          .attr('font-size', 5)
          .attr('fill', 'black')
          .attr('class', 'graphElement')
          .text((d: any) => d.transfer?.args?.amount ?? d.type);
      }

      this.node = this.g
        .selectAll('.node')
        .data(nodes)
        .join('circle')
        .attr('stroke', '#fff')
        .attr('stroke-width', 1.5)
        .attr('r', (d: any) => Math.max(5, (d.weight / 10) + 5))
        .attr('fill', AppConstants.NODE_COLOR)
        .attr('class', 'graphElement')
        .on('click', this.handleClick)
        .call(this.drag());

      if (this.graphService.drawNodeLabel) {
        this.nodeLabel = this.g
          .selectAll('.nodeLabel')
          .data(nodes)
          .enter()
          .append('text')
          .attr('font-size', 10)
          .attr('fill', 'black')
          .attr('class', 'graphElement')
          .text((d: any) => d.name);
      }

      this.node.append('title')
        .text((d: any) => d.id);

      this.node.append('text')
        .attr('font-size', 10)
        .attr('fill', 'black')
        .text((d: any) => {
          return d.name;
        });

      this.simulation.on('tick', () => {
        this.graphService.isSimulating = true;
        this.edge
          .attr('x1', (d: any) => d.source.x)
          .attr('y1', (d: any) => d.source.y)
          .attr('x2', (d: any) => d.target.x)
          .attr('y2', (d: any) => d.target.y);
        if (this.graphService.drawEdgeLabel) {
          this.edgeLabel
            .attr('x', (d: any) => (d.source.x + d.target.x) / 2)
            .attr('y', (d: any) => (d.source.y + d.target.y) / 2);
        }
        this.node
          .attr('cx', (d: any) => d.x)
          .attr('cy', (d: any) => d.y);
        if (this.graphService.drawNodeLabel) {
          this.nodeLabel
            .attr('x', (d: any) => d.x)
            .attr('y', (d: any) => d.y);
        }
      });

      this.connectedLookup = {};
      edges.forEach((d: any) => {
        this.connectedLookup[`${d.source.id},${d.target.id}`] = true;
      });

      this.center(0);
      this.graphService.isLoading = false;
    }
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

  private isConnected(a: any, b: any): boolean {
    return this.isConnectedAsTarget(a, b) || this.isConnectedAsSource(a, b) || a === b;
  }

  private isConnectedAsSource(a: any, b: any): boolean {
    return this.connectedLookup[`${a},${b}`];
  }

  private isConnectedAsTarget(a: any, b: any): boolean {
    return this.connectedLookup[`${b},${a}`];
  }

  private handleClick = (event: any, d: any) => {
    event.stopPropagation();
    this.g.selectAll('.graphElement').style('opacity', (o: any) => {
      if (d.type === GraphElementType.EDGE) {
        if (o.type === GraphElementType.EDGE) {
          // d = EDGE and o = EDGE
          if (o === d) {
            return 1.0;
          }
          return 0;
        } else {
          // d = EDGE and o = NODE
          if (o.id === d.source.id || o.id === d.target.id) {
            return 1.0;
          }
          return 0;
        }
      } else {
        if (o.type === GraphElementType.EDGE) {
          // d = NODE and o = EDGE
          if (o.source.id === d.id || o.target.id === d.id) {
            return 1.0;
          }
          return 0;
        } else {
          // d = NODE and o = NODE
          if (o.id === d.id) {
            return 1;
          }
          if (this.isConnected(o.id, d.id)) {
            return 0.5;
          }
          return 0;
        }
      }
    });
    d3.select(event.target).style('opacity', 1);

    if (d.type === GraphElementType.EDGE) {
      this.selectEmitter.emit(new EdgeGraphModel({
        data: new EdgeDataModel({
          source: d.source.id,
          target: d.target.id,
          strength: d.strength
        }),
        scratch: new GraphScratchModel({
          transfer: d.transfer
        })
      }));
    } else if (d.type === GraphElementType.NODE) {
      this.selectEmitter.emit(new NodeGraphModel({
        data: new NodeDataModel({
          id: d.id,
          name: d.name,
          weight: d.weight
        })
      }));
    }
  }

  private center(count: number): void {
    if (!this.isDestroyed) {
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

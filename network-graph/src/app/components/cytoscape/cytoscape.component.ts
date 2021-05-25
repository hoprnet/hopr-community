import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import cytoscape from 'cytoscape';
import fcose from 'cytoscape-fcose';
import klay from 'cytoscape-klay';
import { AppConstants } from '../../app.constants';
import { ChainTxEventType } from '../../enums/chain.enum';
import { EdgeDataModel, EdgeGraphModel, GraphContainerModel, GraphScratchModel, NodeDataModel, NodeGraphModel } from '../../models/graph.model';
import { GraphService } from '../../services/graph.service';
import { Logger } from '../../services/logger.service';
import { SharedGraphLibComponent } from '../shared/shared-graph-lib.component';

@Component({
  selector: 'hopr-cytoscape',
  templateUrl: './cytoscape.component.html',
  styleUrls: ['./cytoscape.component.css'],
})

export class CytoscapeComponent extends SharedGraphLibComponent implements OnInit, OnDestroy {

  @Input() public style: any;
  @Input() public layout: any;
  @Input() public zoom: any;

  @Output() selectEmitter: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild('containerElementRef') containerElementRef: ElementRef;

  protected readonly componentName: string = 'Cytoscape';

  private cy: cytoscape.Core;

  constructor(protected logger: Logger, protected graphService: GraphService) {
    super(logger, graphService);
    cytoscape.use(fcose);
    cytoscape.use(klay);

    this.layout = this.layout || {
      name: 'grid',
      animate: false,
      spacingFactor: 2
    };

    this.zoom = this.zoom || {
      min: 0.01,
      max: 3.0
    };

    this.style = this.style || [
      {
        selector: 'node',
        style: {
          'height': 'mapData(weight, 1, 100, 20, 60)',
          'width': 'mapData(weight, 1, 100, 20, 60)',
          'font-size': 'mapData(weight, 1, 100, 5, 10)',
          // 'content': 'data(name)',
          'text-valign': 'center',
          'background-color': AppConstants.SECONDARY_COLOR
        }
      },
      {
        selector: ':selected',
        style: {
          'border-width': 3,
          'border-color': 'black',
          'background-color': '#999'
        }
      },
      {
        selector: 'edge',
        style: {
          // 'curve-style': 'bezier',
          'curve-style': 'straight',
          // 'curve-style': 'haystack',
          'opacity': 0.666,
          'width': 1,
          // 'width': 'mapData(strength, 1, 100, 1, 10)',
          'target-arrow-shape': 'triangle',
          'line-color': (d: any) => {
            switch (d?.scratch('transfer')?.type || ChainTxEventType.UNKNOWN) {
              case ChainTxEventType.MINT:
                return AppConstants.TX_EVENT_MINT_COLOR;
              case ChainTxEventType.BURN:
                return AppConstants.TX_EVENT_BURN_COLOR;
              default:
                break;
            }
            return AppConstants.TX_EVENT_TRANSFER_COLOR;
          }
        }
      },
      {
        selector: '.faded',
        style: {
          'opacity': 0,
          'text-opacity': 0
        }
      }
    ];
  }

  ngOnInit(): void {
    super.onInit();
  }

  ngOnDestroy(): void {
    super.onDestroy();
  }

  protected destroy(): void {
    this.cy.destroy();
  }

  protected init(data: GraphContainerModel): void {
    super.beforeInit(data);
    if (data) {
      if (this.cy) {
        this.cy.destroy();
      }
      this.cy = cytoscape({
        container: this.containerElementRef.nativeElement,
        layout: this.layout,
        minZoom: this.zoom.min,
        maxZoom: this.zoom.max,
        style: this.style,
        elements: data as any,
      });

      this.cy.on('tap', 'node', (e: any) => {
        const node: cytoscape.NodeSingular = e.target;
        if (node.selected()) {
          node.unselect();
          this.unselectAll();
        } else {
          const neighborhood = node.neighborhood().add(node);
          this.cy.elements().addClass('faded');
          neighborhood.removeClass('faded');
          this.selectEmitter.emit(new NodeGraphModel({
            data: new NodeDataModel({
              id: node.data('id'),
              name: node.data('name'),
              weight: node.data('weight')
            })
          }));
        }
      });

      this.cy.on('tap', 'edge', (e: any) => {
        const edge: cytoscape.EdgeSingular = e.target;
        if (edge.selected()) {
          edge.unselect();
          this.unselectAll();
        } else {
          this.cy.elements().addClass('faded');
          edge.removeClass('faded');
          edge.source().removeClass('faded');
          edge.target().removeClass('faded');
          this.selectEmitter.emit(new EdgeGraphModel({
            data: new EdgeDataModel({
              name: edge.data('name'),
              source: edge.data('source'),
              target: edge.data('target'),
              strength: edge.data('strength')
            }),
            scratch: new GraphScratchModel({
              refTransfer: edge.scratch('refTransfer')
            })
          }));
        }
      });

      this.cy.on('tap', (e: any) => {
        if (e.target === this.cy) {
          this.unselectAll();
        }
      });
    }
    super.afterInit();
  }

  private unselectAll(): void {
    this.cy.elements().removeClass('faded');
    this.selectEmitter.emit(undefined);
  }

  protected center(counter: number): void {

  }
}

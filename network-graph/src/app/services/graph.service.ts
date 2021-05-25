import { Injectable } from '@angular/core';
import * as DataForge from 'data-forge';
import { Subject } from 'rxjs';
import { AppConstants } from '../app.constants';
import { ChainTxEventType, ChainType } from '../enums/chain.enum';
import { GraphEventType } from '../enums/graph.enum';
import { ChainFilterItemModel } from '../models/chain.model';
import { ChainConfigModel } from '../models/config.model';
import { EventModel, TokensBridgedEventModel, TokensBridgingInitiatedEventModel, TransferEventModel } from '../models/event.model';
import {
  EdgeDataModel,
  EdgeGraphModel,
  GraphContainerModel,
  GraphEventModel,
  GraphScratchModel,
  NodeDataModel,
  NodeGraphModel
} from '../models/graph.model';
import { EventRepository } from '../repositories/event.repository';
import { CommonUtil } from '../utils/common.util';
import { Ensure } from '../utils/ensure.util';
import { FileUtil } from '../utils/file.util';
import { MomentUtil } from '../utils/moment.util';
import { ConfigService } from './config.service';
import { Logger } from './logger.service';

@Injectable({
  providedIn: 'root'
})
export class GraphService {

  private _onChangeSubject: Subject<GraphEventModel>;
  private _data: GraphContainerModel;
  private _currentData: GraphContainerModel;
  private _nodeMap: Map<string, NodeGraphModel>;
  private _edgeMap: Map<string, EdgeGraphModel>;

  public isLoading = false;
  public isSimulating = false;
  public drawArrow = false;
  public drawEdgeLabel = false;
  public drawNodeLabel = false;
  public readonly filter: Map<string, ChainFilterItemModel>;

  constructor(
    private logger: Logger,
    private configService: ConfigService,
    private eventRepository: EventRepository,
    private fileUtil: FileUtil,
    private momentUtil: MomentUtil
  ) {
    this._onChangeSubject = new Subject<GraphEventModel>();
    this.filter = new Map<string, ChainFilterItemModel>([
      [
        ChainTxEventType[ChainTxEventType.MINT],
        new ChainFilterItemModel({
          id: ChainTxEventType[ChainTxEventType.MINT],
          name: 'Mint',
          isSelected: true,
          color: AppConstants.TX_EVENT_MINT_COLOR
        })
      ],
      [
        ChainTxEventType[ChainTxEventType.TRANSFER],
        new ChainFilterItemModel({
          id: ChainTxEventType[ChainTxEventType.TRANSFER],
          name: 'Transfer',
          isSelected: true,
          color: AppConstants.TX_EVENT_TRANSFER_COLOR
        })
      ],
      [
        ChainTxEventType[ChainTxEventType.BURN],
        new ChainFilterItemModel({
          id: ChainTxEventType[ChainTxEventType.BURN],
          name: 'Burn',
          isSelected: true,
          color: AppConstants.TX_EVENT_BURN_COLOR
        })
      ]
    ]);
  }

  public get currentData(): GraphContainerModel {
    return this._currentData;
  }

  public get onChangeSubject(): Subject<GraphEventModel> {
    return this._onChangeSubject;
  }

  public clear(): void {
    this._data = undefined;
    this._currentData = undefined;
    this._nodeMap = undefined;
    this._edgeMap = undefined;
    this.submitDataSubjectEvent(undefined);
  }

  public load(): void {
    this.isLoading = true;
    this.loadAsync().catch((error) => {
      this.logger.info(error)();
    }).finally(() => {
      this.isLoading = false;
    });
  }

  public stopSimulation(): void {
    this._onChangeSubject.next(new GraphEventModel({
      type: GraphEventType.STOP_SIMULATION
    }));
  }

  public changeFilter(id: string): void {
    this.isLoading = true;
    const item = this.filter.get(id);
    if (item) {
      item.isSelected = !item.isSelected;
    }
    const data = this.applyFilters(this._data);
    this.submitDataSubjectEvent(data);
  }

  public async transformCrossChain(): Promise<void> {
    const chain1 = this.configService.config.getChainByType(ChainType.ETH_MAIN);
    const chain2 = this.configService.config.getChainByType(ChainType.XDAI_MAIN);
    const bridgeAddress1 = chain1.bridgeContractAddress;
    const bridgeAddress2 = chain2.bridgeContractAddress;
    const events = await this.eventRepository.getAllAsync();

    let eventsDataFrame = new DataForge.DataFrame(events).setIndex('_id').bake();
    eventsDataFrame = eventsDataFrame.where(e => e.chainType === chain1.type || e.chainType === chain2.type);
    const transfersDataFrame = eventsDataFrame.where(e => e.type === ChainTxEventType.TRANSFER).cast<TransferEventModel>();
    this.logger.info('transfersDataFrame', transfersDataFrame.count())();

    const startEvents = eventsDataFrame.where(e => e.type === ChainTxEventType.BRIDGE_START).cast<TokensBridgingInitiatedEventModel>()
      .join(
        transfersDataFrame,
        left => left.transactionHash,
        right => right.transactionHash,
        (left1, right1) => {
          return {
            messageId: left1.argsMessageId,
            bridgeStart: left1,
            transfer: right1
          };
        });
    this.logger.info('startEvents', startEvents.count())();
    this.logger.info(startEvents.take(3).toArray())();
    const endEvents = eventsDataFrame.where(e => e.type === ChainTxEventType.BRIDGE_END).cast<TokensBridgedEventModel>()
      .join(
        startEvents,
        left => left.argsMessageId,
        right => right.messageId,
        (left1, right1) => {
          const innerResult = {
            index: right1.transfer._id,
            transactionHash: left1.transactionHash,
            transfer: right1.transfer,
            excludeTransfer: false
          };
          if (right1.transfer.argsTo === bridgeAddress1 || right1.transfer.argsTo === bridgeAddress2) {
            // sender -> bridge
            innerResult.excludeTransfer = true;
          }
          if (right1.transfer.argsFrom === bridgeAddress1 || right1.transfer.argsFrom === bridgeAddress2) {
            if (right1.transfer.argsTo === AppConstants.VOID_ADDRESS) {
              // bridge -> 0x
              innerResult.excludeTransfer = true;
            } else {
              // bridge -> fee receiver
              // Clone the transfer object before modifying values
              const transferCloned = new TransferEventModel(innerResult.transfer);
              transferCloned.argsFrom = right1.bridgeStart.argsSender;
              innerResult.transfer = transferCloned;
            }
          }
          return innerResult;
        }
      ).setIndex('index').bake();
    this.logger.info('endEvents', endEvents.count())();
    this.logger.info(endEvents.take(3).toArray())();
    // this.logger.info(leftEvents.where(e => e._id === rightEnd.first().transfer?._id).first());
    const projectedTransfers = endEvents.distinct(e => e.transactionHash).join(
      transfersDataFrame,
      left => left.transactionHash,
      right => right.transactionHash,
      (left1, right1) => {
        // 0x -> recipient or bridge -> recipient
        if (right1.argsFrom === AppConstants.VOID_ADDRESS || right1.argsFrom === bridgeAddress1 || right1.argsFrom === bridgeAddress2) {
          // Clone the transfer object before modifying values
          const transferCloned = new TransferEventModel(right1);
          transferCloned.argsFrom = left1.transfer.argsFrom;
          return transferCloned;
        }
        return right1;
      }).setIndex('_id').bake();
    this.logger.info('projectedTransfers', projectedTransfers.count())();
    this.logger.info(projectedTransfers.take(4).toArray())();
    const projectedTransfer = projectedTransfers.first();
    this.logger.info(projectedTransfer)();

    // Build final transfers array...
    // const finalResult = transfersDataFrame.joinOuterLeft(
    //   projectedTransfers,
    //   left => left._id,
    //   right => right._id,
    //   (left1, right1) => {
    //     if (right1) {
    //       return right1;
    //     }
    //     return left1;
    //   }
    // );
    this.logger.info('excludeTransfer', endEvents.where(e => e.excludeTransfer).count())();
    const endEventsMap = new Map(endEvents.toPairs());
    const projectedTransfersMap = new Map(projectedTransfers.toPairs());
    const finalResult: TransferEventModel[] = [];
    transfersDataFrame.toArray().forEach(e => {
      const endEvent = endEventsMap.get(e._id);
      if (endEvent) {
        if (!endEvent.excludeTransfer) {
          finalResult.push(endEvent.transfer);
        }
      } else if (projectedTransfersMap.has(e._id)) {
        finalResult.push(projectedTransfersMap.get(e._id));
      } else {
        finalResult.push(e);
      }
    });
    this.logger.info('finalResult', finalResult.length)();
    this.logger.info(finalResult.find(e => e._id === projectedTransfer._id))();
  }

  private async loadAsync(): Promise<void> {
    this._nodeMap = new Map<string, NodeGraphModel>();
    this._edgeMap = new Map<string, EdgeGraphModel>();
    if (this.configService.config?.selectedChain) {
      const data = await this.init(this.configService.config?.selectedChain);
      this.submitDataSubjectEvent(data);
    } else {
      this.logger.info('No chain is selected.')();
      this.submitDataSubjectEvent(undefined);
    }
  }

  private async init(chain: ChainConfigModel): Promise<GraphContainerModel> {
    Ensure.notNull(chain, ChainConfigModel.name);
    try {
      if (chain.type === ChainType.TEST) {
        const rawData = await this.fileUtil.readFileAsync(chain.eventsPath);
        this._data = this.convertTestData(JSON.parse(rawData));
      } else {
        const events = await this.eventRepository.getByChainTypeAsync(chain.type);
        this._data = this.convertChainEvents(events);
      }
      return this.applyFilters(this._data);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  private convertTestData(testData: any): GraphContainerModel {
    const data = this.createGraphContainerModel();
    if (Array.isArray(testData?.nodes) && Array.isArray(testData?.edges)) {
      data.nodes = testData?.nodes?.map((e: any) => new NodeGraphModel(e));
      data.edges = testData?.edges?.map((e: any) => new EdgeGraphModel(e));
      for (const node of data.nodes) {
        this._nodeMap.set(node.data.id, node);
      }
    }
    return data;
  }

  private convertChainEvents(events: EventModel[]): GraphContainerModel {
    const data = this.createGraphContainerModel();
    if (Array.isArray(events)) {
      for (const item of events) {
        if (item.type === ChainTxEventType.TRANSFER) {
          this.addGraphElements(this.createTransferEventModel(item), data);
        }
      }
    }
    return data;
  }

  private addGraphElements(transfer: TransferEventModel, data: GraphContainerModel): void {
    this.tryAddNode(transfer.argsFrom, transfer, data);
    this.tryAddNode(transfer.argsTo, transfer, data);
    this.tryAddEdge(transfer, data);
  }

  private tryAddNode(address: string, transfer: TransferEventModel, data: GraphContainerModel): void {
    if (this._nodeMap.has(address)) {
      const node = this._nodeMap.get(address);
      this.addTransfer(transfer, node.scratch.transfers);
      node.data.weight = Math.min(node.scratch.transfers.length, 100);
      node.data.name = node.scratch.transfers.length.toString();
    } else {
      const node = this.createNodeModel(address, this.copyTransfer(transfer));
      this._nodeMap.set(address, node);
      data.nodes.push(node);
    }
  }

  private tryAddEdge(transfer: TransferEventModel, data: GraphContainerModel): void {
    const index = CommonUtil.combineIndex(transfer.argsFrom, transfer.argsTo);
    if (CommonUtil.isNullOrWhitespace(index)) {
      throw new Error('Invalid transfer');
    }
    if (this._edgeMap.has(index)) {
      const edge = this._edgeMap.get(index);
      this.addTransfer(transfer, edge.scratch.transfers);
      edge.data.strength = Math.min(edge.scratch.transfers.length, 100);
      edge.data.name = edge.scratch.transfers.length.toString();
    } else {
      const edge = this.createEdgeModel(this.copyTransfer(transfer));
      this._edgeMap.set(index, edge);
      data.edges.push(edge);
    }
  }

  private copyTransfer(transfer: TransferEventModel): TransferEventModel {
    const transferCopy = new TransferEventModel(transfer);
    if (transfer.blockTimestamp) {
      const timestamp = CommonUtil.tryParseInt(transfer.blockTimestamp);
      if (timestamp && timestamp > 0) {
        transferCopy.blockTimestamp = this.momentUtil.getLocalReverseFormatted(this.momentUtil.getFromUnix(timestamp));
      }
    }
    return transferCopy;
  }

  private addTransfer(transfer: TransferEventModel, transfers: TransferEventModel[]): TransferEventModel {
    const transferCopy = this.copyTransfer(transfer);
    transfers.unshift(transferCopy);
    return transferCopy;
  }

  private applyFilters(data: GraphContainerModel): GraphContainerModel {
    let filteredData: GraphContainerModel;
    if (data) {
      filteredData = this.filterByWeight(data, this.configService.config.minWeight);
      filteredData = this.filterBySelection(filteredData);
    }
    return filteredData;
  }

  private filterByWeight(data: GraphContainerModel, minWeight: number): GraphContainerModel {
    const result = this.createGraphContainerModel();
    if (data) {
      this.logger.info(`${data.nodes.length} nodes and ${data.edges.length} edges before filtering by weight.`)();
      result.nodes = data.nodes.filter((e: NodeGraphModel) => e.data.weight > minWeight);
      result.edges = data.edges.filter(
        (e: EdgeGraphModel) => this._nodeMap.get(e.data.source)?.data.weight > minWeight
          && this._nodeMap.get(e.data.target)?.data.weight > minWeight);
      this.logger.info(`${result.nodes.length} nodes and ${result.edges.length} edges after filtering by weight.`)();
    }
    return result;
  }

  private filterBySelection(data: GraphContainerModel): GraphContainerModel {
    let result: GraphContainerModel;
    if (data) {
      const filterItems: ChainFilterItemModel[] = Array.from(this.filter.values());
      // Check if any item is not selected
      if (filterItems.filter(e => !e.isSelected).length > 0) {
        result = this.createGraphContainerModel();
        // Check if any item is selected
        const selectedItems: ChainFilterItemModel[] = filterItems.filter(e => e.isSelected);
        if (selectedItems.length === 0) {
          return result;
        }
        const types: string[] = selectedItems.map(e => e.id);
        for (const edge of data.edges) {
          if (types.includes(ChainTxEventType[edge.scratch.refTransfer?.type])) {
            result.edges.push(edge);
            result.nodes.push(this._nodeMap.get(edge.data.source));
            result.nodes.push(this._nodeMap.get(edge.data.target));
          }
        }
        // Remove duplicates
        result.nodes = [...new Set(result.nodes)];
      } else {
        result = data;
      }
    }
    return result;
  }

  private submitDataSubjectEvent(data: GraphContainerModel): void {
    this._currentData = data;
    this._onChangeSubject.next(new GraphEventModel({
      type: GraphEventType.DATA_CHANGED
    }));
  }

  private createGraphContainerModel(): any {
    // Cytoscape does not work with instance of GraphContainerModel
    // TODO: replace with "return new GraphContainerModel();"
    return {
      nodes: [],
      edges: []
    };
  }

  private createTransferEventModel(element: any): TransferEventModel {
    if (element) {
      const model = new TransferEventModel(element);
      model.type = ChainTxEventType.TRANSFER;
      if (model.argsFrom === AppConstants.VOID_ADDRESS) {
        model.type = ChainTxEventType.MINT;
      } else if (model.argsTo === AppConstants.VOID_ADDRESS) {
        model.type = ChainTxEventType.BURN;
      }
      return model;
    }
    return undefined;
  }

  private createNodeModel(address: string, transfer: TransferEventModel): NodeGraphModel {
    return new NodeGraphModel({
      data: new NodeDataModel({
        id: address,
        name: '1'
      }),
      scratch: new GraphScratchModel({
        transfers: [transfer]
      })
    });
  }

  private createEdgeModel(transfer: TransferEventModel): EdgeGraphModel {
    return new EdgeGraphModel({
      data: new EdgeDataModel({
        name: '1',
        source: transfer.argsFrom,
        target: transfer.argsTo
      }),
      scratch: new GraphScratchModel({
        refTransfer: transfer,
        transfers: [transfer]
      })
    });
  }
}

import { printTable } from 'console-table-printer';

export class ChannelId {
  src: HOPR_ID;
  dest: HOPR_ID;
  constructor(src: HOPR_ID, dest: HOPR_ID) {
    this.src = src;
    this.dest = dest;
  }
  toString() {
    return `${this.src}_${this.dest}`;
  }
}

export class Channel {
  id: ChannelId;
  source: HoprNode;
  destination: HoprNode;
  balance: number;

  static getChannelId = (src: HoprNode, dest: HoprNode) => new ChannelId(src.id, dest.id)

  constructor(source: HoprNode, destination: HoprNode, balance: number, id: ChannelId) {
    this.id = id || Channel.getChannelId(source, destination)
    this.source = source;
    this.destination = destination
    this.balance = balance;
  }

  toJson() {
    return ({ id: this.id, source: this.source.id, destination: this.destination.id, balance: this.balance })
  }
}

export class HoprNode {
  private _id: HOPR_ID;
  private _channels: Map<string, Channel>;
  private _balance: number;
  constructor(id: HOPR_ID, balance: number = 0) {
    this._id = id;
    this._channels = new Map();
    this._balance = balance;
  }
  open(dest: HoprNode, balance = 0.1) {
    try {
      if (this._id == dest.id) {
        throw Error(`Node ${this.id} can not open channel to itself, ${dest.id}`)
      }
      const channelId = Channel.getChannelId(this, dest)
      if (this._channels.get(channelId.toString())) {
        throw Error(`Channel with Id ${channelId} has already been created.`)
      } else {
        if (balance > this._balance) {
          throw Error(`Trying to open a channel with a balance of ${this._balance} for ${balance} failed.`)
        } else {
          this._channels.set(channelId.toString(), new Channel(this, dest, balance, channelId))
          this._balance -= balance;
        }
      }
    } catch(e) {
      console.log(`Unable to open channel from ${this.id} to ${dest.id}`)
    }
  }
  opennedChannelsImmediateNodes(): HoprNode[] {
    const immediateNodes = []
    this._channels.forEach(channel => immediateNodes.push(channel.destination))
    return immediateNodes;
  }
  hasFunds() {
    return this._balance > 0;
  }
  public get id() {
    return this._id;
  }
  public get channels() {
    return this._channels;
  }
  toJson() {
    return ({ id: this._id, channels: this.channels.size, balance: this._balance })
  }
}

class Links {
  private links: Channel[];
  constructor() {
    this.links = [];
  }
  add(link: Channel) {
    this.links.push(link)
  }
}

export class Network {
  private _nodes: HoprNode[];
  private _coverTrafficNodes: HoprNode[];

  constructor(nodes: HoprNode[]) {
    this._nodes = nodes;
    this._coverTrafficNodes = [];
  }

  static pickRandom(arr: HoprNode[]) {
    return arr[~~(Math.random() * arr.length)]
  }

  simulateOpening(runs: number) {
    [...Array(runs).keys()].map(() =>
      Network.pickRandom(this._nodes)
        .open(Network.pickRandom(this._nodes), 0.1))
  }

  addCoverTrafficNode(ctn: HoprNode) {
    this._coverTrafficNodes.push(ctn);
  }

  print() {
    const nodesToPrint = this._nodes.map(node => node.toJson())
    printTable(nodesToPrint)
    const channelsToPrint: any = []
    this._nodes.map(
      node => node.channels.forEach(channel => channelsToPrint.push(channel.toJson()))
    )
    printTable(channelsToPrint)
  }
  printCoverTraffic() {
    console.log('##### Cover Traffic Table #####')
    const nodesToPrint = this._coverTrafficNodes.map(node => node.toJson())
    printTable(nodesToPrint);
    const channelsToPrint: any = []
    this._coverTrafficNodes.map(
      node => node.channels.forEach(channel => channelsToPrint.push(channel.toJson())))
    printTable(channelsToPrint)
  }
  public get nodes() {
    return this._nodes;
  }
  public get coverTrafficNodes() {
    return this._coverTrafficNodes;
  }
}

export enum HOPR_IDS {
  'Alice', 'Bob', 'Charlie', 'Dave', 'Eryn'
}

export type HOPR_ID =
  HOPR_IDS.Alice |
  HOPR_IDS.Bob |
  HOPR_IDS.Charlie |
  HOPR_IDS.Dave |
  HOPR_IDS.Eryn |
  'CT'
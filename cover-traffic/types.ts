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
  balance: Number;

  static getChannelId = (src: HoprNode, dest: HoprNode) => new ChannelId(src.id, dest.id)

  constructor(source: HoprNode, destination: HoprNode, balance: Number, id: ChannelId) {
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
  constructor(id: HOPR_ID) {
    this._id = id;
    this._channels = new Map();
  }
  open(dest: HoprNode, balance: Number) {
    try {
      if (this._id == dest.id) {
        throw Error(`Node ${this.id} can not open channel to itself, ${dest.id}`)
      }
      const channelId = Channel.getChannelId(this, dest)
      if (this._channels.get(channelId.toString())) {
        throw Error(`Channel with Id ${channelId} has already been created.`)
      } else {
        this._channels.set(channelId.toString(), new Channel(this, dest, balance, channelId))
      }
    } catch(e) {
      console.error('Unable to open channel', e)
    }
  }
  public get id() {
    return this._id;
  }
  public get channels() {
    return this._channels;
  }
  toJson() {
    return ({ id: this._id, channels: this.channels.size })
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
  private nodes: HoprNode[];

  constructor(nodes: HoprNode[]) {
    this.nodes = nodes;
  }

  static pickRandom(arr: HoprNode[]) {
    return arr[~~(Math.random() * arr.length)]
  }

  simulateOpening(runs: Number) {
    [...Array(runs).keys()].map(() =>
      Network.pickRandom(this.nodes)
        .open(Network.pickRandom(this.nodes), 0.1))
  }

  print() {
    const nodesToPrint = this.nodes.map(node => node.toJson())
    printTable(nodesToPrint)
    const channelsToPrint: any = []
    this.nodes.map(
      node => node.channels.forEach(channel => channelsToPrint.push(channel.toJson()))
    )
    printTable(channelsToPrint)
  }
}

export enum HOPR_IDS {
  'Alice', 'Bob', 'Charlie', 'Dave', 'Eryn'
}

export type HOPR_ID = HOPR_IDS.Alice | HOPR_IDS.Bob | HOPR_IDS.Charlie | HOPR_IDS.Dave | HOPR_IDS.Eryn
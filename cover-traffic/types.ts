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
}

export class HoprNode {
  private _id: HOPR_ID;
  private channels: Map<string, Channel>;
  constructor(id: HOPR_ID) {
    this._id = id;
    this.channels = new Map();
  }
  open(dest: HoprNode, balance: Number) {
    const channelId = Channel.getChannelId(this, dest)
    if (this.channels.get(channelId.toString())) {
      throw Error(`Channel with Id ${channelId} has already been created.`)
    } else {
      this.channels.set(channelId.toString(), new Channel(this, dest, balance, channelId))
    }
  }
  public get id() {
    return this._id;
  }
  toJson() {
    return ({ id: this._id, channels: Object.keys(this.channels).length })
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

  print() {
    const nodesToPrint = this.nodes.map(node => node.toJson())
    printTable(nodesToPrint);
  }
}

export enum HOPR_IDS {
  'Alice', 'Bob', 'Charlie', 'Dave', 'Eryn'
}

export type HOPR_ID = HOPR_IDS.Alice | HOPR_IDS.Bob | HOPR_IDS.Charlie | HOPR_IDS.Dave | HOPR_IDS.Eryn
import { Bytes, ethers } from "ethers";

export enum RemoteStatus {
  errored = "errored", invalid = "invalid", valid = "valid", selected = "selected", connected = "connected", exploring = "expoloring", complete = "complete"
}

export interface NodeData {
  key: string;
  label: string;
  tag: string;
  URL: string;
  cluster: string;
  x: number;
  y: number;
  score: number
}

export interface Cluster {
  key: string;
  color: string;
  clusterLabel: string;
}

export interface Tag {
  key: string;
  image: string;
}
/*
export interface Dataset {
  nodes: NodeData[];
  edges: [string, NodeWithStats][];
  clusters: Cluster[];
  tags: Tag[];
}
*/

export interface Dataset {
  nodes: Account[];
  edges: Channel[];
}

export interface Account {
  id: string
  publicKey: string
  balance: number
  openChannelsCount: number
  isActive: boolean
}

export interface Channel {
  id: string
  source: {
    id: string
  }
  destination: {
    id: string
  }
  balance: number
  commitment: Bytes
  channelEpoch: number
  ticketEpoch: number
  ticketIndex: number
  status: number
  commitmentHistory: Bytes[]
}

export enum VisualMode {
  Subgraph, Localnode
}

export interface ApolloAccountQuery {
  accounts: Account[]
}
export interface ApolloChannelQuery {
  channels: Channel[]
}

export interface FiltersState {
  clusters: Record<string, boolean>;
  tags: Record<string, boolean>;
}

export interface NodeWithStats {
  node: string,
  stats: string
}

export interface DatasetMap {
  edges: Map<string, NodeWithStats[]>
  clusters: Cluster[];
  tags: Tag[];
}

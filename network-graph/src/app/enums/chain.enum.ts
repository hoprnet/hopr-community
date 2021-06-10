export enum ChainType {
  TEST = 0,
  ETH_MAIN = 1,
  XDAI_MAIN = 2
}

export enum ChainTxEventType {
  UNKNOWN = 0,
  MINT = 1,
  TRANSFER = 2,
  BURN = 3,
  BRIDGE_START = 4,
  BRIDGE_END = 5
}

export enum ChainSourceType {
  UNKNOWN = 0,
  FILE = 1,
  RPC = 2,
  GRAPHQL = 3
}

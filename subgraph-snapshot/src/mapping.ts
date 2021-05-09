import { Address, BigDecimal, BigInt, ethereum } from '@graphprotocol/graph-ts'
import { Account, AccountSnapshot, StatsContainer, Transaction, TransferEvent } from '../generated/schema'
import { Transfer as wxTransfer } from '../generated/wxHOPR/wxHOPR'
import { Transfer as xTransfer } from '../generated/xHOPR/xHOPR'
import { convertEthToDecimal, zeroBD, zeroBigInt } from './helpers'

export function handleXHoprTransfer(event: xTransfer): void {
  // xHOPR has 18 decimals
  const value = convertEthToDecimal(event.params.value);
  handleTransfer(event, event.params.from, event.params.to, value, TokenType.xHOPR);
}

export function handleWxHoprTransfer(event: wxTransfer): void {
  // wxHOPR has 18 decimals
  const value = convertEthToDecimal(event.params.value);
  handleTransfer(event, event.params.from, event.params.to, value, TokenType.wxHOPR);
}

enum TokenType {
  xHOPR = 0,
  wxHOPR = 1
}

function handleTransfer(event: ethereum.Event, from: Address, to: Address, value: BigDecimal, type: TokenType): void {
  const blockNumber = event.block.number;
  const blockTimestamp = event.block.timestamp;

  // Keep track of all entity indexes which are needed for pagination purposes
  // https://thegraph.com/docs/graphql-api#pagination
  const stats = getOrCreateStatsContainerEntity();

  handleAccountSnapshotUpdate(from, value, blockNumber, blockTimestamp, type, true, stats);
  handleAccountSnapshotUpdate(to, value, blockNumber, blockTimestamp, type, false, stats);

  getOrCreateTransactionEntity(event.transaction, blockNumber, blockTimestamp, stats);
  getOrCreateTransferEventEntity(event, from, to, value, blockNumber, blockTimestamp, type, stats);

  stats.save();
}

function handleAccountSnapshotUpdate(address: Address, value: BigDecimal, block: BigInt, timestamp: BigInt, type: TokenType, isFrom: boolean, stats: StatsContainer): void {
  const accountId = address.toHexString();
  const account = getOrCreateAccountEntity(accountId, stats);

  const snapshotId = accountId + "-" + block.toString();
  const isAdd = account.totalSupply ? isFrom : !isFrom; // id of address(0) represents the total supply. 

  const snapshot = getOrCreateAccountSnapshotEntity(accountId, snapshotId, stats);

  // handleAccountUpdate
  switch (type) {
    case TokenType.xHOPR:
      const newXHoprBalance = isAdd ? account.xHoprBalance.plus(value) : account.xHoprBalance.minus(value);
      account.xHoprBalance = newXHoprBalance;
      snapshot.xHoprBalance = newXHoprBalance;
      break;
    case TokenType.wxHOPR:
    default:
      const newWxHoprBalance = isAdd ? account.wxHoprBalance.plus(value) : account.wxHoprBalance.minus(value);
      account.wxHoprBalance = newWxHoprBalance;
      snapshot.wxHoprBalance = newWxHoprBalance;
      break;
  }

  const newTotalBalance = isAdd ? account.totalBalance.plus(value) : account.totalBalance.minus(value);
  account.totalBalance = newTotalBalance;
  snapshot.totalBalance = newTotalBalance;

  account.blockNumber = block;
  snapshot.blockNumber = block
  account.blockTimestamp = timestamp;
  snapshot.blockTimestamp = timestamp;

  account.save()
  snapshot.save()
}

function getOrCreateStatsContainerEntity(): StatsContainer {
  const entityId = '1';
  let entity = StatsContainer.load(entityId);
  if (entity == null) {
    entity = new StatsContainer(entityId);
    entity.lastAccountIndex = zeroBigInt();
    entity.lastAccountSnapshotIndex = zeroBigInt();
    entity.lastTransactionIndex = zeroBigInt();
    entity.lastTransferEventIndex = zeroBigInt();
    entity.save();
  }
  return entity as StatsContainer;
}

function getOrCreateAccountEntity(id: string, stats: StatsContainer): Account {
  let entity = Account.load(id);
  if (entity == null) {
    entity = new Account(id);
    entity.index = stats.lastAccountIndex.plus(BigInt.fromI32(1));
    entity.totalSupply = id == "0x0000000000000000000000000000000000000000";
    entity.xHoprBalance = zeroBD();
    entity.wxHoprBalance = zeroBD();
    entity.totalBalance = zeroBD();
    entity.blockNumber = zeroBigInt();
    entity.blockTimestamp = zeroBigInt();
    entity.save();
    stats.lastAccountIndex = entity.index;
  }
  return entity as Account;
}

function getOrCreateAccountSnapshotEntity(accountId: string, snapshotId: string, stats: StatsContainer): AccountSnapshot {
  let entity = AccountSnapshot.load(snapshotId);
  if (entity == null) {
    entity = new AccountSnapshot(snapshotId);
    entity.index = stats.lastAccountSnapshotIndex.plus(BigInt.fromI32(1));
    entity.account = accountId;
    entity.xHoprBalance = zeroBD();
    entity.wxHoprBalance = zeroBD();
    entity.totalBalance = zeroBD();
    entity.blockNumber = zeroBigInt();
    entity.blockTimestamp = zeroBigInt();
    entity.save()
    stats.lastAccountSnapshotIndex = entity.index;
  }
  return entity as AccountSnapshot;
}

function getOrCreateTransactionEntity(transaction: ethereum.Transaction, block: BigInt, timestamp: BigInt, stats: StatsContainer): Transaction {
  const id = getTransactionId(transaction);
  let entity = Transaction.load(id);
  if (entity == null) {
    entity = new Transaction(id);
    entity.index = stats.lastTransactionIndex.plus(BigInt.fromI32(1));
    entity.from = transaction.from;
    entity.to = transaction.to;
    entity.blockNumber = block;
    entity.blockTimestamp = timestamp;
    entity.save();
    stats.lastTransactionIndex = entity.index;
  }
  return entity as Transaction;
}

function getOrCreateTransferEventEntity(
  event: ethereum.Event, from: Address, to: Address, value: BigDecimal, block: BigInt, timestamp: BigInt, type: TokenType, stats: StatsContainer
): TransferEvent {
  const id = event.transaction.hash.toHexString() + "-" + event.logIndex.toString();
  const entity = new TransferEvent(id);
  entity.index = stats.lastTransferEventIndex.plus(BigInt.fromI32(1));
  entity.transaction = getTransactionId(event.transaction);
  entity.from = from;
  entity.to = to;
  entity.amount = value;
  entity.logIndex = event.logIndex;
  entity.blockNumber = block;
  entity.blockTimestamp = timestamp;
  entity.tokenType = tokenTypeToString(type);
  entity.save();
  stats.lastTransferEventIndex = entity.index;
  return entity;
}

function getTransactionId(transaction: ethereum.Transaction): string {
  return transaction.hash.toHexString();
}

function tokenTypeToString(type: TokenType): string {
  switch (type) {
    case TokenType.wxHOPR:
      return 'wxHOPR';
    case TokenType.xHOPR:
      return 'xHOPR';
    default:
      return 'Unknown';
  }
}
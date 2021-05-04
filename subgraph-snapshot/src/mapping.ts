import { Transfer } from '../generated/xHOPR/xHOPR'
import { Transfer as wxTransfer } from '../generated/wxHOPR/wxHOPR'
import { Account, AccountSnapshot } from '../generated/schema'
import { Address, BigDecimal, BigInt, } from '@graphprotocol/graph-ts'
import { convertEthToDecimal, zeroBD, zeroBigInt } from './helpers'

export function handleXHoprTransfer(event: Transfer ): void {
  // Both xHOPR and wxHOPR are 18 decimals
  const value = convertEthToDecimal(event.params.value);
  const blockNumber = event.block.number;
  // const id = event.transaction.hash.toHex() + "-" + event.logIndex.toString();

  handleAccountSnapshotUpdate(event.params.from, value, blockNumber, true, true);
  handleAccountSnapshotUpdate(event.params.to, value, blockNumber, true, false);
}

export function handleWxHoprTransfer(event: wxTransfer): void {
  // Both xHOPR and wxHOPR are 18 decimals
  const value = convertEthToDecimal(event.params.value);
  const blockNumber = event.block.number;
  // const id = event.transaction.hash.toHex() + "-" + event.logIndex.toString();

  handleAccountSnapshotUpdate(event.params.from, value, blockNumber, false, true);
  handleAccountSnapshotUpdate(event.params.to, value, blockNumber, false, false);
}

function handleAccountSnapshotUpdate(address: Address, value: BigDecimal, block: BigInt, isXHopr: boolean, isFrom: boolean): void {
  const accountId = address.toHexString();
  let account = Account.load(accountId);
  if (account == null) {
    createAccountEntity(accountId);
    account = Account.load(accountId); // reload here
  }

  const snapshotId = accountId + "-" + block.toString();
  const isAdd = account.totalSupply ? isFrom : !isFrom;     // id of address(0) represents the total supply. 

  let snapshot = AccountSnapshot.load(snapshotId);
  if (snapshot == null) {
    createAccountSnapshotEntity(accountId, snapshotId)
    snapshot = AccountSnapshot.load(snapshotId); // reload here
  }

  // handleAccountUpdate
  if (isXHopr) {
    const newXHoprBalance = isAdd ? account.xHoprBalance.plus(value) : account.xHoprBalance.minus(value);
    account.xHoprBalance = newXHoprBalance;
    snapshot.xHoprBalance = newXHoprBalance;

  } else {
    const newWxHoprBalance = isAdd ? account.wxHoprBalance.plus(value) : account.wxHoprBalance.minus(value);
    account.wxHoprBalance = newWxHoprBalance;
    snapshot.wxHoprBalance = newWxHoprBalance;
  }

  const newTotalBalance = isAdd ? account.totalBalance.plus(value) : account.totalBalance.minus(value);
  account.totalBalance = newTotalBalance;
  snapshot.totalBalance = newTotalBalance;

  account.blockNumber = block;
  snapshot.blockNumber = block

  account.save()
  snapshot.save()
}

function createAccountEntity(accountId: string): void {
  const account = new Account(accountId);
  account.totalSupply = accountId == "0x0000000000000000000000000000000000000000";
  account.xHoprBalance = zeroBD();
  account.wxHoprBalance = zeroBD();
  account.totalBalance = zeroBD();
  account.blockNumber = zeroBigInt();
  account.save()
}

function createAccountSnapshotEntity(accountId: string, snapshotId: string): void {
  const snapshot = new AccountSnapshot(snapshotId);
  snapshot.account = accountId;
  snapshot.xHoprBalance = zeroBD();
  snapshot.wxHoprBalance = zeroBD();
  snapshot.totalBalance = zeroBD();
  snapshot.blockNumber = zeroBigInt();
  snapshot.save()
}
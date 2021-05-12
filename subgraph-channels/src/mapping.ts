import { Transfer } from "../generated/xHOPR/xHOPR";
import { Transfer as wxTransfer } from "../generated/wxHOPR/wxHOPR";
import { Account, AccountSnapshot } from "../generated/schema";
import { Address, BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { convertEthToDecimal, zeroBD, zeroBigInt } from "./helpers";

export function handleXHoprTransfer(event: Transfer): void {
  // xHOPR has 18 decimals
  const value = convertEthToDecimal(event.params.value);
  const blockNumber = event.block.number;
  const blockTimestamp = event.block.timestamp;

  handleAccountSnapshotUpdate(
    event.params.from,
    value,
    blockNumber,
    blockTimestamp,
    true,
    true
  );
  handleAccountSnapshotUpdate(
    event.params.to,
    value,
    blockNumber,
    blockTimestamp,
    true,
    false
  );
}

export function handleWxHoprTransfer(event: wxTransfer): void {
  // wxHOPR has 18 decimals
  const value = convertEthToDecimal(event.params.value);
  const blockNumber = event.block.number;
  const blockTimestamp = event.block.timestamp;

  handleAccountSnapshotUpdate(
    event.params.from,
    value,
    blockNumber,
    blockTimestamp,
    false,
    true
  );
  handleAccountSnapshotUpdate(
    event.params.to,
    value,
    blockNumber,
    blockTimestamp,
    false,
    false
  );
}

function handleAccountSnapshotUpdate(
  address: Address,
  value: BigDecimal,
  block: BigInt,
  timestamp: BigInt,
  isXHopr: boolean,
  isFrom: boolean
): void {
  const accountId = address.toHexString();
  let account = Account.load(accountId);
  if (account == null) {
    createAccountEntity(accountId);
    account = Account.load(accountId); // reload here
  }

  const snapshotId = accountId + "-" + block.toString();
  const isAdd = account.totalSupply ? isFrom : !isFrom; // id of address(0) represents the total supply.

  let snapshot = AccountSnapshot.load(snapshotId);
  if (snapshot == null) {
    createAccountSnapshotEntity(accountId, snapshotId);
    snapshot = AccountSnapshot.load(snapshotId); // reload here
  }

  // handleAccountUpdate
  if (isXHopr) {
    const newXHoprBalance = isAdd
      ? account.xHoprBalance.plus(value)
      : account.xHoprBalance.minus(value);
    account.xHoprBalance = newXHoprBalance;
    snapshot.xHoprBalance = newXHoprBalance;
  } else {
    const newWxHoprBalance = isAdd
      ? account.wxHoprBalance.plus(value)
      : account.wxHoprBalance.minus(value);
    account.wxHoprBalance = newWxHoprBalance;
    snapshot.wxHoprBalance = newWxHoprBalance;
  }

  const newTotalBalance = isAdd
    ? account.totalBalance.plus(value)
    : account.totalBalance.minus(value);
  account.totalBalance = newTotalBalance;
  snapshot.totalBalance = newTotalBalance;

  account.blockNumber = block;
  snapshot.blockNumber = block;
  account.blockTimestamp = timestamp;
  snapshot.blockTimestamp = timestamp;

  account.save();
  snapshot.save();
}

function createAccountEntity(accountId: string): void {
  const account = new Account(accountId);
  account.totalSupply =
    accountId == "0x0000000000000000000000000000000000000000";
  account.xHoprBalance = zeroBD();
  account.wxHoprBalance = zeroBD();
  account.totalBalance = zeroBD();
  account.blockNumber = zeroBigInt();
  account.blockTimestamp = zeroBigInt();
  account.save();
}

function createAccountSnapshotEntity(
  accountId: string,
  snapshotId: string
): void {
  const snapshot = new AccountSnapshot(snapshotId);
  snapshot.account = accountId;
  snapshot.xHoprBalance = zeroBD();
  snapshot.wxHoprBalance = zeroBD();
  snapshot.totalBalance = zeroBD();
  snapshot.blockNumber = zeroBigInt();
  snapshot.blockTimestamp = zeroBigInt();
  snapshot.save();
}

import { BigInt, BigDecimal, Address, crypto, Bytes } from '@graphprotocol/graph-ts'
import { concat } from '@graphprotocol/graph-ts/helper-functions'
import { ChannelUpdated, ChannelUpdatedNewStateStruct, ChannelUpdated__Params, TicketRedeemed__Params } from '../generated/HoprChannels/HoprChannels'
import { Account, Channel, StatusSnapshot } from '../generated/schema'

/************************************
 ********** General Helpers *********
 ************************************/

export function exponentToBigDecimal(decimals: number): BigDecimal {
  let bd = BigDecimal.fromString('1')
  for (let i = 0; i < decimals; i++) {
    bd = bd.times(BigDecimal.fromString('10'))
  }
  return bd
}

export function bigDecimalExp18(): BigDecimal {
  return BigDecimal.fromString('1000000000000000000')
}

export function zeroBytes(): Bytes {
  return changetype<Bytes>(Bytes.fromHexString('0x0000000000000000000000000000000000000000000000000000000000000000'))
}

export function zeroBD(): BigDecimal {
  return BigDecimal.fromString('0')
}

export function zeroBigInt(): BigInt {
  return BigInt.fromI32(0)
}

export function oneBigInt(): BigInt {
  return BigInt.fromI32(1)
}

export function convertEthToDecimal(eth: BigInt): BigDecimal {
  return eth.toBigDecimal().div(exponentToBigDecimal(18))
}

/************************************
 ********* Specific Helpers *********
 ************************************/
 export function getChannelId(source: Address, destination: Address): Bytes {
    return changetype<Bytes>(crypto.keccak256(concat(source, destination)))
}

export function convertStatusToEnum(update: ChannelUpdatedNewStateStruct): string {
    return convertI32ToEnum(update.status)
}

export function convertI32ToEnum(status: i32): string {
    switch (status) {
        case 0:
            return 'CLOSED'
        case 1:
            return 'WAITING_FOR_COMMITMENT'
        case 2:
            return 'OPEN'
        case 3:
            return 'PENDING_TO_CLOSE'
        default:
            return 'WTF'
    }
}

export function getOrInitiateAccount(accountId: string): Account {
    let account = Account.load(accountId)

    if (account == null) {
        account = new Account(accountId)
        account.hasAnnounced = false
        account.balance = zeroBD()
        account.multiaddr = []
        account.publicKey = null
        account.fromChannelsCount = zeroBigInt()
        account.toChannelsCount = zeroBigInt()
        account.isActive = false
        account.openChannelsCount = zeroBigInt()
    }

    return account as Account;
}

export function initiateChannel(channelId: string, sourceId: string, destinationId: string, commitment: Bytes): Channel {
    let channel = new Channel(channelId);
    channel.source = sourceId
    channel.destination = destinationId
    channel.balance = zeroBD()
    channel.commitment = commitment
    channel.channelEpoch = zeroBigInt()
    channel.ticketEpoch = zeroBigInt()
    channel.ticketIndex = zeroBigInt()
    channel.status = convertI32ToEnum(0)
    channel.commitmentHistory = []
    channel.lastOpenedAt = zeroBigInt()
    channel.lastClosedAt = zeroBigInt()
    channel.redeemedTicketCount = zeroBigInt()

    return channel;
}

export function createStatusSnapshot(event: ChannelUpdated): void {
    let statusSnapshotId = event.transaction.hash.toHex() + "-" + event.logIndex.toString()
    let statusSnapshot = new StatusSnapshot(statusSnapshotId)
    statusSnapshot.channel = getChannelId(event.params.source, event.params.destination).toHex()
    statusSnapshot.status = convertStatusToEnum(event.params.newState)
    statusSnapshot.timestamp = event.block.timestamp
    statusSnapshot.save()
}

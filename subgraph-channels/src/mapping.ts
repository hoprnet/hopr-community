import { Address, log } from '@graphprotocol/graph-ts'
import { Announcement, ChannelUpdated, HoprChannels, TicketRedeemed } from '../generated/HoprChannels/HoprChannels'
import { Account, Channel, Ticket } from '../generated/schema'
import { convertEthToDecimal, convertStatusToEnum, createStatusSnapshot, getChannelId, getOrInitiateAccount, initiateChannel, oneBigInt, zeroBD } from './library';

export function handleAnnouncement(event: Announcement): void {
    log.info(`[ info ] Address of the account announcing itself: {}`, [event.params.account.toHex()]);
    let accountId = event.params.account.toHex();
    let account = getOrInitiateAccount(accountId)
    
    if (account.multiaddr.length == 0 || account.multiaddr.indexOf(event.params.multiaddr) > -1) {
        account.multiaddr.push(event.params.multiaddr)
    }
    account.publicKey = event.params.publicKey;
    account.hasAnnounced = true;
    account.save()
}8

export function handleChannelUpdated(event: ChannelUpdated): void {
    log.info(`[ info ] Handle channel update: start {}`, [event.transaction.hash.toHex()]);
    // channel source
    let sourceId = event.params.source.toHex();
    let source = getOrInitiateAccount(sourceId)
    log.info(`[ info ] Handle channel update: source {}`, [event.transaction.hash.toHex()]);

    // channel destination
    let destinationId = event.params.destination.toHex();
    let destination = getOrInitiateAccount(destinationId)
    log.info(`[ info ] Handle channel update: destination {}`, [event.transaction.hash.toHex()]);

    
    let channelId = getChannelId(event.params.source, event.params.destination).toHex()
    let channel = Channel.load(channelId)
    log.info(`[ info ] Address of the account updating the channel: {}`, [channelId]);
    if (channel == null) {
        // update channel count
        log.info('New channel', [])
        source.fromChannelsCount = source.fromChannelsCount.plus(oneBigInt())
        destination.toChannelsCount = destination.toChannelsCount.plus(oneBigInt())
        destination.save();
        channel = initiateChannel(channelId, sourceId, destinationId, event.params.newState.commitment)
    }
    log.info(`[ info ] Channel commiment: {}`, [event.params.newState.commitment.toHexString()]);
    let oldChannelBalance = channel.balance
    let newChannelBalance = convertEthToDecimal(event.params.newState.balance);
    
    log.info(`[ info ] Status: {}`, [event.params.newState.status as string]);
    channel.balance = newChannelBalance;
    channel.commitment = event.params.newState.commitment;
    channel.channelEpoch = event.params.newState.channelEpoch;
    channel.ticketEpoch = event.params.newState.ticketEpoch;
    channel.ticketIndex = event.params.newState.ticketIndex;
    let newStatus = convertStatusToEnum(event.params.newState);
    channel.status = newStatus;
    if (channel.commitmentHistory.indexOf(event.params.newState.commitment) < 0) {
        channel.commitmentHistory.push(event.params.newState.commitment)
    }
    log.info(`[ info ] creating snapshot`, []);

    createStatusSnapshot(event)
    /*
     * See https://github.com/hoprnet/hoprnet/blob/215d406a07f43078df9d517953d3789036668705/packages/utils/src/types/channelEntry.ts#L7-L12
     * Closed = 0,
     * WaitingForCommitment = 1,
     * Open = 2,
     * PendingToClose = 3
     */
    if (event.params.newState.status == 2) {
        channel.lastOpenedAt = event.block.timestamp;
    } else if (event.params.newState.status == 0) {
        channel.lastClosedAt = event.block.timestamp;
    }

    // update account balance
    source.balance = source.balance.plus(newChannelBalance).minus(oldChannelBalance);
    source.save();
    channel.save();
}

export function handleTicketRedeemed(event: TicketRedeemed): void {
    // get the channel epoch, which is not part of the event
    let channelContract = HoprChannels.bind(event.address)
    let channelId = getChannelId(event.params.source, event.params.destination);
    let channelEpoch = channelContract.channels(channelId).value5
    let ticketEpoch = event.params.ticketEpoch
    let ticketIndex = event.params.ticketIndex
    // create new ticket
    let ticketId = channelId.toHex() + "-" + channelEpoch.toString() + "-" + ticketEpoch.toString() + "-" + ticketIndex.toString()
    let ticket = new Ticket(ticketId)
    ticket.channel = channelId.toHex()
    ticket.nextCommitment = event.params.nextCommitment
    ticket.ticketEpoch = ticketEpoch
    ticket.ticketIndex = ticketIndex
    ticket.proofOfRelaySecret = event.params.proofOfRelaySecret
    ticket.amount = convertEthToDecimal(event.params.amount)
    ticket.winProb = event.params.winProb
    ticket.signature = event.params.signature
    // update channel
    let channel = Channel.load(channelId.toHex())
    if (channel == null) {
        log.error("Redeem a ticket for non-existing channel", [])
    } else {
        channel.redeemedTicketCount = channel.redeemedTicketCount.plus(oneBigInt())
    }
    channel.save()
    ticket.save()
}

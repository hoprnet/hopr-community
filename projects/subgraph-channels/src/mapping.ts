import { Address, log } from '@graphprotocol/graph-ts'
import { Announcement, ChannelUpdated, HoprChannels, TicketRedeemed } from '../generated/HoprChannels/HoprChannels'
import { Deregistered, DeregisteredByOwner, EligibilityUpdated, Registered, RegisteredByOwner } from '../generated/HoprNetworkRegistry/HoprNetworkRegistry'
import { Account, Channel, Ticket } from '../generated/schema'
import { convertEthToDecimal, convertStatusToEnum, createStatusSnapshot, getChannelId, getOrInitiateAccount, getOrInitiateRegistration, initiateChannel, oneBigInt, zeroBD, zeroBigInt } from './library';
import { BigInt } from '@graphprotocol/graph-ts'

export function handleAnnouncement(event: Announcement): void {
    log.info(`[ info ] Address of the account announcing itself: {}`, [event.params.account.toHex()]);
    let account = getOrInitiateAccount(event.params.account)
    let multiaddr = account.multiaddr

    if (multiaddr.indexOf(event.params.multiaddr) == -1) {
        multiaddr.push(event.params.multiaddr)
    }
    account.multiaddr = multiaddr
    account.publicKey = event.params.publicKey;
    account.hasAnnounced = true;
    account.save()
}

export function handleChannelUpdated(event: ChannelUpdated): void {
    log.info(`[ info ] Handle channel update: start {}`, [event.transaction.hash.toHex()]);
    // channel source
    let sourceId = event.params.source;
    let source = getOrInitiateAccount(sourceId)
    log.info(`[ info ] Handle channel update: source {}`, [event.transaction.hash.toHex()]);

    // channel destination
    let destinationId = event.params.destination;
    let destination = getOrInitiateAccount(destinationId)
    log.info(`[ info ] Handle channel update: destination {}`, [event.transaction.hash.toHex()]);


    let channelId = getChannelId(event.params.source, event.params.destination)
    let channel = Channel.load(channelId)
    log.info(`[ info ] Address of the account updating the channel: {}`, [channelId.toHex()]);
    if (channel == null) {
        // update channel count
        log.info('New channel', [])
        source.fromChannelsCount = source.fromChannelsCount.plus(oneBigInt())
        destination.toChannelsCount = destination.toChannelsCount.plus(oneBigInt())
        channel = initiateChannel(channelId, sourceId, destinationId, event.params.newState.commitment)
    }

    log.info(`[ info ] Channel commiment: {}`, [event.params.newState.commitment.toHexString()]);
    let oldChannelBalance = channel.balance
    let newChannelBalance = convertEthToDecimal(event.params.newState.balance);

    log.info(`[ info ] Status: {}`, [BigInt.fromI32(event.params.newState.status).toString()]);
    channel.balance = newChannelBalance;
    channel.commitment = event.params.newState.commitment;
    channel.channelEpoch = event.params.newState.channelEpoch;
    channel.ticketEpoch = event.params.newState.ticketEpoch;
    channel.ticketIndex = event.params.newState.ticketIndex;

    let oldStatus = channel.status
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

    if (oldStatus != "OPEN" && channel.status == "OPEN") {
        source.openChannelsCount = source.openChannelsCount.plus(oneBigInt())
        destination.openChannelsCount = destination.openChannelsCount.plus(oneBigInt())
        source.isActive = true
        destination.isActive = true
    } else if (oldStatus == "OPEN" && channel.status != "OPEN") {
        source.openChannelsCount = source.openChannelsCount.minus(oneBigInt())
        destination.openChannelsCount = destination.openChannelsCount.minus(oneBigInt())
        if (source.openChannelsCount.equals(zeroBigInt())) {
            source.isActive = false
        }
        if (destination.openChannelsCount.equals(zeroBigInt())) {
            destination.isActive = false
        }
    }

    // update account balance
    if (newChannelBalance.notEqual(oldChannelBalance)) {
        source.balance = source.balance.plus(newChannelBalance).minus(oldChannelBalance);
    }
    source.save();
    destination.save();
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
    ticket.channel = channelId
    ticket.nextCommitment = event.params.nextCommitment
    ticket.ticketEpoch = ticketEpoch
    ticket.ticketIndex = ticketIndex
    ticket.proofOfRelaySecret = event.params.proofOfRelaySecret
    ticket.amount = convertEthToDecimal(event.params.amount)
    ticket.winProb = event.params.winProb
    ticket.signature = event.params.signature
    // update channel
    let channel = Channel.load(channelId)
    if (channel == null) {
        log.error("Redeem a ticket for non-existing channel {}", [channelId.toHex()])
        return;
    } else {
        channel.redeemedTicketCount = channel.redeemedTicketCount.plus(oneBigInt())
    }
    channel.save()
    ticket.save()
}

export function handleRegistered(event: Registered): void {
    let account = getOrInitiateRegistration(event.params.account)
    let registeredPeers = account.registeredPeers

    if (registeredPeers.indexOf(event.params.hoprPeerId) == -1) {
        registeredPeers.push(event.params.hoprPeerId)
    }
    account.registeredPeers = registeredPeers
    account.save()
}

export function handleOwnerRegistered(event: RegisteredByOwner): void {
    let account = getOrInitiateRegistration(event.params.account)
    let registeredPeers = account.registeredPeers

    if (registeredPeers.indexOf(event.params.hoprPeerId) == -1) {
        registeredPeers.push(event.params.hoprPeerId)
    }
    account.registeredPeers = registeredPeers
    account.save()
}

export function handleDeregistered(event: Deregistered): void {
    let account = getOrInitiateRegistration(event.params.account)
    let registeredPeers = account.registeredPeers
    let elementIndex = registeredPeers.indexOf(event.params.hoprPeerId)

    if ( elementIndex == -1) {
        log.error(` [ error] Cannot find registration: {}`, [event.params.account.toHex(), event.params.hoprPeerId])
    } else {
        registeredPeers.splice(elementIndex, 1)
    }
    account.registeredPeers = registeredPeers
    account.save()
}

export function handleOwnerDeregistered(event: DeregisteredByOwner): void {
    let account = getOrInitiateRegistration(event.params.account)
    let registeredPeers = account.registeredPeers
    let elementIndex = registeredPeers.indexOf(event.params.hoprPeerId)

    if ( elementIndex == -1) {
        log.error(` [ error] Cannot find registration: {}`, [event.params.account.toHex(), event.params.hoprPeerId])
    } else {
        registeredPeers.splice(elementIndex, 1)
    }
    account.registeredPeers = registeredPeers
    account.save()
}

export function handleEligibilityUpdated(event: EligibilityUpdated): void {
    let account = getOrInitiateRegistration(event.params.account)
    account.eligibility = event.params.eligibility
    account.save()
}

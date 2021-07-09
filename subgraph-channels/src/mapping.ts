import { log } from '@graphprotocol/graph-ts'
import { Announcement, ChannelUpdate } from '../generated/HoprChannels/HoprChannels'
import { Account, Channel } from '../generated/schema'

export function handleAnnouncement(event: Announcement): void {
    log.info(`[ info ] Address of the account announcing itself: {}`, [event.params.account.toHexString()]);
    let account = new Account(event.params.account.toHexString())
    account.multiaddr = event.params.multiaddr;
    account.channels = [];
    account.hasAnnounced = true;
    account.save()
}

export function handleChannelUpdate(event: ChannelUpdate): void {
    log.info(`Address of the account updating the channel: {}`, [event.params.source.toHexString()]);
}
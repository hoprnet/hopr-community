import { log } from '@graphprotocol/graph-ts'
import { Announcement, ChannelUpdate } from '../generated/HoprChannels/HoprChannels'
import { Account, Channel } from '../generated/schema'

export function handleAnnouncement(event: Announcement): void {
    log.debug(`Address of the account announcing itself: {}`, [event.params.account.toHexString()]);
}
export function handleChannelUpdate(event: ChannelUpdate): void {
    log.debug(`Address of the account updating the channel: {}`, [event.params.source.toHexString()]);
}
import { log } from '@graphprotocol/graph-ts'
import { Announcement, ChannelUpdate } from '../generated/HoprChannels/HoprChannels'
import { Account, Channel } from '../generated/schema'

export function handleAnnouncement(event: Announcement) {
    const account = new Account(event.params.account.toString());
    account.save()
}
export function handleChannelUpdate(event: ChannelUpdate) {
    const channelId = generateChannelId(new Address(event.params.source), new Address(event.params.destination));
    const channel = new Channel(channelId.toHex());
    channel.save()
}
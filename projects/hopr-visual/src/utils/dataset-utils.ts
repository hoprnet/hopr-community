import { Account, ApolloAccountQuery, ApolloChannelQuery, Channel, Dataset, RemoteStatus } from "../types";

var axios = require('axios');

export function datasetBuilderAccount(query: ApolloAccountQuery, dataset: Dataset): Dataset {
    dataset.nodes = dataset.nodes.concat(...query.accounts)
    // console.log("Dataset: ", dataset)
    return dataset
}

export function datasetBuilderChannel(query: ApolloChannelQuery, dataset: Dataset): Dataset {
    dataset.edges = dataset.edges.concat(...query.channels)
    // console.log("Dataset: ", dataset)
    return dataset
}

enum Status {
    TypeError, NetworkError, OK, Level2Error
}

interface GetAddresses {
    nativeAddress: string
    hoprAddress: string
    native: string
    hopr: string
}

interface HoprNodeHeader {
    peerId: string
    multiAddr: string
    endpoint: string
}

interface GetChannels {
    incoming: Incoming[]
    outgoing: Outgoing[]
}

interface Incoming {
    type: string
    channelId: string
    peerId: string
    status: string
    balance: number
}

interface Outgoing {
    type: string
    channelId: string
    peerId: string
    status: string
    balance: number
}


interface HoprNode extends HoprNodeHeader {
    heartbeats: {
        sent: number,
        success: number
    },
    lastSeen: number,
    quality: number,
    backoff: number,
    isNew: boolean
}

interface PeerRequest {
    nodes: HoprNode[]
    status: Status
    error?: any
}

interface AccountRequest {
    account: Account
    status: Status
    error?: any
    node: HoprNodeHeader
}

interface ChannelRequest {
    channel: Channel[]
    status: Status
    error?: any
}

export async function exploreLocalCluster(localNodeEndpoint: string, nodeToken: string, setRemoteStatus: React.Dispatch<React.SetStateAction<RemoteStatus>>, setRemoteError: React.Dispatch<React.SetStateAction<string>>): Promise<Dataset | undefined> {

    let responseData: PeerRequest
    let visitedMap: Map<string, HoprNodeHeader> = new Map()
    let toBeVisitedList: HoprNodeHeader[] = []

    responseData = await makePeerRequest(localNodeEndpoint, nodeToken)
    if (responseData.status !== Status.OK && responseData.nodes !== undefined) {
        setRemoteError(responseData.error)
        setRemoteStatus(RemoteStatus.errored)
        return
    }

    setRemoteStatus(RemoteStatus.connected)

    toBeVisitedList = toBeVisitedList.concat(responseData.nodes)

    setRemoteStatus(RemoteStatus.exploring)

    //fetch all the nodes in the network
    try {
        while (toBeVisitedList.length > 0) {
            let node: HoprNodeHeader | undefined = toBeVisitedList.shift();
            if (node === undefined || visitedMap.has(node.peerId)) {
                continue
            }
            let endpoint = parseEndpoint(node, localNodeEndpoint)
            node.endpoint = endpoint
            let req = await makePeerRequest(endpoint, nodeToken)
            if (req.error) continue
            visitedMap.set(node.peerId, node)
            for (let i = 0; i < req.nodes.length; i++) {
                const element = req.nodes[i];
                if (element === undefined || visitedMap.has(element.peerId)) {
                    continue
                }
                toBeVisitedList = toBeVisitedList.concat(element)
            }

        }
    } catch (error) {
        console.error(error)
        setRemoteError(responseData.error)
        setRemoteStatus(RemoteStatus.errored)
        return
    }

    let dataset: Dataset = {
        nodes: [],
        edges: []
    }

    //build nodes and edges (Accounts and Channels) for each node of the network
    for await (const entry of visitedMap.entries()) {
        let hoprNode = visitedMap.get(entry[0])
        if (hoprNode === undefined) {
            setRemoteError("[exploreLocalCluster] Hoprnode cannot be null at this point")
            setRemoteStatus(RemoteStatus.errored)
            return
        }
        let nodeRequest: AccountRequest = await makeAccount(hoprNode, nodeToken)
        if (nodeRequest.status !== Status.OK) {
            setRemoteError(nodeRequest.error)
            setRemoteStatus(RemoteStatus.errored)
            return
        }
        let channelsRequest: ChannelRequest = await makeEdges(hoprNode, nodeToken, nodeRequest.account)
        if (channelsRequest.status !== Status.OK) {
            setRemoteError(nodeRequest.error)
            setRemoteStatus(RemoteStatus.errored)
            return
        }
        dataset.edges = dataset.edges.concat(channelsRequest.channel)
        dataset.nodes = dataset.nodes.concat(nodeRequest.account)
    }

    setRemoteStatus(RemoteStatus.complete)

    return dataset
}

async function makePeerRequest(localNodeEndpoint: string, nodeToken: string): Promise<PeerRequest> {

    let responseData: PeerRequest = {
        nodes: [],
        status: Status.OK
    }

    const url = new URL('/api/v2/node/peers', localNodeEndpoint)

    var config = {
        method: 'get',
        url: url.href,
        headers: {
            'accept': 'application/json',
            'x-auth-token': nodeToken
        },
        timeout: 1000,
    };

    try {
        const { data } = await axios(config)
        try {
            data.announced.forEach((element: HoprNode) => {
                let hoprNode: HoprNode = {
                    peerId: element.peerId,
                    multiAddr: element.multiAddr,
                    heartbeats: {
                        sent: element.heartbeats.sent,
                        success: element.heartbeats.success
                    },
                    lastSeen: element.lastSeen,
                    quality: element.quality,
                    backoff: element.backoff,
                    isNew: element.isNew,
                    endpoint: localNodeEndpoint
                }
                responseData.nodes = responseData.nodes.concat(hoprNode)
            });
        } catch (error: any) {
            responseData.error = "Error while parsing the request. Is this a HOPR Node?"
            responseData.status = Status.TypeError
        }

    } catch (error: any) {
        responseData.error = error
        responseData.status = Status.NetworkError
    }

    return responseData
}

async function makeAccount(node: HoprNodeHeader, nodeToken: string): Promise<AccountRequest> {

    let account: AccountRequest = {
        account: {
            id: "",
            publicKey: "",
            balance: 0,
            openChannelsCount: 0,
            isActive: true
        },
        node: node,
        status: Status.OK
    }

    const url = new URL('/api/v2/account/addresses', node.endpoint)

    var config = {
        method: 'get',
        url: url.href,
        headers: {
            'accept': 'application/json',
            'x-auth-token': nodeToken
        },
        timeout: 1000,
    };

    let { data } = await axios(config)

    try {
        let addresses = data as GetAddresses
        account.account.id = addresses.hoprAddress
        account.account.publicKey = addresses.nativeAddress
    } catch (error: any) {
        account.error = "Level 2 error"
        account.status = Status.Level2Error
    }

    return account
}

function parseEndpoint(node: HoprNodeHeader, localEndpoing: string): string {
    const isHTTPS = localEndpoing.startsWith('https')
    if (localEndpoing.includes("gitpod")) {
        let splitted = node.multiAddr.split("/")
        let gitpodUrl = localEndpoing.substring(5)
        let port = parseInt(splitted[4]) % 10 + 13300 //changes port 190xx to 133xx
        return `${port}${gitpodUrl}`
    } else {
        let splitted = node.multiAddr.split("/")
        let ip = splitted[2]
        let port = parseInt(splitted[4]) % 10 + 13300 //changes port 190xx to 133xx
        return `${isHTTPS ? "https://" : "http://"}${ip}:${port}`
    }
}

async function makeEdges(hoprNode: HoprNodeHeader, nodeToken: string, account: Account): Promise<ChannelRequest> {

    let channelReturn: ChannelRequest = {
        channel: [],
        status: Status.OK
    }

    const url = new URL('/api/v2/channels', hoprNode.endpoint)

    var config = {
        method: 'get',
        url: url.href,
        headers: {
            'accept': 'application/json',
            'x-auth-token': nodeToken
        },
        timeout: 1000,
    };

    let { data } = await axios(config)

    try {
        let channelsReq = data as GetChannels
        channelsReq.outgoing.forEach((outgoing) => {
            account.balance += outgoing.balance
            let channel: Channel = {
                id: outgoing.channelId,
                source: {
                    id: account.id
                },
                destination: {
                    id: outgoing.peerId
                },
                balance: outgoing.balance,
                status: 0,
                commitment: [],
                channelEpoch: 0,
                ticketEpoch: 0,
                ticketIndex: 0,
                commitmentHistory: []
            }
            channelReturn.channel = channelReturn.channel.concat(channel)
        })
    } catch (error: any) {
        channelReturn.error = "Level 2 error"
        channelReturn.status = Status.Level2Error
    }

    return channelReturn
}


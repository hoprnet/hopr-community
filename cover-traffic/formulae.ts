// These formulae should be a reflection of the latest Cover Traffic spec
// see: https://docs.google.com/document/d/1W51LPjDnAJz9jJdirisFzSVt5r-WTNgjlkMQ7JRvqg8/edit#

import { PATH_DEFAULT_LENGTH, STAKE_PER_CHANNEL } from "./constants";
import { HoprNode, Network } from "./types";

/*
 * @name: openingMechanism
 * @desc: Initial channel opening from cover traffic node to discover possible paths based
 * on importance according to each node within the network.
 * 
 */
export const coverTrafficOpeningAlgorithm = (nodes: HoprNode[], coverTrafficNode: HoprNode) => {
  while (coverTrafficNode.hasFunds()) {
    openNewChannel(nodes, coverTrafficNode);
  }
}

/*
 * @name: openNewChannel
 * @desc: Opens a new channel based on the importance of given nodes in the network.
 * 
 */
const openNewChannel = (nodes: HoprNode[], coverTrafficNode: HoprNode) => {
  const node = Network.pickRandom(weightedByImportance(nodes))
  coverTrafficNode.open(node, STAKE_PER_CHANNEL);
}

/*
 * @name: weightedByImportance
 * @desc: Sorts a set of given nodes based on the importance score of each node.
 * 
 */
const weightedByImportance = (nodes: HoprNode[]) => {
  // For now we are sorting based on the amount of channels a node has open
  // @TODO: Replace this with an actual importance evaluation formula
  return nodes.sort((a, b) => a.channels.size - b.channels.size)
}


export const coverTrafficPathFindingAndSendingAlgorithm =
  (nodes: HoprNode[], coverTrafficNode: HoprNode, runs = 1) => {
    [...Array(runs).keys()].map(() => {
      const node = Network.pickRandom(coverTrafficNode.opennedChannelsImmediateNodes())
      sendPacket(node, coverTrafficNode);
    })

}
/*
 * @name balanceOfPath
 * @desc The total of the outgoingBalance of each channel along a path
 *
 */

const sendPacket = (firstNode: HoprNode, recipient: HoprNode): void => {
  const pathChoice: HoprNode[] = createPath(firstNode, PATH_DEFAULT_LENGTH, recipient)
  console.log('Path Choice', pathChoice);
}

/*
 * @name createPath
 * @desc Method for creating a series of channels as a path to a given node.
 *
 */

const createPath = (node: HoprNode, pathLength: number, destination: HoprNode) => {
  return recursivePathCreation(node, pathLength, [destination])
}

const recursivePathCreation = (node: HoprNode, pathLength: number, existingPath: HoprNode[]): HoprNode[] => {
  const nextHop = Network.pickRandom(weightedByImportance(node.opennedChannelsImmediateNodes()))
  existingPath.push(nextHop)
  return pathLength > 0 ?
    recursivePathCreation(nextHop, pathLength - 1, existingPath) :
    existingPath
}

import { coverTrafficOpeningAlgorithm, coverTrafficPathFindingAndSendingAlgorithm } from "./formulae";
import { HoprNode, HOPR_IDS, HOPR_ID, Network } from "./types"

/*
 * @name createNodes
 * @desc Bootstrap all the nodes in the network based on the HOPR_ID types
 */
const createNodes = (): HoprNode[] => {
  //Enums store both the index based enum and string literal
  return [...Array(Object.keys(HOPR_IDS).length/2).keys()]
    .map(id => (new HoprNode(HOPR_IDS[id] as unknown as HOPR_ID, 1)))
}

const network = new Network(createNodes())
network.simulateOpening(10);
network.print()
const coverTrafficNode = new HoprNode('CT', 10)
network.addCoverTrafficNode(coverTrafficNode);
coverTrafficOpeningAlgorithm(network.nodes, network.coverTrafficNodes[0])
coverTrafficPathFindingAndSendingAlgorithm(network.nodes, network.coverTrafficNodes[0])
network.printCoverTraffic()
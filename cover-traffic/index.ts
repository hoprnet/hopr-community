import { HoprNode, HOPR_IDS, HOPR_ID, Network } from "./types"

/*
 * @name createNodes
 * @desc Bootstrap all the nodes in the network based on the HOPR_ID types
 */
const createNodes = (): HoprNode[] => {
  //Enums store both the index based enum and string literal
  return [...Array(Object.keys(HOPR_IDS).length/2).keys()]
    .map(id => (new HoprNode(HOPR_IDS[id] as unknown as HOPR_ID)))
}

const network = new Network(createNodes())
network.simulateOpening(5);
network.print()
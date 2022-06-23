import React, { FC } from "react";
import { BiNetworkChart } from "react-icons/bi";
import { BsInfoCircle } from "react-icons/bs";
import { VisualMode } from "../types";

import Panel from "./Panel";


const DescriptionPanel: FC<{ mode: VisualMode }> = ({ mode }) => {
  return (
    <Panel
      initiallyDeployed
      title={
        <>
          <BsInfoCircle className="text-muted" /> Description
        </>
      }
    >
      {mode === VisualMode.Subgraph ? <p className="descriptionPanel">
        The <b>HOPR network</b> is a decentralised and incentivized peer-to-peer network open to anyone who wants to join and run a node.<br />
        Use the control bar on the left to zoom in and out (or the mouse wheel) and to reset the graph to the center.<br /><br />
        Click on the last button <BiNetworkChart /> to switch from the runtime generated network from TheGraph to the Local Cluster Visualizer
      </p> :
        <p className="descriptionPanel">
          You are in the Local Cluster Discovery mode. <br />
          Insert the node's Endpoint and Token in the above fields.
          <br /><br />
          Click on the last button <BiNetworkChart /> to switch to the TheGraph generated network.</p>}
    </Panel>
  );
};

export default DescriptionPanel;

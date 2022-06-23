import React, { KeyboardEvent, ChangeEvent, FC, useEffect } from "react";
// import { useSigma } from "react-sigma-v2";
import { RemoteStatus } from "../types";
import { MdPassword } from "react-icons/md";
import { GrNodes } from "react-icons/gr";

/**
 * This component is basically a fork from React-sigma-v2's SearchControl
 * component, to get some minor adjustments:
 * 1. We need to hide hidden nodes from results
 * 2. We need custom markup
 */
const EndpointField: FC<{ endpoint: string, remoteStatus: RemoteStatus, nodeToken: string, error: string, setNodeToken: React.Dispatch<React.SetStateAction<string>>, setRemoteEndpoint: React.Dispatch<React.SetStateAction<string>>, setRemoteStatus: React.Dispatch<React.SetStateAction<RemoteStatus>> }> = ({ endpoint, remoteStatus, nodeToken, error, setNodeToken, setRemoteEndpoint, setRemoteStatus }) => {
  // const sigma = useSigma();

  // Refresh values when filters are updated (but wait a frame first):
  useEffect(() => {
    validateEndpoint(endpoint)
  }, [endpoint]);

  function validateEndpoint(endpoint: string): RemoteStatus {
    const ipregex = /^((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])|localhost)(:((6553[0-5])|(655[0-2][0-9])|(65[0-4][0-9]{2})|(6[0-4][0-9]{3})|([1-5][0-9]{4})|([0-5]{2,5})|([0-9]{2,4})))$/
    const gitpodregex = /^([0-9]{5})-hoprnet(.+)(\.gitpod\.io)$/
    let remoteStatus = ipregex.test(endpoint) || gitpodregex.test(endpoint) ? RemoteStatus.valid : RemoteStatus.invalid
    setRemoteStatus(remoteStatus)
    return remoteStatus
  }

  useEffect(() => {
  }, [remoteStatus]);

  const onInputNodeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setRemoteEndpoint(input);
  };

  const onKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && remoteStatus === RemoteStatus.valid) {
      setRemoteStatus(RemoteStatus.selected)
    }
    if (e.key === "Enter" && remoteStatus !== RemoteStatus.valid) {
      setRemoteStatus(RemoteStatus.invalid)
      if (validateEndpoint(endpoint) === RemoteStatus.valid) {
        setRemoteStatus(RemoteStatus.selected)
      }
    }
  };

  const onInputTokenChange = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setNodeToken(input);
    setRemoteStatus(RemoteStatus.invalid)
    validateEndpoint(endpoint)
  };

  function generateEndpointMessage(): React.ReactNode {
    var classes: string[] = ["endpointInfo"]
    var message = ""
    switch (remoteStatus) {
      case RemoteStatus.complete:
        message = "Graph complete"
        classes = classes.concat("endpointSuccess")
        break
      case RemoteStatus.connected:
        message = "Connected to node"
        classes = classes.concat("endpointSuccess")
        break
      case RemoteStatus.errored:
        message = error.toString()
        classes = classes.concat("endpointError")
        break
      case RemoteStatus.exploring:
        message = "Exploring graph..."
        break
      case RemoteStatus.invalid:
        message = "Endpoint is invalid"
        classes = classes.concat("endpointError")
        break
      case RemoteStatus.selected:
        message = "Connecting to node..."
        break
      case RemoteStatus.valid:
        message = "Press ENTER to connect to the node"
        classes = classes.concat("endpointSuccess")
        break
      default:
    }
    var classArray = ""
    classes.forEach((className) => {
      classArray += className + " "
    })
    return <div className={classArray}> {message} </div>
  }

  return (
    <><div className="search-wrapper">
      <input
        type="search"
        placeholder={"1.1.1.1:12345 or my.node.url"}
        list="nodes"
        value={endpoint}
        onChange={onInputNodeChange}
        onKeyPress={onKeyPress} />
      <MdPassword className="icon" />
    </div><div className="search-wrapper">
        <input
          type="search"
          placeholder={"Insert cluster token"}
          list="nodes"
          value={nodeToken}
          onChange={onInputTokenChange}
          onKeyPress={onKeyPress} />
        {generateEndpointMessage()}
        <GrNodes className="icon" />
      </div></>
  );
};

export default EndpointField;      
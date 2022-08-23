import React, { useEffect, useState } from "react";
import useWebsocket from "./useWebSocket";
import { decode } from 'rlp'
import { useSlotProps } from "@mui/base";

export const WebSocketHandler= ({ apiEndpoint, apiToken, onMessage }) => {
  const [message, setMessage] = useState("");
  const websockerUrl = `${apiEndpoint}/api/v2/messages/websocket`;
  const websocket = useWebsocket({ wsEndpoint: websockerUrl, securityToken: apiToken });
  const { socketRef } = websocket;

  const decodeMessage =  (msg) => {
    console.log('WB: decodeMessage')
    let uint8Array = new Uint8Array(JSON.parse(`[${msg}]`));    
    let decodedArray = decode(uint8Array)
    if (decodedArray[0] instanceof Uint8Array) {
      return new TextDecoder().decode(decodedArray[0])
    }
    throw Error(`Could not decode received message: ${msg}`);
  }

  const handleReceivedMessage = async (ev) => {
    console.log('WB: handleReceivedMessage')
    try {
      const data = decodeMessage(ev.data)
      console.log("WebSocket Data: ", data);
      setMessage(data);
      onMessage(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {

    if (!socketRef.current) return;
    else {
      socketRef.current.addEventListener("message", handleReceivedMessage);
      console.log('WS: EventListener mounted')
    }

    return () => {
      if (!socketRef.current) return;
      else {
        socketRef.current.removeEventListener("message", handleReceivedMessage);
        console.log('WS: EventListener unmounted')
      }
    };
  }, [socketRef.current]);

  return <span></span>;
};

export default WebSocketHandler;
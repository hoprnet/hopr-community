import React, { useEffect, useState } from "react";
import ReactJson from "react-json-view";

import { decode } from 'rlp'
import useWebsocket from "./useWebSocket";
export const WebSocketHandler: React.FC<{
  wsEndpoint: string;
  securityToken: string;
}> = ({ wsEndpoint, securityToken }): JSX.Element => {
  const [messages, setMessages] = useState<string[]>([]);
  const websocket = useWebsocket({ wsEndpoint, securityToken });
  const { socketRef } = websocket;

  const decodeMessage =  (msg:string): string => {
    let uint8Array = new Uint8Array(JSON.parse(`[${msg}]`));    
    let decodedArray = decode(uint8Array)
    if (decodedArray[0] instanceof Uint8Array) {
      return new TextDecoder().decode(decodedArray[0])
    }
    throw Error(`Could not decode received message: ${msg}`)
  }

  useEffect(()=>{
    console.log({messages});
    
  }, [messages])
  const handleReceivedMessage = async (ev: MessageEvent<string>) => {
    try {
      const data = decodeMessage(ev.data)
      console.log("WebSocket PRev: ", messages);
      console.log("WebSocket Data: ", data);
      setMessages((prevHMessages) => ( [
          ...prevHMessages,
        data,
      ]));
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    if (!socketRef.current) return;
    socketRef.current.addEventListener("message", handleReceivedMessage);

    return () => {
      if (!socketRef.current) return;
      socketRef.current.removeEventListener("message", handleReceivedMessage);
    };
  }, [socketRef.current]);

  return ( <ReactJson src={{messages}} collapsed />);
}; 

export default WebSocketHandler;
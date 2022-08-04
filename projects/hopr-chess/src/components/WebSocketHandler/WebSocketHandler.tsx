import React, { useEffect } from "react";
import useWebsocket from "./useWebSocket";
import { decode } from 'rlp'
import { receiveAnswer, receiveHandshake } from "state/slices/peerSlice/peerSlice";
import { useAppDispatch } from "app/hooks";
import { doMove } from "state/slices/chessSlice/chessSlice";

export const WebSocketHandler: React.FC<{
  wsEndpoint: string;
  securityToken: string;
}> = ({ wsEndpoint, securityToken }): JSX.Element => {
  const websocket = useWebsocket({ wsEndpoint, securityToken });
  const { socketRef } = websocket;

  const dispatch = useAppDispatch()

  const decodeMessage =  (msg:string): string => {
    let uint8Array = new Uint8Array(JSON.parse(`[${msg}]`));    
    let decodedArray = decode(uint8Array)
    if (decodedArray[0] instanceof Uint8Array) {
      return new TextDecoder().decode(decodedArray[0])
    }
    throw Error(`Could not decode received message: ${msg}`)
  }

  const handleReceivedMessage = async (ev: MessageEvent<string>) => {
    try {
      const data = decodeMessage(ev.data)
      // console.log("WebSocket Data: ", data);

      const message = JSON.parse(data)

      switch (message.action) {
        case 'handshake':
          return dispatch(receiveHandshake(message.payload))
        case 'answer':
          return dispatch(receiveAnswer(message.payload))
        case 'heartbeat':
          return
          // return dispatch(receiveHeartbeat(message))
        case 'move':
          return dispatch(doMove(message.payload))
      }
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

  return <span></span>
};

export default WebSocketHandler;

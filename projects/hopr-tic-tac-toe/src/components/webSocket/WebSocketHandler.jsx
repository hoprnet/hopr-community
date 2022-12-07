import React, { useEffect, useState } from 'react';
import useWebsocket from './useWebSocket';
import { decode } from 'rlp';

export const WebSocketHandler = ({
  wsEndpoint,
  securityToken,
  setMessages,
  setIsNewMessage,
}) => {
  const [message, setMessage] = useState('');
  const websocket = useWebsocket({ wsEndpoint, securityToken });
  const { socketRef } = websocket;

  const decodeMessage = (msg) => {
    let uint8Array = new Uint8Array(JSON.parse(`[${msg}]`));
    let decodedArray = decode(uint8Array);

    if (decodedArray[0] instanceof Uint8Array) {
      return new TextDecoder().decode(decodedArray[0]);
    }
    throw Error(`Could not decode received message: ${msg}`);
  };

  const handleReceivedMessage = async (ev) => {
    try {
      const data = decodeMessage(ev.data);
      setMessage(data);
      setMessages((prevArr) => [...prevArr, data]);
      if (data.split('-')[0] === 'invite') setIsNewMessage(true);
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    if (!socketRef.current) return;
    socketRef.current.addEventListener('message', handleReceivedMessage);

    return () => {
      if (!socketRef.current) return;
      socketRef.current.removeEventListener('message', handleReceivedMessage);
    };
  }, [socketRef.current]);

  return <></>;
};

export default WebSocketHandler;

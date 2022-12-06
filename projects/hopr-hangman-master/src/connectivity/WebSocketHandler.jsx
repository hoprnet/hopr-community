import React, { useEffect, useState } from 'react'
import useWebsocket from './useWebSocket'
import { decode } from 'rlp'

export const WebSocketHandler = ({ wsEndpoint, securityToken, game, updateGame }) => {
  const [message, setMessage] = useState('')
  const websocket = useWebsocket({ wsEndpoint, securityToken })
  const { socketRef } = websocket
  const handleReceivedMessage = async (ev) => {
    try {
      let wsMsg;

      let uint8Array = new Uint8Array(JSON.parse(`[${ev.data}]`));
      let decodedArray = decode(uint8Array)
      if (decodedArray[0] instanceof Uint8Array) {
        wsMsg = new TextDecoder().decode(decodedArray[0])
      }

      const data = JSON.parse(wsMsg)

      setMessage(data)
      await game.multiplayer.parseMessage(data);
      await updateGame(game)

    } catch (err) {
      console.error("Couldn't parse websocket message\n", err)
    }
  }

  useEffect(() => {
    if (!socketRef.current) return

    // socketRef.current.addEventListener('message', handleReceivedMessage)
    socketRef.current.onmessage = handleReceivedMessage;

    return () => {
      if (!socketRef.current) return
      socketRef.current.removeEventListener('message', handleReceivedMessage)
    }
  }, [socketRef.current])

  return false;

  // return <span>{message ? message : 'You have no messauges.'}</span>
}

export default WebSocketHandler

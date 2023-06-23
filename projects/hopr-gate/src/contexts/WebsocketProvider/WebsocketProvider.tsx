import { createContext, useEffect } from "react";
import useWebsocket, { ConnectionStatus } from "../../state/websocket";
import useUser from "./../../state/user";
import { useAppState } from "./../../state/index";
import { encodeMessage } from "../../lib/jsonrpc";
import { sendMessage } from "../../lib/api";

interface WebsocketContext {
  myPeerId: string;
  socketRef: React.MutableRefObject<WebSocket>;
  connectionStatus: ConnectionStatus;
  handleSendMessage(content: string, destination: string): any;
  rpcCallAsnwer: any;
}

export const WebsocketContext = createContext({} as WebsocketContext);

const WebsocketProvider = ({ children }) => {

    const {
        state: { settings },
        rpcCallAsnwer,
        handleReceivedMessage,
        updateSettings,
    } = useAppState();
 
    const websocket = useWebsocket(settings);
    const { socketRef } = websocket;
    const connectionStatus = websocket.state.status;

    const user = useUser(settings);
    const { myPeerId } = user?.state;

    useEffect(() => {
      const userData = localStorage.getItem("userData");
      if (userData) {
        const parsed = JSON.parse(userData);
      updateSettings({
        apiEndpoint: parsed.apiEndpoint,
        apiToken: parsed.apiToken,
      }) 
    }

      if (!myPeerId || !socketRef.current) return;
      socketRef.current.addEventListener("message", handleReceivedMessage);

      return () => {
        if (!socketRef.current) return;
        socketRef.current.removeEventListener("message", handleReceivedMessage);
      };
    }, [myPeerId, socketRef.current]);

    const handleSendMessage = async (content: string, destination: string) => {
      if (!myPeerId || !socketRef.current) return;
  
      const headers = new Headers();
      headers.set("Content-Type", "application/json");
      headers.set("Accept-Content", "application/json");
    
      if (settings.apiToken) {
        headers.set("Authorization", "Basic " + btoa(settings.apiToken));
      }
  
      const encodedMessage = encodeMessage(myPeerId, content, "user");

      await sendMessage(settings.apiEndpoint, headers)(destination, encodedMessage)
      .catch((err: any) => console.error('ERROR Failed to send message', err));
    };  

  return (
    <WebsocketContext.Provider value={{ myPeerId, socketRef, connectionStatus, handleSendMessage, rpcCallAsnwer }}>
      {children}
    </WebsocketContext.Provider>
  );
};

export default WebsocketProvider;

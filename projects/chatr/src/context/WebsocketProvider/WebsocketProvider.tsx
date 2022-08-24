import { createContext, useEffect, useState } from "react";
import useWebsocket from "../../state/websocket";
import useAppState, { Message } from "./../../state/index";
import useUser from "./../../state/user";
import { sendMessage, signRequest } from "../../lib/api";
import { genId, encodeMessage } from "../../utils";

interface WebsocketContext {
    conversations: Map<string, Map<string, Message>>;
    myPeerId: string;
    socketRef: React.MutableRefObject<WebSocket>;
    chatMessages: any[];
    handleSendMessage(content: string, destination: string): any;
    fetchChatMessages(lastMessage: [string, Message]): any;
}

export const WebsocketContext = createContext({} as WebsocketContext);

const WebsocketProvider = ({ children }) => {

    const {
        state: { settings, conversations },
        handleReceivedMessage,
        addReceivedMessage,
        updateMessage,
        addSentMessage        
      } = useAppState();

      const [chatMessages, setChatMessages] = useState([]);

    const websocket = useWebsocket(settings);
    const { socketRef } = websocket;

    const user = useUser(settings);
  // const { getReqHeaders } = user;
    const { myPeerId } = user?.state;

    useEffect(() => {
        if (!myPeerId || !socketRef.current) return;
        socketRef.current.addEventListener(
          "message",
          handleReceivedMessage(addReceivedMessage)
        );
    
        return () => {
          if (!socketRef.current) return;
          socketRef.current.removeEventListener(
            "message",
            handleReceivedMessage(addReceivedMessage)
          );
        };
      }, [myPeerId, socketRef.current]);

      const handleSendMessage = async (content: string, destination: string) => {
        if (!myPeerId || !socketRef.current) return;
    
        const headers = new Headers();
        headers.set("Content-Type", "application/json");
        headers.set("Accept-Content", "application/json");
      
        if (settings.securityToken) {
          headers.set("Authorization", "Basic " + btoa(settings.securityToken));
        }
    
        const signature = await signRequest(settings.httpEndpoint, headers)(content)
        .catch((err: any) => console.error('ERROR Failed to obtain signature', err));
        const encodedMessage = encodeMessage(myPeerId, content, signature);
        const id = genId();
        addSentMessage(myPeerId, destination, content, id);
        await sendMessage(settings.httpEndpoint, headers)(destination, encodedMessage, destination, id, updateMessage)
        .catch((err: any) => console.error('ERROR Failed to send message', err));
      };

      const fetchChatMessages = (lastMessage: [string, Message]) => {
        if( chatMessages[chatMessages.length-1]?.id === lastMessage[1].id){
          return;
        }
        chatMessages.push({
          id: lastMessage[1].id,
          isIncoming: lastMessage[1].isIncoming,
          content: lastMessage[1].content,
        });
      }

    return (
        <WebsocketContext.Provider value={{ conversations , myPeerId, socketRef, handleSendMessage, chatMessages, fetchChatMessages}}>
            {children}
        </WebsocketContext.Provider>
    );
}

export default WebsocketProvider;
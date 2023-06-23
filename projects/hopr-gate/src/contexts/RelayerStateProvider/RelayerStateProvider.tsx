import { createContext, useEffect, useState } from "react";
import { decode } from "rlp";
import useWebsocket from "../../state/relayerws";
import { useRelayerState } from "../../state";
import { ethers } from "ethers";
import { getRelayerConfig } from "../../lib/url";
import { encodeMessage } from "../../lib/jsonrpc";
import { sendMessage } from "../../lib/api";
import useUser from "./../../state/user";

type EventList = {
  eventId: string;
  event: string;
};

interface RelayerStateContext {
  socketRef: React.MutableRefObject<WebSocket>;
  relayerStatus: boolean;
  eventsList: EventList[];
  relayerPeerId: string;
}

export const RelayerStateContext = createContext({} as RelayerStateContext);

const RelayerStateProvider = ({ children }) => {
  const {
    relayerState: { settings },
    updateSettings,
  } = useRelayerState();

  const user = useUser(settings);
  const { myPeerId } = user?.state;

  const [relayerPeerId, setRelayerPeerId] = useState<string>("");
  const [eventsList, setEventsList] = useState<any[]>([]);
  const [rpcVitals, setRpcVitals] = useState<boolean>(false);
  const [relayerStatus, setRelayerStatus] = useState(false);
  const [rpcAnswer, setRpcAnswer] = useState<any>(null);

  const websocket = useWebsocket(settings);
  const { socketRef } = websocket;
  const connectionStatus = websocket.state.status;

  const relayerConfig = getRelayerConfig();
  const provider = relayerConfig
    ? new ethers.providers.JsonRpcProvider(relayerConfig.rpcEndpoint)
    : undefined;

  const decodeMessage = (
    msg: string
  ): {
    tag: string;
    from: string;
    address: string;
    content: string[];
  } => {
    let uint8Array = new Uint8Array(JSON.parse(`[${msg}]`));
    let decodedArray = decode(uint8Array);
    if (decodedArray[0] instanceof Uint8Array) {
      const data = new TextDecoder().decode(decodedArray[0]);
      const [tag, from, address, ...content] = data.split(":");
      return {
        tag,
        from,
        address,
        content,
      };
    }
    throw Error(`Could not decode received message: ${msg}`);
  };

  const handleReceivedMessage = async (ev: MessageEvent<string>) => {
    try {
      const data = decodeMessage(ev.data);

      await sendRpcMethod(data.content[0], data.address)
      // const message = JSON.parse(data);
    } catch (err) {
      console.error(err);
    }
  };

  const sendRpcMethod = async (method: string, requester: string, ...args) => {
    provider.send(method, [...args]).then(async (res) => {
      try{
        await handleSendMessage(res, requester);
      } catch (err) {
        console.error(err);
      }      
    });
  };

  const checkRpcVitals = async () => {
    provider.send("eth_chainId", []).then((res) => {
      if (res !== undefined) {
        setRpcVitals(true);
        eventsList.push({
          eventId: String(Math.floor(Math.random() * 1e18)),
          event: `Connected to Chain Id: ${parseInt(res, 16)}`,
        });
      } else {
        setRpcVitals(false);
      }
    });
  };

  useEffect(() => {
    setRelayerPeerId(myPeerId);
  }, [myPeerId]);

  useEffect(() => {
    if (connectionStatus === "CONNECTED" && rpcVitals) {
      setRelayerStatus(true);
    } else {
      setRelayerStatus(false);
    }
  }, [connectionStatus, rpcVitals]);

  useEffect(() => {
    const relayerData = localStorage.getItem("relayerData");

    if (relayerData) {
      const parsed = JSON.parse(relayerData);
      updateSettings({
        apiEndpoint: parsed.apiEndpoint,
        apiToken: parsed.apiToken,
      });
    }

    checkRpcVitals();
    // console.log(eventsList);
    
    if (!socketRef.current) return;
    // Wait 0.1s to avoid collision with user websocket
    socketRef.current.addEventListener("message", handleReceivedMessage);

    return () => {
      if (!socketRef.current) return;
      socketRef.current.removeEventListener("message", handleReceivedMessage);
    };


  }, [socketRef.current, provider]);

  const handleSendMessage = async (content: string, destination: string) => {
    if (!relayerPeerId) return;

    const headers = new Headers();
    headers.set("Content-Type", "application/json");
    headers.set("Accept-Content", "application/json");

    if (settings.apiToken) {
      headers.set("Authorization", "Basic " + btoa(settings.apiToken));
    }

    const encodedMessage = encodeMessage(relayerPeerId, content, "relayer");

    await sendMessage(settings.apiEndpoint, headers)(
      destination,
      encodedMessage
    ).catch((err: any) => console.error("ERROR Failed to send message", err));
  };

  return (
    <RelayerStateContext.Provider
      value={{
        socketRef,
        relayerStatus,
        eventsList,
        relayerPeerId
      }}
    >
      {children}
    </RelayerStateContext.Provider>
  );
};

export default RelayerStateProvider;

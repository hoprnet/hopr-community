import { ChangeEvent, useEffect, useState } from "react";
import WebSocketHandler from "./WebSocketHandler";
import "./styles.css";

export default function App() {
  const params = new URLSearchParams(window.location.search)
  
  const [message, setMessage] = useState("Hello world");
  const [securityToken, setSecurityToken] = useState(params.get('apiToken') || '');
  const [apiEndpoint, setAPIEndpoint] = useState(params.get('apiEndpoint') || 'http://localhost:3001');
  const [address, setAddress] = useState("");

  const getHeaders = (isPost = false) => {
    const headers = new Headers();
    if (isPost) {
      headers.set("Content-Type", "application/json");
      headers.set("Accept-Content", "application/json");
    }
    headers.set("Authorization", "Basic " + btoa(securityToken));
    return headers;
  };

  useEffect(() => {
    const loadAddress = async () => {
      const headers = getHeaders();
      const account = await fetch(`${apiEndpoint}/api/v2/account/addresses`, {
        headers
      })
        .then((res) => res.json())
        .catch((err) => console.error(err));
      setAddress(account?.hoprAddress);
    };
    loadAddress();
  }, [securityToken, apiEndpoint]);

  const sendMessage = async () => {
    if (!address) return;
    await fetch(`${apiEndpoint}/api/v2/messages`, {
      method: "POST",
      headers: getHeaders(true),
      body: JSON.stringify({
        recipient: address,
        body: message
      })
    }).catch((err) => console.error(err));
  };

  return (
    <div>
      <div>
        <label>API Endpoint</label>{" "}
        <input
          name="apiEndpoint"
          placeholder={apiEndpoint}
          value={apiEndpoint}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setAPIEndpoint(e.target.value)
          }
        />
      </div>
      <div>
        <label>Security Token</label>{" "}
        <input
          name="securityToken"
          placeholder={securityToken}
          value={securityToken}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setSecurityToken(e.target.value)
          }
        />
      </div>
      <div>
        <label>Send a message</label>{" "}
        <input
          name="message"
          value={message}
          placeholder={message}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setMessage(e.target.value)
          }
        />
      </div>
      <button onClick={() => sendMessage()}>Send message to node</button>
      <br />
      <br />
      <WebSocketHandler wsEndpoint={`${apiEndpoint}/api/v2/messages/websocket`} securityToken={securityToken} />
    </div>
  );
}

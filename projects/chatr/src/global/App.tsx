import { useState } from "react";
import styles from "./styles.module.scss";

import Chat from "../pages/Chat";
import Gift from "../pages/Gift";
import Main from "../pages/Main";
import Send from "../pages/Send";
import SendConfirm from "../pages/Send/SendConfirm";
import SendError from "../pages/Send/SendError";
import Sending from "../pages/Send/Sending";
import Settings from "../pages/Settings";
import Transfer from "../pages/Transfer";
import Wallet from "../pages/Wallet";
import WebsocketProvider from "../context/WebsocketProvider";

function App() {
  const [page, setPage] = useState("main");
  const [chatWith, setChatWith] = useState("");
  const [amountToSend, setAmountToSend] = useState("");
  const [destinationAddress, setDestinationAddress] = useState("");
  return (
    <WebsocketProvider>
    <div className={styles.app}>
      {page === "main" && (
        <Main changePageHandle={setPage} changeChatWith={setChatWith} />
      )}
      {page === "settings" && <Settings changePageHandle={setPage} />}
      {page === "gift" && <Gift changePageHandle={setPage} />}
      {page === "wallet" && <Wallet changePageHandle={setPage} />}
      {page === "transfer" && <Transfer changePageHandle={setPage} />}
      {page === "sendConfirm" && <SendConfirm changePageHandle={setPage} />}
      {page === "sendError" && <SendError changePageHandle={setPage} />}
      {page === "sending" && (
        <Sending
          amountToSend={amountToSend}
          destinationAddress={destinationAddress}
          changePageHandle={setPage}
          changeDestination={setDestinationAddress}
          changeAmountToSend={setAmountToSend}
        />
      )}
      {page === "send" && (
        <Send
          changePageHandle={setPage}
          chatWith={chatWith}
          changeChatWith={setChatWith}
          changeDestination={setDestinationAddress}
          changeAmountToSend={setAmountToSend}
        />
      )}
      {page === "chat" && (
        <Chat
          changePageHandle={setPage}
          chatWith={chatWith}
          changeChatWith={setChatWith}
        />
      )}
    </div>
    </WebsocketProvider>
  );
}

export default App;

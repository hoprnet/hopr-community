import React, { useEffect, useState, KeyboardEvent, useContext } from "react";
import {
  addAliases,
  Aliases,
  formatWallet,
} from "../../utils";
import Received from "./Received";
import Sent from "./Sent";
import styles from "./style.module.scss";
import { WebsocketContext } from "../../context/WebsocketProvider";

interface PageType {
  chatWith: string;
  changePageHandle: (value: string | ((prevVar: string) => string)) => void;
  changeChatWith: (value: string | ((prevVar: string) => string)) => void;
}

const Chat: React.FC<PageType> = (props: PageType) => {
  const [editing, setEditing] = useState(false);
  const [customName, setCustomName] = useState("");
  const [content, setMessage] = useState<string>("");
  const [conversationIndex, setConversationIndex] = useState(0);

  const forceUpdate = React.useReducer(() => ({}), {})[1] as () => void;

  const { handleSendMessage, conversations, chatMessages, fetchChatMessages } = useContext(WebsocketContext);

  const editAliases = () => {
    const icon = document.getElementById("editIcon") as HTMLImageElement;
    const newAliasesInput = document.getElementById(
      "newAliases"
    ) as HTMLInputElement;

    if (icon) {
      if (!editing) {
        icon.style.transform = "rotate(40deg)";

        setTimeout(() => {
          icon.style.transform = "rotate(-360deg)";
        }, 300);

        setTimeout(() => {
          icon.src = "/images/checkWhite.svg";
          icon.style.transform = "rotate(-380deg)";
          setEditing(true);
        }, 400);

        setTimeout(() => {
          icon.style.transform = "rotate(-360deg)";
        }, 800);
      } else {
        icon.style.transform = "rotate(-390deg)";

        setTimeout(() => {
          icon.style.transform = "rotate(0deg)";
        }, 300);

        setTimeout(() => {
          icon.src = "/images/edit.svg";
          icon.style.transform = "rotate(20deg)";
          setEditing(false);
          if (newAliasesInput.value.length > 0) {
            addAliases(props.chatWith, newAliasesInput.value);
          }
          window.location.reload();
        }, 400);

        setTimeout(() => {
          icon.style.transform = "rotate(0deg)";
        }, 800);
      }
    }
  };

  useEffect(() => {
    var aliases = JSON.parse(
      localStorage.getItem("aliases")!
    ) as Array<Aliases>;

    for (var i = 0; i < aliases.length; i++) {
      if (aliases[i].wallet === props.chatWith) {
        setCustomName(aliases[i].aliases);
      }
    }
  }, [props.chatWith]);

  const handleEnterPress = (e: KeyboardEvent) => {
    if (e.key === "Enter" && e.shiftKey == false) {
      e.preventDefault();

      const messageInput = document.getElementById(
        "messageInput"
      ) as HTMLInputElement;

      handleSendMessage(content, props.chatWith);

      messageInput.value = "";
    }
  };

  const handleClick = () => {
    const messageInput = document.getElementById(
      "messageInput"
    ) as HTMLInputElement;

    handleSendMessage(content, props.chatWith);

    messageInput.value = "";
  };

  // @dev this is the useEffect responsible for
  // updating new incoming messages as conversations
  // is updated
  useEffect(() => {
    if (conversations !== undefined) {
      const conversationSize = conversations.get(props.chatWith)?.size;
      if(conversationSize !== conversationIndex){
        setConversationIndex(conversationSize);
      }
    }
  }, [conversations]);

  useEffect(() => {
    if (conversations !== undefined) {
      const conversation = conversations.get(props.chatWith);
      const conversationSize = conversations.get(props.chatWith)?.size;
      if (conversation !== undefined) {
        const lastMessage = Array.from(conversation)[conversationSize - 1];

        fetchChatMessages(lastMessage);
        forceUpdate();
      }
    }
  }, [conversationIndex]);

  const renderMessages = () => {
    return chatMessages.map((value, index) => {
      return (
        <>
          {value.isIncoming ? (
            <Received text={`${value.content}`} id={`${value.id}`} />
          ) : (
            <Sent text={`${value.content}`} id={`${value.id}`} />
          )}
        </>
      );
    });
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.menu}>
          <div className={styles.left}>
            <img
              src="/images/backArrow.svg"
              alt="Icon"
              onClick={() => {
                props.changePageHandle("main");
                props.changeChatWith("");
              }}
            />
          </div>
          <div className={styles.middle}>
            <div className={styles.peaple}>
              <img src="/images/user2.svg" alt="Icon" />
            </div>
            <div className={styles.data}>
              {!editing && customName && (
                <span className={styles.customName}>{customName}</span>
              )}
              <span
                className={styles.wallet}
                style={customName ? { fontSize: "15px" } : { fontSize: "17px" }}
              >
                {editing ? (
                  <input
                    type="text"
                    defaultValue={customName}
                    placeholder={"Insert a custom name"}
                    id="newAliases"
                  />
                ) : customName ? (
                  formatWallet(props.chatWith, 18)
                ) : (
                  formatWallet(props.chatWith, 16)
                )}
              </span>
            </div>
          </div>
          <div className={styles.right}>
            <img
              src="/images/edit.svg"
              alt="Icon"
              id="editIcon"
              onClick={() => {
                editAliases();
              }}
            />
          </div>
        </div>
      </header>
      <div className={styles.content}>
        <div className={styles.wrapper}>
          {renderMessages()}
          {/* <Received text={`You are talking to ${customName}`} /> */}
          {/* <Sent text={"I will pay you rn"} /> */}
          {/* <Transaction quantity={10} /> */}
        </div>
      </div>
      <div className={styles.footer}>
        <div className={styles.messageSender}>
          <div className={styles.left}>
            <div className={styles.wrapper}>
              <img
                src="/images/coloredPig.svg"
                alt="Icon"
                onClick={() => {
                  props.changePageHandle("send");
                }}
              />
            </div>
          </div>
          <div className={styles.middle}>
            <input
              type="text"
              id="messageInput"
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleEnterPress}
            />
          </div>
          <div className={styles.right}>
            <div className={styles.wrapper}>
              <img src="/images/send.svg" alt="Icon" onClick={handleClick} />
            </div>
          </div>
        </div>
        <div className={styles.resizer} />
      </div>
    </div>
  );
};

export default Chat;

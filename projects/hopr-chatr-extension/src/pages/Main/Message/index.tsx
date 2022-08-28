import React from "react";
import PeerID from "../PeerID";
import styles from "./styles.module.scss";
interface MessageType {
  icon: string;
  text: string;
  button?: {
    image?: string;
    text?: string;
  };
  action?: (value: string | ((prevVar: string) => string)) => void;
}

const Message: React.FC<MessageType> = (props: MessageType) => {
  return (
    <div className={styles.container}>
      <PeerID />
      <div className={styles.wrapper}>
        <div className={styles.message}>
          <img src={`/images/${props.icon}.svg`} alt="Icon" />
          {props.text && <span>{props.text}</span>}
          {props.button && (
            <div
              className={styles.button}
              onClick={() => {
                props.action && props.action("settings");
              }}
            >
              {props.button.image && (
                <img src="/images/superarrow.svg" alt="Button" />
              )}
              {props.button.text && <span>{props.button.text}</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Message;

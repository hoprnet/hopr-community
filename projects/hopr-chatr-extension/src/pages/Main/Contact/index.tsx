import React, { useState } from "react";
import { formatWallet } from "../../../utils";
import styles from "./styles.module.scss";
import * as getAddr from "../../../utils/getAddr";

interface PageType {
  changePageHandle: (value: string | ((prevVar: string) => string)) => void;
  changeChatWith: (value: string | ((prevVar: string) => string)) => void;
  removeContact: (value: string | ((prevVar: string) => string)) => void;
  wallet: string;
  customName?: string;
}

const Contact: React.FC<PageType> = (props: PageType) => {

  const [nativeAddress, setNativeAddress] = useState("");
  getAddr.getAddressFromPeer(props.wallet).then(address => {
    setNativeAddress(address);
  })

  return (
    <div className={styles.item}>
      <div className={styles.decorator}>
        <img src="/images/user.svg" alt="Icon" />
      </div>
      <div className={styles.data}>
        {props.customName && (
          <span className={styles.customName}>{props.customName}</span>
        )}
        <span
          className={styles.wallet}
          style={props.customName ? { fontSize: "10px" } : { fontSize: "10px" }}
        >
          {props.customName
            ? `Peer Id: ${formatWallet(props.wallet, 15)}`
            : `Peer Id: ${formatWallet(props.wallet, 15)}`}
        </span>
        <span
          className={styles.wallet}
          style={props.customName ? { fontSize: "10px" } : { fontSize: "10px" }}
        >
          {props.customName
            ? `Wallet: ${formatWallet(nativeAddress, 16)}`
            : `Wallet: ${formatWallet(nativeAddress, 16)}`}
        </span>
      </div>
      <div className={styles.favorite}>
        <img
          src="/images/trash.svg"
          alt="Icon"
          onClick={() => {
            props.removeContact(props.wallet);
          }}
        />
        <img
          src="/images/send.svg"
          alt="Icon"
          onClick={() => {
            props.changeChatWith(props.wallet);
            props.changePageHandle("chat");
          }}
        />
      </div>
    </div>
  );
};

export default Contact;

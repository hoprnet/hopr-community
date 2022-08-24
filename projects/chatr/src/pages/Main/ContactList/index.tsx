import React from "react";
import { Aliases } from "../../../utils";
import Contact from "../Contact";
import PeerID from "../PeerID";
import styles from "./styles.module.scss";

interface PageType {
  data: any;
  changeChatWith: (value: string | ((prevVar: string) => string)) => void;
  changePageHandle: (value: string | ((prevVar: string) => string)) => void;
  removeContact: (value: string | ((prevVar: string) => string)) => void;
}

const ContactList: React.FC<PageType> = (props: PageType) => {
  if (!props.data.includes("null") && localStorage.getItem("aliases")) {
    const renderContacts = (list: string[]) =>
      list.map((value, key) => {
        var customName = "";
        var aliases = JSON.parse(
          localStorage.getItem("aliases")!
        ) as Array<Aliases>;

        for (var i = 0; i < aliases.length; i++) {
          if (aliases[i].wallet === value) {
            customName = aliases[i].aliases;
          }
        }

        return (
          <Contact
            key={key}
            wallet={value}
            changeChatWith={props.changeChatWith}
            changePageHandle={props.changePageHandle}
            removeContact={props.removeContact}
            customName={customName}
          />
        );
      });
    return (
      <div className={styles.container}>
        <PeerID />
        <div className={styles.result}>{renderContacts(props.data)}</div>
      </div>
    );
  } else {
    return null;
  }
};

export default ContactList;
